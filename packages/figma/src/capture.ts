// Renders every variant of every component in headless Chromium, screenshots
// it as Figma will show it, records it with its optional parts in, and
// converts the record into capture.json's layers. Components come from the
// recipes, and every other card in the release gets a default one, so a new
// nxds component lands in Figma without a recipe.
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { type CDPSession, chromium, type Page } from 'playwright-core';

import {
  convertVariant,
  fingerprint,
  type InstanceSource,
  type SourceVariant,
  svgSignature,
} from './convert.ts';
import {
  installHelpers,
  type MountInput,
  type Override,
  readTypography,
  recordIcons,
  type RecordInput,
  recordVariant,
  settle,
} from './page.ts';
import { defaultFirst, partProp, partProps } from './props.ts';
import {
  type Axis,
  type Recipe,
  RECIPES,
  SKIPPED_CARDS,
  type StateSpec,
} from './recipes.ts';
import {
  CAPTURE_FORMAT,
  type CaptureFile,
  type ComponentSpec,
  type IconSpec,
  type Layer,
  variantName,
  type VariantSpec,
} from './spec.ts';
import {
  collections,
  effectStyles,
  firstFamily,
  textStyles,
  type TokensFile,
  tracedTokens,
} from './tokens.ts';

export interface CaptureInput {
  release: string;
  theme: Record<string, string>;
  /** The release's files, with tokens.css and tokens.json already themed. */
  files: {
    bundleJs: string;
    bundleCss: string;
    tokensCss: string;
    tokensJson: string;
    indexDts: string;
    /** Each card's README.md, by card name. */
    readmes: Readonly<Record<string, string>>;
  };
  /** React 18 and ReactDOM 18 UMD builds, which the bundle expects as page globals. */
  react: string;
  reactDom: string;
  /** Screenshots go in `<outDir>/screenshots/<Component>/`. */
  outDir: string;
  progress(line: string): void;
  /** Only these components, by name, for a quicker run. */
  only?: readonly string[];
}

export interface CaptureResult {
  capture: CaptureFile;
  /** Components that couldn't be captured, and why. */
  problems: string[];
}

const ORIGIN = 'https://capture.nxds.invalid';
const DEFAULT_WIDTH = 400;
/** The colour the icon set is drawn in, before an instance recolours it. */
const ICON_COLOR = 'nx-color-foreground';
/** Props no variant property comes from: they change behaviour, not looks. */
const NOT_VISUAL = new Set([
  'type',
  'dir',
  'target',
  'activationMode',
  'pushPasswordManagerStrategy',
]);
/** A string union longer than this is a list of names, such as icons, not a variant property. */
const MAX_VALUES = 12;

const PAGE = `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="/tokens.css">
<link rel="stylesheet" href="/bundle.css">
<style>
  *, *::before, *::after { transition: none !important; animation: none !important; }
  body {
    margin: 0;
    background: var(--nx-color-background);
    color: var(--nx-color-foreground);
    font-family: var(--nx-typography-family-font-sans);
  }
</style>
<script src="/react.js"></script>
<script src="/react-dom.js"></script>
<script src="/bundle.js"></script>
</head>
<body></body>
</html>`;

async function launch() {
  try {
    return await chromium.launch();
  } catch (error) {
    const { version } = createRequire(import.meta.url)(
      'playwright-core/package.json'
    ) as { version: string };
    throw new Error(
      `Headless Chromium didn't start (${(error as Error).message.split('\n')[0]}). Run \`npx playwright@${version} install chromium\`, then run the command again.`
    );
  }
}

const kebab = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();

