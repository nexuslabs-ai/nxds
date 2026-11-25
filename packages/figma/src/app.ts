// An nxds app as the capture page draws it: the app's own components,
// bundled with its own packages, inside its own appearance provider, styled by
// its own CSS entry compiled with its own Tailwind. Whatever the team edited
// is what Figma gets.
import { build } from 'esbuild';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { ExportError } from './errors.ts';

/** An app's nxds setup, as nxds.json and the CLI's setup describe it. */
export interface AppSetup {
  root: string;
  /** The nxds folder, relative to `root`. */
  dir: string;
  /** The nxds CSS entry, relative to `root`. */
  css: string;
  iconLibrary: string;
  /** The entry imports nxds-colors.css, so the provider derives no colours. */
  ownColors: boolean;
}

/** The capture page's files for an app. */
export interface AppPage {
  /** The compiled CSS entry, and the path it's served at, so its relative URLs reach the app's files. */
  css: { path: string; css: string };
  script: { path: string; js: string };
  /** Icon names the recipes use that the app's icon library has no icon for. */
  missingIcons: string[];
}

/**
 * nxds's internal icons, by the name a recipe gives `Nxds.Icon`, from the
 * Phosphor adapter in packages/react/src/lib/icons.ts. An app on another
 * library draws these through its own adapter.
 */
export const INTERNAL_ICONS: Readonly<Record<string, string>> = {
  'circle-notch': 'IconLoader2',
  'arrow-down': 'IconArrowDown',
  'arrow-left': 'IconArrowLeft',
  'arrow-right': 'IconArrowRight',
  'arrow-up': 'IconArrowUp',
  'caret-down': 'IconChevronDown',
  'caret-left': 'IconChevronLeft',
  'caret-right': 'IconChevronRight',
  'caret-up': 'IconChevronUp',
  'dots-three': 'IconDots',
  'sidebar-simple': 'IconLayoutSidebar',
  'caret-up-down': 'IconSelector',
  check: 'IconCheck',
  copy: 'IconCopy',
  minus: 'IconMinus',
  'pencil-simple': 'IconPencil',
  plus: 'IconPlus',
  x: 'IconX',
  'calendar-blank': 'IconCalendar',
  hash: 'IconHash',
  'text-aa': 'IconLetterCase',
  'list-bullets': 'IconList',
  'magnifying-glass': 'IconSearch',
  'warning-circle': 'IconAlertCircle',
  warning: 'IconAlertTriangle',
  'check-circle': 'IconCircleCheck',
  info: 'IconInfoCircle',
  'dots-six-vertical': 'IconGripVertical',
  palette: 'IconPalette',
};

/** The URL path the page serves a file at, so a relative URL in it resolves to another file's path. */
export const servedPath = (file: string) =>
  `/fs${file.split(path.sep).join('/')}`;

const pascal = (name: string) =>
  name.replace(/(^|-)([a-z0-9])/g, (_, __, char: string) => char.toUpperCase());

/** Every component source in the app's nxds components folder, leaving out stories, tests and the appearance settings UI. */
export function componentFiles(folder: string) {
  const files: string[] = [];
  const visit = (at: string) => {
    for (const entry of readdirSync(at, { withFileTypes: true })) {
      const file = path.join(at, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'appearance') visit(file);
        continue;
      }
      if (
        /\.tsx$/.test(entry.name) &&
        !/\.(stories|test)\.tsx$/.test(entry.name)
      )
        files.push(file);
    }
  };
  visit(folder);
  return files.sort();
}

/**
 * A recipe's Nxds.Toast, where nothing calls `toast()`: one toast, shown in
 * place in the app's own Toaster.
 */
const TOAST = [
  "const IN_PLACE = { position: 'relative', inset: 'auto', transform: 'none' };",
  "export function Toast({ variant = 'default', title, description, action, cancel, closeButton = false, richColors = false, icon, className }) {",
  '  React.useEffect(() => {',
  "    const show = variant === 'default' ? AppToast.toast : AppToast.toast[variant];",
  '    const id = show(title, {',
  '      duration: Infinity,',
  '      style: IN_PLACE,',
  '      description,',
  '      closeButton,',
  '      icon: icon ? React.createElement(Icon, { name: icon }) : undefined,',
  '      action: action ? { label: action, onClick() {} } : undefined,',
  '      cancel: cancel ? { label: cancel, onClick() {} } : undefined,',
  '    });',
  '    return () => { AppToast.toast.dismiss(id); };',
  '  }, [variant, title, description, action, cancel, closeButton, icon]);',
  "  return React.createElement('div', { 'data-slot': 'toast', className }, React.createElement(AppToast.Toaster, { richColors, style: IN_PLACE }));",
  '}',
];

