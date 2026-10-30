import { cache } from 'react';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import 'server-only';

/** The packages whose changelogs the docs show, in the order the index lists them. */
export const CHANGELOG_PACKAGES = [
  {
    slug: 'react',
    summary: 'The React components that nxds-cli copies into your app.',
  },
  { slug: 'vue', summary: 'The Vue components.' },
  { slug: 'core', summary: 'The theme engine that makes every token.' },
  { slug: 'cli', summary: 'The CLI that installs nxds in your app.' },
  { slug: 'eslint-plugin', summary: 'The lint rules for nxds conventions.' },
  {
    slug: 'claude-design',
    summary:
      'nxds as a Claude Design System. It releases with the React components.',
  },
] as const;

export type ChangelogPackage = (typeof CHANGELOG_PACKAGES)[number];

export function findChangelogPackage(slug: string) {
  return CHANGELOG_PACKAGES.find((pkg) => pkg.slug === slug);
}

/**
 * Reads the CHANGELOG.md that changesets writes: a `# name` title, then one
 * `## version` section per release, newest first. `releases` drops the title
 * and the commit hash changesets puts before each entry.
 */
export const readChangelog = cache(async (slug: ChangelogPackage['slug']) => {
  const filePath = path.join(
    process.cwd(),
    '..',
    '..',
    'packages',
    slug,
    'CHANGELOG.md'
  );
  const source = await readFile(filePath, 'utf8');
  const name = source.match(/^# (.+)$/m)?.[1];
  const latest = source.match(/^## (.+)$/m)?.[1];
  if (!name || !latest) {
    throw new Error(
      `${filePath} has no "# name" title or "## version" section.`
    );
  }

  const releases = source
    .replace(/^# .+$/m, '')
    .replace(/^- [0-9a-f]{7,40}: /gm, '- ');
  return { name, latest, releases };
});
