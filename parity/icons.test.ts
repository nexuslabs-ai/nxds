import { ICON_LIBRARY_OPTIONS, type NxdsIconLibrary } from '@nxds/core';
import { reactSrc, vueSrc } from '@nxds/source-model/roots.mjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

/** A library's internal icon set: `lib/icons.ts` for Phosphor, else `lib/icon-libraries/{library}.ts`. */
function iconSetFile(src: string, library: NxdsIconLibrary) {
  return library === 'phosphor'
    ? path.join(src, 'lib', 'icons.ts')
    : path.join(src, 'lib', 'icon-libraries', `${library}.ts`);
}

/** Phosphor names `XIcon` in React and `PhX` in Vue. The other libraries share names. */
function libraryIconName(name: string) {
  return name.replace(/^Ph(?=[A-Z])/, '').replace(/Icon$/, '');
}

/** The library icon a wrapper draws: the first argument of its first call. */
function drawnIcon(node: ts.Node): string | undefined {
  if (ts.isCallExpression(node) && node.arguments[0]) {
    const [first] = node.arguments;
    if (ts.isIdentifier(first)) return first.text;
  }
  return ts.forEachChild(node, drawnIcon);
}

/** Each exported internal icon name, mapped to the library icon it draws. */
function iconSet(file: string) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
  const icons: Record<string, string | undefined> = {};

  for (const statement of source.statements) {
    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const element of statement.exportClause.elements) {
        icons[element.name.text] = (element.propertyName ?? element.name).text;
      }
    }
    const exported = ts
      .getModifiers(statement as ts.HasModifiers)
      ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      icons[statement.name.text] = drawnIcon(statement);
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          icons[declaration.name.text] = drawnIcon(declaration);
        }
      }
    }
  }

  return Object.fromEntries(
    Object.entries(icons).map(([name, icon]) => [
      name,
      icon && libraryIconName(icon),
    ])
  );
}

describe('internal icon sets', () => {
  const names = Object.keys(iconSet(iconSetFile(reactSrc, 'phosphor'))).sort();

  it.each(ICON_LIBRARY_OPTIONS.map((library) => library.value))(
    '%s: Vue draws each internal icon with the same library icon as React',
    (library) => {
      const react = iconSet(iconSetFile(reactSrc, library));
      const vue = iconSet(iconSetFile(vueSrc, library));

      expect(Object.keys(react).sort()).toEqual(names);
      expect(vue).toEqual(react);
    }
  );
});
