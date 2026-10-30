// SETUP.md: the guide the export writes beside project/, which walks Claude
// in a chat through publishing the system, installing it on a canvas and
// checking it with the sampler artboard. The sampler is a static dashboard
// the export ships as an artboard file, which Claude puts on the canvas
// unchanged. It mounts every attribute form a canvas writes, so it doubles
// as the install test.
import type { Attribute } from './attribute.ts';
import { ICON_NAMES } from './icons.ts';
import { type FlatComponent, isRequired } from './props.ts';
import {
  convertValue,
  type Props,
  type ValueAttribute,
} from './runtime/values.ts';
import { TEXT_PLAIN_FILES } from './validate.ts';

/** The folder a canvas installs the system into, under `ds/`. */
const CANVAS_FOLDER = 'nxds';

/** The sampler artboard's file name. A canvas shows a file as an artboard only when its name ends `.dc.html`. */
export const SAMPLER_FILE = 'nxds-sampler.dc.html';

/** The width the sampler is laid out at, as a page. */
const SAMPLER_WIDTH = 1440;

/** The sampler's whole script: it passes the `mode` tweak to the root's `data-theme`, and does nothing else. */
const MODE_SCRIPT = `class Component extends DCLogic {
  renderVals() {
    return { mode: this.props.mode ?? 'light' };
  }
}`;

/** The attribute forms the sampler has to write at least once. */
export const SAMPLER_FORMS = [
  'a bare boolean',
  'a boolean as "true" or "false"',
  'a number',
  'one of a list of options',
  'a comma list',
  'a comma list its type prop picks',
  'an ISO date',
  'an ISO month',
  'a date range',
  'JSON',
  'an icon name',
] as const;

type SamplerForm = (typeof SAMPLER_FORMS)[number];

const X_IMPORT =
  /<x-import((?:\s+[a-z][a-z0-9-]*(?:="[^"]*"|='[^']*')?)*)\s*>/g;
const ATTRIBUTE = /([a-z][a-z0-9-]*)(?:="([^"]*)"|='([^']*)')?/g;
const X_IMPORT_OPENING = /<x-import\b/gi;
const PART = 'component-from-global-scope';
const ICONS = new Set<string>(ICON_NAMES);

/** The files step 2 checks a canvas for, under `ds/<folder>/`. The canvas copies tokens.json itself, and README.md's "On a Design canvas" section names the rest. */
const CANVAS_FILES = [
  'tokens.json',
  'tokens.css',
  'components/bundle.css',
  'components/bundle.js',
  'components/index.d.ts',
];

/** The lines under `## <heading>` up to the next `## ` heading, or undefined when there is no such heading. */
function markdownSection(text: string, heading: string) {
  const lines = text.split('\n');
  const start = lines.indexOf(`## ${heading}`);
  if (start === -1) return undefined;
  const end = lines.findIndex(
    (line, index) => index > start && line.startsWith('## ')
  );
  return lines.slice(start + 1, end === -1 ? undefined : end).join('\n');
}

function canvasSection(readme: string) {
  const section = markdownSection(readme, 'On a Design canvas');
  if (!section) throw new Error('README.md: no "On a Design canvas" section.');
  return section;
}

/** The `<link>` and `<script>` lines README.md's "On a Design canvas" section gives an artboard, with its `ds/<folder>/` paths. */
export function canvasLinks(readme: string) {
  const html = /```html\n([\s\S]*?)```/.exec(canvasSection(readme))?.[1];
  if (!html) {
    throw new Error(
      'README.md: no html block under "On a Design canvas" to link the system from.'
    );
  }
  return html.trim().split('\n');
}

/** The README's link lines with the canvas's `ds/nxds/` paths. */
function canvasRootLinks(readme: string) {
  return canvasLinks(readme).map((line) =>
    line.replaceAll('ds/<folder>/', `ds/${CANVAS_FOLDER}/`)
  );
}

const decodeAttribute = (value: string) =>
  value.replaceAll('&quot;', '"').replaceAll('&amp;', '&');

function tweaksOf(attribute: string) {
  try {
    return JSON.parse(decodeAttribute(attribute)) as Record<string, unknown>;
  } catch {
    throw new Error(`${SAMPLER_FILE}: data-props isn't JSON.`);
  }
}

const whole = (value: unknown) =>
  Number.isInteger(value) ? (value as number) : undefined;

/** The pieces of the sampler file: its head lines, the markup inside `<x-dc>` after its `<helmet>`, its tweaks, its script, and the size its `$preview` gives. */
export function samplerFile(file: string) {
  const head = /<head>\n([\s\S]*?)\n<\/head>/.exec(file)?.[1];
  const dc =
    /<x-dc>\n(?:<helmet>[\s\S]*?<\/helmet>\n)?([\s\S]*?)\n<\/x-dc>/.exec(
      file
    )?.[1];
  const script =
    /<script type="text\/x-dc" data-dc-script data-props="([^"]*)">\n([\s\S]*?)\n<\/script>/.exec(
      file
    );
  if (head === undefined || dc === undefined || !script) {
    throw new Error(
      `${SAMPLER_FILE}: no <head>, <x-dc> or data-dc-script block where a canvas artboard has one.`
    );
  }
  const props = tweaksOf(script[1] ?? '');
  const preview = props['$preview'] as Record<string, unknown> | undefined;
  return {
    title: /<title>([^<]*)<\/title>/.exec(head)?.[1],
    head: head.split('\n'),
    markup: dc,
    props,
    script: script[2] ?? '',
    width: whole(preview?.['width']),
    height: whole(preview?.['height']),
  };
}

