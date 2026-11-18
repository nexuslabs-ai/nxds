// Runs the Figma capture on the built @nxds/claude-design release, the way
// `nxds-cli export figma` does, then checks what a designer relies on in
// Figma: every component captured, every colour bound, palette colours only
// when used, text styles bound to the typography variables, icons as
// swappable instances, repeated parts as instances of their own components,
// and the local link the plugin talks to. Build @nxds/claude-design first.
// Pass a folder to keep the capture and its screenshots.
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { captureComponents, releasePage } from '../src/capture.ts';
import { openLink } from '../src/link.ts';
import { SKIPPED_CARDS } from '../src/recipes.ts';
import {
  type BuildReport,
  type ComponentSpec,
  type Layer,
  REPORT_FORMAT,
  unboundValues,
} from '../src/spec.ts';
import { isPrimitiveColor } from '../src/tokens.ts';

const packages = path.join(import.meta.dirname, '..', '..');
const release = path.join(packages, 'claude-design', 'dist');
const project = path.join(release, 'project');
const require = createRequire(
  path.join(packages, 'claude-design', 'package.json')
);
const umd = (name: string, file: string) =>
  readFileSync(
    path.join(
      path.dirname(require.resolve(`${name}/package.json`)),
      'umd',
      file
    ),
    'utf8'
  );

const kept = process.argv[2];
const outDir = kept
  ? path.resolve(kept)
  : mkdtempSync(path.join(tmpdir(), 'nxds-figma-smoke-'));
mkdirSync(outDir, { recursive: true });

const failures: string[] = [];
const fail = (message: string) => failures.push(message);
const check = (ok: boolean, message: string) => {
  if (!ok) fail(message);
};

const themeModule = (await import(
  pathToFileURL(path.join(release, 'theme.js')).href
)) as {
  default: {
    render(flags: Record<string, string>): { project: Record<string, string> };
  };
};
const theme = { font: 'inter' };
const themed = themeModule.default.render(theme).project;
const readmes: Record<string, string> = {};
for (const card of readdirSync(path.join(project, 'components'))) {
  const file = path.join(project, 'components', card, 'README.md');
  if (existsSync(file)) readmes[card] = readFileSync(file, 'utf8');
}
const started = Date.now();
const releaseFiles = {
  tokensCss: themed['tokens.css'] ?? '',
  bundleCss: readFileSync(
    path.join(project, 'components', 'bundle.css'),
    'utf8'
  ),
  bundleJs: readFileSync(path.join(project, 'components', 'bundle.js'), 'utf8'),
  react: umd('react', 'react.production.min.js'),
  reactDom: umd('react-dom', 'react-dom.production.min.js'),
};
const input = {
  release: 'smoke',
  theme,
  files: {
    ...releasePage(releaseFiles),
    tokensJson: themed['tokens.json'] ?? '',
    indexDts: readFileSync(
      path.join(project, 'components', 'index.d.ts'),
      'utf8'
    ),
    readmes,
  },
  outDir,
  progress: (line: string) => console.log(line),
};
const { capture, problems } = await captureComponents(input);
const json = JSON.stringify(capture, null, 2);
writeFileSync(path.join(outDir, 'capture.json'), json);
const variantCount = capture.components.reduce(
  (sum, spec) => sum + spec.variants.length,
  0
);
console.log(
  `Captured ${variantCount} variants of ${capture.components.length} components in ${Math.round((Date.now() - started) / 1000)}s into ${outDir}.`
);

const component = (name: string) => {
  const found = capture.components.find((spec) => spec.name === name);
  if (!found) throw new Error(`No ${name} in the capture.`);
  return found;
};
const variant = (spec: ComponentSpec, values: Record<string, string> = {}) => {
  const found = spec.variants.find((entry) =>
    Object.entries(values).every(
      ([name, value]) => entry.values[name] === value
    )
  );
  if (!found)
    throw new Error(`${spec.name} has no variant ${JSON.stringify(values)}.`);
  return found.root;
};
const layers = (root: Layer): Layer[] => [
  root,
  ...(root.type === 'FRAME' ? root.children.flatMap(layers) : []),
];
const named = (root: Layer, name: string) =>
  layers(root).filter((layer) => layer.name === name);
