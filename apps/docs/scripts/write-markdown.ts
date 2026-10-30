import type { Element, ElementContent, Nodes, Root } from 'hast';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import type { VFile } from 'vfile';

import { frameworkLabel, isFramework } from '../app/_lib/frameworks.ts';
import { PAGE_MANIFEST } from '../app/_lib/manifest.ts';
import { SITE_URL } from '../app/_lib/site.ts';
import { DOCS_ARTICLE_ID } from '../app/_lib/table-of-contents.ts';

import { docsRoot } from './docs-root.mjs';

declare module 'vfile' {
  interface DataMap {
    /** The page's route, passed in so same-page `#id` links can be resolved. */
    route: string;
    /** The page's internal links as root-relative paths, collected by `articleOnly`. */
    links: string[];
  }
}

/** Elements that only make sense on screen: copy buttons and breadcrumbs. */
const DROPPED_TAGS = new Set(['nav', 'button', 'script', 'style', 'svg']);
/** `data-md-skip` marks a live preview the Markdown leaves out. */
const SKIP_ATTRIBUTE = 'dataMdSkip';

const outDir = path.join(docsRoot, 'out');

const CLAUDE_DESIGN_ROUTE = '/getting-started/claude-design';
const CLAUDE_DESIGN_COMMAND = 'npx nxds-cli@latest export claude-design';
const CLAUDE_DESIGN_MAX_WORDS = 200;

if (!existsSync(outDir)) {
  console.error('Missing out/. Run `next build` first.');
  process.exit(1);
}

/** The first element in `node`'s subtree that passes `test`. */
function findElement(
  node: Nodes,
  test: (element: Element) => boolean
): Element | undefined {
  if (node.type === 'element' && test(node)) return node;
  if (!('children' in node)) return undefined;
  for (const child of node.children) {
    const found = findElement(child, test);
    if (found) return found;
  }
  return undefined;
}

function findById(node: Nodes, id: string) {
  return findElement(node, (candidate) => candidate.properties.id === id);
}

/**
 * Drops on-screen-only elements, `data-md-skip` previews and decorative
 * `aria-hidden` elements.
 */
function prune(node: Element) {
  node.children = node.children.filter(
    (child) =>
      child.type === 'text' ||
      (child.type === 'element' &&
        !DROPPED_TAGS.has(child.tagName) &&
        child.properties[SKIP_ATTRIBUTE] === undefined &&
        child.properties.ariaHidden !== 'true')
  );
  for (const child of node.children) {
    if (child.type !== 'element') continue;
    // Every framework's panel is in the HTML; name each one in the Markdown.
    const framework = child.properties.dataFrameworkPanel;
    if (isFramework(framework)) {
      child.children.unshift({
        type: 'element',
        tagName: 'h2',
        properties: {},
        children: [{ type: 'text', value: frameworkLabel(framework) }],
      });
    }
    prune(child);
  }
}

/** Each docs page, and each section's redirect, mapped to its Markdown. */
const markdownRoutes = new Map(
  PAGE_MANIFEST.flatMap((section) => [
    ...section.pages.map((page) => [page.route, `${page.route}.md`] as const),
    ...section.pages
      .slice(0, 1)
      .map((page) => [`/${section.slug}`, `${page.route}.md`] as const),
  ])
);

/**
 * Points internal links at nxds.dev, and docs pages and sections at their
 * Markdown, so the links still work once the Markdown is pasted elsewhere.
 * Returns each link's root-relative form for the broken-link check.
 */
function absoluteLinks(node: ElementContent, route: string): string[] {
  if (node.type !== 'element') return [];
  const links = node.children.flatMap((child) => absoluteLinks(child, route));
  const raw = String(node.properties.href);
  if (node.tagName !== 'a' || !(raw.startsWith('/') || raw.startsWith('#'))) {
    return links;
  }
  const href = raw.startsWith('#') ? `${route}${raw}` : raw;
  const [location = '', id] = href.split('#');
  const target = markdownRoutes.get(location.replace(/\/$/, '')) ?? location;
  node.properties.href = `${SITE_URL}${target}${id ? `#${id}` : ''}`;
  return [href, ...links];
}

/** Keeps only the page's article, minus anything that only works on screen. */
function articleOnly() {
  return (tree: Root, file: VFile) => {
    const article = findById(tree, DOCS_ARTICLE_ID);
    if (!article) {
      throw new Error(
        `No #${DOCS_ARTICLE_ID} in ${path.relative(docsRoot, file.path)}.`
      );
    }
    const route = file.data.route;
    if (!route) throw new Error(`No route passed for ${file.path}.`);
    prune(article);
    file.data.links = absoluteLinks(article, route);
    tree.children = [article];
  };
}

const processor = unified()
  .use(rehypeParse)
  .use(articleOnly)
  .use(rehypeRemark)
  .use(remarkGfm)
  .use(remarkStringify, { bullet: '-', fences: true, rule: '-' });

const parseHtml = unified().use(rehypeParse);

const builtRoutes = new Map<string, { tree?: Root } | undefined>();

/**
 * The built file a route serves, with its parsed tree when it is HTML, or
 * undefined when the build has no such route.
 */
