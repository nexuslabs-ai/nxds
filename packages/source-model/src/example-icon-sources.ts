// Rewrites a docs example, which draws Phosphor, to draw another icon
// library: its imports, its icon elements and the icons it passes as values.
import ts from 'typescript';

import {
  exampleIconName,
  type Framework,
  ICON_PACKAGES,
  iconExport,
  type IconLibrary,
} from './example-icons.ts';

type Edit = { start: number; end: number; text: string };

function applyEdits(source: string, edits: Edit[]) {
  return [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce(
      (text, { start, end, text: replacement }) =>
        text.slice(0, start) + replacement + text.slice(end),
      source
    );
}

function importLine(names: Iterable<string>, from: string) {
  const byName = (name: string) => name.replace(/^type /, '');
  const sorted = [...new Set(names)].sort((a, b) =>
    byName(a).localeCompare(byName(b))
  );
  return `import { ${sorted.join(', ')} } from '${from}';`;
}

/** The packages `library`'s icons in an example import, for its install line. */
export function exampleIconPackages(
  library: IconLibrary,
  framework: Framework
) {
  const { icons, component } = ICON_PACKAGES[library][framework];
  const packageName = (specifier: string) =>
    specifier
      .split('/')
      .slice(0, specifier.startsWith('@') ? 2 : 1)
      .join('/');
  return [icons, ...(component ? [component] : [])].map(packageName);
}

/** Throws when `rewritten` still names a Phosphor icon. */
function assertNoPhosphor(id: string, rewritten: string, leftover: RegExp) {
  const match = rewritten.match(leftover);
  if (match) {
    throw new Error(
      `${id}: drawing it in another icon library left ${match[0]} behind. Use the icon as an element or a plain value, as the other examples do.`
    );
  }
}

/** A component that draws HugeIcons' `data`, for an example that passes an icon as a value. */
function hugeiconWrapper(name: string, data: string) {
  return `function ${name}(props: Omit<HugeiconsIconProps, 'icon'>) {\n  return <HugeiconsIcon icon={${data}} {...props} />;\n}`;
}

function isIconTag(node: ts.Identifier, names: Set<string>) {
  const { parent } = node;
  return (
    names.has(node.text) &&
    (ts.isJsxOpeningElement(parent) ||
      ts.isJsxSelfClosingElement(parent) ||
      ts.isJsxClosingElement(parent)) &&
    parent.tagName === node
  );
}

/**
 * A React example's source, drawn by `library`. An example that imports no
 * Phosphor icon comes back as it is.
 */
export function reactExampleSource(
  id: string,
  source: string,
  library: IconLibrary
) {
  const file = ts.createSourceFile(
    `${id}.tsx`,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const declaration = file.statements.find(
    (statement): statement is ts.ImportDeclaration =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === ICON_PACKAGES.phosphor.react.icons
  );
  const bindings = declaration?.importClause?.namedBindings;
  if (!declaration || !bindings || !ts.isNamedImports(bindings)) return source;
  if (bindings.elements.some((element) => element.propertyName)) {
    throw new Error(`${id}: import Phosphor icons by their own names.`);
  }
  const names = new Set(bindings.elements.map((element) => element.name.text));
  const phosphorOf = (name: string) => name.replace(/Icon$/, '');
  for (const name of names) exampleIconName(phosphorOf(name), library);
  if (library === 'phosphor') return source;

  const huge = library === 'hugeicons';
  const exported = (name: string, filled = false) =>
    iconExport(
      library,
      'react',
      exampleIconName(phosphorOf(name), library, filled)
    );
  const edits: Edit[] = [];
  const imported = new Set<string>();
  const wrapped = new Map<string, string>();

  function visitTag(node: ts.JsxOpeningElement | ts.JsxSelfClosingElement) {
    const name = node.tagName.getText();
    const weight = node.attributes.properties.find(
      (attribute): attribute is ts.JsxAttribute =>
        ts.isJsxAttribute(attribute) && attribute.name.getText() === 'weight'
    );
    const filled =
      weight?.initializer !== undefined &&
      ts.isStringLiteral(weight.initializer) &&
      weight.initializer.text === 'fill';
    const icon = exported(name, filled);
    imported.add(icon);
    edits.push({
      start: node.tagName.getStart(),
      end: node.tagName.getEnd(),
      text: huge ? `HugeiconsIcon icon={${icon}}` : icon,
    });
    if (weight) {
      edits.push({
        start: weight.getFullStart(),
        end: weight.getEnd(),
        text: '',
      });
    }
  }

  function visit(node: ts.Node) {
    if (node === declaration) return;
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      names.has(node.tagName.getText())
    ) {
      visitTag(node);
    } else if (
      ts.isJsxClosingElement(node) &&
      names.has(node.tagName.getText())
    ) {
      edits.push({
        start: node.tagName.getStart(),
        end: node.tagName.getEnd(),
        text: huge ? 'HugeiconsIcon' : exported(node.tagName.getText()),
      });
    } else if (
      ts.isIdentifier(node) &&
      names.has(node.text) &&
      !isIconTag(node, names)
    ) {
      if (ts.isShorthandPropertyAssignment(node.parent)) {
        throw new Error(
          `${id}: write { icon: ${node.text} }, not { ${node.text} }, so the icon can be renamed.`
        );
      }
      const icon = exported(node.text);
      if (huge) {
        // HugeIcons' icons are data, so a value needs a component that draws one.
        wrapped.set(node.text, icon);
      } else {
        edits.push({ start: node.getStart(), end: node.getEnd(), text: icon });
      }
      imported.add(icon);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);

  for (const [name, data] of wrapped) {
    if (imported.has(name)) {
      throw new Error(
        `${id}: HugeIcons' ${name} has the name of the component that draws ${data}. Pick another HugeIcons icon in EXAMPLE_ICONS.`
      );
    }
  }
  const { icons, component } = ICON_PACKAGES[library].react;
  const lines = [importLine(imported, icons)];
  if (component) {
    lines.push(
      importLine(
        wrapped.size > 0
          ? ['HugeiconsIcon', 'type HugeiconsIconProps']
          : ['HugeiconsIcon'],
        component
      )
    );
  }
  const lastImport = file.statements.filter(ts.isImportDeclaration).at(-1);
  edits.push({
    start: declaration.getStart(),
    end: declaration.getEnd(),
    text: lines.join('\n'),
  });
  if (wrapped.size > 0 && lastImport) {
    edits.push({
      start: lastImport.getEnd(),
      end: lastImport.getEnd(),
      text: `\n\n${[...wrapped].map(([name, data]) => hugeiconWrapper(name, data)).join('\n\n')}`,
    });
  }

  const rewritten = applyEdits(source, edits);
  assertNoPhosphor(id, rewritten, /@phosphor-icons\//);
  return rewritten;
}

const VUE_IMPORT = /^import \{([^}]*)\} from '@phosphor-icons\/vue';$/m;
const VUE_TAG = /<(\/?)(Ph[A-Z]\w*)\b([^>]*?)(\/?)>/g;
const WEIGHT_ATTRIBUTE = /\s+weight="([^"]*)"/;

