// Storybook wiring for nxds. A preview spreads `nxdsPreview(appearance)` into
// its own decorators, parameters, globalTypes and initialGlobals.
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  BASE_TONE_OPTIONS,
  BRAND_COLOR_PRESETS,
  CORNER_OPTIONS,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  type NxdsAppearanceMode,
  type NxdsAppearanceState,
  sanitizeNxdsAppearance,
  STROKE_OPTIONS,
  TEXT_SIZE_OPTIONS,
  UI_SCALE_OPTIONS,
} from '@nxds/core';
import type { Decorator, Preview } from '@storybook/react-vite';
import { useGlobals } from 'storybook/preview-api';

import { NxdsAppearanceProvider } from './components/appearance/provider';
import { cn } from './lib/utils';

type AppearanceGlobalKey =
  | 'mode'
  | 'brandColor'
  | 'surfaceTone'
  | 'lightContrast'
  | 'darkContrast'
  | 'uiScale'
  | 'textSize'
  | 'density'
  | 'corners'
  | 'elevation'
  | 'stroke'
  | 'uiFont'
  | 'headingFont'
  | 'codeFont'
  | 'codeFontSize'
  | 'reduceMotion'
  | 'pointerCursors'
  | 'fontSmoothing';

const APPEARANCE_GLOBAL_KEYS: AppearanceGlobalKey[] = [
  'mode',
  'brandColor',
  'surfaceTone',
  'lightContrast',
  'darkContrast',
  'uiScale',
  'textSize',
  'density',
  'corners',
  'elevation',
  'stroke',
  'uiFont',
  'headingFont',
  'codeFont',
  'codeFontSize',
  'reduceMotion',
  'pointerCursors',
  'fontSmoothing',
];

const MODE_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'circlehollow' },
] as const satisfies readonly {
  value: NxdsAppearanceMode;
  label: string;
  icon: string;
}[];

const CANVAS_BACKGROUND = 'nx:bg-background';

function pickOption<const T extends readonly { value: string }[]>(
  value: unknown,
  options: T,
  fallback: T[number]['value']
): T[number]['value'] {
  return typeof value === 'string' &&
    options.some((option) => option.value === value)
    ? value
    : fallback;
}

function appearanceStateFromGlobals(
  globals: Record<string, unknown>,
  defaults: NxdsAppearanceState
): NxdsAppearanceState {
  const prefs = defaults.prefs;

  return sanitizeNxdsAppearance({
    ...defaults,
    mode: pickOption(globals.mode, MODE_OPTIONS, defaults.mode),
    brandColor:
      typeof globals.brandColor === 'string'
        ? globals.brandColor
        : defaults.brandColor,
    surfaceTone: pickOption(
      globals.surfaceTone,
      BASE_TONE_OPTIONS,
      defaults.surfaceTone
    ),
    lightContrast:
      typeof globals.lightContrast === 'number'
        ? globals.lightContrast
        : defaults.lightContrast,
    darkContrast:
      typeof globals.darkContrast === 'number'
        ? globals.darkContrast
        : defaults.darkContrast,
    uiScale: pickOption(globals.uiScale, UI_SCALE_OPTIONS, defaults.uiScale),
    textSize:
      typeof globals.textSize === 'string'
        ? Number(globals.textSize)
        : defaults.textSize,
    density: pickOption(globals.density, DENSITY_OPTIONS, defaults.density),
    corners: pickOption(globals.corners, CORNER_OPTIONS, defaults.corners),
    elevation: pickOption(
      globals.elevation,
      ELEVATION_OPTIONS,
      defaults.elevation
    ),
    stroke: pickOption(globals.stroke, STROKE_OPTIONS, defaults.stroke),
    prefs: {
      uiFont:
        typeof globals.uiFont === 'string' ? globals.uiFont : prefs.uiFont,
      headingFont:
        typeof globals.headingFont === 'string'
          ? globals.headingFont
          : prefs.headingFont,
      codeFont:
        typeof globals.codeFont === 'string'
          ? globals.codeFont
          : prefs.codeFont,
      codeFontSize:
        typeof globals.codeFontSize === 'number'
          ? globals.codeFontSize
          : prefs.codeFontSize,
      reduceMotion:
        typeof globals.reduceMotion === 'boolean'
          ? globals.reduceMotion
          : prefs.reduceMotion,
      pointerCursors:
        typeof globals.pointerCursors === 'boolean'
          ? globals.pointerCursors
          : prefs.pointerCursors,
      fontSmoothing:
        typeof globals.fontSmoothing === 'boolean'
          ? globals.fontSmoothing
          : prefs.fontSmoothing,
    },
  });
}

function globalsFromAppearanceState(
  state: NxdsAppearanceState
): Record<AppearanceGlobalKey, string | number | boolean | null> {
  return {
    mode: state.mode,
    brandColor: state.brandColor,
    surfaceTone: state.surfaceTone,
    lightContrast: state.lightContrast,
    darkContrast: state.darkContrast,
    uiScale: state.uiScale,
    textSize: String(state.textSize),
    density: state.density,
    corners: state.corners,
    elevation: state.elevation,
    stroke: state.stroke,
    uiFont: state.prefs.uiFont,
    headingFont: state.prefs.headingFont,
    codeFont: state.prefs.codeFont,
    codeFontSize: state.prefs.codeFontSize,
    reduceMotion: state.prefs.reduceMotion,
    pointerCursors: state.prefs.pointerCursors,
    fontSmoothing: state.prefs.fontSmoothing,
  };
}

function appearanceStatesEqual(
  a: NxdsAppearanceState,
  b: NxdsAppearanceState
): boolean {
  const aGlobals = globalsFromAppearanceState(a);
  const bGlobals = globalsFromAppearanceState(b);

  return APPEARANCE_GLOBAL_KEYS.every((key) => aGlobals[key] === bGlobals[key]);
}