const instancesOf = (root: Layer, name: string) =>
  layers(root).filter(
    (layer): layer is Extract<Layer, { type: 'INSTANCE' }> =>
      layer.type === 'INSTANCE' && layer.component === name
  );

// Every card is captured: by its own recipe, as a part, or by a default recipe.
for (const problem of problems) fail(`Not captured: ${problem}`);
const captured = new Set(capture.components.map((spec) => spec.name));
for (const card of Object.keys(readmes).filter(
  (name) => !SKIPPED_CARDS.includes(name)
)) {
  check(
    captured.has(card) || (card === 'Chart' && captured.has('BarChart')),
    `${card} has no Figma component.`
  );
}
check(
  component('Button').variants.length === 288,
  `Button: ${component('Button').variants.length} variants, expected 288.`
);
for (const spec of capture.components) {
  for (const entry of spec.variants) {
    check(
      existsSync(path.join(outDir, entry.screenshot)),
      `${spec.name} ${entry.name}: no screenshot.`
    );
  }
}

// Button binds every value to the token its classes declare.
const button = variant(component('Button'), {
  Variant: 'default',
  Size: 'default',
  State: 'default',
});
const label = named(button, 'Label')[0];
check(
  button.fills[0]?.token === 'nx-color-primary-background',
  'Button: its fill is not bound to primary-background.'
);
check(
  button.minHeight?.token === 'nx-spacing-10',
  'Button: its minimum height is not bound to spacing-10.'
);
check(
  button.layout?.padding.left.token === 'nx-spacing-3',
  'Button: its left padding is not bound to spacing-3.'
);
check(
  button.radius.topLeft.token === 'nx-radius-base',
  'Button: its radius is not bound to radius-base.'
);
check(
  label?.type === 'TEXT' && label.style === 'label/default',
  'Button: its label has no label/default text style.'
);
check(
  label?.type === 'TEXT' && label.textProperty === 'Label',
  'Button: its label is not the Label property.'
);
const hovered = variant(component('Button'), {
  Variant: 'default',
  Size: 'default',
  State: 'hover',
});
check(
  hovered.fills[0]?.token === 'nx-color-primary-background-hover',
  'Button hover: not bound to primary-background-hover.'
);

// Icons are instances of the icon set, and an icon slot is an instance-swap property.
const startIcon = named(button, 'Start icon')[0];
check(
  capture.icons.length >= 700,
  `The icon set has ${capture.icons.length} icons, expected regular and fill.`
);
check(
  startIcon?.type === 'ICON' && startIcon.swapProperty === 'Start icon',
  "Button: its start icon isn't a swappable icon instance."
);
check(
  startIcon?.type === 'ICON' &&
    startIcon.fill.token === 'nx-color-primary-foreground',
  "Button: its icon isn't recoloured with primary-foreground."
);
const iconNames = new Set(capture.icons.map((icon) => icon.name));
for (const spec of capture.components) {
  for (const entry of spec.variants) {
    for (const layer of layers(entry.root)) {
      if (layer.type === 'ICON')
        check(
          iconNames.has(layer.icon),
          `${spec.name}: icon ${layer.icon} isn't in the set.`
        );
    }
  }
}

// The binding comes from the declared token, not the value.
const card = variant(component('Card'));
const alert = variant(component('Alert'), {
  Variant: 'default',
  Presentation: 'card',
  Layout: 'stack',
});
const cardTitle = named(card, 'Title')[0];
const alertTitle = named(alert, 'Title').find((layer) => layer.type === 'TEXT');
check(
  cardTitle?.type === 'TEXT' &&
    cardTitle.fill.token === 'nx-color-container-foreground',
  'Card: its title is not bound to container-foreground.'
);
check(
  alertTitle?.type === 'TEXT' &&
    alertTitle.fill.token === 'nx-color-foreground',
  'Alert: its title is not bound to foreground.'
);

