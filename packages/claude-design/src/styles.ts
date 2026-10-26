// components/bundle.css: the nxds theme compiled with every `nx:` class the
// React 18 sources use. tokens.css owns each value tokens.json lists, so
// those declarations leave this file, and `.dark` rules also match the
// page's `data-theme="dark"`.
import { react18Src } from '@nxds/source-model/roots.mjs';
import { compile } from '@tailwindcss/node';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

const TAILWIND_DIR = path.join(react18Src, '..', '..', 'tailwind');

// The entry the Install page tells consumers to import.
const ENTRY = [
  "@import './nxds.css';",
  "@import 'tw-animate-css';",
  "@import '../react-18/src/components/progress/progress.css';",
].join('\n');

const DARK_CLASS = /(?<![\w\\-])\.dark(?![\w-])/g;
const DARK_SCOPE = ':is(.dark, [data-theme="dark"])';
const NXDS_CLASS = /\.nx\\:/;

function candidates() {
  const found = new Set<string>();
  for (const file of readdirSync(react18Src, {
    recursive: true,
    encoding: 'utf8',
  })) {
    if (!/\.tsx?$/.test(file)) continue;
    const source = readFileSync(path.join(react18Src, file), 'utf8');
    for (const [candidate] of source.matchAll(/nx:[^\s'"`{}]+/g)) {
      found.add(candidate);
    }
  }
  return [...found];
}

function moveValuesToTokens(css: string, tokenNames: ReadonlySet<string>) {
  const root = postcss.parse(css);
  root.walkDecls((declaration) => {
    const rule = declaration.parent;
    if (
      rule?.type === 'rule' &&
      NXDS_CLASS.test((rule as postcss.Rule).selector)
    ) {
      return;
    }
    if (tokenNames.has(declaration.prop)) declaration.remove();
  });
  root.walkRules((rule) => {
    rule.selector = rule.selector.replace(DARK_CLASS, DARK_SCOPE);
  });
  let removed = true;
  while (removed) {
    removed = false;
    root.walk((node) => {
      if (node.type !== 'rule' && node.type !== 'atrule') return;
      if (node.nodes === undefined || node.nodes.length > 0) return;
      node.remove();
      removed = true;
    });
  }
  return root.toString();
}

/** `tokenNames` holds every `--name` tokens.css declares. */
export async function buildStyles(tokenNames: ReadonlySet<string>) {
  const compiler = await compile(ENTRY, {
    base: TAILWIND_DIR,
    onDependency() {},
  });
  return moveValuesToTokens(compiler.build(candidates()), tokenNames);
}
