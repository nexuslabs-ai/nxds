// A docs story's JSX as canvas markup: each nxds part becomes an
// `<x-import component-from-global-scope="Nxds.Part">` element, plain HTML
// stays HTML. Each value is written the way src/runtime/attributes.ts reads it back:
// arrays as comma lists, objects as JSON, dates as ISO strings. Returns null
// when the story needs something an attribute can't hold: state, a computed
// value, an element passed as a prop.
//
// Alongside the markup comes the same tree with each prop's real value, which
// the smoke renders as plain React to compare against the canvas.
import ts from 'typescript';

import { iconSet } from './icon-set.ts';
import { kebab } from './runtime/canvas-wrapper.ts';
import { NAMESPACE } from './system-index.ts';

const INDENT = '  ';

/** A Date in a tree, as JSON can carry it. */
export interface TreeDate {
  __date: string;
}

/** An icon element passed as a prop, such as Button's `startIcon`, by name. */
export interface TreeIcon {
  __icon: string;
}

export type TreeValue =
  | string
  | number
  | boolean
  | null
  | TreeDate
  | TreeIcon
  | TreeValue[]
  | { [key: string]: TreeValue };

/** A part or element with its props' real values, as data a page can render. */
export interface TreeNode {
  part: string;
  props: Record<string, TreeValue>;
  children: (TreeNode | string)[];
}

export interface CanvasExample {
  markup: string;
  tree: TreeNode;
}

/** A value the markup can't write. */
const UNWRITABLE = Symbol('unwritable');

interface Context {
  parts: ReadonlySet<string>;
  /** Module-level constants and `useId()` ids, by name. */
  values: ReadonlyMap<string, TreeValue>;
}

function isDate(value: TreeValue): value is TreeDate {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    '__date' in value
  );
}

function isIcon(value: TreeValue): value is TreeIcon {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    '__icon' in value
  );
}

let iconNames: Map<string, string> | null = null;

/** `plus` for `IconPlus`, or undefined for a component that isn't an icon the bundle ships. */
function iconName(component: string) {
  iconNames ??= new Map(
    iconSet().map(({ component, name }) => [component, name])
  );
  return iconNames.get(component);
}

function isoDate(year: number, month: number, day: number) {
  return [
    String(year).padStart(4, '0'),
    String(month + 1).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');
}

// A literal value, a module-level constant, or `new Date(y, m, d)`.
function literal(
  node: ts.Expression,
  context: Context
): TreeValue | typeof UNWRITABLE {
  while (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node)
  ) {
    node = node.expression;
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand)
  ) {
    return -Number(node.operand.text);
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isIdentifier(node)) return context.values.get(node.text) ?? UNWRITABLE;
  if (ts.isArrayLiteralExpression(node)) {
    const items = node.elements.map((element) => literal(element, context));
    return items.includes(UNWRITABLE) ? UNWRITABLE : (items as TreeValue[]);
  }
  if (ts.isObjectLiteralExpression(node)) return objectLiteral(node, context);
  // `startIcon={<IconPlus />}`: an icon prop takes the icon's name.
  if (
    ts.isJsxSelfClosingElement(node) &&
    node.attributes.properties.length === 0
  ) {
    const name = iconName(node.tagName.getText());
    return name ? { __icon: name } : UNWRITABLE;
  }
  if (ts.isNewExpression(node) && node.expression.getText() === 'Date') {
    const args = (node.arguments ?? []).map((arg) => literal(arg, context));
    if (args.length !== 3 || !args.every((arg) => typeof arg === 'number')) {
      return UNWRITABLE;
    }
    const [year, month, day] = args as number[];
    return { __date: isoDate(year ?? 0, month ?? 0, day ?? 1) };
  }
  return UNWRITABLE;
}

function objectLiteral(
  node: ts.ObjectLiteralExpression,
  context: Context
): TreeValue | typeof UNWRITABLE {
  const entries: [string, TreeValue][] = [];
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) return UNWRITABLE;
    const { name } = property;
    if (!ts.isIdentifier(name) && !ts.isStringLiteral(name)) return UNWRITABLE;
    const value = literal(property.initializer, context);
    if (value === UNWRITABLE) return UNWRITABLE;
    entries.push([name.text, value]);
  }
  return Object.fromEntries(entries);
}

function jsonText(value: TreeValue): string {
  return JSON.stringify(value, (_key, item: TreeValue) =>
    isDate(item) ? item.__date : item
  );
}