/** Adds `names` to the SFC's `vue` import, or imports them from `vue`. */
function withVueImports(script: string, names: string[]) {
  const existing = script.match(/^import \{([^}]*)\} from 'vue';$/m);
  if (!existing) return `${importLine(names, 'vue')}\n${script}`;
  const merged = [
    ...(existing[1] ?? '').split(',').map((name) => name.trim()),
    ...names,
  ].filter(Boolean);
  return script.replace(existing[0], importLine(merged, 'vue'));
}

/**
 * A Vue example single-file component, drawn by `library`. An example that
 * imports no Phosphor icon comes back as it is.
 */
export function vueExampleSource(
  id: string,
  sfc: string,
  library: IconLibrary
) {
  const declaration = sfc.match(VUE_IMPORT);
  if (!declaration) return sfc;
  const names = new Set(
    (declaration[1] ?? '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
  );
  const phosphorOf = (name: string) => name.replace(/^Ph/, '');
  for (const name of names) exampleIconName(phosphorOf(name), library);
  if (library === 'phosphor') return sfc;

  const huge = library === 'hugeicons';
  const exported = (name: string, filled = false) =>
    iconExport(
      library,
      'vue',
      exampleIconName(phosphorOf(name), library, filled)
    );
  const imported = new Set<string>();
  const wrapped = new Map<string, string>();

  const scriptEnd = sfc.indexOf('</script>');
  const tagged = sfc
    .slice(scriptEnd)
    .replace(VUE_TAG, (tag, closing, name, attributes, selfClosing) => {
      if (!names.has(name)) return tag;
      const filled = attributes.match(WEIGHT_ATTRIBUTE)?.[1] === 'fill';
      const rest = attributes.replace(WEIGHT_ATTRIBUTE, '');
      const icon = exported(name, filled);
      if (closing) return `</${huge ? 'HugeiconsIcon' : icon}>`;
      imported.add(icon);
      return huge
        ? `<HugeiconsIcon :icon="${icon}"${rest}${selfClosing}>`
        : `<${icon}${rest}${selfClosing}>`;
    });

  // What's left names an icon as a value: in the script, or bound in the template.
  const valued = (
    sfc.slice(0, scriptEnd).replace(declaration[0], '') + tagged
  ).replace(/\bPh[A-Z]\w*\b/g, (name) => {
    if (!names.has(name)) return name;
    const icon = exported(name);
    imported.add(icon);
    if (!huge) return icon;
    const wrapper = `${phosphorOf(name)}Icon`;
    wrapped.set(wrapper, icon);
    return wrapper;
  });

  const { icons, component } = ICON_PACKAGES[library].vue;
  const lines = [importLine(imported, icons)];
  if (component) lines.push(importLine(['HugeiconsIcon'], component));
  const wrappers = [...wrapped].map(
    ([name, data]) =>
      `const ${name}: FunctionalComponent = (_props, { attrs }) =>\n  h(HugeiconsIcon, { ...attrs, icon: ${data} });`
  );
  const [scriptPart = '', templatePart = ''] = [
    valued.slice(0, valued.indexOf('</script>')),
    valued.slice(valued.indexOf('</script>')),
  ];
  const opening = scriptPart.indexOf('>') + 1;
  let script = `\n${lines.join('\n')}${scriptPart.slice(opening)}`;
  if (wrappers.length > 0) {
    script = withVueImports(script.trimStart(), [
      'type FunctionalComponent',
      'h',
    ]);
    script = `\n${script.trimEnd()}\n\n${wrappers.join('\n\n')}\n`;
  }
  const rewritten = `${scriptPart.slice(0, opening)}${script}${templatePart}`;
  assertNoPhosphor(id, rewritten, /@phosphor-icons\/|\bPh[A-Z]\w*\b/);
  return rewritten;
}
