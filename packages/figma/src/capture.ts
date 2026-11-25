// Renders every variant of every component in headless Chromium, screenshots
// it as Figma will show it, records it with its optional parts in, and
// converts the record into capture.json's layers. Components come from the
// recipes, and every other card in the release gets a default one, so a new
// nxds component lands in Figma without a recipe.
import type { CanvasSchema } from '@nxds/claude-design/attribute';
import type { PartProps } from '@nxds/claude-design/index-dts';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { type CDPSession, chromium, type Page } from 'playwright-core';

import { convertMarkup } from './attributes.ts';
import {
  convertVariant,
  deepFingerprint,
  fingerprint,
  type InstanceSource,
  type SourceVariant,
  svgSignature,
} from './convert.ts';
import { ExportError } from './errors.ts';
import {
  type ElementFacts,
  installHelpers,
  type MarkupNode,
  missingParts,
  type MountInput,
  type Override,
  parseMarkup,
  readTokenValues,
  readTypography,
  recordIcons,
  type RecordInput,
  recordVariant,
  settle,
  type TextFacts,
} from './page.ts';
import {
  type Axis,
  cardOf,
  kebab,
  type Recipe,
  RECIPES,
  SKIPPED_CARDS,
  type StateSpec,
} from './recipes.ts';
import {
  CAPTURE_FORMAT,
  type CaptureFile,
  type ComponentSpec,
  type GridSpec,
  type IconSpec,
  type Layer,
  PROTOCOL_VERSION,
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
  valueProbes,
} from './tokens.ts';

export interface CaptureInput {
  release: string;
  theme: Record<string, string>;
  files: {
    /**
     * The page's stylesheets, in order, each with the path it's served at:
     * the release's themed tokens.css, its bundle.css and an app's own
     * colours file, or an app's compiled CSS entry.
     */
    styles: { path: string; css: string }[];
    /**
     * The page's scripts, in order. Together they set `window.React`,
     * `window.ReactDOM` and `window.Nxds`, as the release's bundle expects
     * and an app's bundle provides.
     */
    scripts: { path: string; js: string }[];
    /** The release's tokens.json, themed: the tokens that become variables. */
    tokensJson: string;
    /** Each card's README.md, by card name. */
    readmes: Readonly<Record<string, string>>;
  };
  /** Each part's props: the release's, with an app's own parts over them. */
  props: PartProps;
  /**
   * The page draws an app rather than the release: it serves the files the
   * app's CSS points at, such as fonts, takes the icon set from the app's
   * bundle, lets the app set text in the system font, and converts each
   * example's attributes by the app's own props.
   */
  app?: { schema: CanvasSchema };
  /** Screenshots go in `<outDir>/screenshots/<Component>/`. */
  outDir: string;
  progress(line: string): void;
  /** Only these components, of `componentNames`, for a quicker run. A card's name also takes its parts, such as `Dialog/Header` for `Dialog`. */
  only?: readonly string[];
}

export interface CaptureResult {
  capture: CaptureFile;
  /** Components that couldn't be captured, and why. */
  problems: string[];
  /** Components an app doesn't have, because their example uses a part it didn't install. */
  notInstalled: string[];
}

/** An example uses parts the page doesn't have. */
class MissingParts extends Error {}

const ORIGIN = 'https://capture.nxds.invalid';
const DEFAULT_WIDTH = 400;
const VIEWPORT = { width: 1400, height: 1000 };
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

/**
 * The capture page's stylesheets and scripts for the release: its themed
 * tokens.css and bundle.css, an app's own colours file after them in the same
 * theme layer so it wins, then React 18, ReactDOM 18 and bundle.js.
 */
export function releasePage(release: {
  tokensCss: string;
  bundleCss: string;
  bundleJs: string;
  react: string;
  reactDom: string;
  colorsCss?: string;
}): Pick<CaptureInput['files'], 'styles' | 'scripts'> {
  return {
    styles: [
      { path: '/tokens.css', css: release.tokensCss },
      { path: '/bundle.css', css: release.bundleCss },
      ...(release.colorsCss === undefined
        ? []
        : [{ path: '/colors.css', css: release.colorsCss }]),
    ],
    scripts: [
      { path: '/react.js', js: release.react },
      { path: '/react-dom.js', js: release.reactDom },
      { path: '/bundle.js', js: release.bundleJs },
    ],
  };
}