// The attribute string src/runtime/attributes.ts converts back to `value`.
function attributeString(value: TreeValue): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value === null) return 'null';
  if (isDate(value)) return value.__date;
  if (isIcon(value)) return value.__icon;
  if (Array.isArray(value)) {
    const items = value.map((item) =>
      typeof item === 'string' ||
      typeof item === 'number' ||
      isDate(item as TreeValue)
        ? attributeString(item)
        : null
    );
    if (items.every((item) => item !== null && !item.includes(','))) {
      return items.join(',');
    }
  }
  return jsonText(value);
}

function quoted(text: string) {
  const escaped = text.replace(/&/g, '&amp;');
  if (text.includes('"') && !text.includes("'")) return `'${escaped}'`;
  return `"${escaped.replace(/"/g, '&quot;')}"`;
}

function attributeValue(
  initializer: ts.JsxAttributeValue | undefined,
  context: Context
): TreeValue | typeof UNWRITABLE {
  if (!initializer) return true;
  if (ts.isStringLiteral(initializer)) return initializer.text;
  if (!ts.isJsxExpression(initializer) || !initializer.expression) {
    return UNWRITABLE;
  }
  return literal(initializer.expression, context);
}

// A part's `true` is a bare attribute, which a canvas reads as true. A plain
// element leaves out a `false` attribute.
function attributeText(name: string, value: TreeValue, isPart: boolean) {
  if (value === true) return name;
  if (value === false && !isPart) return null;
  return `${name}=${quoted(attributeString(value))}`;
}

function attributes(
  node: ts.JsxAttributes,
  isPart: boolean,
  context: Context
): { text: string; props: Record<string, TreeValue> } | null {
  const texts: string[] = [];
  const props: Record<string, TreeValue> = {};
  for (const property of node.properties) {
    if (!ts.isJsxAttribute(property)) return null;
    const name = property.name.getText();
    const value = attributeValue(property.initializer, context);
    if (value === UNWRITABLE) return null;
    props[name] = value;
    const attribute = isPart
      ? kebab(name)
      : name === 'className'
        ? 'class'
        : name;
    const text = attributeText(attribute, value, isPart);
    if (text) texts.push(text);
  }
  return { text: texts.map((text) => ` ${text}`).join(''), props };
}

