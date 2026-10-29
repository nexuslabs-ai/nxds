// SETUP.md: the guide the export writes beside project/, which walks Claude
// in a chat through publishing the system, installing it on a canvas and
// checking it with the sampler artboard. The sampler mounts every attribute
// form a canvas writes, so it doubles as the install test.
import type { Attribute } from './attribute.ts';
import type { FlatComponent } from './props.ts';

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
const PART = 'component-from-global-scope';

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

/** The form an attribute's value takes for its prop: one of SAMPLER_FORMS, free `text`, or null when the bundle can't read it. */
function formOf(
  attribute: Attribute,
  value: string | undefined
): SamplerForm | 'text' | null {
  switch (attribute.kind) {
    case 'scalar':
      if (value === undefined)
        return attribute.boolean ? 'a bare boolean' : null;
      if (attribute.boolean && (value === 'true' || value === 'false')) {
        return 'a boolean as "true" or "false"';
      }
      if (attribute.literals.includes(value)) return 'one of a list of options';
      if (attribute.number && value.trim() !== '' && !Number.isNaN(+value)) {
        return 'a number';
      }
      return attribute.string ? 'text' : null;
    case 'list':
      return attribute.listWhen
        ? 'a comma list its type prop picks'
        : 'a comma list';
    case 'date':
      if (value?.includes(','))
        return attribute.selection ? 'a date range' : null;
      return /^\d{4}-\d{2}$/.test(value ?? '') ? 'an ISO month' : 'an ISO date';
    case 'json':
      return 'JSON';
    case 'icon':
      return 'an icon name';
    default:
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
  for (const [, attributes = ''] of sampler.matchAll(X_IMPORT)) {
    const pairs = [...attributes.matchAll(ATTRIBUTE)].map(
      ([, name = '', double, single]) => ({ name, value: double ?? single })
    );
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
      const form = prop?.attribute ? formOf(prop.attribute, value) : null;
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
