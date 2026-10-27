'use client';

import { type ChangeEvent, type KeyboardEvent, useId, useState } from 'react';

import {
  BASE_TONE_OPTIONS,
  BRAND_COLOR_PRESETS,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  FONT_OPTIONS,
  ICON_LIBRARY_OPTIONS,
  type NxdsAppearancePrefs,
  type NxdsAppearanceState,
  STROKE_OPTIONS,
} from '@nxds/core';
import { useNxdsAppearance } from '@nxds/react/appearance';

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/field/field';
import { Input } from '@/components/input/input';
import { NativeSelect } from '@/components/native-select/native-select';
import { Slider } from '@/components/slider/slider';
import { Switch } from '@/components/switch/switch';

import { setIconLibrary, useIconLibrary } from '../../_lib/icon-library';
import type { ToolName } from '../tool-icons';

import { CornerChoices } from './CornerChoices';

const rowClass =
  'nx:min-h-10 nx:flex-row nx:items-center nx:gap-2 nx:rounded-md nx:bg-muted nx:px-3 nx:py-1';
const labelClass =
  'nx:min-w-0 nx:flex-1 nx:typography-label-small nx:text-muted-foreground';
const descriptionClass = 'nx:typography-body-small';

type Option<T extends string> = { value: T; label: string };

const TEXT_FONTS = FONT_OPTIONS.filter((font) => font.category !== 'mono').map(
  ({ family, label }) => ({ value: family, label })
);
const UI_FONTS = [
  { value: DEFAULT_NXDS_APPEARANCE.prefs.uiFont, label: 'System' },
  ...TEXT_FONTS,
];
const HEADING_FONTS = [{ value: '', label: 'UI font' }, ...TEXT_FONTS];

const HEX = /^#?([0-9a-f]{6})$/i;

/** `#rrggbb` in lowercase, from six hex digits with or without `#`. */
function normalizeHex(value: string) {
  const digits = HEX.exec(value.trim())?.[1];
  return digits ? `#${digits.toLowerCase()}` : null;
}

function brandOptions(brandColor: string) {
  const options: Option<string>[] = BRAND_COLOR_PRESETS.map(
    ({ color, label }) => ({ value: color, label })
  );
  if (!BRAND_COLOR_PRESETS.some((preset) => preset.color === brandColor))
    options.push({ value: brandColor, label: 'Custom' });
  return options;
}

function AppearanceSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  description,
}: {
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  description?: string;
}) {
  const id = useId();
  function change(event: ChangeEvent<HTMLSelectElement>) {
    const option = options.find((item) => item.value === event.target.value);
    if (option) onChange(option.value);
  }
  return (
    <div className="nx:flex nx:min-w-0 nx:flex-col nx:gap-2">
      <Field orientation="horizontal" className={rowClass}>
        <div className="nx:shrink-0">
          <FieldLabel htmlFor={id} className={labelClass}>
            {label}
          </FieldLabel>
        </div>
        <div className="nx:min-w-0 nx:flex-1">
          <NativeSelect
            size="sm"
            variant="borderless"
            id={id}
            value={value}
            onChange={change}
            aria-describedby={description ? `${id}-help` : undefined}
            className="nx:bg-transparent nx:autofill-bg-transparent nx:pl-0 nx:text-right nx:typography-label-small nx:enabled:hover:bg-transparent nx:enabled:hover:autofill-bg-transparent"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </Field>
      {description && (
        <FieldDescription id={`${id}-help`} className={descriptionClass}>
          {description}
        </FieldDescription>
      )}
    </div>
  );
}

/** A labelled slider whose value can also be typed. */
function AppearanceRange({
  label,
  value,
  min,
  max,
  unit = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  const labelId = useId();
  const [draft, setDraft] = useState(String(value));
  // Re-sync the draft when the committed value changes, during render (no effect).
  const [lastValue, setLastValue] = useState(value);
  if (lastValue !== value) {
    setLastValue(value);
    setDraft(String(value));
  }
  const typed = Number(draft);
  const parsable = draft.trim() !== '' && Number.isFinite(typed);

  function commit() {
    // The provider may sanitize the request; its committed value then wins.
    setDraft(String(value));
    if (!parsable) return;
    const next = Math.min(max, Math.max(min, Math.round(typed)));
    if (next !== value) onChange(next);
  }
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setDraft(String(value));
    }
  }
  function slide([next]: number[]) {
    if (next !== undefined && next !== value) onChange(next);
  }
  return (
    <Field className="nx:gap-0 nx:rounded-md nx:bg-muted nx:px-3 nx:py-1">
      <div className="nx:flex nx:min-h-8 nx:items-center nx:gap-2">
        <FieldLabel id={labelId} asChild className={labelClass}>
          <span>{label}</span>
        </FieldLabel>
        <span className="nx:flex nx:shrink-0 nx:items-center nx:typography-body-small nx:text-muted-foreground">
          <Input
            size="sm"
            variant="ghost"
            inputMode="decimal"
            value={draft}
            aria-label={`${label} value${unit ? ` in ${unit}` : ''}`}
            aria-invalid={(draft.trim() !== '' && !parsable) || undefined}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            className="nx:w-12 nx:px-1 nx:text-right nx:font-mono nx:typography-label-small nx:tabular-nums"
          />
          {unit && <span aria-hidden="true">{unit}</span>}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        value={[value]}
        onValueChange={slide}
        aria-labelledby={labelId}
      />
    </Field>
  );
}

