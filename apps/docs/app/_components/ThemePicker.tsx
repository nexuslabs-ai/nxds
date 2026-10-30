'use client';

import { useEffect, useId, useRef, useState } from 'react';

import {
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  ICON_LIBRARY_OPTIONS,
  type NxdsAppearancePrefs,
  STROKE_OPTIONS,
} from '@nxds/core';

import { cn } from '@/lib/utils';

import {
  CODE_FONTS,
  type FontChoice,
  fontPick,
  HEADING_FONTS,
  MODE_OPTIONS,
  UI_FONTS,
} from '../_lib/appearance-controls';
import { useDocsTheme } from '../_lib/docs-theme';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './nxds';
import { ThemeActions } from './ThemeActions';
import { ThemeExport } from './ThemeExport';

const { prefs: DEFAULT_PREFS } = DEFAULT_NXDS_APPEARANCE;

export function ThemePicker() {
  const { state, iconLibrary, change, changeIconLibrary } = useDocsTheme();
  // Starts closed at every width, so the open panel never covers the article.
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  // Publish the panel's real height so `scroll-pb` clears it and Tab never
  // parks a control underneath (WCAG 2.4.11).
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      const rect = panel.getBoundingClientRect();
      // Reserve the measured bottom gap twice: once below, once above.
      const clearance = rect.height + (window.innerHeight - rect.bottom) * 2;
      root.style.setProperty('--docs-panel-offset', `${clearance}px`);
    });
    observer.observe(panel);

    return () => {
      observer.disconnect();
      root.style.removeProperty('--docs-panel-offset');
    };
  }, []);

  function changePrefs(patch: Partial<NxdsAppearancePrefs>) {
    change({ prefs: { ...state.prefs, ...patch } });
  }

  return (
    <aside
      ref={panelRef}
      className="nx:fixed nx:bottom-6 nx:right-6 nx:z-sticky nx:w-[300px] nx:max-h-[calc(100svh_-_2*var(--nx-spacing-6))] nx:overflow-y-auto nx:bg-popover nx:text-popover-foreground nx:border nx:border-border-default nx:rounded-lg nx:shadow-lg"
    >
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="nx:w-full nx:justify-between nx:rounded-lg"
      >
        <span>⚙ Theme</span>
        <span
          className={cn(
            'nx:text-muted-foreground nx:transition-transform',
            expanded && 'nx:rotate-180'
          )}
        >
          ▼
        </span>
      </Button>
      {expanded && (
        <div className="nx:px-4 nx:pb-4 nx:border-t nx:border-border-default">
          <Section title="Colors">
            <PickerRow
              label="Scheme"
              value={state.mode}
              options={MODE_OPTIONS}
              onChange={(mode) => change({ mode })}
            />
            <PickerRow
              label="Base"
              value={state.surfaceTone}
              options={BASE_TONE_OPTIONS}
              onChange={(surfaceTone) => change({ surfaceTone })}
            />
          </Section>
          <Section title="Design Tokens">
            <PickerRow
              label="Size"
              value={state.density}
              options={DENSITY_OPTIONS}
              onChange={(density) => change({ density })}
            />
            <PickerRow
              label="Shadow"
              value={state.elevation}
              options={ELEVATION_OPTIONS}
              onChange={(elevation) => change({ elevation })}
            />
            <PickerRow
              label="Radius"
              value={state.corners}
              options={CORNER_OPTIONS}
              onChange={(corners) => change({ corners })}
            />
            <PickerRow
              label="Border Width"
              value={state.stroke}
              options={STROKE_OPTIONS}
              onChange={(stroke) => change({ stroke })}
            />
          </Section>
          <Section title="Typography">
            <FontRow
              label="Font"
              family={state.prefs.uiFont}
              choices={UI_FONTS}
              onChange={(uiFont) =>
                changePrefs({ uiFont: uiFont ?? DEFAULT_PREFS.uiFont })
              }
            />
            <FontRow
              label="Heading"
              family={state.prefs.headingFont}
              choices={HEADING_FONTS}
              onChange={(headingFont) => changePrefs({ headingFont })}
            />
            <FontRow
              label="Code"
              family={state.prefs.codeFont}
              choices={CODE_FONTS}
              onChange={(codeFont) =>
                changePrefs({ codeFont: codeFont ?? DEFAULT_PREFS.codeFont })
              }
            />
          </Section>
          <Section title="Icons">
            <PickerRow
              label="Library"
              value={iconLibrary}
              options={ICON_LIBRARY_OPTIONS}
              onChange={changeIconLibrary}
            />
          </Section>
          <div className="nx:flex nx:flex-col nx:gap-2 nx:pt-4">
            <ThemeActions size="sm" />
            <ThemeExport className="nx:w-full" />
          </div>
        </div>
      )}
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="nx:pt-4">
      <h4 className="nx:text-[10px] nx:font-semibold nx:uppercase nx:tracking-wider nx:text-muted-foreground nx:mb-3">
        {title}
      </h4>
      {children}
    </div>
  );
}

function PickerRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();

  function change(next: string) {
    const option = options.find((candidate) => candidate.value === next);
    if (option) onChange(option.value);
  }

  return (
    <div className="nx:grid nx:grid-cols-[1fr_auto] nx:items-center nx:gap-3 nx:py-1">
      <label htmlFor={id} className="nx:typography-label-default">
        {label}
      </label>
      <Select value={value} onValueChange={change}>
        <SelectTrigger
          id={id}
          size="sm"
          className="nx:w-[140px] nx:typography-label-small"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** A font picker row. A stack set some other way shows as Custom. */
function FontRow({
  label,
  family,
  choices,
  onChange,
}: {
  label: string;
  family: string | null;
  choices: FontChoice[];
  onChange: (family: string | null) => void;
}) {
  const { chosen, options } = fontPick(family, choices);

  function change(value: string) {
    const choice = options.find((option) => option.value === value);
    if (choice) onChange(choice.family);
  }

  return (
    <PickerRow
      label={label}
      value={chosen.value}
      options={options}
      onChange={change}
    />
  );
}
