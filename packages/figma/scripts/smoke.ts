// Runs the Figma capture in examples/figma-app, the reference app with every
// nxds component, the way `nxds-cli export figma` does, then checks what a
// designer relies on in Figma: every recipe captured, every colour bound,
// palette colours only when used, text styles bound to the typography
// variables, icons as swappable instances, repeated parts as instances of
// their own components, an app's own colours and edited components, and the
// local link the plugin talks to. Run `npm install` in examples/figma-app
// first. Pass a folder to keep the captures and their screenshots.
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { buildAppPage } from '../src/app.ts';
import {
  captureComponents,
  componentNames,
  recipeContent,
} from '../src/capture.ts';
import { openLink } from '../src/link.ts';
import { appParts } from '../src/props.ts';
import {
  type BuildReport,
  type ComponentSpec,
  type Layer,
  PROTOCOL_VERSION,
  REPORT_FORMAT,
  unboundValues,
} from '../src/spec.ts';
import { isPrimitiveColor } from '../src/tokens.ts';

const reference = path.join(
  import.meta.dirname,
  '..',
  '..',
  '..',
  'examples',
  'figma-app'
);
if (!existsSync(path.join(reference, 'node_modules'))) {
  throw new Error('Run npm install in examples/figma-app first.');
}

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

/** Captures the app at `root` as `nxds-cli export figma` does, without the plugin. */
async function captureApp(root: string, out: string, only?: readonly string[]) {
  const config = JSON.parse(
    readFileSync(path.join(root, 'nxds.json'), 'utf8')
  ) as { version: string; dir: string; css: string; iconLibrary?: string };
  const css = readFileSync(path.join(root, config.css), 'utf8');
  const parts = appParts(root, config.dir);
  const content = recipeContent(parts);
  const page = await buildAppPage(
    {
      root,
      dir: config.dir,
      css: config.css,
      iconLibrary: config.iconLibrary ?? 'phosphor',
      ownColors: css.includes('nxds-colors.css'),
    },
    content.text,
    content.icons
  );
  const result = await captureComponents({
    version: config.version,
    files: { styles: [page.css], scripts: [page.script] },
    props: parts.props,
    outDir: out,
    progress: only ? () => {} : (line) => console.log(line),
    only,
  });
  return { ...result, undrawn: content.undrawn };
}

const started = Date.now();
const { capture, problems, notInstalled, undrawn } = await captureApp(
  reference,
  outDir
);
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
const layers = (root: Layer): Layer[] => {
  if (root.type === 'FRAME') return [root, ...root.children.flatMap(layers)];
  if (root.type === 'INSTANCE')
    return [root, ...(root.slotContent ?? []).flatMap(layers)];
  return [root];
};
const named = (root: Layer, name: string) =>
  layers(root).filter((layer) => layer.name === name);
const instancesOf = (root: Layer, name: string) =>
  layers(root).filter(
    (layer): layer is Extract<Layer, { type: 'INSTANCE' }> =>
      layer.type === 'INSTANCE' && layer.component === name
  );

// The reference app has every component, and every recipe draws from it.
for (const problem of problems) fail(`Not captured: ${problem}`);
check(
  notInstalled.length === 0,
  `figma-app lacks parts these recipes draw: ${notInstalled.join(', ')}.`
);
check(
  undrawn.length === 0,
  `These figma-app components have no recipe: ${undrawn.join(', ')}.`
);
const captured = new Set(capture.components.map((spec) => spec.name));
for (const name of componentNames()) {
  check(captured.has(name), `${name} has no Figma component.`);
}
check(
  JSON.stringify(component('Button').grid) ===
    JSON.stringify({
      blocks: ['Variant'],
      rows: ['State'],
      columns: ['Size', 'Icon only'],
    }),
  `Button: its grid is ${JSON.stringify(component('Button').grid)}.`
);
check(
  component('Tabs/Tab').card === 'Tabs',
  `Tabs/Tab: its page is ${component('Tabs/Tab').card}, expected Tabs.`
);
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
const iconNames = new Set(capture.icons.map((icon) => icon.name));
check(
  ['plus', 'check', 'x', 'caret-down', 'house'].every((name) =>
    iconNames.has(name)
  ),
  "The icon set lacks the icons nxds's components and the recipes draw."
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
const cardTitleRoot = variant(component('Card/Title'));
const alert = variant(component('Alert'), {
  Variant: 'default',
  Presentation: 'card',
  Layout: 'stack',
});
const cardTitle = named(cardTitleRoot, 'Label')[0];
const alertTitle = named(
  variant(component('Alert/Title'), { Variant: 'default', Layout: 'stack' }),
  'Label'
)[0];
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
    alert.children.map((child) => child.name).join(',') === 'Alert/Icon,Body',
  'Alert: its grid is not a row of Icon and Body.'
);
check(
  instancesOf(variant(component('Card/Header')), 'Card/Title')[0]?.sizing
    .horizontal === 'FILL',
  'Card: its title does not fill.'
);
// A part keeps only the properties of its whole that change how it looks.
const keptBy = (name: string) =>
  component(name)
    .variantProperties.map((property) => property.name)
    .join(',');