/** Toolbar values are strings, so each text size is its number as text. */
function textSizeToolbarItems() {
  return TEXT_SIZE_OPTIONS.map(({ value, label }) => ({
    value: String(value),
    title: label,
  }));
}

function toolbarItems<
  const T extends readonly { value: string; label: string }[],
>(options: T) {
  return options.map((option) => ({
    value: option.value,
    title: option.label,
  }));
}

/**
 * What a Storybook preview takes from nxds: the appearance decorator, its
 * toolbar and the accessibility settings. Stories start from `appearance`.
 * An app that sets its own colors passes `deriveColors: false`, as it does to
 * its provider, and the toolbar leaves out the color menus.
 */
export function nxdsPreview(
  appearance: NxdsAppearanceState,
  { deriveColors = true }: { deriveColors?: boolean } = {}
) {
  const AppearanceDecorator: Decorator = (Story, context) => {
    const [globals, updateGlobals] = useGlobals();
    const isDocs = context.viewMode === 'docs';
    const globalsState = useMemo(
      () =>
        appearanceStateFromGlobals(
          globals as Record<string, unknown>,
          appearance
        ),
      [globals]
    );
    const [appearanceState, setAppearanceState] = useState(globalsState);

    useEffect(() => {
      setAppearanceState((current) =>
        appearanceStatesEqual(current, globalsState) ? current : globalsState
      );
    }, [globalsState]);

    // A story's canvas is the page body. A docs page keeps its own
    // background, so there each story's wrapper carries it.
    useEffect(() => {
      if (isDocs) return;
      document.body.classList.add(CANVAS_BACKGROUND);
      return () => document.body.classList.remove(CANVAS_BACKGROUND);
    }, [isDocs]);

    const handleStateChange = useCallback(
      (nextState: NxdsAppearanceState) => {
        setAppearanceState(nextState);

        const nextGlobals = globalsFromAppearanceState(nextState);
        const changedGlobals: Partial<
          Record<AppearanceGlobalKey, string | number | boolean | null>
        > = {};

        for (const key of APPEARANCE_GLOBAL_KEYS) {
          if (globals[key] !== nextGlobals[key]) {
            changedGlobals[key] = nextGlobals[key];
          }
        }

        if (Object.keys(changedGlobals).length > 0) {
          updateGlobals(changedGlobals);
        }
      },
      [globals, updateGlobals]
    );

    return (
      <NxdsAppearanceProvider
        state={appearanceState}
        storageKey={false}
        deriveColors={deriveColors}
        onStateChange={handleStateChange}
      >
        <div
          className={cn(
            'nx:text-foreground nx:typography-body-default',
            isDocs && CANVAS_BACKGROUND
          )}
        >
          <Story />
        </div>
      </NxdsAppearanceProvider>
    );
  };

  return {
    decorators: [AppearanceDecorator],
    parameters: {
      // nxds checks contrast with APCA, which axe's WCAG 2 contrast rules
      // disagree with. The rules are an id-keyed object because Storybook
      // merges parameter objects but replaces arrays, so a story's own rules
      // would otherwise drop these.
      a11y: {
        options: {
          rules: {
            'color-contrast': { enabled: false },
            'color-contrast-enhanced': { enabled: false },
          },
        },
      },
    },
    initialGlobals: globalsFromAppearanceState(appearance),
    globalTypes: {
      mode: {
        name: 'Mode',
        description: 'Appearance mode',
        toolbar: {
          icon: 'circlehollow',
          items: MODE_OPTIONS.map((option) => ({
            value: option.value,
            icon: option.icon,
            title: option.label,
          })),
          dynamicTitle: true,
        },
      },
      brandColor: {
        name: 'Primary',
        description: 'Primary brand color',
        toolbar: deriveColors
          ? {
              icon: 'circle',
              items: BRAND_COLOR_PRESETS.map(({ color, label }) => ({
                value: color,
                title: label,
              })),
              dynamicTitle: true,
            }
          : undefined,
      },
      surfaceTone: {
        name: 'Surface',
        description: 'Neutral surface tone',
        toolbar: deriveColors
          ? {
              icon: 'paintbrush',
              items: toolbarItems(BASE_TONE_OPTIONS),
              dynamicTitle: true,
            }
          : undefined,
      },
      uiScale: {
        name: 'UI scale',
        description: 'Text, icon and spacing scale',
        toolbar: {
          icon: 'zoom',
          items: toolbarItems(UI_SCALE_OPTIONS),
          dynamicTitle: true,
        },
      },
      textSize: {
        name: 'Text size',
        description: 'Label text size in px at the Default UI scale',
        toolbar: {
          icon: 'paragraph',
          items: textSizeToolbarItems(),
          dynamicTitle: true,
        },
      },
      density: {
        name: 'Density',
        description: 'Spacing density',
        toolbar: {
          icon: 'expand',
          items: toolbarItems(DENSITY_OPTIONS),
          dynamicTitle: true,
        },
      },
      corners: {
        name: 'Corners',
        description: 'Corner radius mode',
        toolbar: {
          icon: 'circlehollow',
          items: toolbarItems(CORNER_OPTIONS),
          dynamicTitle: true,
        },
      },
      elevation: {
        name: 'Elevation',
        description: 'Shadow elevation mode',
        toolbar: {
          icon: 'contrast',
          items: toolbarItems(ELEVATION_OPTIONS),
          dynamicTitle: true,
        },
      },
      stroke: {
        name: 'Stroke',
        description: 'Border width mode',
        toolbar: {
          icon: 'outline',
          items: toolbarItems(STROKE_OPTIONS),
          dynamicTitle: true,
        },
      },
    },
  } satisfies Preview;
}
