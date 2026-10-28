// components/index.d.ts: a flat `<Name>Props` interface for every component
// part the bundle exports. Each prop's type is what its x-import attribute
// holds (src/attribute.ts), so the canvas can turn it into a control. A
// coverage report lists the props that get no control, and why.
import { publicComponents } from '@nxds/source-model/props-contract.mjs';
import { componentDefaults } from '@nxds/source-model/props-entries.ts';
import { reactProgram } from '@nxds/source-model/react-props.mjs';
import { componentsRoot } from '@nxds/source-model/roots.mjs';
import path from 'node:path';
import ts from 'typescript';

import type {
  Attribute,
  DateAttribute,
  JsonAttribute,
  ListAttribute,
  ScalarAttribute,
} from './attribute.ts';
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

/** The @types/react interfaces every element shares, and SVG's, which an `<svg>` part doesn't take. */
const SHARED_DOM_INTERFACES = new Set([
  'AllHTMLAttributes',
  'AriaAttributes',
  'DOMAttributes',
  'HTMLAttributes',
  'SVGAttributes',
]);

const OMITTED_PROPS = new Set(['key', 'ref']);

/** Props that take an icon element, which a canvas sets by icon name. */
const ICON_PROPS = new Set(['startIcon', 'endIcon', 'leftIcon', 'rightIcon']);

/** Object props a canvas sets as JSON. Any other object prop needs a reason in NOT_NEEDED. */
const JSON_PROPS: Readonly<Record<string, readonly string[]>> = {
  AreaChart: ['data', 'config'],
  BarChart: ['data', 'config'],
  ChartContainer: ['config'],
  DatePicker: ['disabled', 'hidden', 'modifiers'],
  FieldError: ['errors'],
  FilterBuilder: ['fields', 'value'],
  LineChart: ['data', 'config'],
  PieChart: ['data', 'config'],
};

const STYLING = 'a styling object; style a part through its props';
const RECHARTS_INTERNALS =
  'Recharts tooltip and legend setup; the data charts set it';
const TOASTER = 'Toaster setup; a static screen shows a Toast';

/**
 * Object props a canvas doesn't set, with the reason, as `Part.prop` or a
 * prop name every part shares. `Part.*` covers a part's every object prop.
 */
const NOT_NEEDED: Readonly<Record<string, string>> = {
  container: 'a portal target is a DOM node',
  collisionBoundary: 'positions an overlay against DOM nodes',
  collisionPadding: 'fine-tunes overlay collision',
  virtualRef: 'a ref',
  style: STYLING,
  classNames: STYLING,
  styles: STYLING,
  modifiersClassNames: STYLING,
  modifiersStyles: STYLING,
  keywords: 'only filters while someone types',
  'Carousel.opts': 'Embla setup; a carousel can’t scroll on a canvas',
  'Carousel.plugins': 'Embla setup; a carousel can’t scroll on a canvas',
  'Drawer.snapPoints': 'drag snap points',
  'Drawer.activeSnapPoint': 'drag snap points',
  'DatePicker.components': 'swaps DatePicker internals',
  'DatePicker.formatters': 'swaps DatePicker internals',
  'DatePicker.labels': 'swaps DatePicker internals',
  'DatePicker.locale': 'swaps DatePicker internals',
  'DatePicker.dateLib': 'swaps DatePicker internals',
  'DatePickerDayButton.*': 'DatePicker renders each day',
  'MenubarMenu.__scopeMenubar': 'Radix internal',
  'ResizablePanelGroup.resizeTargetMinimumSize': 'pointer hit area',
  'Command.filter': 'only filters while someone types',
  'ChartTooltip.*': RECHARTS_INTERNALS,
  'ChartTooltipContent.*': RECHARTS_INTERNALS,
  'ChartLegend.*': RECHARTS_INTERNALS,
  'ChartLegendContent.*': RECHARTS_INTERNALS,
  'Toaster.*': TOASTER,
};

const HANDLER = 'a function: an event handler, callback or ref';

export type Control = 'dropdown' | 'toggle' | 'number' | 'text' | 'content';

