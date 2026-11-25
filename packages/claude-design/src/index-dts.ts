// components/index.d.ts: one flat `<Part>Props` interface per part, each
// prop's type printed as the canvas takes it, with its default in an
// `@default` tag. This module writes it, and reads it back as each part's
// props, so a tool that has only the release reads what a tool with the
// parts' types reads.
import type { FlatComponent, FlatProp } from './props.ts';

/** A prop as index.d.ts prints it. */
export interface PartProp {
  name: string;
  /** The string literals of a union of strings, or undefined. */
  literals?: string[];
  boolean: boolean;
  /** The default, as a string, or undefined. */
  default?: string;
}

/** Each part's props, by part name. */
export type PartProps = ReadonlyMap<string, readonly PartProp[]>;

function docComment(lines: string[], indent: string) {
  const body = lines.flatMap((line) => line.split('\n'));
  if (body.length === 0) return [];
  if (body.length === 1) return [`${indent}/** ${body[0]} */`];
  return [
    `${indent}/**`,
    ...body.map((line) => `${indent} *${line ? ` ${line}` : ''}`),
    `${indent} */`,
  ];
}

function propLines(prop: FlatProp) {
  const lines = prop.description ? [prop.description] : [];
  if (prop.defaultValue !== null) lines.push(`@default ${prop.defaultValue}`);
  const key = /^[A-Za-z_$][\w$]*$/.test(prop.name)
    ? prop.name
    : `'${prop.name}'`;
  return [
    ...docComment(lines, '  '),
    `  ${key}${prop.optional ? '?' : ''}: ${prop.type};`,
  ];
}

export function renderIndexDts(components: readonly FlatComponent[]) {
  const interfaces = components.flatMap((component) => [
    '',
    ...docComment(component.description ? [component.description] : [], ''),
    `export interface ${component.name}Props {`,
    ...component.props.flatMap(propLines),
    '}',
  ]);
  return [
    '// nxds component props, one interface per part the Nxds bundle exports.',
    '// Each type is what the prop’s x-import attribute holds.',
    "import type * as React from 'react';",
    ...interfaces,
    '',
  ].join('\n');
}

/** A prop from its printed type and its `@default` value. */
function partProp(
  name: string,
  type: string,
  defaultValue: string | null
): PartProp {
  const members = type.split(' | ');
  const literals = members.every((member) => /^"[^"]*"$/.test(member))
    ? members.map((member) => JSON.parse(member) as string)
    : undefined;
  const prop: PartProp = { name, literals, boolean: type === 'boolean' };
  if (defaultValue === null) return prop;
  prop.default = defaultValue.startsWith('"')
    ? (JSON.parse(defaultValue) as string)
    : defaultValue;
  return prop;
}

/** Each part's props, from its flat props. */
export function partProps(components: readonly FlatComponent[]): PartProps {
  return new Map(
    components.map((component) => [
      component.name,
      component.props.map((prop) =>
        partProp(prop.name, prop.type, prop.defaultValue)
      ),
    ])
  );
}

const INTERFACE = /^export interface (\w+)Props \{$/;
const DEFAULT_TAG = /@default\s+("[^"]*"|\S+)/;
const PROP = /^ {2}(?:'([^']+)'|([\w$]+))\??: (.+);$/;

/** Each part's props, read back from the index.d.ts `renderIndexDts` printed. */
export function readIndexDts(indexDts: string): PartProps {
  const parts = new Map<string, PartProp[]>();
  let props: PartProp[] | undefined;
  let defaultValue: string | null = null;
  for (const line of indexDts.split('\n')) {
    const part = INTERFACE.exec(line)?.[1];
    if (part) {
      props = [];
      parts.set(part, props);
      continue;
    }
    if (line === '}') props = undefined;
    if (!props) continue;
    const tag = DEFAULT_TAG.exec(line)?.[1];
    if (tag) {
      defaultValue = tag;
      continue;
    }
    const match = PROP.exec(line);
    const name = match?.[1] ?? match?.[2];
    if (!name || !match?.[3]) continue;
    props.push(partProp(name, match[3], defaultValue));
    defaultValue = null;
  }
  return parts;
}