function escapeText(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function decodeEntities(text: string) {
  return text.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
}

// JSX's whitespace rule: each line loses its leading space unless it's the
// first, and its trailing space unless it's the last; blank lines drop out.
function jsxText(text: string) {
  const lines = text.split(/\r\n|\n|\r/);
  return lines
    .map((line, index) => {
      const start = index === 0 ? line : line.trimStart();
      return index === lines.length - 1 ? start : start.trimEnd();
    })
    .filter((line) => line.trim() !== '')
    .map((line) => line.replace(/\s+/g, ' '))
    .join(' ');
}

interface Rendered {
  lines: string[];
  nodes: (TreeNode | string)[];
}

function children(
  nodes: readonly ts.JsxChild[],
  context: Context,
  depth: number
): Rendered | null {
  const rendered: Rendered = { lines: [], nodes: [] };
  for (const child of nodes) {
    if (ts.isJsxText(child)) {
      const text = jsxText(decodeEntities(child.text));
      if (!text) continue;
      rendered.lines.push(`${INDENT.repeat(depth)}${escapeText(text.trim())}`);
      rendered.nodes.push(text);
      continue;
    }
    if (ts.isJsxExpression(child)) {
      if (!child.expression) continue;
      const value = literal(child.expression, context);
      if (typeof value !== 'string' && typeof value !== 'number') return null;
      rendered.lines.push(
        `${INDENT.repeat(depth)}${escapeText(String(value))}`
      );
      rendered.nodes.push(String(value));
      continue;
    }
    const element = jsxElement(child, context, depth);
    if (element === null) return null;
    rendered.lines.push(...element.lines);
    rendered.nodes.push(...element.nodes);
  }
  return rendered;
}

function tagOf(name: string, context: Context) {
  if (context.parts.has(name)) {
    return {
      open: `x-import component-from-global-scope="${NAMESPACE}.${name}"`,
      close: 'x-import',
      isPart: true,
    };
  }
  const icon = iconName(name);
  if (icon) {
    return {
      open: `x-import component-from-global-scope="${NAMESPACE}.Icon" name="${icon}"`,
      close: 'x-import',
      isPart: true,
      part: 'Icon',
      props: { name: icon },
    };
  }
  if (/^[a-z]/.test(name)) return { open: name, close: name, isPart: false };
  return null;
}

function jsxElement(
  node: ts.JsxChild,
  context: Context,
  depth: number
): Rendered | null {
  const pad = INDENT.repeat(depth);
  if (ts.isJsxFragment(node)) return children(node.children, context, depth);
  const opening = ts.isJsxSelfClosingElement(node)
    ? node
    : ts.isJsxElement(node)
      ? node.openingElement
      : null;
  if (!opening) return null;
  const name = opening.tagName.getText();
  const tag = tagOf(name, context);
  const attrs = tag && attributes(opening.attributes, tag.isPart, context);
  if (!tag || !attrs) return null;
  const tree: TreeNode = {
    part: tag.part ?? name,
    props: { ...tag.props, ...attrs.props },
    children: [],
  };
  if (!ts.isJsxElement(node)) {
    return {
      lines: [`${pad}<${tag.open}${attrs.text}></${tag.close}>`],
      nodes: [tree],
    };
  }
  const inner = children(node.children, context, depth + 1);
  if (inner === null) return null;
  tree.children = inner.nodes;
  const open = `${pad}<${tag.open}${attrs.text}>`;
  const [only] = inner.lines;
  if (inner.lines.length === 1 && only && !only.trim().startsWith('<')) {
    return { lines: [`${open}${only.trim()}</${tag.close}>`], nodes: [tree] };
  }
  return {
    lines: [open, ...inner.lines, `${pad}</${tag.close}>`],
    nodes: [tree],
  };
}

function isUseId(node: ts.Expression) {
  return (
    ts.isCallExpression(node) &&
    /^(?:React\.)?useId$/.test(node.expression.getText()) &&
    node.arguments.length === 0
  );
}

// `termsId` → `terms`, an id that reads as the one useId() would give.
function staticId(name: string) {
  return kebab(name.replace(/Id$/, '')) || 'id';
}

function constants(
  statements: readonly ts.Statement[],
  context: Context,
  idsOnly: boolean
) {
  const values = new Map(context.values);
  for (const statement of statements) {
    if (!ts.isVariableStatement(statement)) {
      if (idsOnly) return null;
      continue;
    }
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) {
        if (idsOnly) return null;
        continue;
      }
      if (isUseId(declaration.initializer)) {
        values.set(declaration.name.text, staticId(declaration.name.text));
        continue;
      }
      if (idsOnly) return null;
      const value = literal(declaration.initializer, { ...context, values });
      if (value !== UNWRITABLE) values.set(declaration.name.text, value);
    }
  }
  return values;
}

function unwrapped(expression: ts.Expression) {
  while (ts.isParenthesizedExpression(expression)) {
    expression = expression.expression;
  }
  return ts.isJsxElement(expression) ||
    ts.isJsxSelfClosingElement(expression) ||
    ts.isJsxFragment(expression)
    ? expression
    : null;
}

// The story's default export, when it returns JSX after nothing but
// `useId()` constants.
function storyFunction(source: ts.SourceFile, context: Context) {
  for (const statement of source.statements) {
    if (!ts.isFunctionDeclaration(statement) || !statement.body) continue;
    const isDefault = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
    );
    if (!isDefault) continue;
    const body = [...statement.body.statements];
    const last = body.pop();
    if (!last || !ts.isReturnStatement(last) || !last.expression) return null;
    const values = constants(body, context, true);
    const jsx = unwrapped(last.expression);
    return values && jsx ? { jsx, values } : null;
  }
  return null;
}

/** `parts` names every component the bundle exports. */
export function canvasExample(
  storySource: string,
  parts: ReadonlySet<string>
): CanvasExample | null {
  const source = ts.createSourceFile(
    'story.tsx',
    storySource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const moduleValues = constants(
    source.statements,
    { parts, values: new Map() },
    false
  );
  const story = storyFunction(source, {
    parts,
    values: moduleValues ?? new Map(),
  });
  if (!story) return null;
  const rendered = jsxElement(story.jsx, { parts, values: story.values }, 0);
  const [tree] = rendered?.nodes ?? [];
  if (!rendered || !tree || typeof tree === 'string') return null;
  if (rendered.nodes.length !== 1) {
    // A fragment, as a part with no name.
    return {
      markup: rendered.lines.join('\n'),
      tree: { part: '', props: {}, children: rendered.nodes },
    };
  }
  return { markup: rendered.lines.join('\n'), tree };
}