function builtRoute(route: string) {
  if (!builtRoutes.has(route)) {
    const file = [
      path.join(outDir, route),
      path.join(outDir, `${route}.html`),
      path.join(outDir, route, 'index.html'),
    ].find(
      (candidate) => existsSync(candidate) && statSync(candidate).isFile()
    );
    builtRoutes.set(
      route,
      file === undefined
        ? undefined
        : {
            tree: file.endsWith('.html')
              ? parseHtml.parse(readFileSync(file, 'utf8'))
              : undefined,
          }
    );
  }
  return builtRoutes.get(route);
}

/** Why `href` is broken, or undefined when its route and `#id` both exist. */
function brokenReason(href: string) {
  const [location = '', id] = href.split('#');
  const [route = ''] = location.split('?');
  const built = builtRoute(route.replace(/\/$/, '') || '/index');
  if (built === undefined) return 'no such route';
  if (id && !(built.tree && findById(built.tree, id))) {
    return `no #${id} on ${route}`;
  }
  return undefined;
}

/** Each page's internal links, checked once every output is written. */
const linksByRoute = new Map<string, string[]>();
const llmsSections: string[] = [];
/** Every page's Markdown, in nav order, for `llms-full.txt`. */
const fullPages: string[] = [];
const markdownByRoute = new Map<string, string>();

for (const section of PAGE_MANIFEST) {
  const lines: string[] = [];
  for (const page of section.pages) {
    const htmlFile = path.join(outDir, `${page.route}.html`);
    if (!existsSync(htmlFile)) {
      throw new Error(`Missing ${path.relative(docsRoot, htmlFile)}.`);
    }
    const processed = await processor.process({
      path: htmlFile,
      value: readFileSync(htmlFile, 'utf8'),
      data: { route: page.route },
    });
    const markdown = String(processed);
    const links = processed.data.links;
    if (!links) {
      throw new Error(`No links collected for ${page.route}.`);
    }
    linksByRoute.set(page.route, links);
    writeFileSync(path.join(outDir, `${page.route}.md`), markdown);
    markdownByRoute.set(page.route, markdown);
    fullPages.push(`<!-- ${page.route} -->\n\n${markdown}`);

    const tree = builtRoute(page.route)?.tree;
    const descriptionMeta =
      tree &&
      findElement(
        tree,
        (element) =>
          element.tagName === 'meta' &&
          element.properties.name === 'description'
      );
    if (!descriptionMeta) {
      throw new Error(
        `Missing <meta name="description"> in ${page.route}.html.`
      );
    }
    const description = descriptionMeta.properties.content;
    lines.push(
      `- [${page.label}](${SITE_URL}${page.route}.md): ${description}`
    );
  }
  if (lines.length > 0) {
    llmsSections.push(`## ${section.title}\n\n${lines.join('\n')}`);
  }
}

const LLMS_BLURB =
  '> nxds is a framework-agnostic theme engine (`@nxds/core`) with components you copy into your app and own. Every class uses the `nx:` Tailwind prefix.';

const llms = `# nxds

${LLMS_BLURB}

Install nxds with the \`nxds\` CLI: run \`npx nxds-cli@latest init\`, then \`npx nxds-cli@latest add <item>\`. Every command takes \`--json\` and \`--dry-run\`.

To set nxds up on a Claude Design canvas, follow [${CLAUDE_DESIGN_ROUTE}.md](${SITE_URL}${CLAUDE_DESIGN_ROUTE}.md).

Each link below is the Markdown version of a docs page. Add \`.md\` to the URL of any page listed here to get its Markdown. [/llms-full.txt](${SITE_URL}/llms-full.txt) has every page in one file. If anything here conflicts with what you know about nxds, trust these docs.

${llmsSections.join('\n\n')}
`;

writeFileSync(path.join(outDir, 'llms.txt'), llms);
writeFileSync(
  path.join(outDir, 'llms-full.txt'),
  `# nxds\n\n${LLMS_BLURB}\n\n${fullPages.join('\n\n')}`
);

function claudeDesignProblems(markdown: string | undefined) {
  if (markdown === undefined) return ['page not built'];
  const problems: string[] = [];
  const fence = /^\s*```bash\n\s*(.+)\n\s*```$/m.exec(markdown);
  if (fence?.[1] !== CLAUDE_DESIGN_COMMAND) {
    problems.push(`no \`${CLAUDE_DESIGN_COMMAND}\` code block`);
  }
  if (!markdown.includes('nxds-design-system/SETUP.md')) {
    problems.push('no nxds-design-system/SETUP.md step');
  }
  if (markdown.includes('Fetch https://nxds.dev')) {
    problems.push('the prompts left their data-md-skip wrapper');
  }
  const words = markdown.split(/\s+/).filter(Boolean).length;
  if (words > CLAUDE_DESIGN_MAX_WORDS) {
    problems.push(`${words} words, over ${CLAUDE_DESIGN_MAX_WORDS}`);
  }
  return problems;
}

const setupProblems = claudeDesignProblems(
  markdownByRoute.get(CLAUDE_DESIGN_ROUTE)
);
if (setupProblems.length > 0) {
  console.error(
    `${CLAUDE_DESIGN_ROUTE}.md:\n${setupProblems.map((problem) => `  ${problem}`).join('\n')}`
  );
  process.exit(1);
}

const brokenLinks = [...linksByRoute].flatMap(([route, hrefs]) =>
  hrefs.flatMap((href) => {
    const reason = brokenReason(href);
    return reason ? [`${route} → ${href}: ${reason}`] : [];
  })
);

if (brokenLinks.length > 0) {
  console.error(`Broken docs links:\n${brokenLinks.join('\n')}`);
  process.exit(1);
}