/** `isCaps` → `Caps`, `closeButton` → `Close button`. */
const title = (prop: string) => {
  const words = prop
    .replace(/^is(?=[A-Z])/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** The README's canvas example: its first html block. */
function example(readme: string | undefined) {
  return /```html\n([\s\S]*?)```/.exec(readme ?? '')?.[1];
}

const firstPart = (markup: string) => /Nxds\.([\w.]+)/.exec(markup)?.[1];

/** Each combination of the properties' values, the first property slowest. */
function combinations(
  properties: readonly { name: string; values: readonly string[] }[]
) {
  return properties.reduce<Record<string, string>[]>(
    (combos, { name, values }) =>
      combos.flatMap((combo) =>
        values.map((value) => ({ ...combo, [name]: value }))
      ),
    [{}]
  );
}

interface Property {
  name: string;
  values: string[];
  axis?: Axis;
  /** A boolean prop, so its values are written as booleans. */
  boolean: boolean;
}

function variantProperties(
  recipe: Recipe,
  part: string,
  indexDts: string
): Property[] {
  if (recipe.axes) {
    return recipe.axes.map((axis): Property => {
      if (axis.values)
        return {
          name: axis.name,
          values: [...axis.values],
          axis,
          boolean: false,
        };
      const prop = partProp(indexDts, axis.part ?? part, axis.prop ?? '');
      if (!prop.literals)
        throw new Error(
          `${axis.part ?? part}.${axis.prop} isn't a union of strings.`
        );
      return {
        name: axis.name,
        values: defaultFirst(prop.literals, prop.default),
        axis,
        boolean: false,
      };
    });
  }
  let props: ReturnType<typeof partProps> = [];
  try {
    props = partProps(indexDts, part);
  } catch {
    return [];
  }
  const exclude = new Set([...NOT_VISUAL, ...(recipe.exclude ?? [])]);
  const unions = props.filter(
    (prop) =>
      prop.literals &&
      prop.literals.length > 1 &&
      prop.literals.length <= MAX_VALUES &&
      !exclude.has(prop.name)
  );
  const booleans = (recipe.booleans ?? []).flatMap((name) =>
    props.filter((prop) => prop.name === name && prop.boolean)
  );
  return [
    ...unions.map(
      (prop): Property => ({
        name: title(prop.name),
        values: defaultFirst(prop.literals ?? [], prop.default),
        axis: { name: title(prop.name), prop: prop.name },
        boolean: false,
      })
    ),
    ...booleans.map(
      (prop): Property => ({
        name: title(prop.name),
        values: defaultFirst(['false', 'true'], prop.default),
        axis: { name: title(prop.name), prop: prop.name },
        boolean: true,
      })
    ),
  ];
}

/** The props each part gets for one variant, merged by part. */
function overridesFor(
  recipe: Recipe,
  properties: readonly Property[],
  values: Record<string, string>,
  state: StateSpec,
  full: boolean,
  part: string,
  rootPart: string | undefined
): Override[] {
  const merged = new Map<string, Record<string, unknown>>();
  const set = (on: string, props: Record<string, unknown>) =>
    merged.set(on, { ...merged.get(on), ...props });
  if (recipe.rootProps && rootPart) set(rootPart, recipe.rootProps);
  for (const property of properties) {
    const value = values[property.name];
    if (value === undefined || !property.axis) continue;
    if (property.axis.set) {
      for (const override of property.axis.set(value, values))
        set(override.part, override.props);
      continue;
    }
    if (!property.axis.prop) continue;
    set(property.axis.part ?? part, {
      [property.axis.prop]: property.boolean ? value === 'true' : value,
    });
  }
  if (state.props) set(state.on ?? part, state.props);
  if (full && recipe.full) set(part, recipe.full(values));
  return [...merged].map(([on, props]) => ({ part: on, props }));
}

const exists = (page: Page, selector: string) =>
  page.evaluate((query) => document.querySelector(query) !== null, selector);

const mountOn = (page: Page, input: MountInput) =>
  page.evaluate((mount) => {
    (window as unknown as { __figmaMount(input: unknown): void }).__figmaMount(
      mount
    );
  }, input);

/** Mounts, opens, applies the state, and settles. Returns the target's box in page coordinates. */
async function show(
  page: Page,
  cdp: CDPSession,
  mount: MountInput,
  recipe: Recipe,
  target: string,
  state: StateSpec
) {
  await mountOn(page, mount);
  if (recipe.open) {
    await page.evaluate(settle);
    if ('click' in recipe.open) {
      await page.click(recipe.open.click, {
        button: recipe.open.button ?? 'left',
      });
      // The pointer leaves, so it hovers nothing later components draw.
      await page.mouse.move(1399, 999);
    } else {
      await page.focus(recipe.open.press);
      await page.keyboard.press(recipe.open.key);
    }
    await page.evaluate(settle);
  }
  if (!(await exists(page, target)))
    throw new Error(`nothing matches ${target}`);
  if (state.blur) {
    await page.evaluate(() =>
      (document.activeElement as HTMLElement | null)?.blur()
    );
  }
  if (state.attributes) {
    await page.evaluate(
      ([query, attributes]) => {
        const el = document.querySelector(query);
        for (const [name, value] of Object.entries(attributes))
          el?.setAttribute(name, value);
      },
      [target, state.attributes] as const
    );
  }
  if (state.pseudo && state.pseudo.length > 0) {
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await cdp.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: target,
    });
    await cdp.send('CSS.forcePseudoState', {
      nodeId,
      forcedPseudoClasses: [...state.pseudo],
    });
  }
  await page.evaluate(settle);
  // The box takes in anything drawn outside the target, such as an open navigation menu's panel.
  return page.evaluate((query) => {
    const target = document.querySelector(query);
    if (!target) return null;
    const own = target.getBoundingClientRect();
    const rects = [
      own,
      ...[...target.querySelectorAll('*')].map((el) =>
        el.getBoundingClientRect()
      ),
    ].filter((rect) => rect.width > 0 || rect.height > 0);
    const left = Math.min(own.left, ...rects.map((rect) => rect.left));
    const top = Math.min(own.top, ...rects.map((rect) => rect.top));
    const right = Math.max(own.right, ...rects.map((rect) => rect.right));
    const bottom = Math.max(own.bottom, ...rects.map((rect) => rect.bottom));
    // A line, such as a separator, still gets a box a pixel wide.
    return {
      x: left,
      y: top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top),
    };
  }, target);
}

