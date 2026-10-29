// The icons bundle.js ships: src/icons.ts, each checked against
// @tabler/icons' own index, which must be the release @tabler/icons-react the
// sources build with. Every icon the sources and stories import must be in
// the list, so nxds.dev's icon page lists what a canvas has.
import { react18Src } from '@nxds/source-model/roots.mjs';
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { ICON_NAMES, iconComponent } from './icons.ts';

/**
 * Each icon adds about 0.4 KB to bundle.js and 0.26 KB to index.d.ts, which
 * prints every name on each of the 18 icon props so the panel can list them.
 */
const MAX_ICONS = 520;

const TABLER_IMPORT =
  /(?:import|export)\s*(?:type\s*)?\{([^}]*)\}\s*from\s*'@tabler\/icons-react'/g;

export interface IconEntry {
  /** The component, `IconPlus`, which `Nxds.Icons` exports for the previews. */
  component: string;
  /** Its name on a canvas, `plus`, as tabler.io lists it. */
  name: string;
}

interface TablerIndex {
  [key: string]: {
    name: string;
    styles?: { outline?: unknown; filled?: unknown };
  };
}

// @tabler/icons exports only its SVGs, so its own files are read from the
// folder one of them resolves into.
const tablerRoot = path.resolve(
  path.dirname(
    createRequire(import.meta.url).resolve('@tabler/icons/outline/plus.svg')
  ),
  '..',
  '..'
);

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}

function tablerVersions() {
  const icons = readJson<{ version: string }>(
    path.join(tablerRoot, 'package.json')
  );
  const react = createRequire(path.join(react18Src, 'index.ts'))(
    '@tabler/icons-react/package.json'
  ) as { version: string };
  return { icons: icons.version, react: react.version };
}

// Every icon name Tabler has: each outline icon, and each filled one as
// `name-filled`, which @tabler/icons-react exports as `IconNameFilled`.
function tablerNames() {
  const index = readJson<TablerIndex>(path.join(tablerRoot, 'icons.json'));
  const names = new Map<string, string>();
  for (const { name, styles } of Object.values(index)) {
    if (styles?.outline) names.set(iconComponent(name), name);
    if (styles?.filled) {
      names.set(iconComponent(`${name}-filled`), `${name}-filled`);
    }
  }
  return names;
}

function sourceIcons() {
  const found = new Set<string>();
  for (const file of readdirSync(react18Src, {
    recursive: true,
    encoding: 'utf8',
  })) {
    if (!/\.tsx?$/.test(file)) continue;
    const source = readFileSync(path.join(react18Src, file), 'utf8');
    for (const [, names = ''] of source.matchAll(TABLER_IMPORT)) {
      for (const entry of names.split(',')) {
        const name = entry.trim().split(/\s+as\s+/)[0];
        if (name) found.add(name);
      }
    }
  }
  return found;
}

let cached: IconEntry[] | null = null;

/** Every icon the bundle ships, in component-name order. */
export function iconSet(): IconEntry[] {
  if (cached) return cached;
  const versions = tablerVersions();
  if (versions.icons !== versions.react) {
    throw new Error(
      `icons: @tabler/icons is ${versions.icons} but the sources build with @tabler/icons-react ${versions.react}. Pin @tabler/icons in package.json to ${versions.react}.`
    );
  }
  const tabler = tablerNames();
  const listed = new Set<string>(ICON_NAMES.map(iconComponent));
  const unknown = ICON_NAMES.filter((name) => !tabler.has(iconComponent(name)));
  if (unknown.length > 0) {
    throw new Error(
      `icons: Tabler ${versions.icons} has no ${unknown.join(', ')}. Fix src/icons.ts.`
    );
  }
  const unlisted = [...sourceIcons()].filter(
    (component) => !listed.has(component)
  );
  if (unlisted.length > 0) {
    throw new Error(
      `icons: the sources use icons src/icons.ts doesn't list. Add ${unlisted.map((component) => `'${tabler.get(component) ?? component}'`).join(', ')}.`
    );
  }
  if (ICON_NAMES.length > MAX_ICONS) {
    throw new Error(
      `icons: ${ICON_NAMES.length} icons, over the ${MAX_ICONS} budget. Trim src/icons.ts.`
    );
  }
  cached = ICON_NAMES.map((name) => ({ name, component: iconComponent(name) }));
  return cached;
}
