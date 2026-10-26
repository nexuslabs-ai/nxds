'use client';

import * as React from 'react';

import { Field, FieldLabel, Input } from '@nxds/react';
import { cn } from '@nxds/react/utils';

import { Slider } from './slider';

interface PropertySliderProps extends Omit<
  React.ComponentProps<'div'>,
  'defaultValue' | 'onChange'
> {
  label: string;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  /** Submitted by the slider only; the editable text does not duplicate it. */
  name?: string;
}

/** A single horizontal setting. Drag the filled row or type its value. */
function PropertySlider({
  label,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  disabled = false,
  name,
  className,
  'aria-invalid': invalid,
  'aria-describedby': describedBy,
  ...props
}: PropertySliderProps) {
  const labelId = React.useId();
  // Match Slider's step grid: snap relative to min, then round and clamp.
  function normalize(next: number) {
    const snapped = min + Math.round((next - min) / step) * step;
    const precision = Math.max(0, (String(step).split('.')[1] ?? '').length);
    return Math.min(max, Math.max(min, Number(snapped.toFixed(precision))));
  }
  const [localValue, setLocalValue] = React.useState(defaultValue ?? min);
  const current = value ?? localValue;
  const [draft, setDraft] = React.useState(String(current));
  const [lastValue, setLastValue] = React.useState(current);
  if (lastValue !== current) {
    setLastValue(current);
    setDraft(String(current));
  }
  const inputInvalid =
    (invalid !== undefined && invalid !== false && invalid !== 'false') ||
    (draft.trim() !== '' && !Number.isFinite(Number(draft)));

  function change(next: number) {
    if (disabled || next === current) return;
    if (value === undefined) setLocalValue(next);
    onValueChange?.(next);
  }
  function commit() {
    const parsed = Number(draft);
    const next =
      draft.trim() && Number.isFinite(parsed) ? normalize(parsed) : current;
    // A controlled parent may reject the request. Its committed value wins.
    setDraft(String(value === undefined ? next : current));
    if (next === current || disabled) return;
    change(next);
    onValueCommit?.(next);
  }
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setDraft(String(current));
    }
  }
  function handleSlide(next: number[]) {
    const nextValue = next[0];
    if (nextValue === undefined) return;
    setDraft(String(value === undefined ? nextValue : current));
    change(nextValue);
  }
  function handleSlideCommit(next: number[]) {
    if (next[0] !== undefined) onValueCommit?.(next[0]);
  }
  return (
    <Field
      {...props}
      data-slot="property-slider"
      data-disabled={disabled || undefined}
      className={cn('nx:min-w-0', className)}
    >
      <div className="nx:relative nx:h-10 nx:w-full">
        <Slider
          variant="filled"
          min={min}
          max={max}
          step={step}
          value={[current]}
          name={name}
          disabled={disabled}
          onValueChange={handleSlide}
          onValueCommit={handleSlideCommit}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          aria-valuetext={unit ? `${current}${unit}` : undefined}
          className="nx:absolute nx:inset-0"
        />
        <div className="nx:pointer-events-none nx:absolute nx:inset-0 nx:flex nx:items-center nx:gap-2 nx:px-3">
          <FieldLabel
            id={labelId}
            asChild
            className={cn(
              'nx:min-w-0 nx:flex-1 nx:truncate nx:typography-label-small',
              disabled && 'nx:text-disabled-foreground'
            )}
          >
            <span>{label}</span>
          </FieldLabel>
          <span
            className={cn(
              'nx:pointer-events-auto nx:flex nx:shrink-0 nx:items-center nx:typography-body-small nx:text-muted-foreground',
              disabled && 'nx:text-disabled-foreground'
            )}
          >
            <Input
              size="sm"
              variant="ghost"
              inputMode="decimal"
              value={draft}
              disabled={disabled}
              aria-label={`${label} value${unit ? ` in ${unit}` : ''}`}
              aria-describedby={describedBy}
              aria-invalid={inputInvalid || undefined}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              className="nx:w-12 nx:px-1 nx:text-right nx:font-mono nx:typography-label-small nx:tabular-nums"
            />
            {unit && <span aria-hidden="true">{unit}</span>}
          </span>
        </div>
      </div>
    </Field>
  );
}

export { PropertySlider, type PropertySliderProps };
