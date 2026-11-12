// Runs the Figma capture on the built @nxds/claude-design release, the way
// `nxds-cli export figma` does, then checks what a designer relies on in
// Figma: the variant counts, the bindings, hug and fill, the nested Button
// instances and the component properties. Then it checks the local link the
// plugin talks to. Build @nxds/claude-design first. Pass a folder to keep the
// capture and its screenshots; otherwise they go in a temporary folder.
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { captureComponents } from '../src/capture.ts';
import { openLink } from '../src/link.ts';
import {
  type BuildReport,
  type ComponentSpec,
  type FrameLayer,
  type Layer,
  REPORT_FORMAT,
  unboundValues,
} from '../src/spec.ts';

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
const started = Date.now();
const capture = await captureComponents({
  release: 'smoke',
  theme,
  files: {
    bundleJs: readFileSync(
      path.join(project, 'components', 'bundle.js'),
      'utf8'
    ),
    bundleCss: readFileSync(
      path.join(project, 'components', 'bundle.css'),
      'utf8'
    ),
    tokensCss: themed['tokens.css'] ?? '',
    tokensJson: themed['tokens.json'] ?? '',
    indexDts: readFileSync(
      path.join(project, 'components', 'index.d.ts'),
      'utf8'
    ),
  },
  react: umd('react', 'react.production.min.js'),
  reactDom: umd('react-dom', 'react-dom.production.min.js'),
  outDir,
  progress: (line) => console.log(line),
});
const json = JSON.stringify(capture, null, 2);
writeFileSync(path.join(outDir, 'capture.json'), json);
console.log(
  `Captured in ${Math.round((Date.now() - started) / 1000)}s into ${outDir}.`
);

const component = (name: string) => {
  const found = capture.components.find((spec) => spec.name === name);
  if (!found) throw new Error(`No ${name} in the capture.`);
  return found;
};
const variant = (spec: ComponentSpec, values: Record<string, string>) => {
  const found = spec.variants.find((entry) =>
    Object.entries(values).every(
      ([name, value]) => entry.values[name] === value
    )
  );
  if (!found)
    throw new Error(`${spec.name} has no variant ${JSON.stringify(values)}.`);
  return found;
};
const layers = (root: Layer): Layer[] => [
  root,
  ...(root.type === 'FRAME' ? root.children.flatMap(layers) : []),
];
const named = (root: Layer, name: string) =>
  layers(root).filter((layer) => layer.name === name);

const instances = (root: Layer) =>
  layers(root).filter(
    (layer): layer is Extract<Layer, { type: 'INSTANCE' }> =>
      layer.type === 'INSTANCE'
  );
const only = (root: Layer, name: string) => {
  const found = named(root, name);
  if (found.length !== 1)
    throw new Error(`${root.name}: ${found.length} layers named ${name}.`);
  return found[0] as Layer;
};
const token = (
  layer: Layer | undefined,
  read: (layer: Layer) => string | undefined
) => (layer ? read(layer) : undefined);

// Variant counts: every variant property's values, multiplied.
const EXPECTED = {
  Button: 288,
  Input: 54,
  Badge: 36,
  Switch: 16,
  Alert: 20,
  Card: 1,
} as const;
for (const [name, count] of Object.entries(EXPECTED)) {
  check(
    component(name).variants.length === count,
    `${name}: ${component(name).variants.length} variants, expected ${count}.`
  );
}

// Each screenshot shows its variant's box, plus the 8px of room for a focus
// ring, at 2x. A component whose parts start hidden, such as Button's icons,
// is narrower in its screenshot than in its recording.
for (const spec of capture.components) {
  const hidesParts = spec.booleanProperties.some(
    (property) => !property.default
  );
  for (const entry of spec.variants) {
    const png = readFileSync(path.join(outDir, entry.screenshot));
    const width = png.readUInt32BE(16) / 2;
    const height = png.readUInt32BE(20) / 2;
    const expected = {
      width: entry.root.width.value + 16,
      height: entry.root.height.value + 16,
    };
    const wrongWidth = !hidesParts && Math.abs(width - expected.width) > 1;
    if (wrongWidth || Math.abs(height - expected.height) > 1) {
      fail(
        `${spec.name} ${entry.name}: the screenshot is ${width}×${height}, the root ${expected.width}×${expected.height} with its room.`
      );
    }
  }
}

