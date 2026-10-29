// An esbuild plugin that hooks every public part in bundle.js into
// src/runtime/attributes.ts. It doesn't wrap a part, so the part keeps its identity
// for checks such as `child.type === MultiSelectItem`:
// - a part's render function, plain or inside `forwardRef`, gets
//   `const props = useCanvasProps('Part', raw)` as its first statement;
// - a part that is another library's component, `const Dialog =
//   DialogPrimitive.Root`, becomes `withCanvasProps('Dialog', ...)`, and every
//   reference in the bundle shares that binding.
import { react18Src } from '@nxds/source-model/roots.mjs';
import type { Plugin } from 'esbuild';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ATTRIBUTES = path.join(import.meta.dirname, 'runtime', 'attributes.ts');
const RAW = '__nxdsRawProps';

interface Edit {
  start: number;
  end: number;
  text: string;
}

type RenderFunction = ts.FunctionDeclaration | ts.FunctionExpression;

function forwardRefRender(node: ts.Expression, source: ts.SourceFile) {
  if (!ts.isCallExpression(node)) return null;
  if (!/(?:^|\.)forwardRef$/.test(node.expression.getText(source))) return null;
  const [render] = node.arguments;
  return render && ts.isFunctionExpression(render) ? render : null;
}

function hookRender(
  part: string,
  render: RenderFunction,
  source: ts.SourceFile
): Edit[] {
  const [props] = render.parameters;
  if (!props || !render.body) {
    throw new Error(
      `bundle.js: ${part} has no props parameter or no body to convert its attributes in.`
    );
  }
  const insertAt = render.body.getStart(source) + 1;
  return [
    {
      start: props.name.getStart(source),
      end: props.name.getEnd(),
      text: RAW,
    },
    {
      start: insertAt,
      end: insertAt,
      text: `const ${props.name.getText(source)} = __nxdsUseCanvasProps(${JSON.stringify(part)}, ${RAW});`,
    },
  ];
}

function declarationEdits(
  declaration: ts.VariableDeclaration,
  part: string,
  source: ts.SourceFile
): Edit[] | null {
  const { initializer } = declaration;
  if (!initializer) return null;
  const render = forwardRefRender(initializer, source);
  if (render) return hookRender(part, render, source);
  if (
    !ts.isPropertyAccessExpression(initializer) &&
    !ts.isIdentifier(initializer)
  ) {
    return null;
  }
  return [
    {
      start: initializer.getStart(source),
      end: initializer.getEnd(),
      text: `__nxdsWithCanvasProps(${JSON.stringify(part)}, ${initializer.getText(source)})`,
    },
  ];
}

/** `code` with each of `parts` hooked into the attribute converter. */
export function hookParts(
  code: string,
  file: string,
  parts: readonly string[]
) {
  const source = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const edits: Edit[] = [];
  const hooked = new Set<string>();
  for (const statement of source.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      parts.includes(statement.name.text)
    ) {
      edits.push(...hookRender(statement.name.text, statement, source));
      hooked.add(statement.name.text);
      continue;
    }
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) continue;
      const part = declaration.name.text;
      if (!parts.includes(part)) continue;
      const found = declarationEdits(declaration, part, source);
      if (!found) continue;
      edits.push(...found);
      hooked.add(part);
    }
  }
  const missed = parts.filter((part) => !hooked.has(part));
  if (missed.length > 0) {
    throw new Error(
      `bundle.js: can't convert the attributes of ${missed.join(', ')} in ${path.relative(react18Src, file)}. A part must be a function, a forwardRef render function, or another library's component; add its shape to src/canvas-transform.ts.`
    );
  }
  const hookedCode = edits
    .sort((a, b) => b.start - a.start)
    .reduce(
      (text, edit) =>
        text.slice(0, edit.start) + edit.text + text.slice(edit.end),
      code
    );
  return `import { useCanvasProps as __nxdsUseCanvasProps, withCanvasProps as __nxdsWithCanvasProps } from ${JSON.stringify(ATTRIBUTES)};\n${hookedCode}`;
}

/** Hooks each component folder's own file; `parts` lists its public parts by folder. */
export function canvasProps(
  parts: ReadonlyMap<string, readonly string[]>
): Plugin {
  return {
    name: 'nxds-canvas-props',
    setup(builder) {
      builder.onLoad({ filter: /\.tsx$/ }, (args) => {
        const slug = path.basename(path.dirname(args.path));
        const own = path.join(react18Src, 'components', slug, `${slug}.tsx`);
        const names = parts.get(slug);
        if (args.path !== own || !names) return undefined;
        return {
          contents: hookParts(
            readFileSync(args.path, 'utf8'),
            args.path,
            names
          ),
          loader: 'tsx',
          resolveDir: path.dirname(args.path),
        };
      });
    },
  };
}
