'use client';

import { type ChangeEvent, type ReactNode, useId, useState } from 'react';

import {
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  FONT_SIZE_PX_MAX,
  FONT_SIZE_PX_MIN,
  ICON_LIBRARY_OPTIONS,
  type NxdsAppearancePrefs,
  type NxdsAppearanceState,
  type NxdsIconLibrary,
  type NxdsResolvedAppearanceMode,
  type NxdsTextSize,
  STROKE_OPTIONS,
  TEXT_SIZE_OPTIONS,
  textSizePx,
  UI_SCALE_OPTIONS,
} from '@nxds/core';
import {
  Input,
  Label,
  NativeSelect,
  NativeSelectOption,
  NxdsAppearanceBrandColorField,
  Slider,
  Switch,
} from '@nxds/react';

import {
  CODE_FONTS,
  type FontChoice,
  fontPick,
  HEADING_FONTS,
  MODE_OPTIONS,
  UI_FONTS,
} from '../_lib/appearance-controls';

const CONTRAST_MIN = 0;
const CONTRAST_MAX = 100;

const LABEL_CLASS = 'nx:typography-label-default';
const FIELD_CLASS = 'nx:flex nx:flex-col nx:gap-2';

function ControlGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="nx:space-y-4">
      <h2 className="nx:typography-label-default nx:text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SelectField<T extends string>({
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
  return (
    <div className={FIELD_CLASS}>
      <Label htmlFor={id}>{label}</Label>
      <NativeSelect
        id={id}
        value={value}
        // The options are exactly `options`, so the selected value is a `T`.
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

const { prefs: DEFAULT_PREFS } = DEFAULT_NXDS_APPEARANCE;

/** Picks a font by name. A stack set some other way shows as Custom. */
function FontField({
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
    <SelectField
      label={label}
      value={chosen.value}
      options={options}
      onChange={change}
    />
  );
}

/** Moves freely while dragged and commits once the thumb is released. */
function ContrastField({
  mode,
  value,
  onChange,
}: {
  mode: NxdsResolvedAppearanceMode;
  value: number;
  onChange: (value: number) => void;
}) {
  const labelId = useId();
  const noteId = useId();
  // Only a pointer drag holds a draft; keyboard steps commit straight to `value`.
  const [draft, setDraft] = useState<number | null>(null);
  const shown = draft ?? value;

  function moveDraft([next]: number[]) {
    if (next === undefined) return;
    setDraft((current) => (current === null ? null : next));
  }

  function commit([next]: number[]) {
    if (next !== undefined && next !== value) onChange(next);
  }

  return (
    <div className={FIELD_CLASS}>
      <div className="nx:flex nx:items-center nx:justify-between nx:gap-2">
        <span id={labelId} className={LABEL_CLASS}>
          Contrast
        </span>
        <span className="nx:typography-label-default nx:tabular-nums nx:text-muted-foreground">
          {shown}
        </span>
      </div>
      <Slider
        aria-labelledby={`${labelId} ${noteId}`}
        min={CONTRAST_MIN}
        max={CONTRAST_MAX}
        step={1}
        value={[shown]}
        onPointerDown={() => setDraft(value)}
        onPointerUp={() => setDraft(null)}
        onLostPointerCapture={() => setDraft(null)}
        onValueChange={moveDraft}
        onValueCommit={commit}
      />
      <p
        id={noteId}
        className="nx:typography-body-small nx:text-muted-foreground"
      >
        Adjusts {mode} mode
      </p>
    </div>
  );
}

/** Commits every in-range entry; anything else waits in the field until blur. */
function FontSizeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    setDraft(text);
    const next = Number(text);
    if (text === '' || !Number.isInteger(next) || next === value) return;
    if (next < FONT_SIZE_PX_MIN || next > FONT_SIZE_PX_MAX) return;
    onChange(next);
  }

  return (
    <div className={FIELD_CLASS}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={FONT_SIZE_PX_MIN}
        max={FONT_SIZE_PX_MAX}
        value={draft ?? value}
        onChange={handleChange}
        onBlur={() => setDraft(null)}
      />
    </div>
  );
}

function SwitchField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="nx:flex nx:items-center nx:justify-between nx:gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/**
 * A preset pick, picker session, or hex edit always begins with a focus or a
 * click inside the field, so either one starts a new undo step.
 */
