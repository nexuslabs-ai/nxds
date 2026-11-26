// Each part's props, read with TypeScript from the app's own components: the
// string unions that become variant properties, the booleans a recipe can
// make one, and each prop's default. A variant the team added in their copy
// of a component reaches Figma this way.
import {
  publicExports,
  toSlugFolder,
} from '@nxds/source-model/props-contract.mjs';
import { componentDefaults } from '@nxds/source-model/props-entries.ts';
import path from 'node:path';
import ts from 'typescript';

import { componentFiles } from './app.ts';
import { ExportError } from './errors.ts';

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

/** @nxds/react's compiler options, which every app's copy of nxds compiles under. */
const OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2020,
  lib: ['lib.es2020.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  noUncheckedIndexedAccess: true,
  esModuleInterop: true,
  skipLibCheck: true,
  resolveJsonModule: true,
  types: [],
  noEmit: true,
};

/** A prop a component declares or takes from a library such as Radix, rather than an HTML or ARIA attribute from React's types. */
const isOwn = (prop: ts.Symbol) =>
  (prop.declarations ?? []).some((declaration) => {
    const file = declaration.getSourceFile().fileName;
    return !/\/node_modules\/(?:@types\/react|csstype)\//.test(file);
  });

/** The props type a component's first parameter takes, or undefined for an export that isn't a component. */
function propsTypeOf(checker: ts.TypeChecker, symbol: ts.Symbol) {
  const [signature] = checker.getTypeOfSymbol(symbol).getCallSignatures();
  const [parameter] = signature?.parameters ?? [];
  return parameter ? checker.getTypeOfSymbol(parameter) : undefined;
}

/** Each of `type`'s props with the types it has across a union's branches. */
function propsOf(checker: ts.TypeChecker, type: ts.Type) {
  const found = new Map<
    string,
    { symbols: ts.Symbol[]; types: Set<ts.Type> }
  >();
  for (const branch of type.isUnion() ? type.types : [type]) {
    for (const prop of checker.getPropertiesOfType(branch)) {
      if (!isOwn(prop)) continue;
      const own = checker.getNonNullableType(checker.getTypeOfSymbol(prop));
      // A branch that bans the prop with `?: never` adds none of its values.
      if (own.flags & ts.TypeFlags.Never) continue;
      const entry = found.get(prop.name) ?? { symbols: [], types: new Set() };
      entry.symbols.push(prop);
      for (const each of own.isUnion() ? own.types : [own])
        entry.types.add(each);
      found.set(prop.name, entry);
    }
  }
  return found;
}

/** The string literals a type annotation writes, in the order it writes them. */
function writtenLiterals(node: ts.TypeNode): string[] {
  if (ts.isUnionTypeNode(node)) return node.types.flatMap(writtenLiterals);
  if (ts.isParenthesizedTypeNode(node)) return writtenLiterals(node.type);
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal))
    return [node.literal.text];
  return [];
}

/**
 * A prop's values in the order its source writes them: a `cva` variant's
 * keys, or a union written in its annotation. Empty when neither says, such
 * as for a type imported from a library.
 */
function writtenOrder(symbols: readonly ts.Symbol[]) {
  for (const declaration of symbols.flatMap(
    (each) => each.declarations ?? []
  )) {
    if (
      ts.isPropertyAssignment(declaration) &&
      ts.isObjectLiteralExpression(declaration.initializer)
    ) {
      return declaration.initializer.properties.flatMap((property) =>
        property.name &&
        (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))
          ? [property.name.text]
          : []
      );
    }
    if (
      (ts.isPropertySignature(declaration) ||
        ts.isPropertyDeclaration(declaration)) &&
      declaration.type
    ) {
      return writtenLiterals(declaration.type);
    }
  }
  return [];
}

/** `literals` in the order the source writes them, then any it doesn't write. */
function inWrittenOrder(literals: string[], written: readonly string[]) {
  const rank = (value: string) => {
    const index = written.indexOf(value);
    return index === -1 ? written.length : index;
  };
  return [...literals].sort((a, b) => rank(a) - rank(b));
}

/** A default as the source writes it, such as `"outline"` or `true`, as the string a variant value is. */
function defaultText(json: string | null | undefined) {
  if (json === null || json === undefined) return undefined;
  try {
    const value: unknown = JSON.parse(json);
    return typeof value === 'string' ? value : String(value);
  } catch {
    return json;
  }
}

/** The app's parts: each one's props, and the component folder it's in, such as `button`. */
export interface AppParts {
  props: PartProps;
  folders: ReadonlyMap<string, string>;
}

function readParts(folder: string): AppParts {
  const files = componentFiles(folder);
  const program = ts.createProgram(files, OPTIONS);
  const checker = program.getTypeChecker();
  const parts = new Map<string, PartProp[]>();
  const folders = new Map<string, string>();
  for (const [name, symbol] of publicExports(checker, program, files)) {
    // A part sits in a folder of its own, as nxds's do. A file directly in the
    // components folder, or a library's component re-exported, isn't one.
    const file = symbol.declarations?.[0]?.getSourceFile().fileName;
    if (!/^[A-Z]/.test(name) || file === undefined) continue;
    const slug = toSlugFolder(path.relative(folder, file));
    if (slug === null) continue;
    const type = propsTypeOf(checker, symbol);
    if (!type) continue;
    const defaults = componentDefaults(checker, symbol, folder);
    folders.set(name, slug);
    parts.set(
      name,
      [...propsOf(checker, type)].map(([prop, entry]): PartProp => {
        const types = [...entry.types];
        const literals = types.every((each) => each.isStringLiteral())
          ? inWrittenOrder(
              [
                ...new Set(
                  types.map((each) => (each as ts.StringLiteralType).value)
                ),
              ],
              writtenOrder(entry.symbols)
            )
          : undefined;
        const boolean = types.every(
          (each) => (each.flags & ts.TypeFlags.BooleanLiteral) !== 0
        );
        const value = defaultText(defaults.get(prop)?.());
        return {
          name: prop,
          ...(literals && literals.length > 0 ? { literals } : {}),
          boolean,
          ...(value === undefined ? {} : { default: value }),
        };
      })
    );
  }
  return { props: parts, folders };
}

/** Throws when `react` has no type declarations from `folder`, since every prop would then read as `any`. */
function assertReactTypes(folder: string) {
  const { resolvedModule } = ts.resolveModuleName(
    'react',
    path.join(folder, 'index.ts'),
    OPTIONS,
    ts.sys
  );
  if (resolvedModule?.extension === ts.Extension.Dts) return;
  throw new ExportError(
    "The app has no type declarations for React, so the export can't read its components' props. Install @types/react and @types/react-dom, then run the command again."
  );
}

/** Every part in the app's components folder, `<root>/<dir>/components`. */
export function appParts(root: string, dir: string): AppParts {
  const components = path.join(dir, 'components');
  assertReactTypes(path.join(root, components));
  try {
    return readParts(path.join(root, components));
  } catch (error) {
    throw new ExportError(
      `The Figma export can't read the props of the app's components in ${components}: ${(error as Error).message}`
    );
  }
}