/** The `boards` entry SETUP.md tells Claude to add to the canvas's `canvas.json`. */
export function boardEntry(file: string) {
  const { title, width, height } = samplerFile(file);
  return JSON.stringify({
    path: SAMPLER_FILE,
    title,
    expand: 'fill',
    w: width,
    h: height,
  });
}

const CLASS_ATTRIBUTE = /\sclass(?:-name)?=(?:"([^"]*)"|'([^']*)')/g;

// Whether `css` has a rule for `.name`, escaped the way Tailwind writes it.
function definesClass(css: string, name: string) {
  const selector = `.${name.replace(/[^\w-]/g, '\\$&')}`;
  for (
    let at = css.indexOf(selector);
    at !== -1;
    at = css.indexOf(selector, at + 1)
  ) {
    if (!/[\w\\-]/.test(css[at + selector.length] ?? '')) return true;
  }
  return false;
}

/** Why the sampler file wouldn't show or check on a canvas: a head that doesn't link the system, state beyond the `mode` tweak, or a class no stylesheet defines. */
function fileProblems(
  file: string,
  { readme, stylesheets }: { readme: string; stylesheets: string }
) {
  const problems: string[] = [];
  const { head, markup, props, script, width, height } = samplerFile(file);
  const links = canvasRootLinks(readme);
  const support = head.indexOf('<script src="./support.js"></script>');
  if (
    support === -1 ||
    links.some((line, index) => head[support + 1 + index] !== line)
  ) {
    problems.push(
      `${SAMPLER_FILE}: <head> must have the support.js line, then the README's link lines in order.`
    );
  }
  // An overlay's content renders outside the root, so it takes the mode too.
  const bindings = file.match(/\{\{[^}]*\}\}/g) ?? [];
  const themed = file.match(/\sdata-theme="\{\{mode\}\}"/g) ?? [];
  if (
    bindings.length !== themed.length ||
    !markup.startsWith('<div data-theme="{{mode}}"')
  ) {
    problems.push(
      `${SAMPLER_FILE}: the only binding is data-theme="{{mode}}", on the root and on overlay content. Found ${bindings.join(', ') || 'none'}.`
    );
  }
  for (const [pattern, what] of [
    [/<sc-(?:for|if)\b/, 'sc-for or sc-if'],
    [/\sdc-props=/, 'dc-props'],
    [/\son-[a-z-]+=/, 'an on-* handler'],
  ] as const) {
    if (pattern.test(markup)) {
      problems.push(
        `${SAMPLER_FILE} uses ${what}. Write every row out, and set state with attributes.`
      );
    }
  }
  const mode = props['mode'] as Record<string, unknown> | undefined;
  if (
    Object.keys(props).sort().join() !== '$preview,mode' ||
    mode?.['editor'] !== 'enum' ||
    JSON.stringify(mode['options']) !== '["light","dark"]' ||
    mode['default'] !== 'light'
  ) {
    problems.push(
      `${SAMPLER_FILE}: data-props holds only mode, an enum of light and dark that defaults to light, and $preview.`
    );
  }
  if (width !== SAMPLER_WIDTH || height === undefined) {
    problems.push(
      `${SAMPLER_FILE}: $preview is ${SAMPLER_WIDTH} wide, with its height at that width in whole px.`
    );
  }
  if (script !== MODE_SCRIPT) {
    problems.push(
      `${SAMPLER_FILE}: the data-dc-script block only returns mode:\n${MODE_SCRIPT}`
    );
  }
  const classes = new Set(
    [...markup.matchAll(CLASS_ATTRIBUTE)].flatMap(([, double, single]) =>
      (double ?? single ?? '').split(/\s+/).filter(Boolean)
    )
  );
  for (const name of classes) {
    if (!definesClass(stylesheets, name)) {
      problems.push(
        `${SAMPLER_FILE}: no stylesheet the canvas links defines the class ${name}.`
      );
    }
  }
  return problems;
}

