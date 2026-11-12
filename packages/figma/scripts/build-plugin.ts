// Builds the plugin into plugin/dist: code.js for Figma's main thread, and
// ui.html with its script inline, since a plugin's UI can't load a file.
// Fails when the manifest doesn't list the port the CLI serves on.
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { LINK_PORT } from '../src/port.ts';

const plugin = path.join(import.meta.dirname, '..', 'plugin');
const dist = path.join(plugin, 'dist');

const manifest = JSON.parse(
  readFileSync(path.join(plugin, 'manifest.json'), 'utf8')
) as {
  networkAccess: { devAllowedDomains: string[] };
};
const origin = `http://localhost:${LINK_PORT}`;
if (!manifest.networkAccess.devAllowedDomains.includes(origin)) {
  throw new Error(
    `plugin/manifest.json must list ${origin} in networkAccess.devAllowedDomains.`
  );
}

mkdirSync(dist, { recursive: true });
const shared = {
  bundle: true,
  format: 'iife',
  target: 'es2017',
  logLevel: 'warning',
} as const;
await build({
  ...shared,
  entryPoints: [path.join(plugin, 'src', 'code.ts')],
  outfile: path.join(dist, 'code.js'),
});
const ui = await build({
  ...shared,
  entryPoints: [path.join(plugin, 'src', 'ui.ts')],
  write: false,
});
const script = ui.outputFiles[0]?.text ?? '';
const page = readFileSync(path.join(plugin, 'src', 'ui.html'), 'utf8').replace(
  '<!-- ui.js -->',
  () => `<script>${script}</script>`
);
writeFileSync(path.join(dist, 'ui.html'), page);
console.log(
  `Built the nxds Figma plugin into ${path.relative(process.cwd(), dist) || dist}.`
);
