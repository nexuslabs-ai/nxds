import { repoRoot } from '@nxds/source-model/roots.mjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { copies, dependencies } from './parity.ts';

const read = (file: string) => readFileSync(path.join(repoRoot, file), 'utf8');

const printer = ts.createPrinter({ removeComments: true });

function unwrap(node: ts.Expression): ts.Expression {
  let current = node;
  while (ts.isAsExpression(current) || ts.isSatisfiesExpression(current)) {
    current = current.expression;
  }
  return current;
}

function parse(file: string) {
  return ts.createSourceFile(
    file,
    read(file),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
}

/** The `{ … }` the top-level function `name` in `file` returns. */
function readReturned(file: string, name: string) {
  const source = parse(file);
  for (const statement of source.statements) {
    if (!ts.isFunctionDeclaration(statement)) continue;
    if (statement.name?.text !== name) continue;
    for (const inner of statement.body?.statements ?? []) {
      if (!ts.isReturnStatement(inner) || !inner.expression) continue;
      const init = unwrap(inner.expression);
      if (ts.isObjectLiteralExpression(init)) return { source, init };
    }
  }
  throw new Error(`${file} has no \`${name}\` that returns \`{ … }\`.`);
}

/** The `const preview = { … }` object a Storybook preview file exports. */
function readPreview(file: string) {
  const source = parse(file);
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const init = declaration.initializer && unwrap(declaration.initializer);
      if (declaration.name.getText() !== 'preview') continue;
      if (init && ts.isObjectLiteralExpression(init)) return { source, init };
    }
  }
  throw new Error(`${file} has no \`const preview = { … }\`.`);
}

function member(object: ts.ObjectLiteralExpression, name: string) {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    if (property.name.getText() !== name) continue;
    const value = unwrap(property.initializer);
    if (ts.isObjectLiteralExpression(value)) return value;
  }
  throw new Error(`preview has no \`${name}: { … }\`.`);
}

function keys(object: ts.ObjectLiteralExpression) {
  return object.properties.map((property) => property.name?.getText()).sort();
}

/** The source text of `object`'s `name` property, such as `'error'`. */
function valueText(object: ts.ObjectLiteralExpression, name: string) {
  const property = object.properties.find(
    (candidate) => candidate.name?.getText() === name
  );
  if (property && ts.isPropertyAssignment(property)) {
    return property.initializer.getText();
  }
  throw new Error(`preview has no \`${name}\`.`);
}

const react = readPreview('packages/react/.storybook/preview.tsx');
const vue = readPreview('packages/vue/.storybook/preview.ts');

// React's preview takes its toolbar and axe rules from the wiring an app
// gets. Vue's preview holds its own until the CLI installs Vue (#887).
const REACT_WIRING = 'packages/react/src/storybook.tsx';
const reactWiring = readReturned(REACT_WIRING, 'nxdsPreview');
const reactGlobals = readReturned(REACT_WIRING, 'globalsFromAppearanceState');

function a11y({ init }: typeof react) {
  return member(member(init, 'parameters'), 'a11y');
}

function manifest(framework: 'react' | 'vue') {
  const { dependencies: declared } = JSON.parse(
    read(`packages/${framework}/package.json`)
  );
  return declared as Record<string, string>;
}

describe('shared setup', () => {
  it.each(copies)('%s is copied unchanged to %s', (reactFile, vueFile) => {
    expect(read(vueFile)).toBe(read(reactFile));
  });

  it.each([
    ['parameters', () => member(react.init, 'parameters')],
    ['globalTypes', () => member(reactWiring.init, 'globalTypes')],
    ['initialGlobals', () => reactGlobals.init],
  ] as const)('both Storybook previews set the same %s', (name, ofReact) => {
    expect(keys(member(vue.init, name))).toEqual(keys(ofReact()));
  });

  it('both Storybook previews run the same axe rules', () => {
    const print = (preview: typeof react) =>
      printer.printNode(
        ts.EmitHint.Expression,
        member(a11y(preview), 'options'),
        preview.source
      );
    expect(print(vue)).toBe(print(reactWiring));
  });

  it('both Storybook previews fail a story on an axe violation', () => {
    expect(valueText(a11y(vue), 'test')).toBe(valueText(a11y(react), 'test'));
  });

  it.each(dependencies)(
    '%s and %s take the same range',
    (reactName, vueName) => {
      const range = manifest('react')[reactName];
      expect(range).toBeDefined();
      expect(manifest('vue')[vueName]).toBe(range);
    }
  );
});