/** The capture page: the stylesheets, then the capture's own rules, then the scripts. */
function pageHtml(files: CaptureInput['files']) {
  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
${files.styles.map((style) => `<link rel="stylesheet" href="${style.path}">`).join('\n')}
<style>
  *, *::before, *::after { transition: none !important; animation: none !important; }
  body {
    margin: 0;
    min-height: 100vh;
    background: var(--nx-color-background);
    color: var(--nx-color-foreground);
    font-family: var(--nx-typography-family-font-sans);
  }
</style>
${files.scripts.map((script) => `<script src="${script.path}"></script>`).join('\n')}
</head>
<body></body>
</html>`;
}

const CONTENT_TYPES: Record<string, string> = {
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

/** A file the page asks for at `/fs/<path>`, when it is one a stylesheet can point at. */
function servedFile(urlPath: string) {
  if (!urlPath.startsWith('/fs/')) return undefined;
  const file = decodeURIComponent(urlPath.slice('/fs'.length));
  const type = CONTENT_TYPES[path.extname(file)];
  if (!type || !existsSync(file)) return undefined;
  return { type, body: readFileSync(file) };
}

async function launch() {
  try {
    return await chromium.launch();
  } catch (error) {
    const { version } = createRequire(import.meta.url)(
      'playwright-core/package.json'
    ) as { version: string };
    throw new ExportError(
      `Headless Chromium didn't start (${(error as Error).message.split('\n')[0]}). Run \`npx playwright@${version} install chromium\`, then run the command again.`
    );
  }
}

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

/** The values with the default first, so Figma shows the default variant first. */
function defaultFirst(values: readonly string[], first: string | undefined) {
  if (first === undefined || !values.includes(first)) return [...values];
  return [first, ...values.filter((value) => value !== first)];
}

/** `prop` of `part`. Throws when the part has no such prop. */
function propOf(props: PartProps, part: string, prop: string) {
  const found = props.get(part)?.find((entry) => entry.name === prop);
  if (!found) throw new Error(`${part} has no prop ${prop}.`);
  return found;
}

