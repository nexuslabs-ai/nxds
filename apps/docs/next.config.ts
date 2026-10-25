import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { MDX_OPTIONS } from './mdx-options';

const docsRoot = path.dirname(fileURLToPath(import.meta.url));

// packages/react imports its own icons as these, from components and blocks.
// The docs swap that module for one that follows the reader's icon library.
const ICONS_REQUESTS = ['../../lib/icons', '../../../lib/icons'];
const SWITCHABLE_ICONS = './app/_lib/switchable-icons.tsx';

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
