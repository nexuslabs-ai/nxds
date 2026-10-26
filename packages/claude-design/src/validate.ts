// Checks a folder against the Claude Design System format before anyone
// publishes it: paths, size caps, the index, tokens.json's grammar, the
// bundle and the previews. Returns every problem found, so one run lists
// them all.
import { parse } from 'acorn';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

import { IDENTIFIER, isPageGenerated, validateIndex } from './system-index.ts';
import { familyVariable, type TokensFile } from './tokens.ts';
import { compileTokensCss, listFamilies } from './tokens-css.ts';

const KB = 1024;
const MB = 1024 * KB;

const MAX_FILES = 1008;
const MAX_FILE_BYTES = 15 * MB;
const CAPS: [RegExp, number, string][] = [
  [/^README\.md$/, 200 * KB, 'the brand book'],
  [/^tokens\.json$/, 512 * KB, 'tokens.json'],
  [/^components\/bundle\.js$/, 6 * MB, 'the bundle'],
  [/^components\/bundle\.css$/, 2 * MB, 'the stylesheet'],
  [/^components\/[^/]+\/preview\.html$/, 256 * KB, 'a preview'],
  [/^components\/[^/]+\/README\.md$/, 64 * KB, 'a component README'],
];
const MAX_TYPES_BYTES = 1.5 * MB;

const REFUSED_NAMES = new Set([
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lockb',
  'bunfig.toml',
  'tsconfig.json',
  'deno.json',
  'CLAUDE.md',
  'AGENTS.md',
  'node_modules',
]);

