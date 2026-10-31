// components/bundle.css: the nxds theme compiled with every `nx:` class the
// React 18 sources use. Every catalogue token's default leaves this file:
// tokens.css declares the ones a component reads, and a read the scanner
// misses fails validation instead of falling back to a default here. The
// appearance presets stay, `.dark` rules also match the page's
// `data-theme="dark"`, and structural selectors reach through the wrapper the
// canvas puts around each component.
import { createTokenCatalogue } from '@nxds/core/catalogue';
import { react18Src } from '@nxds/source-model/roots.mjs';
import { compile } from '@tailwindcss/node';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

import { tolerateCanvasWrappers } from './wrapper-css.ts';

const TAILWIND_DIR = path.dirname(
  fileURLToPath(import.meta.resolve('@nxds/tailwind/nxds.css'))
);

// The entry the Install page tells consumers to import.
const ENTRY = [
  "@import './nxds.css';",
  "@import 'tw-animate-css';",
  `@import '${path.join(react18Src, 'components', 'progress', 'progress.css')}';`,
].join('\n');

const DARK_CLASS = /(?<![\w\\-])\.dark(?![\w-])/g;
const DARK_SCOPE = ':is(.dark, [data-theme="dark"])';
const NXDS_CLASS = /\.nx\\:/;
/**
 * The selectors that hold a token's default value, before the `.dark` rewrite.
 * Tailwind writes its theme variables, such as the page widths, to
 * `:root, :host`.
 */
const DEFAULT_SELECTORS: ReadonlySet<string> = new Set([
  ':root',
  ':host',
  '.dark',
]);

/** The `nx:` classes `source` names. */
export function classCandidates(source: string) {
  return [...source.matchAll(/nx:[^\s'"`{}]+/g)].map(
    ([candidate]) => candidate
  );
}

/** The Tailwind compiler for the entry consumers import. */
export function compileTheme() {
  return compile(ENTRY, { base: TAILWIND_DIR, onDependency() {} });
}

// Every `nx:` class in the React 18 sources, stories and blocks included,
// since the previews render the docs stories, and in the export's own parts.
function candidates() {
  const found = new Set<string>();
  for (const root of [
    react18Src,
    path.join(import.meta.dirname, 'canvas'),
    path.join(import.meta.dirname, 'runtime'),
  ]) {
    for (const file of readdirSync(root, {
      recursive: true,
      encoding: 'utf8',
    })) {
      if (!/\.tsx?$/.test(file)) continue;
      const source = readFileSync(path.join(root, file), 'utf8');
      for (const candidate of classCandidates(source)) found.add(candidate);
    }
  }
  return [...found];
}

// A rule such as `:root, [data-density='default']` splits in two: the preset
// keeps every declaration, and `:root` loses the catalogue tokens.
function moveDefaultsToTokens(
  rule: postcss.Rule,
  tokenNames: ReadonlySet<string>
) {
  if (NXDS_CLASS.test(rule.selector)) return;
  if (!rule.selectors.some((selector) => DEFAULT_SELECTORS.has(selector))) {
    return;
  }
  const owned = (rule.nodes ?? []).filter(
    (node): node is postcss.Declaration =>
      node.type === 'decl' && tokenNames.has(node.prop)
  );
  if (owned.length === 0) return;
  const presets = rule.selectors.filter(
    (selector) => !DEFAULT_SELECTORS.has(selector)
  );
  if (presets.length > 0) rule.cloneBefore({ selectors: presets });
  rule.selectors = rule.selectors.filter((selector) =>
    DEFAULT_SELECTORS.has(selector)
  );
  for (const declaration of owned) declaration.remove();
}

function moveValuesToTokens(css: string, tokenNames: ReadonlySet<string>) {
  const root = postcss.parse(css);
  root.walkRules((rule) => moveDefaultsToTokens(rule, tokenNames));
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

export async function buildStyles() {
  const compiler = await compileTheme();
  const tokenNames = new Set<string>(
    createTokenCatalogue().map((token) => token.name)
  );
  return tolerateCanvasWrappers(
    moveValuesToTokens(compiler.build(candidates()), tokenNames)
  );
}