// Hug, fill and grids follow the CSS.
check(
  button.sizing.horizontal === 'HUG' && button.sizing.vertical === 'HUG',
  'Button: not hug × hug.'
);
check(
  alert.layout?.mode === 'HORIZONTAL' &&
    alert.children.map((child) => child.name).join(',') === 'Icon,Body',
  'Alert: its grid is not a row of Icon and Body.'
);
check(
  cardTitle?.sizing.horizontal === 'FILL',
  'Card: its title does not fill.'
);

// Nested components and repeated parts are instances.
const nesting: [string, Record<string, string>, string, number][] = [
  [
    'Alert',
    { Variant: 'default', Presentation: 'card', Layout: 'stack' },
    'Button',
    1,
  ],
  ['Card', {}, 'Button', 3],
  ['DropdownMenu', {}, 'Menu item', 4],
  ['ContextMenu', {}, 'Menu item', 1],
  ['Select content', {}, 'Select item', 4],
  ['Command', {}, 'Command item', 1],
  ['Tabs', {}, 'Tab', 2],
  ['Accordion', {}, 'Accordion item', 3],
  ['RadioGroup', {}, 'Radio', 3],
  ['ToggleGroup', {}, 'Toggle group item', 3],
  ['Table', {}, 'Table row', 3],
  ['Sidebar', {}, 'Sidebar menu button', 3],
  ['Breadcrumb', {}, 'Breadcrumb link', 1],
  ['Pagination', {}, 'Pagination link', 1],
];
for (const [name, values, part, least] of nesting) {
  const found = instancesOf(variant(component(name), values), part).length;
  check(
    found >= least,
    `${name}: ${found} ${part} instances, expected at least ${least}.`
  );
}
const variantNames = new Map(
  capture.components.map((spec) => [
    spec.name,
    new Set(spec.variants.map((entry) => entry.name)),
  ])
);
const order = capture.components.map((spec) => spec.name);
for (const spec of capture.components) {
  for (const entry of spec.variants) {
    for (const layer of layers(entry.root)) {
      if (layer.type !== 'INSTANCE') continue;
      const source = component(layer.component);
      const name =
        source.variantProperties
          .map(({ name: property }) => `${property}=${layer.variant[property]}`)
          .join(', ') || source.name;
      check(
        variantNames.get(layer.component)?.has(name) === true,
        `${spec.name}: its ${layer.name} instance names ${name}, which doesn't exist.`
      );
      check(
        order.indexOf(layer.component) < order.indexOf(spec.name),
        `${spec.name} is built before ${layer.component}, which it holds.`
      );
    }
  }
}

// Component properties.
const props = (name: string) => {
  const spec = component(name);
  return {
    booleans: spec.booleanProperties
      .map((property) => `${property.name}:${property.default}`)
      .join(','),
    texts: spec.textProperties.map((property) => property.name).join(','),
    swaps: spec.swapProperties.map((property) => property.name).join(','),
  };
};
check(
  props('Button').booleans === 'Show start icon:false,Show end icon:false',
  `Button booleans: ${props('Button').booleans}.`
);
check(
  props('Button').swaps === 'Start icon,End icon',
  `Button swaps: ${props('Button').swaps}.`
);
check(
  props('Button').texts === 'Label',
  `Button texts: ${props('Button').texts}.`
);
check(
  props('Menu item').booleans.includes('Show shortcut:true'),
  `Menu item booleans: ${props('Menu item').booleans}.`
);
check(
  ['Show icon:true', 'Description:true', 'Actions:true'].every((entry) =>
    props('Alert').booleans.includes(entry)
  ),
  `Alert booleans: ${props('Alert').booleans}.`
);

// Variables: palette colours only when a layer binds them, typography bound into the text styles.
const used = new Set<string>();
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
for (const spec of capture.components)
  for (const entry of spec.variants) collect(entry.root);
