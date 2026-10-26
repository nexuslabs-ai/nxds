// Which `--nx-*` variables each exported component reads: through the `nx:`
// classes in its sources and every module they import, and through `var()`
// in inline styles. Stories don't count, so a token only a story uses reads
// as unused.
import { isModuleSource } from '@nxds/source-model/react-sources.mjs';
import { react18Src } from '@nxds/source-model/roots.mjs';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import ts from 'typescript';

import { classCandidates, compileTheme } from './styles.ts';

export interface ComponentReads {
  /** Each `--nx-*` name a component reads, with the components that read it. */
  readers: ReadonlyMap<string, readonly string[]>;
  /** A name built at runtime, such as `--nx-spacing-${spacing}`, by its prefix. */
  prefixes: ReadonlyMap<string, readonly string[]>;
}

// Tailwind's build wraps a long `var()` argument onto its own line.
export const VARIABLE = /var\(\s*(--nx-[\w-]+)\s*[,)]/g;
export const DYNAMIC_VARIABLE = /var\(\s*(--nx-[\w-]*-)\$\{/g;
/** Every `--nx-*` name `text` reads. */
export function variablesRead(text: string) {
  return new Set([...text.matchAll(VARIABLE)].map(([, name = '']) => name));
}

const RELATIVE_IMPORT = /\bfrom\s+'(\.{1,2}\/[^']+)'/g;

function resolveImport(from: string, specifier: string) {
  const base = path.resolve(path.dirname(from), specifier);
  return [`${base}.tsx`, `${base}.ts`, path.join(base, 'index.ts')].find(
    (file) => existsSync(file) && isModuleSource(file)
  );
}

/** `entry` and every module it imports, directly or not. */
function moduleClosure(entry: string) {
  const seen = new Set<string>();
  const pending = [entry];
  for (let file = pending.pop(); file; file = pending.pop()) {
    if (seen.has(file)) continue;
    seen.add(file);
    for (const [, specifier = ''] of readFileSync(file, 'utf8').matchAll(
      RELATIVE_IMPORT
    )) {
      const imported = resolveImport(file, specifier);
      if (imported) pending.push(imported);
    }
  }
  return [...seen];
}

// A class or variable a comment names is not read.
const printer = ts.createPrinter({ removeComments: true });

function codeOf(file: string) {
  return printer.printFile(
    ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      false,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    )
  );
}

function folderModules(slug: string) {
  const folder = path.join(react18Src, 'components', slug);
  return readdirSync(folder)
    .map((file) => path.join(folder, file))
    .filter(isModuleSource)
    .flatMap(moduleClosure);
}

// An escaped class name in a selector, such as `.nx\:hover\:bg-muted`.
const SELECTOR_CLASS = /\.((?:\\.|[\w-])+)/g;

/** The `--nx-*` names each `nx:` class reads, from one compile of `candidates`. */
async function classReads(candidates: readonly string[]) {
  const compiler = await compileTheme();
  const reads = new Map<string, Set<string>>();
  postcss.parse(compiler.build([...candidates])).walkRules((rule) => {
    // A nested rule's selector names a variant's class, such as `nx:group`.
    if (rule.parent?.type === 'rule') return;
    const classes = [...rule.selector.matchAll(SELECTOR_CLASS)]
      .map(([, escaped = '']) => escaped.replace(/\\(.)/g, '$1'))
      .filter((name) => name.startsWith('nx:'));
    if (classes.length === 0) return;
    const names = new Set<string>();
    rule.walkDecls((declaration) => {
      for (const [, name = ''] of declaration.value.matchAll(VARIABLE)) {
        names.add(name);
      }
    });
    for (const name of classes) {
      const set = reads.get(name) ?? new Set();
      for (const variable of names) set.add(variable);
      reads.set(name, set);
    }
  });
  return reads;
}

function add(map: Map<string, Set<string>>, key: string, value: string) {
  const set = map.get(key) ?? new Set();
  set.add(value);
  map.set(key, set);
}

function sorted(map: Map<string, Set<string>>) {
  return new Map([...map].map(([key, set]) => [key, [...set].sort()]));
}

/** `folders` are the exported components, as `{ name, slug }`. */
export async function componentReads(
  folders: readonly { name: string; slug: string }[]
): Promise<ComponentReads> {
  const sources = folders.map(({ name, slug }) => ({
    name,
    text: folderModules(slug).map(codeOf).join('\n'),
  }));
  const reads = await classReads([
    ...new Set(sources.flatMap(({ text }) => classCandidates(text))),
  ]);

  const readers = new Map<string, Set<string>>();
  const prefixes = new Map<string, Set<string>>();
  for (const { name, text } of sources) {
    for (const candidate of classCandidates(text)) {
      for (const variable of reads.get(candidate) ?? []) {
        add(readers, variable, name);
      }
    }
    for (const [, variable = ''] of text.matchAll(VARIABLE)) {
      add(readers, variable, name);
    }
    for (const [, prefix = ''] of text.matchAll(DYNAMIC_VARIABLE)) {
      add(prefixes, prefix, name);
    }
  }
  return { readers: sorted(readers), prefixes: sorted(prefixes) };
}

/** The components that read `name`, directly or through a runtime-built name. */
export function readersOf({ readers, prefixes }: ComponentReads, name: string) {
  const found = new Set(readers.get(name) ?? []);
  for (const [prefix, names] of prefixes) {
    if (name.startsWith(prefix)) for (const reader of names) found.add(reader);
  }
  return [...found].sort();
}
