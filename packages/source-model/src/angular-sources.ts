// What @nxds/angular exports and the props of each component, as the docs read
// them, and how the install planner reads an Angular source file.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  type ComponentEntry,
  literalDefaultValue,
  type PropEntry,
  type PropsFile,
  toPropsFile,
} from './props-entries.ts';
import {
  angularComponentsRoot,
  angularRoot,
  componentFolderSlug,
  toRepoPath,
} from './roots.mjs';

export type AngularProgram = ReturnType<typeof createAngularProgram>;

function fail(message: string): never {
  throw new Error(`angular-sources: ${message}`);
}

/** A folder's own file, `button/button.ts`, which holds its exported parts. */
function componentFile(slug: string) {
  return path.join(angularComponentsRoot, slug, `${slug}.ts`);
}

/**
 * Every component folder packages/angular exports, in folder order: those
 * whose `{slug}.ts` exports a component or directive. `overlay-layout` holds
 * only recipes.
 */
export function exportedSlugs() {
  return readdirSync(angularComponentsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => {
      const file = componentFile(slug);
      if (!existsSync(file)) return false;
      const source = ts.createSourceFile(
        file,
        readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true
      );
      return exportedClasses(source).length > 0;
    })
    .sort();
}

/** The TypeScript program over packages/angular, which props are read from. */
export function createAngularProgram() {
  const configPath = path.join(angularRoot, 'tsconfig.json');
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    path.dirname(configPath)
  );
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  return { program, checker: program.getTypeChecker() };
}

const ANGULAR_DECORATORS = new Set(['Component', 'Directive']);

/** The `@Component({ … })` or `@Directive({ … })` options of `node`, or null. */
function decoratorOptions(node: ts.ClassDeclaration) {
  for (const decorator of ts.getDecorators(node) ?? []) {
    const call = decorator.expression;
    if (!ts.isCallExpression(call)) continue;
    if (!ANGULAR_DECORATORS.has(call.expression.getText())) continue;
    const [options] = call.arguments;
    if (options && ts.isObjectLiteralExpression(options)) return options;
  }
  return null;
}

function optionValue(options: ts.ObjectLiteralExpression, name: string) {
  const found = options.properties.find(
    (prop): prop is ts.PropertyAssignment =>
      ts.isPropertyAssignment(prop) && prop.name.getText() === name
  );
  return found?.initializer;
}

/** The exported classes of `file` that Angular compiles, in source order. */
function exportedClasses(file: ts.SourceFile) {
  return file.statements.filter(
    (statement): statement is ts.ClassDeclaration =>
      ts.isClassDeclaration(statement) &&
      !!statement.name &&
      !!ts
        .getModifiers(statement)
        ?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword) &&
      decoratorOptions(statement) !== null
  );
}

/** `input`, `input.required` or `model`, as the call that creates a signal input. */
function signalInputKind(call: ts.CallExpression) {
  const callee = call.expression.getText();
  if (callee === 'input' || callee === 'model') return callee;
  if (callee === 'input.required' || callee === 'model.required') {
    return 'required';
  }
  return null;
}

/** `{ alias: 'class' }` gives the public name `class`. */
function aliasOf(call: ts.CallExpression) {
  for (const argument of call.arguments) {
    if (!ts.isObjectLiteralExpression(argument)) continue;
    const alias = optionValue(argument, 'alias');
    if (alias && ts.isStringLiteral(alias)) return alias.text;
  }
  return null;
}

const TYPE_FORMAT =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType;

/**
 * `type` as the Props table prints it, with a union alias spelled out. `true`
 * and `false` print as `boolean`.
 */
function printType(checker: ts.TypeChecker, type: ts.Type) {
  if (!type.isUnion())
    return checker.typeToString(type, undefined, TYPE_FORMAT);
  const isBoolean = (member: ts.Type) =>
    (member.flags & ts.TypeFlags.BooleanLiteral) !== 0;
  const members = type.types
    .filter((member) => !isBoolean(member))
    .map((member) => checker.typeToString(member, undefined, TYPE_FORMAT));
  if (type.types.some(isBoolean)) members.unshift('boolean');
  return members.join(' | ');
}

/** The `T` of an `InputSignal<T>` or `ModelSignal<T>`, as the Props table prints it. */
function valueType(checker: ts.TypeChecker, member: ts.PropertyDeclaration) {
  const type = checker.getTypeAtLocation(member);
  const [value] = checker.getTypeArguments(type as ts.TypeReference);
  if (!value) {
    fail(`${member.name.getText()} has no signal input type.`);
  }
  return printType(checker, value);
}

function jsDoc(checker: ts.TypeChecker, node: ts.Node) {
  const symbol = checker.getSymbolAtLocation(
    (node as ts.NamedDeclaration).name ?? node
  );
  return symbol
    ? ts
        .displayPartsToString(symbol.getDocumentationComment(checker))
        .replace(/\r\n/g, '\n')
    : '';
}

