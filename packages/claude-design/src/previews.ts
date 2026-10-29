// components/<Name>/preview.html and README.md for each component folder,
// from its stories: the first `docs` story renders the card, and the stories
// meta description opens the README.
import {
  componentDescription,
  componentStoryFiles,
  docsStoryModule,
  readDocsStories,
} from '@nxds/source-model/docs-stories.ts';
import { react18Src, reactStaticRoot } from '@nxds/source-model/roots.mjs';
import { build, type Plugin } from 'esbuild';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { type CanvasExample, canvasExample } from './canvas-markup.ts';
import { ROOT_PARTS } from './groups.ts';
import type { FlatComponent, FlatProp } from './props.ts';
import { NAMESPACE } from './system-index.ts';

const DEFAULT_HEIGHT = 120;

/** Cards whose first docs story needs more room than the default row. */
const HEIGHTS: Record<string, number> = {
  Carousel: 320,
  Chart: 320,
  DatePicker: 360,
  FilterBuilder: 240,
  MessageScroller: 360,
  Resizable: 240,
  Sidebar: 420,
  Table: 280,
};

/** Modules a docs story imports, read from the bundle on the page. */
const BUNDLE_MODULES: Record<string, string> = {
  react: 'module.exports = window.React;',
  'react-dom': 'module.exports = window.ReactDOM;',
  'react-dom/client':
    'module.exports = { createRoot: window.ReactDOM.createRoot };',
  '@tabler/icons-react': `module.exports = window.${NAMESPACE}.Icons;`,
  recharts: `module.exports = window.${NAMESPACE}.Recharts;`,
};

const JSX_RUNTIME = path.join(import.meta.dirname, 'runtime', 'jsx-runtime.ts');
const STORY_MODULE = 'nxds:story';

const MEDIA_TYPES: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