check(
  keptBy('Alert/Icon') === 'Variant' && keptBy('Sidebar/Header') === '',
  `Parts: Alert/Icon keeps ${keptBy('Alert/Icon')}, Sidebar/Header keeps ${keptBy('Sidebar/Header')}.`
);
// A Button a group restyles is still a Button, with its corners overridden.
const grouped = instancesOf(variant(component('ButtonGroup')), 'Button');
check(
  grouped.length >= 2 &&
    grouped.some((layer) => layer.restyle?.radius.topLeft.value === 0),
  `ButtonGroup: ${grouped.length} Button instances, none with its corners squared.`
);
check(
  component('Card/Header')
    .booleanProperties.map((property) => property.name)
    .join(',') === 'Description,Action',
  "Card/Header: its Description and Action toggles aren't its own."
);

// Nested components and repeated parts are instances.
const nesting: [string, Record<string, string>, string, number][] = [
  ['Alert/Actions', { Layout: 'stack' }, 'Button', 1],
  ['Card/Footer', {}, 'Button', 2],
  ['Card', {}, 'Card/Footer', 1],
  ['DropdownMenu/Content', {}, 'DropdownMenu/Item', 4],
  ['DropdownMenu', {}, 'DropdownMenu/Content', 1],
  ['ContextMenu/Content', {}, 'DropdownMenu/Item', 1],
  ['ContextMenu', {}, 'ContextMenu/Content', 1],
  ['Select', {}, 'Select/Trigger', 1],
  ['Select', {}, 'Select/Content', 1],
  ['Menubar', {}, 'Menubar/Content', 1],
  ['Menubar', {}, 'Menubar/Trigger', 3],
  ['MultiSelect', {}, 'MultiSelect/Content', 1],
  ['NavigationMenu', {}, 'NavigationMenu/Trigger', 2],
  ['Popover', {}, 'Popover/Content', 1],
  ['Tooltip', {}, 'Tooltip/Content', 1],
  ['AlertDialog', {}, 'AlertDialog/Content', 1],
  ['Sheet', { Side: 'top' }, 'Sheet/Content', 1],
  ['Sheet/Content', { Side: 'top' }, 'Sheet/Body', 1],
  ['Drawer', { Direction: 'left' }, 'Drawer/Content', 1],
  ['Drawer/Content', { Direction: 'left' }, 'Drawer/Body', 1],
  ['InputOTP/Group', {}, 'InputOTP/Slot', 3],
  ['EmptyState/Header', {}, 'EmptyState/Title', 1],
  ['DescriptionList', {}, 'DescriptionList/Item', 3],
  ['Select/Content', {}, 'Select/Item', 4],
  ['Command', {}, 'Command/Item', 1],
  ['Tabs', {}, 'Tabs/List', 1],
  ['Accordion', {}, 'Accordion/Item', 3],
  ['RadioGroup', {}, 'RadioGroup/Item', 3],
  ['ToggleGroup', {}, 'ToggleGroup/Item', 3],
  ['Table', {}, 'Table/Body', 1],
  ['Table/Body', {}, 'Table/Row', 3],
  ['Table/Row', {}, 'Table/Cell', 3],
  ['Table/Body', { Striped: 'true' }, 'Table/Row', 3],
  ['Alert', { Variant: 'destructive' }, 'Alert/Actions', 1],
  ['Alert', { Layout: 'inline' }, 'Alert/Content', 1],
  ['Card/Header', {}, 'Card/Title', 1],
  ['Card', {}, 'Card/Header', 1],
  ['Accordion/Item', {}, 'Accordion/Trigger', 1],
  ['Tabs/List', {}, 'Tabs/Tab', 2],
  ['Sidebar/Group', {}, 'Sidebar/Group label', 1],
  ['Item', {}, 'Item/Content', 1],
  ['Attachment', {}, 'Attachment/Media', 1],
  ['Sidebar', {}, 'Sidebar/Content', 1],
  ['Sidebar/Group', {}, 'Sidebar/Menu button', 3],
  ['Breadcrumb', {}, 'Breadcrumb/Link', 1],
  ['Pagination', {}, 'Pagination/Link', 6],
  ['Sidebar/Header', {}, 'Sidebar/Menu button', 1],
  ['Dialog/Header', {}, 'Dialog/Title', 1],
  ['Dialog/Header', {}, 'Dialog/Description', 1],
  ['Dialog/Footer', {}, 'Button', 2],
  ['Dialog/Content', {}, 'Dialog/Header', 1],
  ['Dialog/Content', {}, 'Dialog/Body', 1],
  ['Dialog/Content', {}, 'Dialog/Footer', 1],
  ['Dialog/Content', {}, 'Dialog/Close', 1],
  ['Dialog', {}, 'Dialog/Overlay', 1],
  ['Dialog', {}, 'Dialog/Content', 1],
];
// A part that renders `children` is a slot, which what holds it fills with its own content.
check(
  component('Card/Content')
    .slotProperties.map(({ name }) => name)
    .join(',') === 'Content',
  'Card/Content: it has no Content slot.'
);
const filled: [string, Record<string, string>, string, number][] = [
  ['Card', {}, 'Card/Content', 1],
  ['Carousel', {}, 'Card', 1],
  ['MultiSelect/Content', {}, 'Command', 1],
  ['MessageScroller', {}, 'EmptyState', 1],
  ['Resizable', {}, 'Resizable/Panel', 2],
];
for (const [name, values, part, least] of filled) {
  const found = instancesOf(variant(component(name), values), part).filter(
    (layer) => layer.slotContent
  ).length;
  check(
    found >= least,
    `${name}: ${found} ${part} instances fill a slot, expected at least ${least}.`
  );
}