export interface FlatProp {
  name: string;
  type: string;
  optional: boolean;
  description: string;
  defaultValue: string | null;
  /** What the attribute holds, or null when no rule covers the prop's type. */
  attribute: Attribute | null;
  control: Control | null;
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

function isDeprecated(symbol: ts.Symbol) {
  return (symbol.declarations ?? []).some((declaration) =>
    ts
      .getJSDocTags(declaration)
      .some((tag) => tag.tagName.text === 'deprecated')
  );
}

// Own props, props a wrapped library declares (Radix `side`, `open`), and a
// short list of DOM attributes. Deprecated props are left out.
function isListedProp(symbol: ts.Symbol) {
  if (OMITTED_PROPS.has(symbol.name) || isDeprecated(symbol)) return false;
  const owner = declaringPackage(symbol);
  if (owner === null) return true;
  if (owner === '@types/react' || owner === 'csstype') {
    return isDomPropListed(symbol);
  }
  return true;
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

function withoutNullish(type: ts.Type) {
  return (type.isUnion() ? type.types : [type]).filter(
    (member) =>
      (member.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) === 0
  );
}

// An optional ReactNode prop is a fresh union with undefined, which has lost
// the alias name; ReactPortal only appears inside ReactNode.
function isReactNode(members: readonly ts.Type[]) {
  return members.some((member) =>
    ['ReactPortal', 'ReactElement'].includes(member.getSymbol()?.name ?? '')
  );
}

/** The prop's own TypeScript type, printed for a prop the canvas doesn't set. */
function printType(checker: ts.TypeChecker, type: ts.Type) {
  const members = withoutNullish(type);
  if (members.length === 0) return 'undefined';
  if (isReactNode(members)) return 'React.ReactNode';
  return portable(
    checker.typeToString(
      checker.getNonNullableType(type),
      undefined,
      PRINT_FLAGS
    )
  );
}

function isFunction(checker: ts.TypeChecker, type: ts.Type) {
  return checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0;
}

function isRef(type: ts.Type) {
  return ['RefObject', 'MutableRefObject'].includes(
    type.getSymbol()?.name ?? ''
  );
}

function isDate(type: ts.Type) {
  return type.getSymbol()?.name === 'Date';
}

function arrayItem(checker: ts.TypeChecker, type: ts.Type) {
  if (!checker.isArrayType(type)) return null;
  return checker.getTypeArguments(type as ts.TypeReference)[0] ?? null;
}

function emptyScalar(): ScalarAttribute {
  return {
    kind: 'scalar',
    literals: [],
    string: false,
    suggested: false,
    number: false,
    boolean: false,
  };
}

// The members of a string, number, boolean or literal union, or null when
// one of them is something else.
function scalarOf(members: readonly ts.Type[]): ScalarAttribute | null {
  const scalar = emptyScalar();
  for (const member of members) {
    if (member.isStringLiteral() || member.isNumberLiteral()) {
      scalar.literals.push(member.value);
    } else if (member.flags & ts.TypeFlags.BooleanLiteral) {
      scalar.boolean = true;
    } else if (member.flags & ts.TypeFlags.String) {
      scalar.string = true;
    } else if (member.flags & ts.TypeFlags.Number) {
      scalar.number = true;
    } else if (
      member.isIntersection() &&
      member.types.some((part) => part.flags & ts.TypeFlags.String)
    ) {
      // `string & {}` keeps a union's literals as suggestions.
      scalar.suggested = true;
    } else {
      return null;
    }
  }
  if (scalar.suggested && !scalar.string) scalar.string = true;
  else scalar.suggested = false;
  return scalar;
}

function dateKeys(
  checker: ts.TypeChecker,
  type: ts.Type,
  keys: Set<string>,
  depth = 0
): { dateItems: boolean } {
  let dateItems = false;
  if (depth > 3) return { dateItems };
  for (const member of withoutNullish(type)) {
    const item = arrayItem(checker, member);
    if (item) {
      if (withoutNullish(item).some(isDate)) dateItems = true;
      dateItems =
        dateKeys(checker, item, keys, depth + 1).dateItems || dateItems;
      continue;
    }
    if (isDate(member) || !(member.flags & ts.TypeFlags.Object)) continue;
    if (isFunction(checker, member)) continue;
    for (const property of checker.getPropertiesOfType(member)) {
      const propertyType = checker.getTypeOfSymbol(property);
      if (withoutNullish(propertyType).some(isDate)) keys.add(property.name);
      dateKeys(checker, propertyType, keys, depth + 1);
    }
  }
  return { dateItems };
}

function requiredKeys(checker: ts.TypeChecker, type: ts.Type) {
  return checker
    .getPropertiesOfType(type)
    .filter((property) => (property.flags & ts.SymbolFlags.Optional) === 0)
    .map((property) => property.name);
}

function jsonOf(
  checker: ts.TypeChecker,
  type: ts.Type,
  members: readonly ts.Type[]
): JsonAttribute {
  const keys = new Set<string>();
  const { dateItems } = dateKeys(checker, type, keys);
  const objects = members.filter(
    (member) =>
      member.flags & ts.TypeFlags.Object &&
      !isFunction(checker, member) &&
      !isDate(member)
  );
  const [only] = objects;
  const item = only && objects.length === 1 ? arrayItem(checker, only) : null;
  const shape = objects.length !== 1 ? 'any' : item ? 'array' : 'object';
  const required =
    shape === 'object' && only
      ? requiredKeys(checker, only)
      : shape === 'array' && item
        ? requiredKeys(checker, item)
        : [];
  return {
    kind: 'json',
    shape,
    required,
    dateKeys: [...keys].sort(),
    dateItems,
    boolean: members.some(
      (member) => (member.flags & ts.TypeFlags.BooleanLiteral) !== 0
    ),
  };
}

function notNeeded(part: string, name: string) {
  return (
    NOT_NEEDED[`${part}.${name}`] ?? NOT_NEEDED[`${part}.*`] ?? NOT_NEEDED[name]
  );
}

// A list's items, when every array member holds dates or scalars.
function listOf(
  checker: ts.TypeChecker,
  arrays: readonly ts.Type[],
  single: ScalarAttribute | null
): ListAttribute | null {
  const items = arrays.flatMap((array) => {
    const item = arrayItem(checker, array);
    return item ? withoutNullish(item) : [];
  });
  if (items.length === 0) return null;
  if (items.every(isDate)) {
    return { kind: 'list', item: { kind: 'date', selection: false }, single };
  }
  const item = scalarOf(items);
  return item ? { kind: 'list', item, single } : null;
}

// DatePicker's `selected` across its modes: a Date, Date[] and DateRange.
function isDateSelection(checker: ts.TypeChecker, members: readonly ts.Type[]) {
  const dates = members.filter(isDate).length;
  const ranges = members.filter((member) =>
    checker.getPropertiesOfType(member).some((p) => p.name === 'from')
  ).length;
  return dates > 0 && ranges > 0;
}

/**
 * What a canvas attribute holds for this prop, null when no rule covers it,
 * or undefined when this member of a props union types it `undefined`.
 */
function attributeOf(
  checker: ts.TypeChecker,
  part: string,
  name: string,
  type: ts.Type
): Attribute | null | undefined {
  if (name === 'children') return { kind: 'content' };
  const members = withoutNullish(type);
  if (members.length === 0) return undefined;
  if (isReactNode(members)) {
    return ICON_PROPS.has(name)
      ? { kind: 'icon' }
      : { ...emptyScalar(), string: true };
  }
  const values = members.filter(
    (member) => !isFunction(checker, member) && !isRef(member)
  );
  if (values.length === 0) return { kind: 'none', reason: HANDLER };

  const scalar = scalarOf(values);
  if (scalar) return scalar;

  const reason = notNeeded(part, name);
  if (reason) return { kind: 'none', reason };
  if (JSON_PROPS[part]?.includes(name)) return jsonOf(checker, type, values);

  if (values.every(isDate)) return { kind: 'date', selection: false };
  if (isDateSelection(checker, values))
    return { kind: 'date', selection: true };

  const arrays = values.filter((member) => arrayItem(checker, member));
  const rest = values.filter((member) => !arrays.includes(member));
  const single = rest.length > 0 ? scalarOf(rest) : null;
  if (arrays.length > 0 && (rest.length === 0 || single)) {
    return listOf(checker, arrays, single);
  }

  // A string or an object, such as SidebarMenuButton's `tooltip`: the
  // attribute holds the string.
  const primitive = scalarOf(
    values.filter((member) => !(member.flags & ts.TypeFlags.Object))
  );
  return primitive?.string ? primitive : null;
}

// A props union, such as DayPicker's one per mode, lists a prop once with
// each member's type merged.
function mergeAttributes(
  part: string,
  name: string,
  attributes: readonly (Attribute | null | undefined)[]
): Attribute | null {
  const present = attributes.filter((attribute) => attribute !== undefined);
  const [first] = present;
  if (first === undefined) return null;
  if (
    present.every((other) => JSON.stringify(other) === JSON.stringify(first))
  ) {
    return first;
  }
  const scalars = present.filter(
    (attribute): attribute is ScalarAttribute => attribute?.kind === 'scalar'
  );
  const lists = present.filter(
    (attribute): attribute is ListAttribute => attribute?.kind === 'list'
  );
  if (scalars.length + lists.length === present.length) {
    const single = scalars.length > 0 ? mergeScalars(scalars) : null;
    const [list] = lists;
    if (!list) return single;
    return { ...list, single: single ?? list.single };
  }
  // DatePicker's `selected`: a Date, a Date[] or a DateRange, by mode.
  if (present.some((attribute) => attribute?.kind === 'date')) {
    return { kind: 'date', selection: true } satisfies DateAttribute;
  }
  throw new Error(
    `index.d.ts: ${part}.${name} has a different type in each member of its props union; add a rule for it in src/props.ts.`
  );
}

function mergeScalars(scalars: readonly ScalarAttribute[]): ScalarAttribute {
  return scalars.reduce((merged, scalar) => ({
    kind: 'scalar',
    literals: [...new Set([...merged.literals, ...scalar.literals])],
    string: merged.string || scalar.string,
    suggested: merged.suggested || scalar.suggested,
    number: merged.number || scalar.number,
    boolean: merged.boolean || scalar.boolean,
  }));
}

function literalUnion(scalar: ScalarAttribute) {
  const parts = scalar.literals.map((literal) => JSON.stringify(literal));
  if (scalar.boolean) parts.push('boolean');
  return parts.join(' | ');
}

/** The type index.d.ts prints: what the attribute holds. */
function attributeType(attribute: Attribute, ownType: string) {
  switch (attribute.kind) {
    case 'scalar':
      if (attribute.number && attribute.literals.length === 0) return 'number';
      if (attribute.string && !attribute.suggested) return 'string';
      if (attribute.literals.length > 0) return literalUnion(attribute);
      return attribute.boolean ? 'boolean' : 'string';
    case 'list':
    case 'date':
    case 'json':
      return 'string';
    default:
      return ownType;
  }
}

function controlOf(attribute: Attribute | null, type: string): Control | null {
  if (!attribute) return null;
  if (attribute.kind === 'content') return 'content';
  if (attribute.kind === 'none' || attribute.kind === 'icon') return null;
  if (type === 'boolean') return 'toggle';
  if (type === 'number') return 'number';
  if (type === 'string') return 'text';
  return 'dropdown';
}

const LIST_FORMAT: Record<string, string> = {
  date: 'Comma list of dates, such as `2026-10-01,2026-10-07`.',
  number: 'Comma list of numbers, such as `20,80`.',
  string: 'Comma list, such as `design,research`.',
};

/** How the attribute is written, for the prop's doc comment. */
function attributeFormat(attribute: Attribute | null) {
  if (!attribute) return null;
  switch (attribute.kind) {
    case 'list': {
      const item =
        attribute.item.kind === 'date'
          ? 'date'
          : attribute.item.number
            ? 'number'
            : 'string';
      const list = LIST_FORMAT[item] ?? '';
      const { single } = attribute;
      if (!single) return list;
      if (single.string) {
        return `One value. With \`type="multiple"\`, a ${list.charAt(0).toLowerCase()}${list.slice(1)}`;
      }
      const literals = single.literals.map((literal) => `\`${literal}\``);
      return `${literals.join(' or ')}, or a ${list.charAt(0).toLowerCase()}${list.slice(1)}`;
    }
    case 'date':
      return attribute.selection
        ? 'ISO date, such as `2026-10-28`. With `mode="multiple"`, a comma list of dates. With `mode="range"`, the first and last date: `2026-10-01,2026-10-07`.'
        : 'ISO date, such as `2026-10-28`, or a month, such as `2026-10`.';
    case 'json':
      return `JSON${attribute.dateKeys.length > 0 || attribute.dateItems ? ', with dates as ISO strings' : ''}.${attribute.boolean ? ' A bare attribute is `true`.' : ''}`;
    default:
      return null;
  }
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

// Each prop's symbols, one per member of a props union, in first-seen order.
function propSymbols(checker: ts.TypeChecker, type: ts.Type) {
  const members = type.isUnion() ? type.types : [type];
  const byName = new Map<string, ts.Symbol[]>();
  for (const member of members) {
    for (const prop of checker.getPropertiesOfType(member)) {
      byName.set(prop.name, [...(byName.get(prop.name) ?? []), prop]);
    }
  }
  return { byName, members: members.length };
}

// Whether the part has a `type` that can be "multiple", as Accordion and
// ToggleGroup do.
function takesMultiple(
  checker: ts.TypeChecker,
  part: string,
  byName: Map<string, ts.Symbol[]>,
  declaration: ts.Node
) {
  return (byName.get('type') ?? []).some((symbol) => {
    const attribute = attributeOf(
      checker,
      part,
      'type',
      checker.getTypeOfSymbolAtLocation(symbol, declaration)
    );
    return (
      attribute?.kind === 'scalar' && attribute.literals.includes('multiple')
    );
  });
}

// A list that also takes any string, such as Button's `value`, is a list only
// where `type="multiple"` picks the array.
function singleUnlessMultiple(attribute: Attribute | null, multiple: boolean) {
  if (attribute?.kind !== 'list' || !attribute.single?.string) return attribute;
  return multiple ? attribute : { ...attribute.single, number: false };
}

// DOM event handlers a library re-declares, such as Recharts' `onClick`.
function isDomEventHandler(type: string) {
  return /EventHandler</.test(type);
}

function flatComponent(
  checker: ts.TypeChecker,
  name: string,
  symbol: ts.Symbol
): FlatComponent {
  const fileName = symbol.declarations?.[0]?.getSourceFile().fileName ?? '';
  const defaults = componentDefaults(checker, symbol);
  const resolved = propsType(checker, symbol);
  const props: FlatProp[] = [];
  if (resolved) {
    const { byName, members } = propSymbols(checker, resolved.type);
    const multiple = takesMultiple(checker, name, byName, resolved.declaration);
    for (const [propName, symbols] of byName) {
      const [first] = symbols;
      if (!first || !isListedProp(first)) continue;
      const types = symbols.map((prop) =>
        checker.getTypeOfSymbolAtLocation(prop, resolved.declaration)
      );
      const ownType = printType(checker, types[0] as ts.Type);
      if (isDomEventHandler(ownType)) continue;
      const attribute = singleUnlessMultiple(
        mergeAttributes(
          name,
          propName,
          types.map((type) => attributeOf(checker, name, propName, type))
        ),
        multiple
      );
      const type = attribute ? attributeType(attribute, ownType) : ownType;
      const description = [
        documentation(checker, first),
        attributeFormat(attribute),
      ]
        .filter(Boolean)
        .join('\n\n');
      props.push({
        name: propName,
        type,
        optional:
          symbols.length < members ||
          symbols.some((prop) => (prop.flags & ts.SymbolFlags.Optional) !== 0),
        description,
        defaultValue: literalDefault(defaults.get(propName)),
        attribute,
        control: controlOf(attribute, type),
      });
    }
  }
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
    '// Each type is what the prop’s x-import attribute holds.',
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

/** Props whose rule lands in a later commit of this change, by what lands it. */
const PLANNED: Readonly<Record<string, string>> = {
  icon: 'icon names',
};

export interface Coverage {
  components: number;
  props: number;
  controls: Record<Control, number>;
  /** Props a canvas doesn't set, by reason. */
  notNeeded: Map<string, string[]>;
  planned: Map<string, string[]>;
  missing: { name: string; type: string }[];
}

export function coverage(components: readonly FlatComponent[]): Coverage {
  const report: Coverage = {
    components: components.length,
    props: 0,
    controls: { dropdown: 0, toggle: 0, number: 0, text: 0, content: 0 },
    notNeeded: new Map(),
    planned: new Map(),
    missing: [],
  };
  const add = (map: Map<string, string[]>, key: string, prop: string) =>
    map.set(key, [...(map.get(key) ?? []), prop]);
  for (const component of components) {
    for (const prop of component.props) {
      report.props += 1;
      const qualified = `${component.name}.${prop.name}`;
      if (prop.control) report.controls[prop.control] += 1;
      const { attribute } = prop;
      if (!attribute) {
        report.missing.push({ name: qualified, type: prop.type });
      } else if (attribute.kind === 'none') {
        add(report.notNeeded, attribute.reason, qualified);
      } else if (PLANNED[attribute.kind]) {
        add(report.planned, PLANNED[attribute.kind] ?? '', qualified);
      }
    }
  }
  return report;
}

function total(map: Map<string, string[]>) {
  return [...map.values()].reduce((sum, props) => sum + props.length, 0);
}

function listed(map: Map<string, string[]>) {
  return [...map].flatMap(([reason, props]) => [
    `### ${reason.charAt(0).toUpperCase()}${reason.slice(1)} (${props.length})`,
    '',
    props.map((prop) => `\`${prop}\``).join(', '),
    '',
  ]);
}

export function renderCoverage(report: Coverage) {
  return [
    '# Canvas prop coverage',
    '',
    `${report.components} component parts, ${report.props} props.`,
    '',
    '| Control | Props |',
    '| --- | --- |',
    ...Object.entries(report.controls).map(
      ([kind, count]) => `| ${kind} | ${count} |`
    ),
    `| none: not needed on a canvas | ${total(report.notNeeded)} |`,
    `| none: planned | ${total(report.planned)} |`,
    `| none: missing | ${report.missing.length} |`,
    '',
    '## Not needed on a canvas',
    '',
    ...listed(report.notNeeded),
    ...(report.planned.size > 0
      ? ['## Planned', '', ...listed(report.planned)]
      : []),
  ].join('\n');
}