// Button binds every value to the token its classes declare.
const button = variant(component('Button'), {
  Variant: 'default',
  Size: 'default',
  State: 'default',
}).root;
const label = only(button, 'Label');
check(
  button.fills[0]?.token === 'nx-color-primary-background',
  'Button: its fill is not bound to primary-background.'
);
check(
  button.height.token === 'nx-spacing-10',
  'Button: its height is not bound to spacing-10.'
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
  button.layout?.gap.token === 'nx-spacing-2',
  'Button: its gap is not bound to spacing-2.'
);
check(
  label.type === 'TEXT' && label.style === 'label/default',
  'Button: its label has no label/default text style.'
);
check(
  token(label, (layer) =>
    layer.type === 'TEXT' ? layer.fill.token : undefined
  ) === 'nx-color-primary-foreground',
  'Button: its label colour is not bound to primary-foreground.'
);
const hovered = variant(component('Button'), {
  Variant: 'default',
  Size: 'default',
  State: 'hover',
}).root;
check(
  hovered.fills[0]?.token === 'nx-color-primary-background-hover',
  'Button hover: its fill is not bound to primary-background-hover.'
);
const focused = variant(component('Button'), {
  Variant: 'default',
  Size: 'default',
  State: 'focus',
}).root;
check(
  named(focused, 'Focus ring').length === 1,
  'Button focus: no focus ring layer.'
);

// The binding comes from the declared token, not the value: Card text reads
// container-foreground and Alert text reads foreground.
const card = component('Card').variants[0]?.root as FrameLayer;
const alert = variant(component('Alert'), {
  Variant: 'default',
  Presentation: 'card',
  Layout: 'stack',
}).root;
const cardTitle = only(card, 'Title');
const alertTitle = named(alert, 'Title').find((layer) => layer.type === 'TEXT');
check(
  cardTitle.type === 'TEXT' &&
    cardTitle.fill.token === 'nx-color-container-foreground',
  'Card: its title is not bound to container-foreground.'
);
check(
  alertTitle?.type === 'TEXT' &&
    alertTitle.fill.token === 'nx-color-foreground',
  'Alert: its title is not bound to foreground.'
);
const colors = new Map(
  (
    capture.collections.find((collection) => collection.name === 'Color')
      ?.variables ?? []
  ).map((entry) => [entry.token, JSON.stringify(entry.light)])
);
const sameValue =
  colors.get('nx-color-container-foreground') ===
  colors.get('nx-color-foreground');
console.log(
  `container-foreground and foreground ${sameValue ? 'share' : "don't share"} a light value, and each layer is bound to the one its class declares.`
);

// Hug, fill and fixed follow the CSS.
check(
  button.sizing.horizontal === 'HUG' && button.sizing.vertical === 'FIXED',
  'Button: not hug × fixed.'
);
check(label.sizing.horizontal === 'HUG', 'Button: its label does not hug.');
const inputRoot = variant(component('Input'), {
  Variant: 'bordered',
  Size: 'default',
  State: 'default',
}).root;
check(
  inputRoot.sizing.horizontal === 'FIXED' && inputRoot.width.value === 280,
  'Input: not 280px fixed.'
);
check(
  only(inputRoot, 'Text').sizing.horizontal === 'FILL',
  'Input: its text does not fill.'
);
check(cardTitle.sizing.horizontal === 'FILL', 'Card: its title does not fill.');

// Alert's grid is a row of an icon and a body, and its action is a Button instance.
check(
  alert.layout?.mode === 'HORIZONTAL',
  'Alert: its grid is not a horizontal row.'
);
check(
  alert.children.map((child) => child.name).join(',') === 'Icon,Body',
  `Alert: its row holds ${alert.children.map((child) => child.name).join(', ')}, not Icon and Body.`
);
const body = only(alert, 'Body');
check(
  body.type === 'FRAME' &&
    body.layout?.mode === 'VERTICAL' &&
    body.sizing.horizontal === 'FILL',
  'Alert: its body is not a vertical stack that fills.'
);
const alertButtons = instances(alert);
check(
  alertButtons.length === 1 &&
    alertButtons[0]?.component === 'Button' &&
    alertButtons[0].variant['Variant'] === 'outline' &&
    alertButtons[0].texts['Label'] === 'Upgrade',
  'Alert: its action is not an outline Button instance labelled Upgrade.'
);
check(
  instances(only(card, 'Footer')).length === 2,
  'Card: its footer does not hold two Button instances.'
);
check(
  instances(only(card, 'Action'))[0]?.variant['Size'] === 'sm',
  'Card: its action is not a small Button instance.'
);

