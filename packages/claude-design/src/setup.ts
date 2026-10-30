// SETUP.md: the guide the export writes beside project/, which walks Claude
// in a chat through publishing the system, installing it on a canvas and
// checking it with the sampler artboard. The sampler mounts every attribute
// form a canvas writes, so it doubles as the install test.
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

function canvasSection(readme: string) {
  const section = /^## On a Design canvas\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(
    readme
  )?.[1];
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

/** What SETUP.md tells Claude to paste: the README's link lines for `<head>`, and the sampler for inside `<x-dc>`. */
export function samplerArtboard(readme: string, sampler: string) {
  const links = canvasLinks(readme).map((line) =>
    line.replaceAll('ds/<folder>/', `ds/${CANVAS_FOLDER}/`)
  );
  return { links: links.join('\n'), sampler: sampler.trim() };
}

/** Why a guide built from these inputs would send Claude wrong: a publish step that leaves out a `text/plain` file, a file the install leaves out, a block in the wrong place. */
function guideProblems({
  template,
  readme,
  sampler,
}: {
  template: string;
  readme: string;
  sampler: string;
}) {
  const problems: string[] = [];
  const publish =
    /^## 1\. Publish the system\n([\s\S]*?)(?=^## )/m.exec(template)?.[1] ?? '';
  const update =
    /^## Update to a new release\n[\s\S]*?^(4\. .*)$/m.exec(template)?.[1] ??
    '';
  for (const [name, step] of [
    ['step 1', publish],
    ['update step 4', update],
  ] as const) {
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
  if (/<(?:link|script)\b/.test(sampler)) {
    problems.push(
      'sampler.html links or runs a file. It goes inside <x-dc>, and the link lines go in <head>.'
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
  const problems = guideProblems({ template, readme, sampler });
  if (problems.length > 0) throw new Error(problems.join('\n'));
  const artboard = samplerArtboard(readme, sampler);
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
    .replace('{{links}}', () => artboard.links)
    .replace('{{sampler}}', () => artboard.sampler);
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
export function samplerProblems(sampler: string, parts: FlatComponent[]) {
  const byName = new Map(parts.map((part) => [part.name, part]));
  const problems: string[] = [];
  const written = new Set<SamplerForm>();
  const tags = samplerTags(sampler);
  const openings = sampler.match(X_IMPORT_OPENING)?.length ?? 0;
  if (openings !== tags.length) {
    problems.push(
      `sampler.html has ${openings - tags.length} x-import tags the build can't read. Write attributes in lowercase, with quoted values.`
    );
  }
  for (const { part: name, attributes, props } of tags) {
    const part = name === undefined ? undefined : byName.get(name);
    if (!part) {
      problems.push(
        `sampler.html mounts ${name ?? 'an x-import with no part'}, which the bundle doesn't export.`
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
          `sampler.html: ${part.name} ${attribute}${value === undefined ? '' : `="${value}"`} isn't a prop it takes in a form the bundle reads.`
        );
        continue;
      }
      if (form !== 'text') written.add(form);
    }
  }
  for (const form of SAMPLER_FORMS) {
    if (!written.has(form))
      problems.push(`sampler.html writes no prop as ${form}.`);
  }
  return problems;
}
