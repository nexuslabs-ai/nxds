import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createJiti } from 'jiti';

import { docsRoot } from './docs-root.mjs';

// Cloudflare Workers static assets reject a _headers line over 2,000 characters.
const MAX_HEADERS_LINE_LENGTH = 2000;

const outDir = path.join(docsRoot, 'out');

if (!existsSync(outDir)) {
  console.error('Missing out/. Run `next build` first.');
  process.exit(1);
}

const jiti = createJiti(
  pathToFileURL(path.join(docsRoot, 'package.json')).href
);
const { SECURITY_HEADERS } = await jiti.import(
  path.join(docsRoot, 'security-headers.ts')
);
const { PAGE_MANIFEST, sectionHomeRoute } = await jiti.import(
  path.join(docsRoot, 'app', '_lib', 'manifest.ts')
);

const headersLines = [
  '/*',
  ...Object.entries(SECURITY_HEADERS).map(
    ([name, value]) => `  ${name}: ${value}`
  ),
  '/_next/static/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  // write-markdown.ts output, served as UTF-8 so `›` and `—` survive.
  '/*.md',
  '  Content-Type: text/markdown; charset=utf-8',
  // Every docs page prefetches its `.md` for the Copy page button.
  '  Cache-Control: public, max-age=300, stale-while-revalidate=86400',
  '/llms.txt',
  '  Content-Type: text/plain; charset=utf-8',
  '/llms-full.txt',
  '  Content-Type: text/plain; charset=utf-8',
];

const overlong = headersLines.find(
  (line) => line.length > MAX_HEADERS_LINE_LENGTH
);
if (overlong) {
  console.error(
    `_headers line exceeds ${MAX_HEADERS_LINE_LENGTH} characters: ${overlong.slice(0, 80)}…`
  );
  process.exit(1);
}

// A static export renders `redirect()` in app/(docs)/[section]/page.tsx as a
// client-side redirect only; these give each section a real HTTP redirect.
const redirectLines = PAGE_MANIFEST.flatMap((section) => {
  const home = sectionHomeRoute(section);
  return home ? [`/${section.slug} ${home} 307`] : [];
});

writeFileSync(path.join(outDir, '_headers'), `${headersLines.join('\n')}\n`);
writeFileSync(path.join(outDir, '_redirects'), `${redirectLines.join('\n')}\n`);
