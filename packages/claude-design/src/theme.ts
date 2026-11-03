// A system's theme: what a set of `init` theme flags writes into the export.
// The build bundles this module into theme.js with the release's build inputs
// (src/theme-entry.ts), writes the default files through it, and nxds-cli
// runs it for `export claude-design --brand-color …`. It imports nothing that
// reads the repo, so it runs anywhere.
import {
  applyNxdsThemeFlags,
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DEFAULT_NXDS_APPEARANCE,
  DEFAULT_NXDS_THEME,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  findBrandColorPreset,
  FONT_OPTIONS,
  type NxdsAppearanceState,
  STROKE_OPTIONS,
} from '@nxds/core';
import { formatHex } from 'culori';

import { fillTemplate } from './template.ts';
import {
  EXPORT_THEME_FLAGS,
  formatThemeFlags,
  orderedThemeFlags,
} from './theme-fields.ts';
import type { ComponentReads } from './token-reads.ts';
import { buildTokens, type TokensFile, typeStyleRules } from './tokens.ts';
import { compileTokensCss } from './tokens-css.ts';

/** A theme, as a system records it: each flag's value, by flag name. */
export type ThemeFlags = Readonly<Record<string, string>>;

/** What the release's build hands the theme module. */
export interface ThemeInput {
  version: string;
  ref: string;
  reads: ComponentReads;
  stylesheetReads: ReadonlySet<string>;
  /** README.md, with `{{…}}` where the theme's text goes. */
  readme: string;
  /** SETUP.md, with this release's values in and `{{…}}` for the theme's. */
  guide: string;
}

/** theme.js: the module a release ships for nxds-cli to theme its export with. */
export interface ThemeModule {
  /** Which shape this module has. nxds-cli refuses one it doesn't know. */
  api: 1;
  /** The theme flags this release takes. */
  flags: readonly string[];
  render(flags: ThemeFlags): RenderedTheme;
}

/** The files a theme rewrites under `project/`, what it sets in design-system.json, and its SETUP.md. */
export interface RenderedTheme {
  project: { 'tokens.json': string; 'tokens.css': string; 'README.md': string };
  index: { title: string; theme: ThemeFlags };
  /** SETUP.md for a system of `files` project files. */
  guide(files: number): string;
}

const DEFAULT_TITLE = 'nxds';

type FamilyKey = 'sans' | 'heading' | 'mono';

/** The font flags, with the `type.families` key each sets. */
const FONT_FLAGS: readonly [string, FamilyKey][] = [
  ['font', 'sans'],
  ['heading-font', 'heading'],
  ['code-font', 'mono'],
];

/**
 * The appearance `flags` set. Throws on a flag the export doesn't take, and,
 * with core's own message, on a value its field doesn't take.
 */
function appearanceOf(flags: ThemeFlags): NxdsAppearanceState {
  for (const flag of Object.keys(flags)) {
    if (!EXPORT_THEME_FLAGS.includes(flag)) {
      throw new Error(`--${flag} isn't a theme flag the export takes.`);
    }
  }
  return applyNxdsThemeFlags(DEFAULT_NXDS_THEME, flags).appearance;
}

type Font = (typeof FONT_OPTIONS)[number];

const curatedFont = (value: string | undefined) =>
  FONT_OPTIONS.find((font) => font.value === value);

/**
 * A curated font's stack with its Google Fonts family first. Fontsource names
 * a variable font `"Inter Variable"`, and Google Fonts serves it as `Inter`.
 */
const googleStack = (font: Font) =>
  font.family.replace(/^"[^"]+"/, `"${font.label}"`);

/** The fonts the flags pick, by the `type.families` key each sets. */
function themeFonts(flags: ThemeFlags) {
  const picked = new Map<FamilyKey, Font>();
  for (const [flag, key] of FONT_FLAGS) {
    const font = curatedFont(flags[flag]);
    if (font) picked.set(key, font);
  }
  // A heading font left at "ui" follows the UI font.
  const ui = picked.get('sans');
  if (ui && !picked.has('heading')) picked.set('heading', ui);
  return picked;
}

const label = (
  options: readonly { value: string; label: string }[],
  value: string
) =>
  (
    options.find((option) => option.value === value)?.label ?? value
  ).toLowerCase();

const hex = (color: string) => formatHex(color) ?? color;

/** The brand colour's name: its preset's label, or its hex. Undefined for the default brand. */
function brandName(color: string) {
  const preset = findBrandColorPreset(color);
  if (preset?.value === 'default') return undefined;
  return preset?.label ?? hex(color);
}

/**
 * The system's title: `nxds`, then its brand and its surface tone when either
 * differs from nxds's, such as `nxds · Rose on stone`.
 */
export function themeTitle(flags: ThemeFlags) {
  const { brandColor, surfaceTone } = appearanceOf(flags);
  const brand = brandName(brandColor);
  const tone = label(BASE_TONE_OPTIONS, surfaceTone);
  if (brand) return `${DEFAULT_TITLE} · ${brand} on ${tone}`;
  if (surfaceTone !== DEFAULT_NXDS_APPEARANCE.surfaceTone) {
    return `${DEFAULT_TITLE} on ${tone}`;
  }
  return DEFAULT_TITLE;
}