/** Each signal input a class declares, as a Props table row. */
function ownInputs(
  checker: ts.TypeChecker,
  node: ts.ClassDeclaration
): PropEntry[] {
  return node.members.flatMap((member) => {
    if (!ts.isPropertyDeclaration(member) || !member.initializer) return [];
    if (!ts.isCallExpression(member.initializer)) return [];
    const call = member.initializer;
    const kind = signalInputKind(call);
    if (!kind) return [];

    const name = aliasOf(call) ?? member.name.getText();
    const [initial] = call.arguments;
    const defaultValue =
      kind !== 'required' && initial && !ts.isObjectLiteralExpression(initial)
        ? literalDefaultValue(initial.getText(), `${node.name?.text}.${name}`)
        : null;
    return [
      {
        name,
        type: valueType(checker, member),
        required: kind === 'required',
        defaultValue,
        description: jsDoc(checker, member),
      },
    ];
  });
}

/**
 * Inputs a class exposes from its `hostDirectives`, such as `nxTabs`'
 * `value` from brain's `brnTabs`. Their type and docs come from the directive.
 */
function hostDirectiveInputs(
  checker: ts.TypeChecker,
  options: ts.ObjectLiteralExpression
): PropEntry[] {
  const hostDirectives = optionValue(options, 'hostDirectives');
  if (!hostDirectives || !ts.isArrayLiteralExpression(hostDirectives)) {
    return [];
  }
  return hostDirectives.elements.flatMap((element) => {
    if (!ts.isObjectLiteralExpression(element)) return [];
    const directive = optionValue(element, 'directive');
    const inputs = optionValue(element, 'inputs');
    if (!directive || !inputs || !ts.isArrayLiteralExpression(inputs)) {
      return [];
    }
    const declared = checker.getTypeAtLocation(directive);
    const instance = declared.getConstructSignatures()[0]?.getReturnType();
    if (!instance) return [];
    return inputs.elements.flatMap((input) => {
      if (!ts.isStringLiteral(input)) return [];
      const [inner = '', exposed] = input.text.split(':').map((s) => s.trim());
      const property = directiveInputProperty(declared, inner);
      const symbol = property && instance.getProperty(property);
      if (!symbol) return [];
      const [value] = checker.getTypeArguments(
        checker.getTypeOfSymbol(symbol) as ts.TypeReference
      );
      return [
        {
          name: exposed ?? inner,
          type: value ? printType(checker, value) : 'unknown',
          required: false,
          defaultValue: null,
          description: ts
            .displayPartsToString(symbol.getDocumentationComment(checker))
            .replace(/\r\n/g, '\n'),
        },
      ];
    });
  });
}

/** A property name or string literal key as text. */
function keyText(name: ts.PropertyName) {
  return ts.isStringLiteral(name) || ts.isIdentifier(name) ? name.text : null;
}

/**
 * The class property behind a directive's public input name, read from the
 * input map in its compiled `static ɵdir` declaration. That type is an alias of
 * `unknown`, so the map is read from its syntax.
 */
function directiveInputProperty(directive: ts.Type, publicName: string) {
  const declaration = directive.getProperty('ɵdir')?.valueDeclaration;
  if (!declaration || !ts.isPropertyDeclaration(declaration)) return null;
  const typeNode = declaration.type;
  if (!typeNode || !ts.isTypeReferenceNode(typeNode)) return null;
  const inputs = typeNode.typeArguments?.[3];
  if (!inputs || !ts.isTypeLiteralNode(inputs)) return null;

  for (const member of inputs.members) {
    if (!ts.isPropertySignature(member) || !member.type) continue;
    if (!ts.isTypeLiteralNode(member.type)) continue;
    const alias = member.type.members.find(
      (option) =>
        ts.isPropertySignature(option) && keyText(option.name) === 'alias'
    );
    const value =
      alias && ts.isPropertySignature(alias) && alias.type
        ? alias.type
        : undefined;
    if (
      value &&
      ts.isLiteralTypeNode(value) &&
      ts.isStringLiteral(value.literal) &&
      value.literal.text === publicName
    ) {
      return keyText(member.name);
    }
  }
  return null;
}

/** The first row per name: a class's own input wins over the one it forwards. */
function withoutRepeats(props: PropEntry[]) {
  const seen = new Set<string>();
  return props.filter(({ name }) => !seen.has(name) && seen.add(name));
}

function partEntry(
  checker: ts.TypeChecker,
  file: string,
  node: ts.ClassDeclaration
): ComponentEntry {
  const options =
    decoratorOptions(node) ?? fail(`${node.name?.text} has no decorator.`);
  return {
    name: node.name?.text ?? fail('an exported class has no name.'),
    description: jsDoc(checker, node),
    sourcePath: toRepoPath(file),
    props: withoutRepeats([
      ...ownInputs(checker, node),
      ...hostDirectiveInputs(checker, options),
    ])
      .filter((prop) => prop.name !== 'class')
      .sort((a, b) => a.name.localeCompare(b.name, 'en')),
  };
}

/** Each exported part of `slug` and its own inputs, for the Props table. */
export function componentProps(
  { program, checker }: AngularProgram,
  slug: string
): PropsFile {
  const file = componentFile(slug);
  const source =
    program.getSourceFile(file) ??
    fail(`${toRepoPath(file)} is not in the program.`);
  return toPropsFile(
    slug,
    exportedClasses(source).map((node) => partEntry(checker, file, node))
  );
}

// ── Install planning ────────────────────────────────────────────────────────

export function isAngularModuleSource(file: string) {
  return file.endsWith('.ts') && !file.endsWith('.stories.ts');
}

export function linkedAngularSlug(file: string, exported: Set<string>) {
  return componentFolderSlug(angularComponentsRoot, file, exported);
}
