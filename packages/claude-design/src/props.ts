// components/index.d.ts: a flat `<Name>Props` interface for every component
// part the bundle exports, each prop's type spelled out (string literal
// unions, booleans, numbers) so the canvas can turn it into a control. A
// coverage report lists the props that get no control, and why.
import { publicComponents } from '@nxds/source-model/props-contract.mjs';
import { componentDefaults } from '@nxds/source-model/props-entries.ts';
import { reactProgram } from '@nxds/source-model/react-props.mjs';
import { componentsRoot } from '@nxds/source-model/roots.mjs';
import path from 'node:path';
import ts from 'typescript';

import { ICONS } from './icons.ts';

/** DOM attributes every part lists. */
const COMMON_DOM_PROPS = new Set(['children', 'className', 'id']);

/** Attributes listed when the part's own element declares them, as `<input>` declares `placeholder`. */
const ELEMENT_DOM_PROPS = new Set([
  'checked',
  'defaultChecked',
  'defaultValue',
  'disabled',
  'href',
  'max',
  'maxLength',
  'min',
  'name',
  'placeholder',
  'readOnly',
  'required',
  'rows',
  'step',
  'target',
  'type',
  'value',
]);

/** The @types/react interfaces every element shares. */
const SHARED_DOM_INTERFACES = new Set([
  'AllHTMLAttributes',
  'AriaAttributes',
  'DOMAttributes',
  'HTMLAttributes',
]);

const OMITTED_PROPS = new Set(['key', 'ref']);

export type Control = 'dropdown' | 'toggle' | 'number' | 'text' | 'content';
export type NoControlReason = 'element' | 'function' | 'object';

export interface FlatProp {
  name: string;
  type: string;
  optional: boolean;
  description: string;
  defaultValue: string | null;
  control: Control | null;
  reason: NoControlReason | null;
}

export interface FlatComponent {
  name: string;
  slug: string;
  description: string;
  props: FlatProp[];
}

const PRINT_FLAGS =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

function slugOf(fileName: string) {
  return path.relative(componentsRoot, fileName).split(path.sep)[0] ?? '';
}

function declaringPackage(symbol: ts.Symbol) {
  const fileName = symbol.declarations?.[0]?.getSourceFile().fileName ?? '';
  const [, after] = fileName.split('node_modules/');
  if (after === undefined) return null;
  const parts = after.split('/');
  return parts[0]?.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
}

function declaringInterface(symbol: ts.Symbol) {
  const parent = symbol.declarations?.[0]?.parent;
  return parent && ts.isInterfaceDeclaration(parent) ? parent.name.text : null;
}

function isDomPropListed(symbol: ts.Symbol) {
  if (COMMON_DOM_PROPS.has(symbol.name)) return true;
  if (!ELEMENT_DOM_PROPS.has(symbol.name)) return false;
  return !SHARED_DOM_INTERFACES.has(declaringInterface(symbol) ?? '');
}

// Own props, props a wrapped library declares (Radix `side`, `open`), and a
// short list of DOM attributes.
function isListedProp(symbol: ts.Symbol) {
  if (OMITTED_PROPS.has(symbol.name)) return false;
  const owner = declaringPackage(symbol);
  if (owner === null) return true;
  if (owner === '@types/react' || owner === 'csstype') {
    return isDomPropListed(symbol);
  }
  return true;
}

// DOM event handlers a library re-declares, such as Recharts' `onClick`.
function isDomEventHandler(prop: FlatProp) {
  return /EventHandler</.test(prop.type);
}

function isLiteral(type: ts.Type) {
  return (type.flags & ts.TypeFlags.Literal) !== 0;
}

function literalText(checker: ts.TypeChecker, type: ts.Type) {
  return checker.typeToString(type);
}

// Dot-qualifies the React types a reader resolves, and drops machine paths.
function portable(text: string) {
  return text
    .replace(/import\("[^"]+"\)\./g, '')
    .replace(
      /(?<![\w.])(ReactNode|ReactElement|CSSProperties|JSX\.Element)\b/g,
      'React.$1'
    );
}

function printType(checker: ts.TypeChecker, type: ts.Type) {
  const members = (type.isUnion() ? type.types : [type]).filter(
    (member) =>
      (member.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) === 0
  );
  if (members.length === 0) return 'undefined';

  const booleans = members.filter(
    (member) => (member.flags & ts.TypeFlags.BooleanLiteral) !== 0
  );
  if (members.every(isLiteral)) {
    const rest = members.filter((member) => !booleans.includes(member));
    const parts = rest.map((member) => literalText(checker, member));
    if (booleans.length === 2) parts.push('boolean');
    else parts.push(...booleans.map((member) => literalText(checker, member)));
    return parts.join(' | ');
  }

  // An optional ReactNode prop is a fresh union with undefined, which has lost
  // the alias name; ReactPortal only appears inside ReactNode.
  if (members.some((member) => member.getSymbol()?.name === 'ReactPortal')) {
    return 'React.ReactNode';
  }
  return portable(
    checker.typeToString(
      checker.getNonNullableType(type),
      undefined,
      PRINT_FLAGS
    )
  );
}

function controlFor(
  name: string,
  type: string
): Pick<FlatProp, 'control' | 'reason'> {
  if (name === 'children') return { control: 'content', reason: null };
  if (type === 'boolean' || type === 'true' || type === 'false') {
    return { control: 'toggle', reason: null };
  }
  if (type === 'number') return { control: 'number', reason: null };
  if (type === 'string') return { control: 'text', reason: null };
  if (
    /^(?:"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?|boolean)(?: \| (?:"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?|boolean))*$/.test(
      type
    )
  ) {
    return { control: 'dropdown', reason: null };
  }
  if (/React\.(ReactNode|ReactElement|JSX\.Element)/.test(type)) {
    return { control: null, reason: 'element' };
  }
  if (type.includes('=>')) return { control: null, reason: 'function' };
  return { control: null, reason: 'object' };
}

