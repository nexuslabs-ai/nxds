// The icons bundle.js ships: src/icons.ts, each checked against the
// @phosphor-icons/react release the sources build with. Every icon the sources
// and stories import must be in the list, so nxds.dev's icon page lists what a
// canvas has.
import { react18Src } from '@nxds/source-model/roots.mjs';
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { ICON_NAMES, iconComponent, iconWeight } from './icons.ts';

/**
 * Each icon adds about 3 KB to bundle.js and 0.26 KB to index.d.ts, which
 * prints every name on each of the 18 icon props so the panel can list them.
 */
const MAX_ICONS = 520;

const PHOSPHOR_IMPORT =
  /(?:import|export)\s*(?:type\s*)?\{([^}]*)\}\s*from\s*'@phosphor-icons\/react\/ssr'/g;

export interface IconEntry {
  /** The component, `PlusIcon`, which `Nxds.Icons` exports for the previews. */
  component: string;
  /** Its name on a canvas, `plus`, as phosphoricons.com lists it. */
  name: string;
  /** `fill` for a `-fill` name, which draws the component's filled weight. */
  weight?: 'fill';
}

// Every component @phosphor-icons/react's SSR entry exports, `PlusIcon` for
// `dist/ssr/Plus.es.js`.
function phosphorComponents() {
  const root = path.dirname(
    createRequire(path.join(react18Src, 'index.ts')).resolve(
      '@phosphor-icons/react/package.json'
    )
  );
  return new Set(
    readdirSync(path.join(root, 'dist', 'ssr'))
      .filter((file) => file.endsWith('.es.js') && file !== 'index.es.js')
      .map((file) => `${file.slice(0, -'.es.js'.length)}Icon`)
  );
}

function sourceIcons() {
  const found = new Set<string>();
  for (const file of readdirSync(react18Src, {
    recursive: true,
    encoding: 'utf8',
  })) {
    if (!/\.tsx?$/.test(file)) continue;
    const source = readFileSync(path.join(react18Src, file), 'utf8');
    for (const [, names = ''] of source.matchAll(PHOSPHOR_IMPORT)) {
      for (const entry of names.split(',')) {
        const name = entry.trim().split(/\s+as\s+/)[0];
        if (name) found.add(name);
      }
    }
  }
  return found;
}

let cached: IconEntry[] | null = null;

/** Every icon the bundle ships, in name order. */
export function iconSet(): IconEntry[] {
  if (cached) return cached;
  const phosphor = phosphorComponents();
  const unknown = ICON_NAMES.filter(
    (name) => !phosphor.has(iconComponent(name))
  );
  if (unknown.length > 0) {
    throw new Error(
      `icons: @phosphor-icons/react has no ${unknown.join(', ')}. Fix src/icons.ts.`
    );
  }
  const listed = new Set<string>(ICON_NAMES.map(iconComponent));
  const unlisted = [...sourceIcons()].filter(
    (component) => !listed.has(component)
  );
  if (unlisted.length > 0) {
    throw new Error(
      `icons: the sources use icons src/icons.ts doesn't list. Add the names of ${unlisted.join(', ')}.`
    );
  }
  if (ICON_NAMES.length > MAX_ICONS) {
    throw new Error(
      `icons: ${ICON_NAMES.length} icons, over the ${MAX_ICONS} budget. Trim src/icons.ts.`
    );
  }
  cached = ICON_NAMES.map((name) => {
    const entry: IconEntry = { name, component: iconComponent(name) };
    const weight = iconWeight(name);
    if (weight) entry.weight = weight;
    return entry;
  });
  return cached;
}