/** Why a guide built from these inputs would send Claude wrong: a publish step that leaves out a `text/plain` file, a file the install leaves out, or a link line that isn't one. */
function guideProblems({
  template,
  readme,
}: {
  template: string;
  readme: string;
}) {
  const problems: string[] = [];
  const publish = markdownSection(template, '1. Publish the system');
  const update = markdownSection(template, 'Update to a new release');
  const updateStep = update?.match(/^4\. .*$/m)?.[0];
  for (const [name, step, missing] of [
    ['step 1', publish, "a '## 1. Publish the system' section"],
    [
      'update step 4',
      updateStep,
      update === undefined
        ? "a '## Update to a new release' section"
        : 'step 4 under Update to a new release',
    ],
  ] as const) {
    if (step === undefined) {
      problems.push(`SETUP.md has no ${missing}.`);
      continue;
    }
    if (!step.includes('{{textPlainFiles}}')) {
      problems.push(
        `SETUP.md: ${name} must send {{textPlainFiles}} as text/plain, or the publish is refused.`
      );
    }
  }
  const section = canvasSection(readme);
  for (const file of CANVAS_FILES.filter((file) => file !== 'tokens.json')) {
    if (!section.includes(`\`${file}\``)) {
      problems.push(
        `README.md's "On a Design canvas" section doesn't name ${file}, so a canvas install leaves it out.`
      );
    }
  }
  if (canvasLinks(readme).some((line) => !/^<(?:link|script) /.test(line))) {
    problems.push(
      'README.md: the "On a Design canvas" html block holds a line that isn\'t a <link> or <script>. Those lines go in <head>.'
    );
  }
  return problems;
}

export function setupGuide({
  template,
  readme,
  sampler,
  version,
  files,
}: {
  template: string;
  readme: string;
  sampler: string;
  version: string;
  files: readonly string[];
}) {
  const problems = guideProblems({ template, readme });
  if (problems.length > 0) throw new Error(problems.join('\n'));
  const canvasFiles = CANVAS_FILES.map(
    (file) => `- \`ds/${CANVAS_FOLDER}/${file}\``
  ).join('\n');
  const textPlainFiles = TEXT_PLAIN_FILES.map(
    (file) => `\`project/${file}\``
  ).join(' and ');
  const guide = template
    .replaceAll('{{version}}', version)
    .replaceAll('{{files}}', String(files.length))
    .replaceAll('{{textPlainFiles}}', () => textPlainFiles)
    .replace('{{canvasFiles}}', () => canvasFiles)
    .replace('{{boardEntry}}', () => boardEntry(sampler));
  const left = /\{\{\w+\}\}/.exec(guide);
  if (left) throw new Error(`SETUP.md: ${left[0]} has no value.`);
  return guide;
}

type Form = SamplerForm | 'text' | null;

function scalarForm(
  literals: readonly (string | number)[],
  raw: string,
  value: unknown
): Form {
  if (typeof value === 'boolean') {
    return raw === '' ? 'a bare boolean' : 'a boolean as "true" or "false"';
  }
  if (literals.some((literal) => literal === value)) {
    return 'one of a list of options';
  }
  return typeof value === 'number' ? 'a number' : 'text';
}

