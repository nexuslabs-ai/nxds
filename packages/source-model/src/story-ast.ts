// Reads the docs stories of a framework package whose stories render a
// `template` string, as @nxds/vue's and @nxds/angular's do, for the docs
// generators that turn each into the file a reader copies.
import ts from 'typescript';

export function kebab(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function unwrap(node: ts.Expression): ts.Expression {
  let current = node;
  while (
    ts.isSatisfiesExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

export function property(object: ts.ObjectLiteralExpression, name: string) {
  const found = object.properties.find(
    (prop) =>
      (ts.isPropertyAssignment(prop) ||
        ts.isShorthandPropertyAssignment(prop)) &&
      prop.name.getText() === name
  );
  if (!found) return undefined;
  return ts.isPropertyAssignment(found) ? unwrap(found.initializer) : found;
}

/** `parameters.docs.description.{key}` as a string, or null. */
export function docsDescription(
  object: ts.ObjectLiteralExpression,
  key: string
) {
  let node: ts.Node | undefined = object;
  for (const name of ['parameters', 'docs', 'description', key]) {
    if (!node || !ts.isObjectLiteralExpression(node)) return null;
    node = property(node, name);
  }
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text.trim();
  }
  return null;
}

/** `text` with its leading blank lines, trailing space and common indent removed. */
export function dedent(text: string) {
  const lines = text.replace(/^\n+|\s+$/g, '').split('\n');
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.search(/\S/))
  );
  return lines.map((line) => line.slice(indent)).join('\n');
}

/** Whether a story's `tags` list `docs`. */
export function isDocsStory(object: ts.ObjectLiteralExpression) {
  const tags = property(object, 'tags');
  return (
    !!tags &&
    ts.isArrayLiteralExpression(tags) &&
    tags.elements.some((tag) => ts.isStringLiteral(tag) && tag.text === 'docs')
  );
}