/**
 * The bundle's entry: every component, the app's provider and default
 * appearance, `Icon`, which draws a recipe's icon by name, and `Toast` when
 * the app has Sonner. A Phosphor app draws any Phosphor name; another library
 * draws the names nxds's own icons cover, through the app's adapter.
 */
function entrySource(app: AppSetup, recipeIcons: readonly string[]) {
  const folder = path.join(app.root, app.dir);
  const state = path.join(
    app.root,
    path.dirname(app.css),
    'appearance-state.ts'
  );
  const sonner = path.join(folder, 'components/sonner/sonner.tsx');
  const phosphor = app.iconLibrary === 'phosphor';
  const drawn = phosphor
    ? recipeIcons
    : recipeIcons.filter((name) => INTERNAL_ICONS[name]);
  const lines = [
    "import * as React from 'react';",
    "import * as ReactDOM from 'react-dom';",
    "import * as ReactDOMClient from 'react-dom/client';",
    `import { NxdsAppearanceProvider } from ${JSON.stringify(path.join(folder, 'components/appearance/provider'))};`,
    existsSync(state)
      ? `import { defaultAppearance } from ${JSON.stringify(state)};`
      : 'const defaultAppearance = undefined;',
    `import * as AppIcons from ${JSON.stringify(path.join(folder, 'lib/icons'))};`,
    ...(existsSync(sonner)
      ? [`import * as AppToast from ${JSON.stringify(sonner)};`]
      : []),
    ...(phosphor && drawn.length > 0
      ? [
          `import { ${drawn.map((name) => `${pascal(name)}Icon as Phosphor_${pascal(name)}`).join(', ')} } from '@phosphor-icons/react';`,
        ]
      : []),
    ...componentFiles(path.join(folder, 'components')).map(
      (file) => `export * from ${JSON.stringify(file)};`
    ),
    `const internal = ${JSON.stringify(INTERNAL_ICONS)};`,
    `const named = { ${phosphor ? drawn.map((name) => `${JSON.stringify(name)}: Phosphor_${pascal(name)}`).join(', ') : ''} };`,
    // The icon set: nxds's own icons by their names, in the app's library.
    'const set = Object.fromEntries(Object.entries(internal).filter(([, icon]) => AppIcons[icon]).map(([name, icon]) => [name, AppIcons[icon]]));',
    'export function Icon({ name, size = 16, ...rest }) {',
    '  const component = named[name] ?? set[name];',
    '  return component ? React.createElement(component, { size, ...rest }) : null;',
    '}',
    ...(existsSync(sonner) ? TOAST : []),
    'export const __figma = {',
    '  Provider: NxdsAppearanceProvider,',
    '  defaultState: defaultAppearance,',
    `  deriveColors: ${!app.ownColors},`,
    '  icons: [...new Set([...Object.keys(set), ...Object.keys(named)])],',
    '};',
    'window.React = React;',
    'window.ReactDOM = { ...ReactDOM, ...ReactDOMClient };',
  ];
  return {
    source: lines.join('\n'),
    missing: recipeIcons.filter((name) => !drawn.includes(name)),
  };
}

/** Bundles the app's components and their packages into one script for the capture page. */
async function bundle(app: AppSetup, source: string) {
  try {
    const result = await build({
      stdin: {
        contents: source,
        resolveDir: app.root,
        sourcefile: 'nxds-figma-entry.tsx',
        loader: 'tsx',
      },
      absWorkingDir: app.root,
      bundle: true,
      format: 'iife',
      globalName: 'Nxds',
      platform: 'browser',
      jsx: 'automatic',
      define: { 'process.env.NODE_ENV': '"production"' },
      loader: { '.css': 'empty' },
      logLevel: 'silent',
      write: false,
    });
    return result.outputFiles[0]?.text ?? '';
  } catch (error) {
    throw new ExportError(
      `The app's nxds components didn't bundle: ${(error as Error).message}`
    );
  }
}

/** The parts of `@tailwindcss/node` and `@tailwindcss/oxide` the export calls. */
interface TailwindNode {
  compile(
    css: string,
    options: {
      base: string;
      from?: string;
      onDependency(path: string): void;
      shouldRewriteUrls?: boolean;
    }
  ): Promise<{ build(candidates: string[]): string }>;
}
interface TailwindOxide {
  Scanner: new (options: {
    sources: { base: string; pattern: string; negated: boolean }[];
  }) => {
    scan(): string[];
    scanFiles(input: { content: string; extension: string }[]): string[];
  };
}

