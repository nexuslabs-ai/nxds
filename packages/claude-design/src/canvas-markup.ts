// A docs story's JSX as canvas markup: each nxds part becomes an
// `<x-import component-from-global-scope="Nxds.Part">` element, plain HTML
// stays HTML. Returns null when the story needs something an attribute
// can't hold: state, a computed value, an element passed as a prop.
import ts from 'typescript';

import { ICONS } from './icons.ts';
import { NAMESPACE } from './system-index.ts';

const ICON_NAMES = new Set<string>(ICONS);

const INDENT = '  ';

export function kebab(name: string) {
  if (/^(?:aria|data)-/.test(name)) return name;
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function attributeValue(initializer: ts.JsxAttributeValue | undefined) {
  if (!initializer) return '';
  if (ts.isStringLiteral(initializer)) return initializer.text;
  if (!ts.isJsxExpression(initializer) || !initializer.expression) return null;
  const expression = initializer.expression;
  if (
    ts.isStringLiteral(expression) ||
    ts.isNoSubstitutionTemplateLiteral(expression)
  ) {
    return expression.text;
  }
  if (ts.isNumericLiteral(expression)) return expression.text;
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return '';
  return null;
}

function attributes(node: ts.JsxAttributes, isPart: boolean): string | null {
  const parts: string[] = [];
  for (const property of node.properties) {
    if (!ts.isJsxAttribute(property)) return null;
    const name = property.name.getText();
    const value = attributeValue(property.initializer);
    if (value === null) return null;
    const attribute = isPart
      ? kebab(name)
      : name === 'className'
        ? 'class'
        : name;
    parts.push(
      value === '' ? attribute : `${attribute}="${escapeAttribute(value)}"`
    );
  }
  return parts.map((part) => ` ${part}`).join('');
}

function escapeText(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function decodeEntities(text: string) {
  return text.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
}

interface Context {
  parts: ReadonlySet<string>;
}

function children(
  nodes: readonly ts.JsxChild[],
  context: Context,
  depth: number
): string[] | null {
  const lines: string[] = [];
  for (const child of nodes) {
    if (ts.isJsxText(child)) {
      const text = decodeEntities(child.text).replace(/\s+/g, ' ').trim();
      if (text) lines.push(`${INDENT.repeat(depth)}${text}`);
      continue;
    }
    if (ts.isJsxExpression(child)) {
      if (!child.expression) continue;
      if (ts.isStringLiteral(child.expression)) {
        lines.push(
          `${INDENT.repeat(depth)}${escapeText(child.expression.text)}`
        );
        continue;
      }
      return null;
    }
    const rendered = element(child, context, depth);
    if (rendered === null) return null;
    lines.push(...rendered);
  }
  return lines;
}

function tagOf(name: string, context: Context) {
  if (context.parts.has(name)) {
    return {
      open: `x-import component-from-global-scope="${NAMESPACE}.${name}"`,
      close: 'x-import',
      isPart: true,
    };
  }
  if (ICON_NAMES.has(name)) {
    return {
      open: `x-import component-from-global-scope="${NAMESPACE}.Icons.${name}"`,
      close: 'x-import',
      isPart: true,
    };
  }
  if (/^[a-z]/.test(name)) return { open: name, close: name, isPart: false };
  return null;
}

function element(
  node: ts.JsxChild,
  context: Context,
  depth: number
): string[] | null {
  const pad = INDENT.repeat(depth);
  if (ts.isJsxFragment(node)) return children(node.children, context, depth);
  if (ts.isJsxSelfClosingElement(node)) {
    const tag = tagOf(node.tagName.getText(), context);
    const attrs = tag && attributes(node.attributes, tag.isPart);
    if (!tag || attrs === null) return null;
    return [`${pad}<${tag.open}${attrs}></${tag.close}>`];
  }
  if (!ts.isJsxElement(node)) return null;
  const tag = tagOf(node.openingElement.tagName.getText(), context);
  const attrs = tag && attributes(node.openingElement.attributes, tag.isPart);
  if (!tag || attrs === null) return null;
  const inner = children(node.children, context, depth + 1);
  if (inner === null) return null;
  const open = `${pad}<${tag.open}${attrs}>`;
  const [only] = inner;
  if (inner.length === 1 && only && !only.trim().startsWith('<')) {
    return [`${open}${only.trim()}</${tag.close}>`];
  }
  return [open, ...inner, `${pad}</${tag.close}>`];
}

// The story's default export, when its body is a single `return <jsx />`.
function returnedJsx(source: ts.SourceFile) {
  for (const statement of source.statements) {
    if (!ts.isFunctionDeclaration(statement) || !statement.body) continue;
    const isDefault = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
    );
    if (!isDefault) continue;
    const [only, ...rest] = statement.body.statements;
    if (
      rest.length > 0 ||
      !only ||
      !ts.isReturnStatement(only) ||
      !only.expression
    ) {
      return null;
    }
    let expression: ts.Expression = only.expression;
    while (ts.isParenthesizedExpression(expression))
      expression = expression.expression;
    return ts.isJsxElement(expression) ||
      ts.isJsxSelfClosingElement(expression) ||
      ts.isJsxFragment(expression)
      ? expression
      : null;
  }
  return null;
}

/** `parts` names every component the bundle exports. */
export function canvasMarkup(storySource: string, parts: ReadonlySet<string>) {
  const source = ts.createSourceFile(
    'story.tsx',
    storySource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const jsx = returnedJsx(source);
  if (!jsx) return null;
  const lines = element(jsx, { parts }, 0);
  return lines ? lines.join('\n') : null;
}
