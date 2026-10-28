import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { MDX_OPTIONS } from './mdx-options';

const docsRoot = path.dirname(fileURLToPath(import.meta.url));

// How packages/react's components and blocks import its own icons, and how a
// generated demo does. The docs swap that module for one that follows the
// reader's icon library.
const ICONS_REQUESTS = ['../../lib/icons', '../../../lib/icons', '@/lib/icons'];
const SWITCHABLE_ICONS = './app/_lib/switchable-icons.tsx';

// The swap matches import requests, not resolved files, so fail on any
// packages/react import of lib/icons the swap would miss. The icon sets the
// swap draws from import the Phosphor set unswapped.
function assertIconsRequests() {
  const reactSrc = path.join(docsRoot, '..', '..', 'packages', 'react', 'src');
  const icons = path.join(reactSrc, 'lib', 'icons');
  for (const file of readdirSync(reactSrc, {
    recursive: true,
    encoding: 'utf8',
  })) {
    if (!/\.tsx?$/.test(file)) continue;
    if (file.startsWith(path.join('lib', 'icon-libraries'))) continue;
    const source = readFileSync(path.join(reactSrc, file), 'utf8');
    for (const [, request = ''] of source.matchAll(/from\s+'(\.[^']*)'/g)) {
      const resolved = path.join(reactSrc, path.dirname(file), request);
      if (resolved === icons && !ICONS_REQUESTS.includes(request)) {
        throw new Error(
          `packages/react/src/${file} imports lib/icons as '${request}'. Add it to ICONS_REQUESTS in apps/docs/next.config.ts, so the docs swap it.`
        );
      }
    }
  }
}

assertIconsRequests();

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['@nxds/react'],
  // let .md/.mdx resolve as modules (for content imported by the dynamic route)
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  turbopack: {
    // Pin the monorepo root (../.. from this file) so Turbopack doesn't walk past
    // a nested .claude/worktrees/* checkout and pick the parent repo's lockfile.
    root: path.join(docsRoot, '..', '..'),
    resolveAlias: Object.fromEntries(
      ICONS_REQUESTS.map((request) => [request, SWITCHABLE_ICONS])
    ),
  },
  webpack(config, { webpack }) {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /\/lib\/icons$/,
        (resource: { request: string }) => {
          if (!ICONS_REQUESTS.includes(resource.request)) return;
          resource.request = path.join(docsRoot, SWITCHABLE_ICONS);
        }
      )
    );
    return config;
  },
};

const withMDX = createMDX({ options: MDX_OPTIONS });

export default withMDX(nextConfig);
