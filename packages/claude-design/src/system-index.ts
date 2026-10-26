// project/design-system.json, the index the Design System page reads first.
export const NAMESPACE = 'Nxds';
const TITLE = 'nxds';
const REACT_VERSION = '18.3.1';

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