/** The first Tailwind release whose `@tailwindcss/node` and `@tailwindcss/oxide` API the export calls, within its major version. */
const TAILWIND_FROM = { major: 4, minor: 3 };

/** Where the first of `requires` that has `id` resolves it. */
function resolveFrom(requires: readonly NodeJS.Require[], id: string) {
  for (const require of requires) {
    try {
      return require.resolve(id);
    } catch {
      // Try the next place the app could have it.
    }
  }
  return undefined;
}

/** `id`'s version, from the package.json above its resolved entry. */
function versionOf(entry: string, id: string) {
  for (
    let dir = path.dirname(entry);
    dir !== path.dirname(dir);
    dir = path.dirname(dir)
  ) {
    const file = path.join(dir, 'package.json');
    if (!existsSync(file)) continue;
    const pkg = JSON.parse(readFileSync(file, 'utf8')) as {
      name?: string;
      version?: string;
    };
    if (pkg.name === id) return pkg.version;
  }
  return undefined;
}

/**
 * The app's own Tailwind: `@tailwindcss/node` and `@tailwindcss/oxide`, as the
 * app installed them, directly or through its Vite or PostCSS plugin.
 */
async function appTailwind(root: string) {
  const app = createRequire(path.join(root, 'package.json'));
  const from = [
    app,
    ...[
      '@tailwindcss/vite',
      '@tailwindcss/postcss',
      '@tailwindcss/cli',
    ].flatMap((plugin) => {
      try {
        return [createRequire(app.resolve(plugin))];
      } catch {
        return [];
      }
    }),
  ];
  const load = async <T>(id: string): Promise<T> => {
    const entry = resolveFrom(from, id);
    if (!entry) {
      throw new ExportError(
        `The app has no ${id}. Install Tailwind CSS v4 as nxds's setup does, then run the command again.`
      );
    }
    const version = versionOf(entry, id);
    const [major, minor = 0] = (version ?? '').split('.').map(Number);
    if (major !== TAILWIND_FROM.major || minor < TAILWIND_FROM.minor) {
      throw new ExportError(
        `The app has ${id} ${version ?? 'of an unknown version'}. The export works with Tailwind CSS ${TAILWIND_FROM.major}.${TAILWIND_FROM.minor} and later ${TAILWIND_FROM.major}.x releases. Update Tailwind, then run the command again.`
      );
    }
    return (await import(pathToFileURL(entry).href)) as T;
  };
  const node = await load<TailwindNode>('@tailwindcss/node');
  const oxide = await load<TailwindOxide>('@tailwindcss/oxide');
  return { compile: node.compile, Scanner: oxide.Scanner };
}

/**
 * The app's CSS entry, compiled with every class its nxds folder and the
 * recipes use, and every `typography-*` utility its CSS defines, so each
 * becomes a text style whether a component uses it or not.
 */
async function compileCss(app: AppSetup, recipes: string) {
  const { compile, Scanner } = await appTailwind(app.root);
  const entry = path.join(app.root, app.css);
  const files = [entry];
  let compiler: Awaited<ReturnType<typeof compile>>;
  try {
    compiler = await compile(readFileSync(entry, 'utf8'), {
      base: path.dirname(entry),
      from: entry,
      onDependency(file) {
        files.push(file);
      },
      shouldRewriteUrls: true,
    });
  } catch (error) {
    throw new ExportError(
      `The app's CSS entry ${app.css} didn't compile: ${(error as Error).message}`
    );
  }
  const typography = files.flatMap((file) =>
    existsSync(file)
      ? [
          ...readFileSync(file, 'utf8').matchAll(
            /@utility\s+(typography-[\w-]+)/g
          ),
        ].map((match) => `nx:${match[1]}`)
      : []
  );
  const scanner = new Scanner({
    sources: [
      { base: path.join(app.root, app.dir), pattern: '**/*', negated: false },
    ],
  });
  const candidates = [
    ...scanner.scan(),
    ...scanner.scanFiles([{ content: recipes, extension: 'html' }]),
    ...typography,
  ];
  return { path: servedPath(entry), css: compiler.build(candidates) };
}

/**
 * The capture page's CSS and script for `app`. `recipes` is every recipe's
 * markup as text, so its classes are compiled too, and `recipeIcons` the icon
 * names the recipes use.
 */
export async function buildAppPage(
  app: AppSetup,
  recipes: string,
  recipeIcons: readonly string[]
): Promise<AppPage> {
  const { source, missing } = entrySource(app, recipeIcons);
  return {
    css: await compileCss(app, recipes),
    script: { path: '/app.js', js: await bundle(app, source) },
    missingIcons: missing,
  };
}