// Every instance names a Button variant that exists.
const buttonVariants = new Set(
  component('Button').variants.map((entry) => entry.name)
);
for (const spec of capture.components) {
  for (const entry of spec.variants) {
    for (const instance of instances(entry.root)) {
      const name = component(instance.component)
        .variantProperties.map(
          ({ name: property }) => `${property}=${instance.variant[property]}`
        )
        .join(', ');
      check(
        buttonVariants.has(name),
        `${spec.name} ${entry.name}: its ${instance.name} instance names ${name}, which doesn't exist.`
      );
    }
  }
}

// Component properties, and the layers that carry them.
const PROPERTIES = {
  Button: {
    booleans: ['Start icon:false', 'End icon:false'],
    texts: ['Label'],
  },
  Input: { booleans: [], texts: ['Text'] },
  Badge: {
    booleans: ['Left icon:false', 'Right icon:false'],
    texts: ['Label'],
  },
  Switch: { booleans: [], texts: [] },
  Alert: {
    booleans: ['Icon:true', 'Description:true', 'Actions:true'],
    texts: ['Title', 'Description text'],
  },
  Card: {
    booleans: [
      'Description:true',
      'Action:true',
      'Content:true',
      'Footer:true',
    ],
    texts: ['Title', 'Description text', 'Content text'],
  },
} as const;
for (const [name, expected] of Object.entries(PROPERTIES)) {
  const spec = component(name);
  const booleans = spec.booleanProperties
    .map((property) => `${property.name}:${property.default}`)
    .join(',');
  const texts = spec.textProperties.map((property) => property.name).join(',');
  check(
    booleans === expected.booleans.join(','),
    `${name}: boolean properties ${booleans}, expected ${expected.booleans.join(',')}.`
  );
  check(
    texts === expected.texts.join(','),
    `${name}: text properties ${texts}, expected ${expected.texts.join(',')}.`
  );
}

// Every token a layer uses is a variable or a style, and variable names are unique.
const variables = new Set(
  capture.collections.flatMap((collection) =>
    collection.variables.map((entry) => entry.token)
  )
);
const textStyleNames = new Set(capture.textStyles.map((style) => style.name));
const effectStyleNames = new Set(
  capture.effectStyles.map((style) => style.name)
);
const used = new Set<string>();
const collect = (value: unknown) => {
  if (Array.isArray(value)) return value.forEach(collect);
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (key === 'token' && typeof item === 'string') used.add(item);
    else collect(item);
  }
};
for (const spec of capture.components)
  for (const entry of spec.variants) collect(entry.root);
for (const name of used)
  check(
    variables.has(name),
    `${name} is bound in a layer but has no variable.`
  );
for (const spec of capture.components) {
  for (const entry of spec.variants) {
    for (const layer of layers(entry.root)) {
      if (layer.type === 'TEXT' && layer.style)
        check(
          textStyleNames.has(layer.style),
          `${layer.style} is used but not created.`
        );
      if (layer.type === 'FRAME' && layer.shadow?.style)
        check(
          effectStyleNames.has(layer.shadow.style),
          `${layer.shadow.style} is used but not created.`
        );
    }
  }
}
for (const collection of capture.collections) {
  const names = collection.variables.map((entry) => entry.name);
  check(
    new Set(names).size === names.length,
    `${collection.name}: two variables share a name.`
  );
}

// Every colour is bound to a variable. The values left unbound are sizes and
// rings nxds declares as literals, listed for the report.
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
  fail(
    `${value.component} ${value.variant} / ${value.layer}: its ${value.property} ${value.value} isn't bound.`
  );
}
const distinct = new Map<string, number>();
for (const value of unbound) {
  const key = `${value.component} ${value.layer.split(' / ').slice(1).join(' / ') || '(root)'}: ${value.property} ${value.value}`;
  distinct.set(key, (distinct.get(key) ?? 0) + 1);
}
console.log(`${unbound.length} unbound values, ${distinct.size} distinct:`);
for (const [key, count] of [...distinct].sort((a, b) => b[1] - a[1]))
  console.log(`  ${count}× ${key}`);

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
  version: 1,
  created: {
    collections: 4,
    variables: 1,
    textStyles: 1,
    effectStyles: 1,
    componentSets: 5,
    components: 415,
    instances: 3,
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
const received = await link.report;
check(
  JSON.stringify(received) === JSON.stringify(sent),
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
  `Figma smoke test passed: ${capture.components.reduce((sum, spec) => sum + spec.variants.length, 0)} variants of ${capture.components.length} components, their screenshots, bindings, sizing, instances and properties, and the link.`
);