/** The form `raw` takes, given the value the bundle converts it to. */
function valueForm(attribute: ValueAttribute, raw: string, value: unknown) {
  switch (attribute.kind) {
    case 'scalar':
      return scalarForm(attribute.literals, raw, value);
    case 'list':
      if (!Array.isArray(value)) {
        return scalarForm(attribute.single?.literals ?? [], raw, value);
      }
      return attribute.listWhen
        ? 'a comma list its type prop picks'
        : 'a comma list';
    case 'date':
      if (Array.isArray(value)) return 'a comma list';
      if (!(value instanceof Date)) return 'a date range';
      return /^\d{4}-\d{2}$/.test(raw.trim()) ? 'an ISO month' : 'an ISO date';
    case 'json':
      return typeof value === 'boolean' ? scalarForm([], raw, value) : 'JSON';
  }
}

/** The form an attribute's value takes for its prop: one of SAMPLER_FORMS, free `text`, or null when the bundle can't read it. */
function formOf(
  attribute: Attribute,
  raw: string,
  props: Props,
  required: boolean
): Form {
  if (attribute.kind === 'content' || attribute.kind === 'none') return null;
  if (attribute.kind === 'icon') {
    return ICONS.has(raw) ? 'an icon name' : null;
  }
  const converted = convertValue(raw, attribute, props, required);
  return 'problem' in converted
    ? null
    : valueForm(attribute, raw, converted.value);
}

const camel = (name: string) =>
  name.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());

/** Each x-import tag in `markup`: the part it mounts, its attributes as written, and the props they set. A bare attribute has no value. */
export function samplerTags(markup: string) {
  return [...markup.matchAll(X_IMPORT)].map(([, written = '']) => {
    const attributes = new Map(
      [...written.matchAll(ATTRIBUTE)].map(
        ([, name = '', double, single]) =>
          [name, double ?? single] as [string, string | undefined]
      )
    );
    const props: Props = Object.fromEntries(
      [...attributes].map(([name, value]) => [camel(name), value ?? ''])
    );
    const part = attributes.get(PART)?.replace(/^Nxds\./, '');
    return { part, attributes, props };
  });
}

/** Every part and attribute in the sampler the bundle can't mount, and every form it leaves out. */
function attributeProblems(sampler: string, parts: FlatComponent[]) {
  const byName = new Map(parts.map((part) => [part.name, part]));
  const problems: string[] = [];
  const written = new Set<SamplerForm>();
  const tags = samplerTags(sampler);
  const openings = sampler.match(X_IMPORT_OPENING)?.length ?? 0;
  if (openings !== tags.length) {
    problems.push(
      `${SAMPLER_FILE} has ${openings - tags.length} x-import tags the build can't read. Write attributes in lowercase, with quoted values.`
    );
  }
  for (const { part: name, attributes, props } of tags) {
    const part = name === undefined ? undefined : byName.get(name);
    if (!part) {
      problems.push(
        `${SAMPLER_FILE} mounts ${name ?? 'an x-import with no part'}, which the bundle doesn't export.`
      );
      continue;
    }
    for (const [attribute, value] of attributes) {
      if (attribute === PART || /^(?:aria|data)-/.test(attribute)) continue;
      const prop = part.props.find((entry) => entry.name === camel(attribute));
      const form = prop?.attribute
        ? formOf(prop.attribute, value ?? '', props, isRequired(prop))
        : null;
      if (!form) {
        problems.push(
          `${SAMPLER_FILE}: ${part.name} ${attribute}${value === undefined ? '' : `="${value}"`} isn't a prop it takes in a form the bundle reads.`
        );
        continue;
      }
      if (form !== 'text') written.add(form);
    }
  }
  for (const form of SAMPLER_FORMS) {
    if (!written.has(form))
      problems.push(`${SAMPLER_FILE} writes no prop as ${form}.`);
  }
  return problems;
}

/** Everything that would keep the sampler file from showing, checking or mounting on a canvas. */
export function samplerProblems(
  file: string,
  context: { readme: string; stylesheets: string; parts: FlatComponent[] }
) {
  return [
    ...fileProblems(file, context),
    ...attributeProblems(samplerFile(file).markup, context.parts),
  ];
}
