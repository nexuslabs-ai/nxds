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

/** The `<link>` and `<script>` lines README.md's "On a Design canvas" section gives an artboard, with its `ds/<folder>/` paths. */
export function canvasLinks(readme: string) {
  const section = /^## On a Design canvas\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(
    readme
  )?.[1];
  const html = /```html\n([\s\S]*?)```/.exec(section ?? '')?.[1];
  if (!html) {
    throw new Error(
      'README.md: no html block under "On a Design canvas" to link the system from.'
    );
  }
  return html.trim().split('\n');
}

/** The markup SETUP.md tells Claude to paste: the README's link lines, then the sampler. */
export function samplerArtboard(readme: string, sampler: string) {
  const links = canvasLinks(readme).map((line) =>
    line.replaceAll('ds/<folder>/', `ds/${CANVAS_FOLDER}/`)
  );
  return [...links, '', sampler.trim()].join('\n');
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
  files: number;
}) {
  const guide = template
    .replaceAll('{{version}}', version)
    .replaceAll('{{files}}', String(files))
    .replace('{{sampler}}', () => samplerArtboard(readme, sampler));
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