/** The layers, in order, that carry each component property. */
function propertyLayers(variants: readonly VariantSpec[]) {
  const visible = new Set<string>();
  const texts = new Map<string, string>();
  const swaps = new Map<string, string>();
  const visit = (layer: Layer) => {
    if (layer.visibleProperty) visible.add(layer.visibleProperty);
    if (
      layer.type === 'TEXT' &&
      layer.textProperty &&
      !texts.has(layer.textProperty)
    ) {
      texts.set(layer.textProperty, layer.characters);
    }
    if (
      layer.type === 'ICON' &&
      layer.swapProperty &&
      !swaps.has(layer.swapProperty)
    ) {
      swaps.set(layer.swapProperty, layer.icon);
    }
    if (layer.type === 'FRAME') layer.children.forEach(visit);
  };
  for (const variant of variants) visit(variant.root);
  return { visible, texts, swaps };
}

/** Every token a layer binds, to keep only the palette colours components use. */
function usedTokens(components: readonly ComponentSpec[]) {
  const used = new Set<string>([ICON_COLOR]);
  const collect = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(collect);
    if (!value || typeof value !== 'object') return;
    for (const [key, item] of Object.entries(value)) {
      if (key === 'token' && typeof item === 'string') used.add(item);
      else if (key === 'colors' && item && typeof item === 'object') {
        for (const token of Object.values(item)) used.add(String(token));
      } else collect(item);
    }
  };
  for (const component of components)
    for (const variant of component.variants) collect(variant.root);
  return used;
}

/** The recipes to run: every recipe, then a default one for each card no recipe draws. */
function allRecipes(readmes: Readonly<Record<string, string>>) {
  const drawn = new Set([
    ...RECIPES.map((recipe) => recipe.card ?? recipe.name),
    ...SKIPPED_CARDS,
  ]);
  const extra = Object.keys(readmes)
    .filter((card) => !drawn.has(card))
    .sort()
    .map((card): Recipe => ({ name: card }));
  return [...RECIPES, ...extra];
}

/** The icon set, with each icon's markup ready for Figma's SVG import. */
function iconSet(icons: readonly IconSpec[]) {
  return icons.map((icon) => ({
    name: icon.name,
    svg: icon.svg
      .replaceAll('currentColor', '#000000')
      .replace(/<rect[^>]*fill="none"[^>]*\/?>(<\/rect>)?/g, ''),
  }));
}

/** The `data-slot` a variant's root was captured from. */
function rootSlot(variant: VariantSpec) {
  return /\[data-slot=([^\]]+)\]/.exec(variant.root.source)?.[1];
}

/** An instance's variant from its own attributes: each prop's `data-*` attribute, and disabled for State. */
function attributeVariant(
  properties: readonly Property[]
): InstanceSource['variant'] {
  return (element) =>
    Object.fromEntries(
      properties.map((property) => {
        const prop = property.axis?.prop;
        const attribute = prop
          ? element.attributes[`data-${kebab(prop)}`]
          : undefined;
        if (attribute !== undefined && property.values.includes(attribute))
          return [property.name, attribute];
        if (property.name === 'State' && property.values.includes('disabled')) {
          const disabled =
            element.attributes['disabled'] !== undefined ||
            element.attributes['data-disabled'] !== undefined;
          return [
            property.name,
            disabled ? 'disabled' : (property.values[0] ?? ''),
          ];
        }
        return [property.name, property.values[0] ?? ''];
      })
    );
}

