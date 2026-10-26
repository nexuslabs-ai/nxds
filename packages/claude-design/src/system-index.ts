// project/design-system.json, the index the Design System page reads first,
// and the paths the page writes for itself.
export const NAMESPACE = 'Nxds';
const TITLE = 'nxds';
const REACT_VERSION = '18.3.1';
export const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const PAGE_PATHS = ['manifest.json', 'api/'];

export interface LastChange {
  by: string;
  at: string;
  via: string;
  note: string;
}

export interface SystemIndex {
  v: 3;
  layout: 'files';
  createdOnFiles: { v: 1; at: string };
  title: string;
  namespace: string;
  editing: 'code';
  libraries: { name: string; version: string }[];
  sections: Record<string, unknown>;
  groups: string[];
  assetGroups: Record<string, unknown>;
  blobs: Record<string, unknown>;
  docs: { sections: unknown[] };
  lastChange: LastChange;
  [key: string]: unknown;
}

export function buildSystemIndex({
  version,
  at,
}: {
  version: string;
  at: string;
}): SystemIndex {
  return {
    v: 3,
    layout: 'files',
    createdOnFiles: { v: 1, at },
    title: TITLE,
    namespace: NAMESPACE,
    editing: 'code',
    libraries: [
      { name: 'react', version: REACT_VERSION },
      { name: 'react-dom', version: REACT_VERSION },
    ],
    sections: {},
    groups: [],
    assetGroups: {},
    blobs: {},
    docs: { sections: [] },
    lastChange: {
      by: 'nxds',
      at,
      via: `nxds-cli · @nxds/claude-design@${version}`,
      note: `nxds ${version}: tokens, components, prop types and previews.`,
    },
  };
}

/**
 * The export's index laid over the one a system already has: the system keeps
 * its creation marker, title and anything a person added on the page.
 */
export function mergeSystemIndex(
  current: Record<string, unknown>,
  exported: SystemIndex
): Record<string, unknown> {
  return {
    ...current,
    namespace: exported.namespace,
    editing: exported.editing,
    libraries: exported.libraries,
    lastChange: exported.lastChange,
  };
}

/** `file` is relative to `project/`. The page generates it, so an export never writes it. */
export function isPageGenerated(file: string) {
  return PAGE_PATHS.some((page) => file === page || file.startsWith(page));
}

/** What keeps the page from reading `index`, one message per problem. */
export function validateIndex(index: Record<string, unknown>): string[] {
  const where = 'design-system.json';
  const errors: string[] = [];
  if (index['v'] !== 3 || index['layout'] !== 'files') {
    errors.push(`${where}: needs "v": 3 and "layout": "files".`);
  }
  if (!index['createdOnFiles'] && !index['convertedFrom']) {
    errors.push(`${where}: needs the createdOnFiles marker.`);
  }
  if (typeof index['title'] !== 'string' || !index['title']) {
    errors.push(`${where}: needs a title.`);
  }
  if (
    typeof index['namespace'] !== 'string' ||
    !IDENTIFIER.test(index['namespace'])
  ) {
    errors.push(`${where}: namespace must be a JS identifier.`);
  }
  const lastChange = index['lastChange'] as Record<string, unknown> | undefined;
  if (
    !lastChange ||
    typeof lastChange['by'] !== 'string' ||
    Number.isNaN(Date.parse(String(lastChange['at'])))
  ) {
    errors.push(`${where}: lastChange needs "by" and an ISO-8601 "at".`);
  }
  return errors;
}