function BrandColorField({
  value,
  onChange,
  onGestureStart,
}: {
  value: string;
  onChange: (value: string) => void;
  onGestureStart: () => void;
}) {
  const id = useId();
  return (
    <div
      role="group"
      aria-labelledby={id}
      className={FIELD_CLASS}
      onFocusCapture={onGestureStart}
      onClickCapture={onGestureStart}
    >
      <span id={id} className={LABEL_CLASS}>
        Brand color
      </span>
      <NxdsAppearanceBrandColorField
        label="Brand color"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export function AppearanceControls({
  state,
  resolvedMode,
  iconLibrary,
  onChange,
  onIconLibraryChange,
  onGestureStart,
}: {
  state: NxdsAppearanceState;
  resolvedMode: NxdsResolvedAppearanceMode;
  iconLibrary: NxdsIconLibrary;
  onChange: (
    patch: Partial<NxdsAppearanceState>,
    group?: keyof NxdsAppearanceState
  ) => void;
  onIconLibraryChange: (library: NxdsIconLibrary) => void;
  onGestureStart: () => void;
}) {
  const contrastKey =
    resolvedMode === 'dark' ? 'darkContrast' : 'lightContrast';

  function changePrefs(patch: Partial<NxdsAppearancePrefs>) {
    onChange({ prefs: { ...state.prefs, ...patch } });
  }

  return (
    <div data-slot="appearance-controls" className="nx:space-y-8">
      <ControlGroup title="Color">
        <BrandColorField
          value={state.brandColor}
          onChange={(brandColor) => onChange({ brandColor }, 'brandColor')}
          onGestureStart={onGestureStart}
        />
        <SelectField
          label="Mode"
          value={state.mode}
          options={MODE_OPTIONS}
          onChange={(mode) => onChange({ mode })}
        />
        <SelectField
          label="Surface tone"
          value={state.surfaceTone}
          options={BASE_TONE_OPTIONS}
          onChange={(surfaceTone) => onChange({ surfaceTone })}
        />
        <ContrastField
          mode={resolvedMode}
          value={state[contrastKey]}
          onChange={(contrast) => onChange({ [contrastKey]: contrast })}
        />
      </ControlGroup>
      <ControlGroup title="Shape">
        <SelectField
          label="UI scale"
          value={state.uiScale}
          options={UI_SCALE_OPTIONS}
          onChange={(uiScale) => onChange({ uiScale })}
        />
        <SelectField
          label="Text size"
          value={String(state.textSize)}
          options={TEXT_SIZE_OPTIONS.map((size) => ({
            value: String(size),
            label: `${textSizePx(size, state.uiScale)}px`,
          }))}
          // Each option's value is a text size as text.
          onChange={(value) =>
            onChange({ textSize: Number(value) as NxdsTextSize })
          }
        />
        <SelectField
          label="Density"
          value={state.density}
          options={DENSITY_OPTIONS}
          onChange={(density) => onChange({ density })}
        />
        <SelectField
          label="Corners"
          value={state.corners}
          options={CORNER_OPTIONS}
          onChange={(corners) => onChange({ corners })}
        />
        <SelectField
          label="Elevation"
          value={state.elevation}
          options={ELEVATION_OPTIONS}
          onChange={(elevation) => onChange({ elevation })}
        />
        <SelectField
          label="Stroke"
          value={state.stroke}
          options={STROKE_OPTIONS}
          onChange={(stroke) => onChange({ stroke })}
        />
      </ControlGroup>
      <ControlGroup title="Type and icons">
        <FontField
          label="Font"
          family={state.prefs.uiFont}
          choices={UI_FONTS}
          onChange={(uiFont) =>
            changePrefs({ uiFont: uiFont ?? DEFAULT_PREFS.uiFont })
          }
        />
        <FontField
          label="Heading font"
          family={state.prefs.headingFont}
          choices={HEADING_FONTS}
          onChange={(headingFont) => changePrefs({ headingFont })}
        />
        <FontField
          label="Code font"
          family={state.prefs.codeFont}
          choices={CODE_FONTS}
          onChange={(codeFont) =>
            changePrefs({ codeFont: codeFont ?? DEFAULT_PREFS.codeFont })
          }
        />
        <SelectField
          label="Icons"
          value={iconLibrary}
          options={ICON_LIBRARY_OPTIONS}
          onChange={onIconLibraryChange}
        />
      </ControlGroup>
      <ControlGroup title="Preferences">
        <FontSizeField
          label="Code font size"
          value={state.prefs.codeFontSize}
          onChange={(codeFontSize) => changePrefs({ codeFontSize })}
        />
        <SwitchField
          label="Reduce motion"
          checked={state.prefs.reduceMotion}
          onChange={(reduceMotion) => changePrefs({ reduceMotion })}
        />
        <SwitchField
          label="Pointer cursors"
          checked={state.prefs.pointerCursors}
          onChange={(pointerCursors) => changePrefs({ pointerCursors })}
        />
        <SwitchField
          label="Font smoothing"
          checked={state.prefs.fontSmoothing}
          onChange={(fontSmoothing) => changePrefs({ fontSmoothing })}
        />
      </ControlGroup>
    </div>
  );
}
