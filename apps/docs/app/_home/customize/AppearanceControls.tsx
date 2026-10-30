'use client';

import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useState,
} from 'react';

import {
  BASE_TONE_OPTIONS,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  FONT_SIZE_PX_MAX,
  FONT_SIZE_PX_MIN,
  ICON_LIBRARY_OPTIONS,
  type NxdsAppearancePrefs,
  type NxdsAppearanceState,
  STROKE_OPTIONS,
} from '@nxds/core';
import { useNxdsAppearance } from '@nxds/react/appearance';

import { NxdsAppearanceBrandColorField } from '@/components/appearance/brand-color-field/brand-color-field';
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

import {
  CONTRAST_RANGE,
  type FontChoice,
  fontPick,
  HEADING_FONTS,
  UI_FONTS,
} from '../../_lib/appearance-controls';
import { useDocsTheme } from '../../_lib/docs-theme';
import type { ToolName } from '../tool-icons';

import { CornerChoices } from './CornerChoices';

const rowClass =
  'nx:min-h-10 nx:flex-row nx:items-center nx:gap-2 nx:rounded-md nx:bg-muted nx:px-3 nx:py-1';
const labelClass =
  'nx:min-w-0 nx:flex-1 nx:typography-label-small nx:text-muted-foreground';
const descriptionClass = 'nx:typography-body-small';

type Option<T extends string> = { value: T; label: string };

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
  const { startStep } = useDocsTheme();
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
    <Field
      className="nx:gap-0 nx:rounded-md nx:bg-muted nx:px-3 nx:py-1"
      onFocusCapture={startStep}
      onPointerDownCapture={startStep}
    >
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

/**
 * The brand color's preset, swatch and hex value. A pick or an edit always
 * begins with a focus or a click inside it, so either one starts an undo step.
 */
function BrandColorField({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const { startStep } = useDocsTheme();
  const id = useId();
  return (
    <Field
      aria-labelledby={id}
      className="nx:gap-2 nx:rounded-md nx:bg-muted nx:px-3 nx:py-2"
      onFocusCapture={startStep}
      onClickCapture={startStep}
    >
      <FieldLabel id={id} asChild className={labelClass}>
        <span>Brand color</span>
      </FieldLabel>
      <NxdsAppearanceBrandColorField
        label="Brand color"
        value={value}
        onChange={onChange}
      />
    </Field>
  );
}

/** A font picker row. A stack set some other way shows as Custom. */
function FontSelect({
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
    <AppearanceSelect
      label={label}
      value={chosen.value}
      options={options}
      onChange={change}
    />
  );
}

/** The Customize tools, in toolbar order. */
export const customizeTools = [
  'Theme',
  'Colors',
  'Typography',
  'Spacing',
  'Radius',
  'More',
] as const satisfies readonly ToolName[];

export type CustomizeTool = (typeof customizeTools)[number];

/**
 * The docs theme, with setters for one field of it. `group` makes repeated
 * changes to that field, such as a slider drag, share one undo step.
 */
function useAppearanceEditor() {
  const { state, iconLibrary, change, changeIconLibrary } = useDocsTheme();
  const { resolvedMode } = useNxdsAppearance();
  function update<K extends keyof NxdsAppearanceState>(
    name: K,
    value: NxdsAppearanceState[K],
    group?: K
  ) {
    change({ [name]: value }, group);
  }
  function updatePrefs<K extends keyof NxdsAppearancePrefs>(
    name: K,
    value: NxdsAppearancePrefs[K],
    group?: 'prefs'
  ) {
    change({ prefs: { ...state.prefs, [name]: value } }, group);
  }
  return {
    state,
    resolvedMode,
    iconLibrary,
    update,
    updatePrefs,
    changeIconLibrary,
  };
}

function ThemePanel() {
  const id = useId();
  const { state, resolvedMode, update } = useAppearanceEditor();
  const contrastKey =
    resolvedMode === 'dark' ? 'darkContrast' : 'lightContrast';
  return (
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
        {...CONTRAST_RANGE}
        onChange={(value) => update(contrastKey, value, contrastKey)}
      />
    </>
  );
}

function ColorsPanel() {
  const { state, update } = useAppearanceEditor();
  return (
    <>
      <BrandColorField
        value={state.brandColor}
        onChange={(value) => update('brandColor', value, 'brandColor')}
      />
      <AppearanceSelect
        label="Gray family"
        value={state.surfaceTone}
        options={BASE_TONE_OPTIONS}
        onChange={(value) => update('surfaceTone', value)}
      />
    </>
  );
}

function TypographyPanel() {
  const { state, iconLibrary, updatePrefs, changeIconLibrary } =
    useAppearanceEditor();
  return (
    <>
      <FontSelect
        label="Font"
        family={state.prefs.uiFont}
        choices={UI_FONTS}
        onChange={(family) =>
          updatePrefs('uiFont', family ?? DEFAULT_NXDS_APPEARANCE.prefs.uiFont)
        }
      />
      <FontSelect
        label="Heading font"
        family={state.prefs.headingFont}
        choices={HEADING_FONTS}
        onChange={(family) => updatePrefs('headingFont', family)}
      />
      <AppearanceSelect
        label="Icons"
        value={iconLibrary}
        options={ICON_LIBRARY_OPTIONS}
        onChange={changeIconLibrary}
      />
      <AppearanceRange
        label="UI size"
        value={state.prefs.uiFontSize}
        min={FONT_SIZE_PX_MIN}
        max={FONT_SIZE_PX_MAX}
        unit="px"
        onChange={(value) => updatePrefs('uiFontSize', value, 'prefs')}
      />
    </>
  );
}

function SpacingPanel() {
  const { state, update } = useAppearanceEditor();
  return (
    <AppearanceSelect
      label="Density"
      value={state.density}
      options={DENSITY_OPTIONS}
      onChange={(value) => update('density', value)}
      description="Changes component spacing. The grid stays in place."
    />
  );
}

function RadiusPanel() {
  const { state, update } = useAppearanceEditor();
  return (
    <CornerChoices
      value={state.corners}
      onChange={(corners) => update('corners', corners)}
    />
  );
}

function MorePanel() {
  const { state, update } = useAppearanceEditor();
  return (
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
  );
}

const panels: Record<CustomizeTool, () => ReactNode> = {
  Theme: ThemePanel,
  Colors: ColorsPanel,
  Typography: TypographyPanel,
  Spacing: SpacingPanel,
  Radius: RadiusPanel,
  More: MorePanel,
};

/** The Customize panel for one toolbar tool. It edits the page's appearance. */
export function AppearanceControls({ tool }: { tool: CustomizeTool }) {
  const Panel = panels[tool];
  return (
    <div className="nx:min-w-0 nx:overflow-y-auto nx:p-1">
      <FieldGroup className="nx:gap-2">
        <Panel />
      </FieldGroup>
    </div>
  );
}
