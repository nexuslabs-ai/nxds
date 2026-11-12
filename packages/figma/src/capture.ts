// Renders every variant of every recipe in headless Chromium, screenshots it
// as Figma will show it, records it with its optional parts in, and converts
// the record into capture.json's layers.
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { type CDPSession, chromium, type Page } from 'playwright-core';

import { convertVariant, type InstanceSource } from './convert.ts';
import {
  installHelpers,
  type PartTree,
  type RecordInput,
  recordVariant,
} from './page.ts';
import { defaultFirst, propValues } from './props.ts';
import { FORCED, type Recipe, RECIPES } from './recipes.ts';
import {
  CAPTURE_FORMAT,
  type CaptureFile,
  type ComponentSpec,
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
  };
  /** React 18 and ReactDOM 18 UMD builds, which the bundle expects as page globals. */
  react: string;
  reactDom: string;
  /** Screenshots go in `<outDir>/screenshots/<Component>/`. */
  outDir: string;
  progress(line: string): void;
}

const ORIGIN = 'https://capture.nxds.invalid';

const PAGE = `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="/tokens.css">
<link rel="stylesheet" href="/bundle.css">
<style>
  *, *::before, *::after { transition: none !important; animation: none !important; }
  body { margin: 0; background: var(--nx-color-background); }
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

function variantProperties(recipe: Recipe, indexDts: string) {
  const axes = recipe.axes.map((axis) => ({
    name: axis.name,
    values:
      'prop' in axis
        ? defaultFirst(propValues(indexDts, recipe.name, axis.prop))
        : [...axis.values],
  }));
  return recipe.states.length > 0
    ? [...axes, { name: 'State', values: [...recipe.states] }]
    : axes;
}

/** The layers that carry each component property, across every variant. */
function propertyLayers(variants: readonly VariantSpec[]) {
  const visible = new Set<string>();
  const texts = new Map<string, string>();
  const visit = (layer: Layer) => {
    if (layer.visibleProperty) visible.add(layer.visibleProperty);
    if (
      layer.type === 'TEXT' &&
      layer.textProperty &&
      !texts.has(layer.textProperty)
    ) {
      texts.set(layer.textProperty, layer.characters);
    }
    if (layer.type === 'FRAME') layer.children.forEach(visit);
  };
  for (const variant of variants) visit(variant.root);
  return { visible, texts };
}

/** Mounts `tree`, forces the state's pseudo-classes on its root, and waits for fonts and two frames. */
async function show(
  page: Page,
  cdp: CDPSession,
  tree: PartTree,
  width: number | undefined,
  forced: readonly string[]
) {
  await page.evaluate(
    ([part, size]) => {
      (
        window as unknown as {
          __figmaMount(tree: unknown, width: number | null): void;
        }
      ).__figmaMount(part, size);
    },
    [tree, width ?? null] as const
  );
  if (forced.length > 0) {
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await cdp.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '[data-capture-root] > *',
    });
    await cdp.send('CSS.forcePseudoState', {
      nodeId,
      forcedPseudoClasses: [...forced],
    });
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
  });
}

export async function captureComponents(
  input: CaptureInput
): Promise<CaptureFile> {
  const tokens = JSON.parse(input.files.tokensJson) as TokensFile;
  const styles = textStyles(tokens);
  const effects = effectStyles(tokens);
  const traced = tracedTokens(tokens);
  const browser = await launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1400, height: 1000 },
      deviceScaleFactor: 2,
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
    await page.evaluate(installHelpers);
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');

    const instances = new Map<string, InstanceSource>();
    const components: ComponentSpec[] = [];
    for (const recipe of RECIPES) {
      const properties = variantProperties(recipe, input.files.indexDts);
      const folder = path.join('screenshots', recipe.name);
      mkdirSync(path.join(input.outDir, folder), { recursive: true });
      const recordInput: RecordInput = {
        tokens: traced,
        parts: [...recipe.parts],
        texts: [...recipe.texts],
      };
      const hasOffParts = recipe.parts.some((part) => !part.default);
      const variants: VariantSpec[] = [];
      for (const values of combinations(properties)) {
        const state = values['State'] ?? 'default';
        const forced = FORCED[state] ?? [];
        const name = variantName(properties, values);
        const screenshot = path.join(folder, `${name || recipe.name}.png`);
        await show(
          page,
          cdp,
          recipe.render(values, state, false),
          recipe.width,
          forced
        );
        await page
          .locator('[data-capture-root]')
          .screenshot({ path: path.join(input.outDir, screenshot) });
        if (hasOffParts)
          await show(
            page,
            cdp,
            recipe.render(values, state, true),
            recipe.width,
            forced
          );
        const recorded = await page.evaluate(recordVariant, recordInput);
        if (errors.length > 0) {
          throw new Error(
            `${recipe.name} ${name}: the page threw: ${errors.join('; ')}`
          );
        }
        const notes: string[] = [];
        const root = convertVariant(recorded, {
          component: recipe.name,
          slot: recipe.slot,
          width: recipe.width,
          instances,
          textStyles: new Map(styles.map((style) => [style.token, style])),
          effectStyles: new Map(effects.map((style) => [style.token, style])),
          notes,
        });
        variants.push({
          values,
          name: name || recipe.name,
          screenshot,
          root,
          notes,
        });
      }
      const { visible, texts } = propertyLayers(variants);
      const booleans = new Map(
        recipe.parts.map((part) => [part.name, part.default])
      );
      components.push({
        name: recipe.name,
        variantProperties: properties,
        booleanProperties: [...visible].map((name) => ({
          name,
          default: booleans.get(name) ?? true,
        })),
        textProperties: [...texts].map(([name, value]) => ({
          name,
          default: value,
        })),
        variants,
      });
      if (recipe.instanceVariant) {
        instances.set(recipe.slot, {
          name: recipe.name,
          textProperty: recipe.texts[0]?.name,
          variant: recipe.instanceVariant,
        });
      }
      input.progress(`Captured ${recipe.name}: ${variants.length} variants.`);
    }
    await assertFontsLoaded(page, tokens);
    return {
      format: CAPTURE_FORMAT,
      version: 1,
      nxds: { release: input.release, theme: input.theme },
      collections: collections(tokens),
      textStyles: styles,
      effectStyles: effects,
      components,
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