/** The brand seed as an editable hex value. */
function BrandColorField({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  // Re-sync the draft when the committed value changes, during render (no effect).
  const [lastValue, setLastValue] = useState(value);
  if (lastValue !== value) {
    setLastValue(value);
    setDraft(value);
  }
  function change(event: ChangeEvent<HTMLInputElement>) {
    setDraft(event.target.value);
    const hex = normalizeHex(event.target.value);
    if (hex) onChange(hex);
  }
  return (
    <Field orientation="horizontal" className={rowClass}>
      <FieldLabel htmlFor={id} className={labelClass}>
        Brand color
      </FieldLabel>
      <Input
        id={id}
        size="sm"
        variant="ghost"
        value={draft}
        onChange={change}
        onBlur={() => setDraft(value)}
        aria-label="Brand color hex value"
        aria-invalid={normalizeHex(draft) === null}
        spellCheck={false}
        className="nx:w-[9ch] nx:px-1 nx:text-right nx:font-mono nx:uppercase nx:typography-label-small"
      />
    </Field>
  );
}

/** The Customize panel for one toolbar tool. It edits the page's appearance. */
export function AppearanceControls({ tool }: { tool: ToolName }) {
  const id = useId();
  const { state, setState, resolvedMode } = useNxdsAppearance();
  const iconLibrary = useIconLibrary();
  const contrastKey =
    resolvedMode === 'dark' ? 'darkContrast' : 'lightContrast';
  function update<K extends keyof NxdsAppearanceState>(
    name: K,
    value: NxdsAppearanceState[K]
  ) {
    setState((current) => ({ ...current, [name]: value }));
  }
  function updatePrefs<K extends keyof NxdsAppearancePrefs>(
    name: K,
    value: NxdsAppearancePrefs[K]
  ) {
    setState((current) => ({
      ...current,
      prefs: { ...current.prefs, [name]: value },
    }));
  }
  return (
    <div className="nx:min-w-0 nx:overflow-y-auto nx:p-1">
      <FieldGroup className="nx:gap-2">
        {tool === 'Theme' && (
          <>
            <Field orientation="horizontal" className={rowClass}>
              <FieldLabel htmlFor={id} className={labelClass}>
                Dark mode
              </FieldLabel>
              <Switch
                id={id}
                checked={resolvedMode === 'dark'}
                onCheckedChange={(checked) =>
                  update('mode', checked ? 'dark' : 'light')
                }
              />
            </Field>
            <FieldDescription className={descriptionClass}>
              Updates the whole site, not only this page.
            </FieldDescription>
            <AppearanceRange
              label="Contrast"
              value={state[contrastKey]}
              min={0}
              max={100}
              onChange={(value) => update(contrastKey, value)}
            />
          </>
        )}
        {tool === 'Colors' && (
          <>
            <AppearanceSelect
              label="Brand preset"
              value={state.brandColor}
              options={brandOptions(state.brandColor)}
              onChange={(value) => update('brandColor', value)}
            />
            <BrandColorField
              value={state.brandColor}
              onChange={(value) => update('brandColor', value)}
            />
            <AppearanceSelect
              label="Gray family"
              value={state.surfaceTone}
              options={BASE_TONE_OPTIONS}
              onChange={(value) => update('surfaceTone', value)}
            />
          </>
        )}
        {tool === 'Typography' && (
          <>
            <AppearanceSelect
              label="Font"
              value={state.prefs.uiFont}
              options={UI_FONTS}
              onChange={(value) => updatePrefs('uiFont', value)}
            />
            <AppearanceSelect
              label="Heading font"
              value={state.prefs.headingFont ?? ''}
              options={HEADING_FONTS}
              onChange={(value) => updatePrefs('headingFont', value || null)}
            />
            <AppearanceSelect
              label="Icons"
              value={iconLibrary}
              options={ICON_LIBRARY_OPTIONS}
              onChange={setIconLibrary}
            />
            <AppearanceRange
              label="UI size"
              value={state.prefs.uiFontSize}
              min={12}
              max={20}
              unit="px"
              onChange={(value) => updatePrefs('uiFontSize', value)}
            />
          </>
        )}
        {tool === 'Spacing' && (
          <AppearanceSelect
            label="Density"
            value={state.density}
            options={DENSITY_OPTIONS}
            onChange={(value) => update('density', value)}
            description="Changes component spacing. The grid stays in place."
          />
        )}
        {tool === 'Radius' && (
          <CornerChoices
            value={state.corners}
            onChange={(corners) => update('corners', corners)}
          />
        )}
        {tool === 'More' && (
          <>
            <AppearanceSelect
              label="Elevation"
              value={state.elevation}
              options={ELEVATION_OPTIONS}
              onChange={(value) => update('elevation', value)}
            />
            <AppearanceSelect
              label="Stroke"
              value={state.stroke}
              options={STROKE_OPTIONS}
              onChange={(value) => update('stroke', value)}
            />
          </>
        )}
      </FieldGroup>
    </div>
  );
}