const dialog = variant(component('Dialog'), {});
check(
  dialog.width.value === 1280 &&
    dialog.height.value === 800 &&
    dialog.sizing.vertical === 'FIXED',
  `Dialog: the screen is ${dialog.width.value}x${dialog.height.value} ${dialog.sizing.vertical}, expected a fixed 1280x800.`
);
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
  props('DropdownMenu/Item').booleans.includes('Show shortcut:true'),
  `DropdownMenu/Item booleans: ${props('DropdownMenu/Item').booleans}.`
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
const unbound = unboundValues(capture);
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

// A copy of figma-app, edited as a team would: its own colours file, where a
// reference to another nxds token becomes an alias and an app's own variable
// resolves to its value, a new Button variant, a component of its own that no
// recipe draws, and Kbd removed. The copy sits in the repo, so its packages
// resolve from the repo's.
const fixture = path.join(import.meta.dirname, '..', '.fixture');
rmSync(fixture, { recursive: true, force: true });
cpSync(reference, fixture, {
  recursive: true,
  filter: (source) => !/[/\\](?:node_modules|nxds-figma)$/.test(source),
});
const config = JSON.parse(
  readFileSync(path.join(fixture, 'nxds.json'), 'utf8')
) as { dir: string; css: string };
const edit = (file: string, from: string, to: string) => {
  const full = path.join(fixture, file);
  const text = readFileSync(full, 'utf8');
  const edited = text.replace(from, to);
  if (edited === text) throw new Error(`figma-app's ${file} changed shape.`);
  writeFileSync(full, edited);
};
writeFileSync(
  path.join(fixture, path.dirname(config.css), 'nxds-colors.css'),
  `@layer theme {
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
}
`
);
edit(
  config.css,
  "@import './components/nxds/tailwind/nxds.css';",
  "@import './components/nxds/tailwind/nxds.css';\n@import './nxds-colors.css';"
);
edit(
  path.join(config.dir, 'components/button/button-variants.ts'),
  "        link: 'nx:border-0",
  "        brand: 'nx:bg-information-background nx:text-information-foreground',\n        link: 'nx:border-0"
);
mkdirSync(path.join(fixture, config.dir, 'components/rating'));
writeFileSync(
  path.join(fixture, config.dir, 'components/rating/rating.tsx'),
  '/** A row of stars. */\nexport function Rating({ value }: { value: number }) {\n  return <span data-slot="rating">{"★".repeat(value)}</span>;\n}\n'
);
rmSync(path.join(fixture, config.dir, 'components/kbd'), { recursive: true });
const own = await captureApp(fixture, path.join(outDir, 'own'), [
  'Button',
  'Card',
  'Kbd',
]);
rmSync(fixture, { recursive: true, force: true });