const colors =
  capture.collections.find((collection) => collection.name === 'Color')
    ?.variables ?? [];
for (const entry of colors) {
  if (isPrimitiveColor(entry.token))
    check(
      used.has(entry.token),
      `${entry.token} is exported, but no layer uses it.`
    );
}
const variables = new Set(
  capture.collections.flatMap((collection) =>
    collection.variables.map((entry) => entry.token)
  )
);
for (const token of used)
  check(
    variables.has(token),
    `${token} is bound in a layer but has no variable.`
  );
check(
  variables.has(capture.iconColor),
  `The icon colour ${capture.iconColor} has no variable.`
);
const typography =
  capture.collections.find((collection) => collection.name === 'Typography')
    ?.variables ?? [];
check(
  typography.some((entry) => entry.name === 'size/sm'),
  'Typography: no size/sm variable.'
);
for (const style of capture.textStyles) {
  const size = style.variables.fontSize;
  check(
    size !== undefined && variables.has(size),
    `${style.name}: its font size isn't a typography variable.`
  );
}
for (const collection of capture.collections) {
  const names = collection.variables.map((entry) => entry.name);
  check(
    new Set(names).size === names.length,
    `${collection.name}: two variables share a name.`
  );
}

// Every colour is bound, except Sonner's own toast colours and image placeholders.
const unbound = capture.components.flatMap((spec) =>
  spec.variants.flatMap((entry) => unboundValues(spec.name, entry))
);
const colorProperties = new Set([
  'fill',
  'stroke',
  'text colour',
  'icon colour',
]);
for (const value of unbound.filter((entry) =>
  colorProperties.has(entry.property)
)) {
  if (value.component === 'Toast' || value.layer.endsWith('Image')) continue;
  fail(
    `${value.component} ${value.variant} / ${value.layer}: its ${value.property} ${value.value} isn't bound.`
  );
}
const distinct = new Set(
  unbound.map(
    (value) =>
      `${value.component} ${value.layer.split(' / ').slice(1).join(' / ')} ${value.property} ${value.value}`
  )
);
console.log(
  `${unbound.length} unbound values, ${distinct.size} distinct. ${colors.filter((entry) => isPrimitiveColor(entry.token)).length} palette colours in use.`
);

// A theme the engine derives declares literal colours, so no variable is an alias.
for (const collection of capture.collections) {
  for (const entry of collection.variables) {
    check(
      entry.lightAlias === undefined && entry.darkAlias === undefined,
      `${entry.token} is an alias in a derived theme.`
    );
  }
}

// An app's own colours file: components draw in its colours, a reference to
// another nxds token becomes an alias, an app's own variable resolves to its
// value, and a redefined shadow reaches its style.
const OWN_COLORS = `@layer theme {
  :root {
    --app-accent: #e11d48;
    --nx-color-primary-background: var(--nx-color-blue-600);
    --nx-color-primary-background-hover: color-mix(in oklab, var(--nx-color-blue-600) 80%, black);
    --nx-color-primary-foreground: var(--app-accent);
    --nx-color-border-default: var(--nx-color-foreground);
    --nx-shadow-sm: 0px 2px 6px 0px rgb(0 0 0 / 0.3);
  }
  .dark {
    --nx-color-primary-background: var(--nx-color-blue-400);
  }
}`;
const own = await captureComponents({
  ...input,
  files: {
    ...input.files,
    ...releasePage({ ...releaseFiles, colorsCss: OWN_COLORS }),
  },
  outDir: mkdtempSync(path.join(tmpdir(), 'nxds-figma-own-')),
  only: ['Button', 'Card'],
  progress: () => {},
});
const ownVariable = (token: string) =>
  own.capture.collections
    .flatMap((collection) => collection.variables)
    .find((entry) => entry.token === token);
const ownButton = own.capture.components
  .find((spec) => spec.name === 'Button')
  ?.variants.find((entry) => entry.values['State'] === 'default')?.root;