// A preview fetches nothing, so each static file a story names is inlined.
function inlineStaticFiles(source: string) {
  return source.replace(
    /(["'])(\/[\w./-]+\.(?:svg|png|jpg|webp))\1/g,
    (literal, quote, file) => {
      const absolute = path.join(reactStaticRoot, file);
      if (!existsSync(absolute)) return literal;
      const type = MEDIA_TYPES[path.extname(file)];
      return `${quote}data:${type};base64,${readFileSync(absolute).toString('base64')}${quote}`;
    }
  );
}

// `@/components/*` is the bundle; `@/lib/*` and `@/hooks/*` helpers compile
// into the preview from the React 18 sources.
function storyImports(source: string): Plugin {
  return {
    name: 'nxds-story-imports',
    setup(builder) {
      builder.onResolve({ filter: /^nxds:story$/ }, () => ({
        path: STORY_MODULE,
        namespace: 'nxds',
      }));
      builder.onLoad({ filter: /.*/, namespace: 'nxds' }, () => ({
        contents: inlineStaticFiles(source),
        loader: 'tsx',
        resolveDir: react18Src,
      }));
      builder.onResolve({ filter: /^react\/jsx(-dev)?-runtime$/ }, () => ({
        path: JSX_RUNTIME,
      }));
      builder.onResolve({ filter: /^@\/components\// }, () => ({
        path: 'bundle',
        namespace: 'page-global',
      }));
      builder.onResolve({ filter: /^@\// }, (args) =>
        builder.resolve(`./${args.path.slice(2)}`, {
          kind: args.kind,
          resolveDir: react18Src,
        })
      );
      builder.onResolve(
        { filter: /^(react(-dom(\/client)?)?|@tabler\/icons-react|recharts)$/ },
        (args) => ({ path: args.path, namespace: 'page-global' })
      );
      builder.onLoad({ filter: /.*/, namespace: 'page-global' }, (args) => ({
        contents:
          BUNDLE_MODULES[args.path] ?? `module.exports = window.${NAMESPACE};`,
        loader: 'js',
      }));
    },
  };
}

async function compileStory(source: string) {
  const result = await build({
    stdin: {
      contents: [
        `import Story from '${STORY_MODULE}';`,
        "import { createElement } from 'react';",
        "import { createRoot } from 'react-dom/client';",
        "createRoot(document.getElementById('root')).render(createElement(Story));",
      ].join('\n'),
      loader: 'tsx',
      resolveDir: react18Src,
      sourcefile: 'preview.tsx',
    },
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    jsx: 'automatic',
    charset: 'utf8',
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: { '.css': 'empty' },
    plugins: [storyImports(source)],
    logOverride: { 'module-level-directive': 'silent' },
  });
  const [output] = result.outputFiles;
  if (!output) throw new Error('preview: esbuild wrote no output.');
  return output.text.trim();
}

export function previewHtml({
  name,
  group,
  script,
}: {
  name: string;
  group: string;
  script: string;
}) {
  const height = HEIGHTS[name] ?? DEFAULT_HEIGHT;
  return [
    `<!-- @dsCard group="${group}" height=${height} -->`,
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    `<title>${name}</title>`,
    '<style>',
    '  body { margin: 0; background: var(--nx-color-background); color: var(--nx-color-foreground); font-family: var(--font-sans); }',
    '  #root { padding: var(--nx-spacing-6); }',
    '</style>',
    '</head>',
    '<body>',
    '<div id="root"></div>',
    `<script>${script}</script>`,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

export interface ComponentFolder {
  slug: string;
  name: string;
  group: string;
}

/** The card's preview, which renders the folder's first docs story. */
export async function buildPreview(folder: ComponentFolder) {
  const [story] = readDocsStories(
    folder.slug,
    componentStoryFiles(folder.slug)
  );
  if (!story) {
    throw new Error(`preview: ${folder.slug} has no story tagged \`docs\`.`);
  }
  const { source } = await docsStoryModule(story, {});
  return previewHtml({ ...folder, script: await compileStory(source) });
}

/** The folder's first docs story that canvas markup can write, or null. */
export async function folderCanvasExample(
  slug: string,
  exported: ReadonlySet<string>
): Promise<CanvasExample | null> {
  for (const story of readDocsStories(slug, componentStoryFiles(slug))) {
    const { source } = await docsStoryModule(story, {});
    const example = canvasExample(inlineStaticFiles(source), exported);
    if (example) return example;
  }
  return null;
}

function firstSentence(text: string) {
  return /^[\s\S]*?[.!?](?=\s|$)/.exec(text.trim())?.[0] ?? text.trim();
}

function controlCell(prop: FlatProp) {
  if (prop.control) return prop.control;
  return prop.attribute?.kind === 'none'
    ? `none: ${prop.attribute.reason}`
    : 'none';
}

function propRow(prop: FlatProp) {
  const control = controlCell(prop);
  const fallback = prop.defaultValue ?? '';
  // Every icon name would fill the cell; components/Icon/README.md lists them.
  const type =
    prop.attribute?.kind === 'icon'
      ? 'icon name'
      : `\`${prop.type.replace(/\|/g, '\\|')}\``;
  return `| \`${prop.name}\` | ${type} | ${fallback && `\`${fallback}\``} | ${control} |`;
}

/** The README's props tables, one per part. */
export function propsSection(parts: readonly FlatComponent[]) {
  const lines = ['## Props', ''];
  for (const part of parts) {
    if (part.props.length === 0) continue;
    lines.push(
      `### ${part.name}`,
      '',
      '| Prop | Type | Default | Control |',
      '| --- | --- | --- | --- |',
      ...part.props.map(propRow),
      ''
    );
  }
  return lines;
}

// Used when no docs story's markup can be written as attributes.
function rootExample(part: FlatComponent) {
  return `<x-import component-from-global-scope="${NAMESPACE}.${part.name}"></x-import>`;
}

export function componentReadme({
  folder,
  parts,
  example,
}: {
  folder: ComponentFolder;
  parts: readonly FlatComponent[];
  example: CanvasExample | null;
}) {
  const description = componentDescription(
    folder.slug,
    componentStoryFiles(folder.slug)
  ).trim();
  const rootName = ROOT_PARTS[folder.name] ?? folder.name;
  const main = parts.find((part) => part.name === rootName);
  if (!main) {
    throw new Error(
      `README: ${folder.name} exports no part named ${rootName}; add its root part to ROOT_PARTS in src/groups.ts.`
    );
  }
  const lines = [
    `# ${folder.name}`,
    '',
    description,
    '',
    '## On the canvas',
    '',
    '```html',
    example?.markup ?? rootExample(main),
    '```',
    '',
    'Attributes set props, kebab-case to camelCase. Element content becomes `children`. Each prop below lists the attribute it takes. A comma list, JSON or an ISO date is noted in its type.',
    '',
  ];

  if (parts.length > 1) {
    lines.push('## Parts', '');
    for (const part of parts) {
      const summary = part.description
        ? ` — ${firstSentence(part.description)}`
        : '';
      lines.push(`- \`${NAMESPACE}.${part.name}\`${summary}`);
    }
    lines.push('');
  }

  lines.push(...propsSection(parts));
  return lines.join('\n');
}