const ownVariable = (token: string) =>
  own.capture.collections
    .flatMap((collection) => collection.variables)
    .find((entry) => entry.token === token);
const ownComponent = (name: string) =>
  own.capture.components.find((spec) => spec.name === name);
const ownVariant = (values: Record<string, string>) =>
  ownComponent('Button')?.variants.find((entry) =>
    Object.entries(values).every(([key, value]) => entry.values[key] === value)
  )?.root;
const ownButton = ownVariant({ Variant: 'default', State: 'default' });
const blue600 = ownVariable('nx-color-blue-600');
check(own.problems.length === 0, `Edited app: ${own.problems.join('; ')}`);
check(
  !capture.partial && own.capture.partial,
  'Capture: partial is not set by --only alone.'
);
const ownFooter = ownComponent('Card/Footer');
check(
  ownButton !== undefined &&
    ownFooter !== undefined &&
    ownFooter.variants.some(
      (variant) => instancesOf(variant.root, 'Button').length > 0
    ),
  'Only: capturing Card alone did not bring in its parts and the Buttons they hold as instances.'
);
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
check(
  ownComponent('Button')
    ?.variantProperties.find((property) => property.name === 'Variant')
    ?.values.includes('brand') === true,
  "Edited app: Button's Variant has no brand, the app's new variant."
);
check(
  ownVariant({ Variant: 'brand', State: 'default' })?.fills[0]?.token ===
    'nx-color-information-background',
  "Edited app: Button's brand variant isn't bound to information-background."
);
check(
  own.notInstalled.includes('Kbd'),
  "Edited app: Kbd, which the app removed, isn't listed as not installed."
);
check(
  own.undrawn.includes('rating'),
  "Edited app: rating, the app's own component, isn't listed as having no recipe."
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
const crossOrigin = await fetch(`${base}/capture`, {
  headers: { origin: 'https://example.com' },
});
check(
  crossOrigin.status === 403,
  'Link: it answered a web page, which sends its own origin.'
);
// A host name rebound to this machine reaches the port with its own Host.
const rebound = await new Promise<number | undefined>((resolve, reject) => {
  request(
    `${base}/capture`,
    { headers: { host: `example.com:${link.port}` } },
    (response) => {
      response.resume();
      resolve(response.statusCode);
    }
  )
    .on('error', reject)
    .end();
});
check(rebound === 403, 'Link: it answered a request for another host.');
const sent: BuildReport = {
  format: REPORT_FORMAT,
  version: PROTOCOL_VERSION,
  written: {
    pages: 2,
    collections: 5,
    variables: 1,
    textStyles: 1,
    effectStyles: 1,
    icons: 1,
    componentSets: 1,
    components: 1,
    instances: 1,
  },
  removed: ['page Kbd'],
  modes: ['Light'],
  darkModeError: 'in addMode: Limited to 1 modes only',
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
  `Figma smoke test passed: ${variantCount} variants of ${capture.components.length} components and ${capture.icons.length} icons, their bindings, sizing, instances, properties and variables, an app's own colours and edited components, and the link.`
);
