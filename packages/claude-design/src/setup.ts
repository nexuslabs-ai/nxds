// SETUP.md: the guide the export writes beside project/, which walks Claude
// in a chat through publishing the system, installing it on a canvas and
// checking it with the sampler artboard. The sampler mounts every attribute
// form a canvas writes, so it doubles as the install test.
import type {
  Attribute,
  DateAttribute,
  JsonAttribute,
  ListAttribute,
  ScalarAttribute,
} from './attribute.ts';
import { ICON_NAMES } from './icons.ts';
import type { FlatComponent } from './props.ts';
import { toDate, toNumber } from './runtime/values.ts';

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
const DATE_ITEM: DateAttribute = { kind: 'date', selection: null };

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

/** A tag's raw attribute string for a prop, such as Accordion's `type`. */
type Picked = (prop: string) => string | undefined;

function booleanForm(value: string | undefined): Form {
  if (value === undefined) return 'a bare boolean';
  return value === 'true' || value === 'false'
    ? 'a boolean as "true" or "false"'
    : null;
}

function scalarForm(
  attribute: ScalarAttribute,
  value: string | undefined
): Form {
  const bool = attribute.boolean ? booleanForm(value) : null;
  if (bool) return bool;
  if (value === undefined) return null;
  const number = toNumber(value);
  const option = attribute.literals.some((literal) =>
    typeof literal === 'string' ? literal === value : literal === number
  );
  if (option) return 'one of a list of options';
  if (attribute.number && number !== null) return 'a number';
  return attribute.string ? 'text' : null;
}

/** Whether a comma list, or a JSON array for items that hold commas, reads as `item` throughout. */
function readsAsItems(
  value: string,
  item: ScalarAttribute | DateAttribute
): boolean {
  const trimmed = value.trim();
  let parts: unknown;
  try {
    parts = trimmed.startsWith('[')
      ? JSON.parse(trimmed)
      : trimmed.split(',').map((part) => part.trim());
  } catch {
    return false;
  }
  if (!Array.isArray(parts)) return false;
  return parts.every((part) => {
    if (typeof part !== 'string' && typeof part !== 'number') return false;
    const text = String(part).trim();
    if (text === '') return false;
    return item.kind === 'date'
      ? toDate(text) !== null
      : scalarForm(item, text) !== null;
  });
}

function listForm(
  { item, single, listWhen }: ListAttribute,
  value: string | undefined,
  picked: Picked
): Form {
  if (value === undefined) return null;
  const list = readsAsItems(value, item);
  if (!single) return list ? 'a comma list' : null;
  if (listWhen) {
    if (picked(listWhen.prop) !== listWhen.value) {
      return scalarForm(single, value);
    }
    return list ? 'a comma list its type prop picks' : null;
  }
  return scalarForm(single, value) ?? (list ? 'a comma list' : null);
}

function dateForm(
  { selection }: DateAttribute,
  value: string | undefined,
  picked: Picked
): Form {
  if (value === undefined) return null;
  const mode = selection ? picked(selection.prop) : undefined;
  if (selection && mode === selection.range) {
    return value.split(',').length === 2 && readsAsItems(value, DATE_ITEM)
      ? 'a date range'
      : null;
  }
  if (selection && mode === selection.list) {
    return readsAsItems(value, DATE_ITEM) ? 'a comma list' : null;
  }
  if (!toDate(value)) return null;
  return /^\d{4}-\d{2}$/.test(value.trim()) ? 'an ISO month' : 'an ISO date';
}

function jsonForm(attribute: JsonAttribute, value: string | undefined): Form {
  const bool = attribute.boolean ? booleanForm(value) : null;
  if (bool) return bool;
  if (value === undefined) return null;
  try {
    JSON.parse(value);
    return 'JSON';
  } catch {
    return null;
  }
}

/** The form an attribute's value takes for its prop: one of SAMPLER_FORMS, free `text`, or null when the bundle can't read it. */
function formOf(
  attribute: Attribute,
  value: string | undefined,
  picked: Picked
): Form {
  switch (attribute.kind) {
    case 'scalar':
      return scalarForm(attribute, value);
    case 'list':
      return listForm(attribute, value, picked);
    case 'date':
      return dateForm(attribute, value, picked);
    case 'json':
      return jsonForm(attribute, value);
    case 'icon':
      return value !== undefined && ICONS.has(value) ? 'an icon name' : null;
    case 'content':
    case 'none':
      return null;
  }
}

const camel = (name: string) =>
  name.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());

/** Every part and attribute in the sampler the bundle can't mount, and every form it leaves out. */
export function samplerProblems(sampler: string, parts: FlatComponent[]) {
  const byName = new Map(parts.map((part) => [part.name, part]));
  const problems: string[] = [];
  const written = new Set<SamplerForm>();
  const tags = [...sampler.matchAll(X_IMPORT)];
  const openings = sampler.match(X_IMPORT_OPENING)?.length ?? 0;
  if (openings !== tags.length) {
    problems.push(
      `sampler.html has ${openings - tags.length} x-import tags the build can't read. Write attributes in lowercase, with quoted values.`
    );
  }
  for (const [, attributes = ''] of tags) {
    const pairs = [...attributes.matchAll(ATTRIBUTE)].map(
      ([, name = '', double, single]) => ({ name, value: double ?? single })
    );
    const picked: Picked = (prop) =>
      pairs.find((pair) => camel(pair.name) === prop)?.value;
    const name = pairs
      .find((pair) => pair.name === PART)
      ?.value?.replace(/^Nxds\./, '');
    const part = name === undefined ? undefined : byName.get(name);
    if (!part) {
      problems.push(
        `sampler.html mounts ${name ?? 'an x-import with no part'}, which the bundle doesn't export.`
      );
      continue;
    }
    for (const { name: attribute, value } of pairs) {
      if (attribute === PART || /^(?:aria|data)-/.test(attribute)) continue;
      const prop = part.props.find((entry) => entry.name === camel(attribute));
      const form = prop?.attribute
        ? formOf(prop.attribute, value, picked)
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