const TOKEN_NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const COLOR_FUNCTION =
  /^(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(\s*[-+\w.%\s/,]*\)$/;
const ALIAS = /^\{([A-Za-z0-9][A-Za-z0-9_.-]{0,63})\}$/;
const LENGTH = /^(?:-?\d*\.?\d+(?:px|rem|em|%)|0)$/;
const PLAIN_CSS = /^[A-Za-z0-9 #%(),./+_-]{1,200}$/;
const SHADOW = /^[A-Za-z0-9 #%(),./+_-]{1,400}$/;
const FAMILY_STACK = /^[^;{}<>\\()]{1,200}$/;
const MAX_THEMES = 8;
const MAX_COLORS = 600;
const MAX_FAMILY_TOKENS = 60;
const MAX_TYPE_FAMILIES = 12;
const MAX_TYPE_GROUPS = 12;
const MAX_TYPE_STYLES = 80;
const MAX_EXTRA_FAMILIES = 12;

const CARD_MARKER =
  /^<!-- @dsCard(?: group="[^"]{1,64}")? height=(\d+)(?: [a-z]+(?:="[^"]*"|=\d+)?)* -->$/;
const COVER_MARKER = /^<!-- @dsCard height=(\d+) -->$/;
const FORBIDDEN_TAGS = /<(iframe|frame|object|embed|portal|noscript)\b/i;
const URL_ATTRIBUTE = /\b(?:src|href)\s*=\s*["'](https?:)?\/\//i;
const UNFLATTENED_TYPE =
  /\b(?:VariantProps|ComponentProps|ComponentPropsWithoutRef|Omit|Pick)\s*</;

export interface ValidationResult {
  errors: string[];
  files: string[];
}

// A symlink or other special entry could pull files from outside `root` into
// the publish, so only directories and regular files are listed.
function listFiles(root: string, errors: string[], dir = ''): string[] {
  return readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(
    (entry) => {
      const relative = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) return listFiles(root, errors, relative);
      if (entry.isFile()) return [relative];
      errors.push(`${relative}: not a regular file.`);
      return [];
    }
  );
}

function checkPaths(files: string[], errors: string[]) {
  if (files.length > MAX_FILES) {
    errors.push(`${files.length} files; a system holds at most ${MAX_FILES}.`);
  }
  for (const file of files) {
    const segments = file.split('/');
    if (segments.some((segment) => segment.startsWith('.'))) {
      errors.push(`${file}: dot-files are refused.`);
    }
    if (segments.some((segment) => REFUSED_NAMES.has(segment))) {
      errors.push(`${file}: toolchain and agent files are refused.`);
    }
    if (segments.some((segment) => /~\d/.test(segment))) {
      errors.push(`${file}: 8.3 names are refused.`);
    }
    if (isPageGenerated(file)) {
      errors.push(`${file}: the page generates this; never write it.`);
    }
    const [top, name] = segments;
    if (
      top === 'components' &&
      segments.length > 2 &&
      !IDENTIFIER.test(name ?? '')
    ) {
      errors.push(`${file}: components/<Name> must be a JS identifier.`);
    }
  }
}

function checkSizes(root: string, files: string[], errors: string[]) {
  let types = 0;
  for (const file of files) {
    const bytes = statSync(path.join(root, file)).size;
    if (bytes > MAX_FILE_BYTES)
      errors.push(`${file}: over ${MAX_FILE_BYTES / MB} MiB.`);
    for (const [pattern, cap, what] of CAPS) {
      if (pattern.test(file) && bytes > cap) {
        errors.push(`${file}: ${bytes} bytes; ${what} is capped at ${cap}.`);
      }
    }
    if (/^components\/(?:index|[^/]+\/[^/]+)\.d\.ts$/.test(file))
      types += bytes;
  }
  if (types > MAX_TYPES_BYTES) {
    errors.push(
      `type files total ${types} bytes; the cap is ${MAX_TYPES_BYTES}.`
    );
  }
}

function readJson(root: string, file: string, errors: string[]) {
  try {
    return JSON.parse(readFileSync(path.join(root, file), 'utf8'));
  } catch (error) {
    errors.push(`${file}: ${(error as Error).message}`);
    return undefined;
  }
}

type Entry = { name?: unknown; value?: unknown; usage?: unknown };

function colorValueOk(value: string, names: Set<string>) {
  if (HEX.test(value)) return true;
  if (COLOR_FUNCTION.test(value) && !/var\(|url\(|color-mix\(/.test(value))
    return true;
  const alias = ALIAS.exec(value);
  return Boolean(alias && names.has(alias[1] ?? ''));
}

function themedValues(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object')
    return Object.values(value).map(String);
  return [];
}

function checkAliases(colors: Entry[], errors: string[]) {
  const aliases = new Map<string, string[]>();
  for (const token of colors) {
    const targets = themedValues(token.value).flatMap((value) => {
      const match = ALIAS.exec(value);
      return match?.[1] ? [match[1]] : [];
    });
    if (targets.length > 0) aliases.set(String(token.name), targets);
  }
  for (const start of aliases.keys()) {
    const seen = new Set<string>();
    const walk = (name: string, depth: number): boolean => {
      if (depth > 16 || seen.has(name)) return false;
      seen.add(name);
      return (aliases.get(name) ?? []).every((next) => walk(next, depth + 1));
    };
    if (!walk(start, 0))
      errors.push(`tokens.json: ${start} is an alias cycle or deeper than 16.`);
  }
}

function checkFamilyEntries(
  key: string,
  entries: Entry[],
  allNames: Set<string>,
  colorNames: Set<string>,
  errors: string[]
) {
  for (const entry of entries) {
    const name = String(entry.name);
    const where = `tokens.json ${key}.${name}`;
    if (!TOKEN_NAME.test(name)) errors.push(`${where}: invalid name.`);
    if (allNames.has(name))
      errors.push(`${where}: name used twice across families.`);
    allNames.add(name);
    const values = themedValues(entry.value);
    if (values.length === 0) errors.push(`${where}: no value.`);
    for (const value of values) {
      const ok =
        key === 'color'
          ? colorValueOk(value, colorNames)
          : key === 'shadow'
            ? SHADOW.test(value) && !/var\(|url\(/.test(value)
            : key === 'spacing' || key === 'radius'
              ? LENGTH.test(value) || /^\d+(\.\d+)?$/.test(value)
              : PLAIN_CSS.test(value) && !/var\(|url\(/.test(value);
      if (!ok) errors.push(`${where}: value "${value}" would drop.`);
    }
    if (typeof entry.usage !== 'string' || !entry.usage) {
      errors.push(`${where}: needs a usage note.`);
    }
  }
}

function checkType(type: TokensFile['type'] | undefined, errors: string[]) {
  if (!type) {
    errors.push('tokens.json: no type family.');
    return;
  }
  const families = Object.entries(type.families ?? {});
  if (families.length > MAX_TYPE_FAMILIES)
    errors.push(`tokens.json type: over ${MAX_TYPE_FAMILIES} families.`);
  for (const [key, stack] of families) {
    if (
      !FAMILY_STACK.test(stack) ||
      (stack.match(/["']/g)?.length ?? 0) % 2 !== 0
    ) {
      errors.push(`tokens.json type.families.${key}: invalid font stack.`);
    }
  }
  const groups = type.groups ?? [];
  if (groups.length > MAX_TYPE_GROUPS)
    errors.push(`tokens.json type: over ${MAX_TYPE_GROUPS} groups.`);
  const styles = groups.flatMap((group) => group.styles);
  if (styles.length > MAX_TYPE_STYLES)
    errors.push(`tokens.json type: over ${MAX_TYPE_STYLES} styles.`);
  const styleNames = new Set<string>();
  for (const group of groups) {
    for (const style of group.styles) {
      const where = `tokens.json type ${group.name}.${style.name}`;
      if (!TOKEN_NAME.test(style.name) || styleNames.has(style.name)) {
        errors.push(`${where}: invalid or repeated name.`);
      }
      styleNames.add(style.name);
      const family = style.family ?? group.family;
      if (!type.families[family])
        errors.push(`${where}: unknown family ${family}.`);
      if (!LENGTH.test(style.fontSize))
        errors.push(`${where}: invalid fontSize.`);
      if (
        style.lineHeight &&
        !LENGTH.test(style.lineHeight) &&
        !(Number(style.lineHeight) < 10)
      ) {
        errors.push(`${where}: invalid lineHeight.`);
      }
      if (style.letterSpacing && !LENGTH.test(style.letterSpacing)) {
        errors.push(`${where}: invalid letterSpacing.`);
      }
    }
  }
}

function checkTokens(root: string, errors: string[]) {
  const tokens = readJson(root, 'tokens.json', errors) as
    | TokensFile
    | undefined;
  if (!tokens) return;
  const themes = tokens.color?.themes ?? [];
  if (themes.length === 0 || themes.length > MAX_THEMES) {
    errors.push(`tokens.json: color needs 1 to ${MAX_THEMES} themes.`);
  }
  const colors = (tokens.color?.tokens ?? []) as Entry[];
  if (colors.length > MAX_COLORS)
    errors.push(`tokens.json: over ${MAX_COLORS} colors.`);
  const colorNames = new Set(colors.map((token) => String(token.name)));
  const allNames = new Set<string>();
  const extra = Object.keys(tokens).filter(
    (key) =>
      ![
        'name',
        'version',
        'meta',
        'color',
        'type',
        'spacing',
        'radius',
        'shadow',
      ].includes(key)
  );
  if (extra.length > MAX_EXTRA_FAMILIES)
    errors.push(`tokens.json: over ${MAX_EXTRA_FAMILIES} extra families.`);

  for (const [key, family] of Object.entries(tokens)) {
    if (key === 'type' || key === 'meta' || key === 'name' || key === 'version')
      continue;
    const list = (family as { tokens?: unknown })?.tokens;
    if (!Array.isArray(list)) {
      errors.push(
        `tokens.json ${key}: must be {"tokens": [...]}, a list; a name-to-value map is not read.`
      );
      continue;
    }
    if (key !== 'color' && list.length > MAX_FAMILY_TOKENS) {
      errors.push(`tokens.json ${key}: over ${MAX_FAMILY_TOKENS} tokens.`);
    }
    checkFamilyEntries(key, list as Entry[], allNames, colorNames, errors);
  }
  checkAliases(colors, errors);
  checkType(tokens.type, errors);

  const cssPath = path.join(root, 'tokens.css');
  if (!existsSync(cssPath)) {
    errors.push('tokens.css: missing.');
    return { tokens, allNames };
  }
  checkTokensCss(tokens, readFileSync(cssPath, 'utf8'), errors);
  return { tokens, allNames };
}

/** Each top-level `.<style>` rule in tokens.css, by style name. */
function styleRules(css: string) {
  const rules = new Map<string, string[]>();
  for (const node of postcss.parse(css).nodes) {
    if (node.type !== 'rule' || !node.selector.startsWith('.')) continue;
    rules.set(
      node.selector.slice(1),
      (node.nodes ?? []).flatMap((child) =>
        child.type === 'decl' ? [`${child.prop}: ${child.value};`] : []
      )
    );
  }
  return rules;
}

const STYLE_FIELDS: Record<
  string,
  'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing'
> = {
  'font-size': 'fontSize',
  'line-height': 'lineHeight',
  'font-weight': 'fontWeight',
  'letter-spacing': 'letterSpacing',
};

// The text style classes read variables, so each one must resolve, through
// tokens.json, to the literal values its style lists.
function checkStyleValues(
  tokens: TokensFile,
  rules: Map<string, string[]>,
  errors: string[]
) {
  const values = new Map(
    listFamilies(tokens).flatMap(([, list]) =>
      list.flatMap((token) =>
        typeof token.value === 'string'
          ? [[`--${token.name}`, token.value]]
          : []
      )
    )
  );
  const resolve = (value: string) =>
    value.replace(
      /var\((--[\w-]+)\)/g,
      (reference, name: string) => values.get(name) ?? reference
    );
  for (const group of tokens.type.groups) {
    for (const style of group.styles) {
      const where = `tokens.css .${style.name}`;
      for (const line of rules.get(style.name) ?? []) {
        const [, property = '', value = ''] =
          /^([\w-]+): (.*);$/.exec(line) ?? [];
        if (property === 'font-family') {
          if (
            value !== `var(${familyVariable(style.family ?? group.family)})`
          ) {
            errors.push(`${where}: font-family isn't its family's variable.`);
          }
          continue;
        }
        const field = STYLE_FIELDS[property];
        if (!field) continue;
        const resolved = resolve(value);
        if (resolved.includes('var(')) {
          errors.push(
            `${where}: ${property} reads a variable tokens.json doesn't list.`
          );
        } else if (
          style[field] !== undefined &&
          String(style[field]) !== resolved
        ) {
          errors.push(
            `${where}: ${property} is ${resolved}, but tokens.json lists ${style[field]}.`
          );
        }
      }
    }
  }
}

function checkTokensCss(tokens: TokensFile, css: string, errors: string[]) {
  const rules = styleRules(css);
  let expected: string;
  try {
    expected = compileTokensCss(tokens, rules);
  } catch (error) {
    errors.push((error as Error).message);
    return;
  }
  if (css !== expected) {
    errors.push('tokens.css: differs from a compile of tokens.json.');
    return;
  }
  checkStyleValues(tokens, rules, errors);
}

/** Every custom property `css` declares. */
export function declaredNames(css: string) {
  const names = new Set<string>();
  postcss.parse(css).walkDecls((declaration) => {
    if (declaration.prop.startsWith('--')) names.add(declaration.prop);
  });
  return names;
}

function bundleHeader(code: string, errors: string[]) {
  const [first = ''] = code.split('\n', 1);
  const match = /^\/\* @ds-bundle: (\{.*\}) \*\/$/.exec(first);
  if (!match?.[1]) {
    errors.push('components/bundle.js: line 1 must be the @ds-bundle header.');
    return undefined;
  }
  try {
    return JSON.parse(match[1]) as {
      namespace: string;
      components: { name: string }[];
    };
  } catch {
    errors.push('components/bundle.js: the @ds-bundle header is not JSON.');
    return undefined;
  }
}

function checkBundle(
  root: string,
  index: Record<string, unknown> | undefined,
  errors: string[]
) {
  const file = path.join(root, 'components', 'bundle.js');
  if (!existsSync(file)) {
    errors.push('components/bundle.js: missing.');
    return [];
  }
  const code = readFileSync(file, 'utf8');
  if (/<\/script/i.test(code))
    errors.push('components/bundle.js: contains a literal </script.');
  if (code.includes('<!--'))
    errors.push('components/bundle.js: contains a literal <!--.');
  if (/\bimport\s*\(/.test(code))
    errors.push('components/bundle.js: contains a dynamic import().');
  try {
    parse(code, { ecmaVersion: 'latest', sourceType: 'script' });
  } catch (error) {
    errors.push(
      `components/bundle.js: not a classic script (${(error as Error).message}).`
    );
  }
  const header = bundleHeader(code, errors);
  if (!header) return [];
  if (index && header.namespace !== index['namespace']) {
    errors.push(
      'components/bundle.js: the header namespace differs from the index.'
    );
  }
  if (
    !code.includes(`window.${header.namespace}=`) &&
    !code.includes(`window.${header.namespace} =`)
  ) {
    errors.push(
      `components/bundle.js: never assigns window.${header.namespace}.`
    );
  }
  return header.components.map((component) => component.name);
}

// An appearance preset's selector, such as `[data-density='compact']`.
const PRESET = /\[data-(?!theme=)[\w-]+=/;
const VARIABLE = /var\((--nx-[\w-]+)\)/g;
const DYNAMIC_VARIABLE = /var\((--nx-[\w-]*-)\$\{/g;

function readText(root: string, file: string) {
  const full = path.join(root, file);
  return existsSync(full) ? readFileSync(full, 'utf8') : '';
}

// bundle.css may declare a name tokens.css declares only for an appearance
// preset: tokens.css holds the default.
function checkStylesheet(
  root: string,
  tokenNames: Set<string>,
  errors: string[]
) {
  const css = readText(root, 'components/bundle.css');
  if (/<\/style/i.test(css))
    errors.push('components/bundle.css: contains a literal </style.');
  postcss.parse(css).walkDecls((declaration) => {
    if (!tokenNames.has(declaration.prop)) return;
    const rule = declaration.parent;
    if (
      rule?.type === 'rule' &&
      (rule as postcss.Rule).selectors.every((selector) =>
        PRESET.test(selector)
      )
    ) {
      return;
    }
    errors.push(
      `components/bundle.css: declares ${declaration.prop} outside an appearance preset; tokens.css owns its default.`
    );
  });
}

/** The `--nx-*` names the components and text styles read, and the prefixes they build names from. */
function readNames(root: string) {
  const bundle = readText(root, 'components/bundle.js');
  const names = new Set<string>();
  const add = (text: string) => {
    for (const [, name = ''] of text.matchAll(VARIABLE)) names.add(name);
  };
  add(bundle);
  add(readText(root, 'tokens.css'));
  postcss.parse(readText(root, 'components/bundle.css')).walkRules((rule) => {
    if (rule.selector.includes('.nx\\:')) add(rule.toString());
  });
  const prefixes = [...bundle.matchAll(DYNAMIC_VARIABLE)].map(
    ([, prefix = '']) => prefix
  );
  return { names, prefixes };
}

// A token no component reads says it is for authors, and nothing the
// components read is left undeclared.
function checkReads(
  root: string,
  tokens: TokensFile | undefined,
  tokenNames: Set<string>,
  errors: string[]
) {
  const { names, prefixes } = readNames(root);
  const read = (name: string) =>
    names.has(name) || prefixes.some((prefix) => name.startsWith(prefix));
  for (const [key, list] of tokens ? listFamilies(tokens) : []) {
    for (const token of list) {
      if (read(`--${token.name}`) || token.usage.startsWith('For authors:')) {
        continue;
      }
      errors.push(
        `tokens.json ${key}.${token.name}: no component reads it, so its usage must start with "For authors:".`
      );
    }
  }
  const declared = new Set([
    ...tokenNames,
    ...declaredNames(readText(root, 'components/bundle.css')),
  ]);
  const all = new Set<string>();
  for (const file of ['components/bundle.js', 'components/bundle.css']) {
    for (const [, name = ''] of readText(root, file).matchAll(VARIABLE)) {
      all.add(name);
    }
  }
  for (const name of [...all].filter((name) => !declared.has(name)).sort()) {
    errors.push(`components: read ${name}, which no stylesheet declares.`);
  }
}

/** The `<Name>Props` interfaces index.d.ts declares, by name. */
function checkTypes(root: string, errors: string[]) {
  const file = path.join(root, 'components', 'index.d.ts');
  if (!existsSync(file)) {
    errors.push('components/index.d.ts: missing.');
    return new Set<string>();
  }
  const types = readFileSync(file, 'utf8');
  if (UNFLATTENED_TYPE.test(types)) {
    errors.push(
      'components/index.d.ts: a props type is not flattened (VariantProps, ComponentProps, Omit or Pick).'
    );
  }
  if (/\btypeof\s+[A-Za-z]/.test(types)) {
    errors.push('components/index.d.ts: a props type uses typeof.');
  }
  return new Set(
    [...types.matchAll(/export interface (\w+)Props\b/g)].map(
      (match) => match[1] ?? ''
    )
  );
}

// The canvas finds Nxds.A.B's props as ABProps, BProps or BRootProps.
function hasProps(declared: Set<string>, mounted: string) {
  const [, ...path] = mounted.split('.');
  const last = path.at(-1) ?? '';
  return [path.join(''), last, `${last}Root`].some((name) =>
    declared.has(name)
  );
}

function checkCanvasExamples(
  root: string,
  files: string[],
  declared: Set<string>,
  errors: string[]
) {
  for (const file of files.filter((candidate) =>
    /^components\/[^/]+\/README\.md$/.test(candidate)
  )) {
    const readme = readFileSync(path.join(root, file), 'utf8');
    for (const [, mounted] of readme.matchAll(
      /component-from-global-scope="([\w.]+)"/g
    )) {
      if (mounted && !hasProps(declared, mounted)) {
        errors.push(
          `${file}: mounts ${mounted}, which index.d.ts has no props for.`
        );
      }
    }
  }
}

function checkPreview(file: string, html: string, errors: string[]) {
  const [first = ''] = html.split('\n', 1);
  const cover = file === 'components/Cover/preview.html';
  const marker = (cover ? COVER_MARKER : CARD_MARKER).exec(first);
  if (!marker) {
    errors.push(`${file}: line 1 must be the @dsCard marker.`);
  } else {
    const height = Number(marker[1]);
    const [min, max] = cover ? [240, 360] : [40, 4000];
    if (height < min || height > max)
      errors.push(`${file}: height ${height} is outside ${min}–${max}.`);
  }
  if (FORBIDDEN_TAGS.test(html))
    errors.push(`${file}: uses a refused element.`);
  if (URL_ATTRIBUTE.test(html))
    errors.push(`${file}: loads a URL; previews fetch nothing.`);
  for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    if (/^\s*import\s|\bimport\s*\(/m.test(script ?? '')) {
      errors.push(`${file}: a script imports a module.`);
    }
  }
}

function checkComponents(
  root: string,
  files: string[],
  components: string[],
  errors: string[]
) {
  const coverFiles = files.filter((file) =>
    file.startsWith('components/Cover/')
  );
  if (
    coverFiles.length !== 1 ||
    coverFiles[0] !== 'components/Cover/preview.html'
  ) {
    errors.push('components/Cover/ must hold preview.html and nothing else.');
  }
  if (components.includes('Cover'))
    errors.push('components/bundle.js: Cover is the cover, not a component.');
  for (const name of components) {
    for (const part of ['README.md', 'preview.html']) {
      if (!files.includes(`components/${name}/${part}`)) {
        errors.push(
          `components/${name}/${part}: missing for the bundle's ${name}.`
        );
      }
    }
  }
  for (const file of files.filter((candidate) =>
    candidate.endsWith('/preview.html')
  )) {
    checkPreview(file, readFileSync(path.join(root, file), 'utf8'), errors);
  }
}

// Backticked names that look like tokens must exist, so prose can't drift.
function checkReadme(
  root: string,
  tokens: TokensFile | undefined,
  names: Set<string>,
  errors: string[]
) {
  const file = path.join(root, 'README.md');
  if (!existsSync(file)) {
    errors.push('README.md: missing; every system starts there.');
    return;
  }
  const styles = new Set(
    tokens?.type.groups.flatMap((group) =>
      group.styles.map((style) => style.name)
    ) ?? []
  );
  for (const [, name] of readFileSync(file, 'utf8').matchAll(
    /`((?:nx-|typography-)[\w-]+)`/g
  )) {
    if (name && !names.has(name) && !styles.has(name)) {
      errors.push(
        `README.md: names \`${name}\`, which tokens.json doesn't have.`
      );
    }
  }
}

/** `root` is the folder holding the system's files: the `project/` folder of an export. */
export function validateSystem(root: string): ValidationResult {
  const errors: string[] = [];
  if (!existsSync(root))
    return { errors: [`${root}: no such folder.`], files: [] };
  const files = listFiles(root, errors).sort();
  checkPaths(files, errors);
  checkSizes(root, files, errors);
  const index = readJson(root, 'design-system.json', errors) as
    | Record<string, unknown>
    | undefined;
  if (index) errors.push(...validateIndex(index));
  const checked = checkTokens(root, errors);
  const components = checkBundle(root, index, errors);
  const tokenNames = declaredNames(readText(root, 'tokens.css'));
  checkStylesheet(root, tokenNames, errors);
  checkReads(root, checked?.tokens, tokenNames, errors);
  const declared = checkTypes(root, errors);
  checkComponents(root, files, components, errors);
  checkCanvasExamples(root, files, declared, errors);
  checkReadme(root, checked?.tokens, checked?.allNames ?? new Set(), errors);
  return { errors, files };
}