/** The appearance as a phrase: "a near-black brand colour on zinc surfaces, …". */
function appearancePhrase(appearance: NxdsAppearanceState) {
  const brand = brandName(appearance.brandColor);
  const contrast =
    appearance.lightContrast === DEFAULT_NXDS_APPEARANCE.lightContrast &&
    appearance.darkContrast === DEFAULT_NXDS_APPEARANCE.darkContrast
      ? ''
      : `, at ${appearance.lightContrast} contrast in Light and ${appearance.darkContrast} in Dark`;
  return [
    `a ${brand ? `${brand} (${hex(appearance.brandColor)})` : 'near-black'} brand colour`,
    ` on ${label(BASE_TONE_OPTIONS, appearance.surfaceTone)} surfaces`,
    `, ${label(DENSITY_OPTIONS, appearance.density)} density`,
    `, ${label(CORNER_OPTIONS, appearance.corners)} corners`,
    `, ${label(ELEVATION_OPTIONS, appearance.elevation)} shadows`,
    ` and ${label(STROKE_OPTIONS, appearance.stroke)} strokes`,
    contrast,
  ].join('');
}

/** README.md's type sentence: the faces text, headings and code are set in. */
function typeFaces(fonts: ReadonlyMap<FamilyKey, Font>) {
  const sans = fonts.get('sans')?.label ?? 'the system UI face';
  const heading = fonts.get('heading');
  const mono = fonts.get('mono')?.label ?? 'the system monospace face';
  const headings =
    heading && heading !== fonts.get('sans')
      ? `, headings in ${heading.label}`
      : '';
  const sentence = `nxds sets text in ${sans}${headings} and code in ${mono}.`;
  const loaded = [...new Set([...fonts.values()].map((font) => font.label))];
  if (loaded.length === 0) return sentence;
  return `${sentence} tokens.css loads ${joinAnd(loaded)} from Google Fonts. Don't add a font link, and don't upload font files.`;
}

function joinAnd(items: readonly string[]) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

/** Each flag, validated, in the order `init` lists them. */
function validFlags(flags: ThemeFlags) {
  appearanceOf(flags);
  return Object.fromEntries(
    orderedThemeFlags(flags).map(({ flag, value }) => [flag, value])
  );
}

/** The `Sales overview` check: the faces the sampler's title and body text are set in. */
function facesCheck(fonts: ReadonlyMap<FamilyKey, Font>) {
  const heading = fonts.get('heading');
  const sans = fonts.get('sans');
  if (!heading) return undefined;
  const faces =
    sans === heading
      ? `The \`Sales overview\` title and body text are set in ${heading.label}.`
      : sans
        ? `The \`Sales overview\` title is set in ${heading.label}, and body text in ${sans.label}.`
        : `The \`Sales overview\` title is set in ${heading.label}.`;
  return `- ${faces} The console shows no failed request to fonts.googleapis.com.`;
}

/** The light and dark primary fill, as hex, for the sampler check. */
function primaryFill(tokens: TokensFile) {
  const value = tokens.color.tokens.find(
    (token) => token.name === 'nx-color-primary-background'
  )?.value;
  if (value === undefined) {
    throw new Error('tokens.json: no nx-color-primary-background.');
  }
  if (typeof value === 'string') return { light: hex(value), dark: hex(value) };
  return { light: hex(value.light ?? ''), dark: hex(value.dark ?? '') };
}

/** The sampler checks a theme adds to SETUP.md's step 5, one bullet a line. */
function themeChecks(
  theme: ThemeFlags,
  tokens: TokensFile,
  fonts: ReadonlyMap<FamilyKey, Font>
) {
  const checks: string[] = [];
  if (theme['brand-color'] !== undefined) {
    const fill = primaryFill(tokens);
    const dark =
      fill.dark === fill.light
        ? ' It stays the same with `mode` set to `dark`.'
        : ` With \`mode\` set to \`dark\`, close to \`${fill.dark}\`.`;
    checks.push(
      `- The \`New deal\` button and the \`A\` workspace mark are filled with the brand colour, close to \`${fill.light}\`.${dark}`
    );
  }
  const faces = facesCheck(fonts);
  if (faces) checks.push(faces);
  return checks.map((check) => `${check}\n`).join('');
}

/**
 * The system `flags` theme: its token files, README, index fields and setup
 * guide. Throws on a flag the export doesn't take or a value it doesn't take.
 */
export function renderTheme(
  input: ThemeInput,
  flags: ThemeFlags
): RenderedTheme {
  const theme = validFlags(flags);
  const themed = Object.keys(theme).length > 0;
  const appearance = appearanceOf(theme);
  const fonts = themeFonts(theme);
  const tokens = buildTokens(input, {
    appearance,
    flags: theme,
    families: Object.fromEntries(
      [...fonts].map(([key, font]) => [key, googleStack(font)])
    ),
    fonts: [...new Set([...fonts.values()].map((font) => font.label))],
  });
  const phrase = appearancePhrase(appearance);
  const title = themeTitle(theme);
  return {
    project: {
      'tokens.json': `${JSON.stringify(tokens, null, 2)}\n`,
      'tokens.css': compileTokensCss(tokens, typeStyleRules()),
      'README.md': fillTemplate('README.md', input.readme, {
        appearance: `This system shows ${themed ? 'its own appearance' : 'the default nxds appearance'}: ${phrase}.`,
        typeFaces: typeFaces(fonts),
        bodySize: `${appearance.prefs.uiFontSize}px`,
        codeSize: `${appearance.prefs.codeFontSize}px`,
      }),
    },
    index: { title, theme },
    guide: (files) =>
      fillTemplate('SETUP.md', input.guide, {
        files: String(files),
        title,
        description: themed
          ? `nxds ${input.version} with ${phrase}.`
          : `nxds ${input.version}: calm, dense product UI, with live components and tokens in Light and Dark.`,
        themeJson: `\`${JSON.stringify(theme)}\``,
        themeIntro: themed
          ? `This system carries the theme \`${formatThemeFlags(orderedThemeFlags(theme))}\`. Its title is \`${title}\`.\n\n`
          : '',
        themeChecks: themeChecks(theme, tokens, fonts),
      }),
  };
}