export async function captureComponents(
  input: CaptureInput
): Promise<CaptureResult> {
  const tokens = JSON.parse(input.files.tokensJson) as TokensFile;
  const effects = effectStyles(tokens);
  const traced = tracedTokens(tokens);
  const recipes = allRecipes(input.files.readmes).filter(
    (recipe) => !input.only || input.only.includes(recipe.name)
  );
  const allParts = RECIPES.flatMap((recipe) => recipe.parts ?? []).map(
    ({ selector, name }) => ({ selector, name })
  );
  const browser = await launch();
  try {
    // Recharts skips its entrance animation for reduced motion, so a chart draws at once.
    const context = await browser.newContext({
      viewport: { width: 1400, height: 1000 },
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const served: Record<string, [string, string]> = {
      '/': ['text/html', PAGE],
      '/tokens.css': ['text/css', input.files.tokensCss],
      '/bundle.css': ['text/css', input.files.bundleCss],
      '/bundle.js': ['text/javascript', input.files.bundleJs],
      '/react.js': ['text/javascript', input.react],
      '/react-dom.js': ['text/javascript', input.reactDom],
    };
    await page.route(`${ORIGIN}/**`, (route) => {
      const file = served[new URL(route.request().url()).pathname];
      return file
        ? route.fulfill({ contentType: file[0], body: file[1] })
        : route.fulfill({ status: 404 });
    });
    await page.goto(`${ORIGIN}/`);
    await page.mouse.move(1399, 999);
    await page.evaluate(installHelpers);
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');

    const iconNames =
      partProp(input.files.indexDts, 'Icon', 'name').literals ?? [];
    const icons = await page.evaluate(recordIcons, iconNames);
    const iconsByShape = new Map<string, string>();
    for (const icon of icons) {
      const signature = svgSignature(icon.svg);
      if (signature && !iconsByShape.has(signature))
        iconsByShape.set(signature, icon.name);
    }
    input.progress(`Captured ${icons.length} icons.`);
    const styles = textStyles(tokens, await page.evaluate(readTypography));
    const textStylesByToken = new Map(
      styles.map((style) => [style.token, style])
    );
    const effectStylesByToken = new Map(
      effects.map((style) => [style.token, style])
    );

    const sources = new Map<string, InstanceSource>();
    const components: ComponentSpec[] = [];
    const problems: string[] = [];

    const captureRecipe = async (recipe: Recipe): Promise<ComponentSpec> => {
      const card = recipe.card ?? recipe.name;
      const base =
        typeof recipe.markup === 'string'
          ? recipe.markup
          : example(input.files.readmes[card]);
      if (recipe.markup === undefined && base === undefined)
        throw new Error(`the ${card} README has no canvas example`);
      const part = recipe.part ?? recipe.name;
      const axes = variantProperties(recipe, part, input.files.indexDts);
      const stateNames = Object.keys(recipe.states ?? {});
      const properties: Property[] =
        stateNames.length > 0
          ? [...axes, { name: 'State', values: stateNames, boolean: false }]
          : axes;
      const folder = path.join('screenshots', recipe.name);
      mkdirSync(path.join(input.outDir, folder), { recursive: true });
      const hasOffParts =
        recipe.parts?.some((entry) => !entry.default) ?? false;
      const variants: VariantSpec[] = [];
      const looks: SourceVariant[] = [];
      let target: string | undefined;
      for (const values of combinations(properties)) {
        const state = recipe.states?.[values['State'] ?? 'default'] ?? {};
        const markup =
          typeof recipe.markup === 'function'
            ? recipe.markup(values)
            : (base ?? '');
        const mount = (full: boolean): MountInput => ({
          markup,
          overrides: overridesFor(
            recipe,
            properties,
            values,
            state,
            full,
            part,
            firstPart(markup)
          ),
          width: recipe.width ?? DEFAULT_WIDTH,
        });
        const name = variantName(properties, values) || recipe.name;
        const screenshot = path.join(folder, `${name}.png`);
        const explicit =
          typeof recipe.target === 'function'
            ? recipe.target(values)
            : recipe.target;
        if (explicit) target = explicit;
        if (!target) {
          await mountOn(page, mount(false));
          for (const candidate of [
            `[data-slot=${kebab(recipe.name)}]`,
            `[data-slot=${kebab(part)}]`,
            '[data-capture-root] > *',
          ]) {
            if (await exists(page, candidate)) {
              target = candidate;
              break;
            }
          }
        }
        if (!target)
          throw new Error('nothing to capture: the example renders nothing');
        const box = await show(page, cdp, mount(false), recipe, target, state);
        if (!box) throw new Error(`${target} has no box`);
        await page.screenshot({
          path: path.join(input.outDir, screenshot),
          clip: {
            x: Math.max(0, box.x - 8),
            y: Math.max(0, box.y - 8),
            width: box.width + 16,
            height: box.height + 16,
          },
        });
        if (hasOffParts)
          await show(page, cdp, mount(true), recipe, target, state);
        const recorded = await page.evaluate(recordVariant, {
          tokens: traced,
          parts: allParts,
          target,
        } satisfies RecordInput);
        if (errors.length > 0)
          throw new Error(`${name}: the page threw: ${errors.join('; ')}`);
        const notes: string[] = [];
        const root = convertVariant(recorded, {
          component: recipe.name,
          slot: recorded.tree.slot ?? kebab(recipe.name),
          prefix: kebab(card),
          textNames: recipe.textNames ?? {},
          instances: sources,
          icons: iconsByShape,
          textStyles: textStylesByToken,
          effectStyles: effectStylesByToken,
          notes,
        });
        variants.push({ values, name, screenshot, root, notes });
        looks.push({ name, values, fingerprint: fingerprint(recorded.tree) });
      }
      const { visible, texts, swaps } = propertyLayers(variants);
      const booleans = new Map(
        (recipe.parts ?? []).map((entry) => [entry.name, entry.default])
      );
      const spec: ComponentSpec = {
        name: recipe.name,
        variantProperties: properties.map(({ name, values }) => ({
          name,
          values,
        })),
        booleanProperties: [...visible].map((name) => ({
          name,
          default: booleans.get(name) ?? true,
        })),
        textProperties: [...texts].map(([name, value]) => ({
          name,
          default: value,
        })),
        swapProperties: [...swaps].map(([name, icon]) => ({
          name,
          default: icon,
        })),
        variants,
      };
      const slot = variants[0] ? rootSlot(variants[0]) : undefined;
      if (slot) {
        const source: InstanceSource = {
          name: recipe.name,
          variantProperties: spec.variantProperties,
          variants: looks,
          textProperties: [...texts.keys()],
          booleanProperties: [...visible],
          swapProperties: [...swaps.keys()],
          variant: recipe.instanceVariant ?? attributeVariant(properties),
        };
        for (const each of [slot, ...(recipe.alsoSlots ?? [])]) {
          if (!sources.has(each)) sources.set(each, source);
        }
      }
      input.progress(`Captured ${recipe.name}: ${variants.length} variants.`);
      return spec;
    };

    for (const recipe of recipes) {
      try {
        components.push(await captureRecipe(recipe));
      } catch (error) {
        problems.push(`${recipe.name}: ${(error as Error).message}`);
        input.progress(`Skipped ${recipe.name}: ${(error as Error).message}`);
      }
      errors.length = 0;
    }
    await assertFontsLoaded(page, tokens);
    return {
      capture: {
        format: CAPTURE_FORMAT,
        version: 2,
        nxds: { release: input.release, theme: input.theme },
        collections: collections(tokens, usedTokens(components)),
        textStyles: styles,
        effectStyles: effects,
        icons: iconSet(icons),
        iconColor: ICON_COLOR,
        components,
      },
      problems,
    };
  } finally {
    await browser.close();
  }
}

/** Fails when the theme's text font fell back, so the screenshots wouldn't match Figma. */
async function assertFontsLoaded(page: Page, tokens: TokensFile) {
  const family = firstFamily(tokens.type.families['sans'] ?? '');
  const loaded = await page.evaluate(
    (name) =>
      [...document.fonts].some(
        (face) =>
          face.family.replace(/["']/g, '') === name && face.status === 'loaded'
      ),
    family
  );
  if (!loaded) {
    throw new Error(
      `${family} didn't load from Google Fonts, so the screenshots would show a fallback font. Check your connection, then run the command again.`
    );
  }
}