const blue600 = ownVariable('nx-color-blue-600');
check(own.problems.length === 0, `Own colours: ${own.problems.join('; ')}`);
check(
  ownButton?.fills[0]?.token === 'nx-color-primary-background',
  "Own colours: Button's fill isn't bound to primary-background."
);
check(
  JSON.stringify(ownButton?.fills[0]?.color) === JSON.stringify(blue600?.light),
  "Own colours: Button doesn't draw in the colours file's blue-600."
);
check(
  ownVariable('nx-color-primary-background')?.lightAlias ===
    'nx-color-blue-600' &&
    ownVariable('nx-color-primary-background')?.darkAlias ===
      'nx-color-blue-400',
  'Own colours: primary/background is not an alias of blue-600 in light and blue-400 in dark.'
);
check(
  ownVariable('nx-color-border-default')?.lightAlias === 'nx-color-foreground',
  'Own colours: border/default is not an alias of foreground.'
);
const foreground = ownVariable('nx-color-primary-foreground');
check(
  foreground?.lightAlias === undefined &&
    typeof foreground?.light === 'object' &&
    Math.abs(foreground.light.r - 225 / 255) < 0.01,
  "Own colours: primary/foreground isn't the app's #e11d48."
);
check(
  ownVariable('nx-color-primary-background-hover')?.lightAlias === undefined,
  'Own colours: a color-mix() became an alias.'
);
check(
  blue600 !== undefined &&
    ownVariable('nx-color-blue-400') !== undefined &&
    ownVariable('nx-color-red-600') === undefined,
  'Own colours: the referenced palette colours, and only those, are exported.'
);
const ownShadow = own.capture.effectStyles.find(
  (style) => style.token === 'nx-shadow-sm'
);
check(
  ownShadow?.effects.length === 1 && ownShadow.effects[0]?.blur === 6,
  "Own colours: shadow/sm isn't the colours file's shadow."
);

// The link: the plugin's UI fetches the capture with CORS, and posts its report.
const link = await openLink(json, 0);
const base = `http://localhost:${link.port}`;
const fetched = await fetch(`${base}/capture`, { headers: { origin: 'null' } });
check(
  fetched.headers.get('access-control-allow-origin') === '*',
  'Link: /capture does not allow a null origin.'
);
check(
  (await fetched.text()) === json,
  'Link: /capture does not answer the capture.'
);
const preflight = await fetch(`${base}/report`, { method: 'OPTIONS' });
check(
  preflight.status === 204 &&
    (preflight.headers.get('access-control-allow-headers') ?? '').includes(
      'content-type'
    ),
  'Link: the preflight does not allow a JSON post.'
);
const junk = await fetch(`${base}/report`, {
  method: 'POST',
  body: '{"format":"other"}',
});
check(junk.status === 400, 'Link: it took a body that is not a report.');
const sent: BuildReport = {
  format: REPORT_FORMAT,
  version: 2,
  created: {
    collections: 5,
    variables: 1,
    textStyles: 1,
    effectStyles: 1,
    icons: 1,
    componentSets: 1,
    components: 1,
    instances: 1,
  },
  modes: ['Light'],
  darkModeError: 'in addMode: Limited to 1 modes only',
  unbound: [],
  fonts: [],
  failures: [],
};
const posted = await fetch(`${base}/report`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(sent),
});
check(
  posted.status === 204,
  `Link: posting the report answered ${posted.status}.`
);
check(
  JSON.stringify(await link.report) === JSON.stringify(sent),
  'Link: the report it resolved with is not the one posted.'
);
await link.close();

if (failures.length > 0) {
  console.error(
    `Figma smoke test failed:\n${failures.map((failure) => `  ${failure}`).join('\n')}`
  );
  process.exit(1);
}
if (!kept) rmSync(outDir, { recursive: true, force: true });
console.log(
  `Figma smoke test passed: ${variantCount} variants of ${capture.components.length} components and ${capture.icons.length} icons, their bindings, sizing, instances, properties and variables, and the link.`
);