function variantProperties(
  recipe: Recipe,
  part: string,
  props: PartProps
): Property[] {
  // The part whose props they are: the recipe's, or its whole's.
  const owner = recipe.axesFrom ?? part;
  if (recipe.axes) {
    return recipe.axes.map((given): Property => {
      const axis = { ...given, part: given.part ?? owner };
      if (axis.values)
        return {
          name: axis.name,
          values: [...axis.values],
          axis,
          boolean: false,
        };
      const prop = propOf(props, axis.part, axis.prop ?? '');
      if (!prop.literals)
        throw new Error(`${axis.part}.${axis.prop} isn't a union of strings.`);
      return {
        name: axis.name,
        values: defaultFirst(prop.literals, prop.default),
        axis,
        boolean: false,
      };
    });
  }
  const owned = props.get(owner) ?? [];
  const exclude = new Set([...NOT_VISUAL, ...(recipe.exclude ?? [])]);
  const unions = owned.filter(
    (prop) =>
      prop.literals &&
      prop.literals.length > 1 &&
      prop.literals.length <= MAX_VALUES &&
      !exclude.has(prop.name)
  );
  const booleans = (recipe.booleans ?? []).flatMap((name) =>
    owned.filter((prop) => prop.name === name && prop.boolean)
  );
  return [
    ...unions.map(
      (prop): Property => ({
        name: title(prop.name),
        values: defaultFirst(prop.literals ?? [], prop.default),
        axis: { name: title(prop.name), prop: prop.name, part: owner },
        boolean: false,
      })
    ),
    ...booleans.map(
      (prop): Property => ({
        name: title(prop.name),
        values: defaultFirst(['false', 'true'], prop.default),
        axis: { name: title(prop.name), prop: prop.name, part: owner },
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

/** Mounts the example and opens what the recipe opens with a click or a key. */
async function mountOpen(page: Page, mount: MountInput, recipe: Recipe) {
  await mountOn(page, mount);
  if (!recipe.open) return;
  await page.evaluate(settle);
  if ('click' in recipe.open) {
    await page
      .locator(recipe.open.click)
      .first()
      .click({ button: recipe.open.button ?? 'left' });
    // The pointer leaves, so it hovers nothing later components draw.
    await page.mouse.move(0, 0);
  } else {
    await page.locator(recipe.open.press).first().focus();
    await page.keyboard.press(recipe.open.key);
  }
  await page.evaluate(settle);
}

/** Mounts, opens, applies the state, and settles. Returns the target's box in page coordinates, or null when nothing matches it. */
async function show(
  page: Page,
  cdp: CDPSession,
  mount: MountInput,
  recipe: Recipe,
  target: string,
  state: StateSpec
) {
  await mountOpen(page, mount, recipe);
  if (!(await exists(page, target))) return null;
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
  const slots = new Set<string>();
  const visit = (layer: Layer) => {
    if (layer.visibleProperty) visible.add(layer.visibleProperty);
    if (layer.type === 'FRAME' && layer.slotProperty)
      slots.add(layer.slotProperty);
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
  return { visible, texts, swaps, slots };
}

/** The recipe's grid, checked against its properties, or State in rows, Size in columns and the rest in blocks. */
function gridFor(
  recipe: Recipe,
  properties: readonly { name: string }[]
): GridSpec {
  const names = properties.map(({ name }) => name);
  if (recipe.grid) {
    const placed = [
      ...recipe.grid.blocks,
      ...recipe.grid.rows,
      ...recipe.grid.columns,
    ];
    if (
      placed.length !== names.length ||
      names.some((name) => !placed.includes(name))
    )
      throw new Error(
        `its grid places ${placed.join(', ')}, but its properties are ${names.join(', ')}`
      );
    return recipe.grid;
  }
  const rest = names.filter((name) => name !== 'State' && name !== 'Size');
  const columns = names.includes('Size') ? ['Size'] : rest.splice(-1);
  const rows = names.includes('State') ? ['State'] : rest.splice(-1);
  return { blocks: rest, rows, columns };
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
    ...RECIPES.map((recipe) => cardOf(recipe.name)),
    ...SKIPPED_CARDS,
  ]);
  const extra = Object.keys(readmes)
    .filter((card) => !drawn.has(card))
    .sort()
    .map((card): Recipe => ({ name: card }));
  return [...RECIPES, ...extra];
}

/** The slot a recipe's component is drawn with, plus the other slots it also draws. */
function slotsOf(recipe: Recipe) {
  const target =
    typeof recipe.target === 'string'
      ? /\[data-slot=([\w-]+)\]$/.exec(recipe.target)?.[1]
      : undefined;
  return [
    target ?? kebab(recipe.part ?? recipe.name),
    ...(recipe.alsoSlots ?? []),
  ];
}

/** Every `data-slot` in a recorded tree. */
function slotsIn(node: ElementFacts | TextFacts, found: Set<string>) {
  if (node.kind === 'text') return;
  if (node.slot) found.add(node.slot);
  for (const child of node.children) slotsIn(child, found);
}

/** Every part `nodes` draw, such as `Card` and `Button`. */
function partsIn(nodes: readonly MarkupNode[], found = new Set<string>()) {
  for (const node of nodes) {
    if (typeof node === 'string') continue;
    if (node.part !== null) found.add(node.part);
    partsIn(node.children, found);
  }
  return found;
}

/** Each `{ __icon: name }` in `value`, however deep. */
function iconsIn(value: unknown, found: Set<string>) {
  if (Array.isArray(value))
    return value.forEach((item) => iconsIn(item, found));
  if (!value || typeof value !== 'object') return;
  if ('__icon' in value && typeof value.__icon === 'string')
    found.add(value.__icon);
  for (const item of Object.values(value)) iconsIn(item, found);
}

/** Every component the capture draws, by name, which `only` picks from. */
export function componentNames(readmes: Readonly<Record<string, string>>) {
  return allRecipes(readmes).map((recipe) => recipe.name);
}

/**
 * Every example the capture renders, in every variant, and the icon names
 * they use, so an app's Tailwind compiles their classes and its bundle draws
 * their icons.
 */
export function examples(
  readmes: Readonly<Record<string, string>>,
  props: PartProps
) {
  const markup: string[] = [];
  const icons = new Set<string>();
  for (const recipe of allRecipes(readmes)) {
    const base =
      typeof recipe.markup === 'string'
        ? recipe.markup
        : example(readmes[cardOf(recipe.name)]);
    let properties: Property[] = [];
    try {
      properties = variantProperties(recipe, recipe.part ?? recipe.name, props);
    } catch {
      // The capture reports a part the release lacks.
    }
    for (const values of combinations(properties)) {
      const text =
        typeof recipe.markup === 'function' ? recipe.markup(values) : base;
      if (text) markup.push(text);
      iconsIn([recipe.rootProps, recipe.full?.(values)], icons);
      for (const property of properties) {
        const value = values[property.name];
        if (property.axis?.set && value !== undefined)
          iconsIn(property.axis.set(value, values), icons);
      }
    }
  }
  const text = [...new Set(markup)].join('\n');
  // Nxds.Icon's `name`, and an icon prop such as Button's `start-icon`.
  for (const match of text.matchAll(
    /Nxds\.Icon"[^>]*\sname="([a-z0-9-]+)"|\s(?:[a-z]+-)?icon="([a-z0-9-]+)"/g
  )) {
    const name = match[1] ?? match[2];
    if (name) icons.add(name);
  }
  return { markup: text, icons: [...icons].sort() };
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

/**
 * Leaves out each property that doesn't change how a part looks, keeping the
 * variants of its first value. A part takes every property of its whole, and
 * keeps only the ones that restyle it. `looks` pairs with `variants`.
 */
function lookChanging(
  component: string,
  properties: readonly Property[],
  variants: readonly VariantSpec[],
  looks: readonly SourceVariant[]
) {
  const drawn = variants.map((entry) => JSON.stringify(entry.root));
  let kept = [...properties];
  let left = variants.map((_, index) => index);
  for (const property of properties) {
    const others = kept.filter((each) => each !== property);
    const groups = new Map<string, Set<string>>();
    for (const index of left) {
      const values = variants[index]?.values ?? {};
      const key = others.map(({ name }) => values[name]).join('|');
      groups.set(key, (groups.get(key) ?? new Set()).add(drawn[index] ?? ''));
    }
    if ([...groups.values()].some((group) => group.size > 1)) continue;
    kept = others;
    const first = variants[left[0] ?? 0]?.values[property.name];
    left = left.filter(
      (index) => variants[index]?.values[property.name] === first
    );
  }
  const named = (values: Record<string, string>) => {
    const own = Object.fromEntries(
      kept.map(({ name }) => [name, values[name] ?? ''])
    );
    return { values: own, name: variantName(kept, own) || component };
  };
  return {
    properties: kept,
    variants: left.map((index): VariantSpec => {
      const entry = variants[index] as VariantSpec;
      return { ...entry, ...named(entry.values) };
    }),
    // Each kept variant also stands for the looks of the variants it replaced.
    looks: left.map((index): SourceVariant => {
      const entry = looks[index] as SourceVariant;
      const same = looks.filter((other) =>
        kept.every(({ name }) => other.values[name] === entry.values[name])
      );
      return {
        ...named(entry.values),
        fingerprints: [...new Set(same.flatMap((other) => other.fingerprints))],
        deeps: [...new Set(same.flatMap((other) => other.deeps))],
      };
    }),
  };
}

/** The `data-slot` a variant's root was captured from. */
function rootSlot(variant: VariantSpec) {
  return /\[data-slot=([^\]]+)\]/.exec(variant.root.source)?.[1];
}

/** An instance's variant from attributes: each prop's `data-*` attribute on the element, or on the ancestor its prop is set on, and disabled for State. */
function attributeVariant(
  properties: readonly Property[]
): InstanceSource['variant'] {
  return (element, ancestors) =>
    Object.fromEntries(
      properties.map((property) => {
        const prop = property.axis?.prop;
        const slot = property.axis?.part ? kebab(property.axis.part) : null;
        const holder =
          slot === null || element.slot === slot
            ? element
            : [...ancestors].reverse().find((facts) => facts.slot === slot);
        const attribute = prop
          ? holder?.attributes[`data-${kebab(prop)}`]
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
  const traced = tracedTokens(tokens);
  const every = allRecipes(input.files.readmes);
  const names = every.map((recipe) => recipe.name);
  // A card's name also takes its parts: Dialog brings Dialog/Header.
  const only = input.only;
  const wanted = new Set(
    only
      ? names.filter(
          (name) => only.includes(name) || only.includes(cardOf(name))
        )
      : names
  );
  const allParts = RECIPES.flatMap((recipe) => recipe.parts ?? []).map(
    ({ selector, name }) => ({ selector, name })
  );
  const browser = await launch();
  try {
    // Recharts skips its entrance animation for reduced motion, so a chart draws at once.
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const served = new Map<string, [string, string]>([
      ['/', ['text/html', pageHtml(input.files)]],
      ...input.files.styles.map((style): [string, [string, string]] => [
        style.path,
        ['text/css', style.css],
      ]),
      ...input.files.scripts.map((script): [string, [string, string]] => [
        script.path,
        ['text/javascript', script.js],
      ]),
    ]);
    await page.route(`${ORIGIN}/**`, (route) => {
      const urlPath = new URL(route.request().url()).pathname;
      const file = served.get(urlPath);
      if (file) return route.fulfill({ contentType: file[0], body: file[1] });
      const asset = input.app ? servedFile(urlPath) : undefined;
      return asset
        ? route.fulfill({ contentType: asset.type, body: asset.body })
        : route.fulfill({ status: 404 });
    });
    await page.goto(`${ORIGIN}/`);
    await page.mouse.move(1399, 999);
    await page.evaluate(installHelpers);
    // An app's provider applies its appearance when it first mounts, so the values are read after.
    await mountOn(page, { nodes: [], overrides: [], width: DEFAULT_WIDTH });
    await page.evaluate(settle);
    const values = await page.evaluate(readTokenValues, valueProbes(tokens));
    const effects = effectStyles(tokens, values);
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');

    const appIcons = await page.evaluate(
      () =>
        (window as { Nxds?: { __figma?: { icons?: string[] } } }).Nxds?.__figma
          ?.icons
    );
    const iconNames =
      appIcons ?? propOf(input.props, 'Icon', 'name').literals ?? [];
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
    const notInstalled: string[] = [];
    /** Every slot the captured components draw, to find the components they hold. */
    const seen = new Set<string>();

    // Each example parsed once, with an app's attributes converted.
    const parsed = new Map<string, MarkupNode[]>();
    const nodesOf = async (markup: string) => {
      const known = parsed.get(markup);
      if (known) return known;
      const nodes = await page.evaluate(parseMarkup, markup);
      const missing = await page.evaluate(missingParts, [...partsIn(nodes)]);
      if (missing.length > 0) {
        throw new MissingParts(
          `the page has no ${missing.map((part) => `Nxds.${part}`).join(', ')}`
        );
      }
      const result = input.app ? convertMarkup(nodes, input.app.schema) : nodes;
      parsed.set(markup, result);
      return result;
    };

    const captureRecipe = async (recipe: Recipe): Promise<ComponentSpec> => {
      await page.setViewportSize(recipe.viewport ?? recipe.screen ?? VIEWPORT);
      const card = cardOf(recipe.name);
      const base =
        typeof recipe.markup === 'string'
          ? recipe.markup
          : example(input.files.readmes[card]);
      if (recipe.markup === undefined && base === undefined)
        throw new Error(`the ${card} README has no canvas example`);
      const part = recipe.part ?? recipe.name;
      const axes = variantProperties(recipe, part, input.props);
      const stateNames = Object.keys(recipe.states ?? {});
      let properties: Property[] =
        stateNames.length > 0
          ? [...axes, { name: 'State', values: stateNames, boolean: false }]
          : axes;
      const folder = path.join('screenshots', recipe.name);
      mkdirSync(path.join(input.outDir, folder), { recursive: true });
      const hasOffParts =
        recipe.parts?.some((entry) => !entry.default) ?? false;
      let variants: VariantSpec[] = [];
      let looks: SourceVariant[] = [];
      let target: string | undefined;
      for (const values of combinations(properties)) {
        if (recipe.skip?.(values)) continue;
        const state: StateSpec = {
          blur: recipe.blur,
          ...recipe.states?.[values['State'] ?? 'default'],
        };
        const markup =
          typeof recipe.markup === 'function'
            ? recipe.markup(values)
            : (base ?? '');
        const nodes = await nodesOf(markup);
        const mount = (full: boolean): MountInput => ({
          nodes,
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
          await mountOpen(page, mount(false), recipe);
          for (const candidate of [
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
        // A part only some of its whole's variants draw, such as an inline Alert's close button.
        if (!box && recipe.axesFrom) continue;
        if (!box) throw new Error(`nothing matches ${target}`);
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
          slot: recorded.tree.slot ?? kebab(part),
          rootSlot: recipe.slot ?? false,
          prefix: kebab(card),
          textNames: recipe.textNames ?? {},
          instances: sources,
          icons: iconsByShape,
          textStyles: textStylesByToken,
          effectStyles: effectStylesByToken,
          notes,
        });
        // A screen keeps its size, though only its page content is in flow.
        if (recipe.screen) {
          root.name = recipe.name;
          root.sizing = { horizontal: 'FIXED', vertical: 'FIXED' };
        }
        slotsIn(recorded.tree, seen);
        variants.push({ values, name, screenshot, root, notes });
        looks.push({
          name,
          values,
          fingerprints: [fingerprint(recorded.tree)],
          deeps: [deepFingerprint(recorded.tree)],
        });
      }
      if (variants.length === 0) throw new Error(`nothing matches ${target}`);
      if (recipe.axesFrom) {
        const kept = lookChanging(recipe.name, properties, variants, looks);
        properties = kept.properties;
        variants = kept.variants;
        looks = kept.looks;
      }
      const { visible, texts, swaps, slots } = propertyLayers(variants);
      const booleans = new Map(
        (recipe.parts ?? []).map((entry) => [entry.name, entry.default])
      );
      const spec: ComponentSpec = {
        name: recipe.name,
        card,
        variantProperties: properties.map(({ name, values }) => ({
          name,
          values,
        })),
        grid: gridFor(recipe, properties),
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
        slotProperties: [...slots].map((name) => ({ name })),
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
          slot: recipe.slot ?? false,
          variant: recipe.instanceVariant ?? attributeVariant(properties),
        };
        for (const each of [slot, ...(recipe.alsoSlots ?? [])]) {
          if (!sources.has(each)) sources.set(each, source);
        }
      }
      input.progress(`Captured ${recipe.name}: ${variants.length} variants.`);
      return spec;
    };

    // An --only run also captures the components the named ones hold, so they
    // become instances. A held component comes earlier in recipe order, and
    // finding one means capturing again from the start.
    for (;;) {
      for (const recipe of every.filter(({ name }) => wanted.has(name))) {
        try {
          components.push(await captureRecipe(recipe));
        } catch (error) {
          if (input.app && error instanceof MissingParts) {
            notInstalled.push(recipe.name);
          } else {
            problems.push(`${recipe.name}: ${(error as Error).message}`);
          }
        }
        errors.length = 0;
      }
      const last = Math.max(...[...wanted].map((name) => names.indexOf(name)));
      const held = every
        .slice(0, last)
        .filter(
          (recipe) =>
            !wanted.has(recipe.name) &&
            slotsOf(recipe).some((slot) => seen.has(slot))
        );
      if (held.length === 0) break;
      for (const recipe of held) wanted.add(recipe.name);
      input.progress(
        `Capturing again with ${held.map(({ name }) => name).join(', ')}, which they hold.`
      );
      sources.clear();
      components.length = 0;
      problems.length = 0;
      notInstalled.length = 0;
    }
    await assertFontsLoaded(page, tokens, input.app !== undefined);
    return {
      capture: {
        format: CAPTURE_FORMAT,
        version: PROTOCOL_VERSION,
        // The plugin removes what a full capture lacks, so a failed component stays.
        partial: input.only !== undefined || problems.length > 0,
        nxds: { release: input.release, theme: input.theme },
        collections: collections(tokens, usedTokens(components), values),
        textStyles: styles,
        effectStyles: effects,
        icons: iconSet(icons),
        iconColor: ICON_COLOR,
        components,
      },
      problems,
      notInstalled,
    };
  } finally {
    await browser.close();
  }
}

/** Fails when the theme's text font fell back, so the screenshots wouldn't match Figma. */
async function assertFontsLoaded(page: Page, tokens: TokensFile, app: boolean) {
  const family = firstFamily(tokens.type.families['sans'] ?? '');
  const { faces, loaded } = await page.evaluate((name) => {
    const named = [...document.fonts].filter(
      (face) => face.family.replace(/["']/g, '') === name
    );
    return {
      faces: named.length,
      loaded: named.some((face) => face.status === 'loaded'),
    };
  }, family);
  // An app may set text in the system font, which declares no face; Figma's report names its replacement.
  if (loaded || (app && faces === 0)) return;
  throw new ExportError(
    `${family} didn't load, so the screenshots would show a fallback font. Check your connection, then run the command again.`
  );
}