// A default the component computes, such as `disabled={!canScrollNext}`, has
// no literal to show.
function literalDefault(resolve: (() => string | null) | undefined) {
  try {
    return resolve?.() ?? null;
  } catch {
    return null;
  }
}

function documentation(checker: ts.TypeChecker, symbol: ts.Symbol) {
  return ts
    .displayPartsToString(symbol.getDocumentationComment(checker))
    .replace(/\r\n/g, '\n')
    .trim();
}

function propsType(checker: ts.TypeChecker, symbol: ts.Symbol) {
  const declaration = symbol.declarations?.[0];
  if (!declaration) return null;
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const [signature] = checker.getSignaturesOfType(type, ts.SignatureKind.Call);
  const [parameter] = signature?.getParameters() ?? [];
  if (!parameter) return null;
  return {
    declaration,
    type: checker.getTypeOfSymbolAtLocation(parameter, declaration),
  };
}

function flatComponent(
  checker: ts.TypeChecker,
  name: string,
  symbol: ts.Symbol
): FlatComponent {
  const fileName = symbol.declarations?.[0]?.getSourceFile().fileName ?? '';
  const defaults = componentDefaults(checker, symbol);
  const resolved = propsType(checker, symbol);
  const props = resolved
    ? checker
        .getPropertiesOfType(resolved.type)
        .filter(isListedProp)
        .map((prop): FlatProp => {
          const type = printType(
            checker,
            checker.getTypeOfSymbolAtLocation(prop, resolved.declaration)
          );
          return {
            name: prop.name,
            type,
            optional: (prop.flags & ts.SymbolFlags.Optional) !== 0,
            description: documentation(checker, prop),
            defaultValue: literalDefault(defaults.get(prop.name)),
            ...controlFor(prop.name, type),
          };
        })
        .filter((prop) => !isDomEventHandler(prop))
    : [];
  return {
    name,
    slug: slugOf(fileName),
    description: documentation(checker, symbol),
    props,
  };
}

/** Every component part the bundle exports, in name order. */
export function flatComponents(): FlatComponent[] {
  const { checker, exported } = reactProgram();
  return [...publicComponents(checker, exported, componentsRoot)]
    .map(([name, symbol]) => flatComponent(checker, name, symbol))
    .filter((component) => component.slug !== 'appearance');
}

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
    "import type * as React from 'react';",
    ...interfaces,
    ...ICONS.flatMap((icon) => ['', ...iconProps(icon)]),
    '',
  ].join('\n');
}

// Each `Nxds.Icons.IconName` takes Tabler's props.
function iconProps(icon: string) {
  return [
    `/** Tabler icon, mounted as \`Nxds.Icons.${icon}\`. */`,
    `export interface ${icon}Props {`,
    '  /** Width and height in px. @default 24 */',
    '  size?: number;',
    '  /** Stroke width. @default 2 */',
    '  stroke?: number;',
    '  /** Stroke colour. @default "currentColor" */',
    '  color?: string;',
    '  className?: string;',
    '}',
  ];
}

export interface Coverage {
  components: number;
  props: number;
  controls: Record<Control, number>;
  noControl: Record<NoControlReason, number>;
  byComponent: {
    name: string;
    props: { name: string; type: string; reason: NoControlReason }[];
  }[];
}

export function coverage(components: readonly FlatComponent[]): Coverage {
  const report: Coverage = {
    components: components.length,
    props: 0,
    controls: { dropdown: 0, toggle: 0, number: 0, text: 0, content: 0 },
    noControl: { element: 0, function: 0, object: 0 },
    byComponent: [],
  };
  for (const component of components) {
    const missing: Coverage['byComponent'][number]['props'] = [];
    for (const prop of component.props) {
      report.props += 1;
      if (prop.control) report.controls[prop.control] += 1;
      if (!prop.reason) continue;
      report.noControl[prop.reason] += 1;
      missing.push({ name: prop.name, type: prop.type, reason: prop.reason });
    }
    if (missing.length > 0) {
      report.byComponent.push({ name: component.name, props: missing });
    }
  }
  return report;
}

const REASONS: Record<NoControlReason, string> = {
  element: 'takes a React element; an attribute holds text only',
  function: 'takes a function',
  object: 'takes an object, array or class instance',
};

export function renderCoverage(report: Coverage) {
  const lines = [
    '# Canvas prop coverage',
    '',
    `${report.components} component parts, ${report.props} props.`,
    '',
    '| Control | Props |',
    '| --- | --- |',
    ...Object.entries(report.controls).map(
      ([kind, count]) => `| ${kind} | ${count} |`
    ),
    ...Object.entries(report.noControl).map(
      ([reason, count]) =>
        `| none: ${REASONS[reason as NoControlReason]} | ${count} |`
    ),
    '',
    '## Props with no control',
    '',
  ];
  for (const component of report.byComponent) {
    lines.push(
      `- **${component.name}**: ${component.props
        .map((prop) => `\`${prop.name}\` (${prop.reason})`)
        .join(', ')}`
    );
  }
  lines.push('');
  return lines.join('\n');
}
