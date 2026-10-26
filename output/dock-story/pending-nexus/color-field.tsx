'use client';

import { useState } from 'react';

import { Input } from '@nxds/react';
import { cn } from '@nxds/react/utils';
import { cva } from 'class-variance-authority';

export interface NxdsAppearanceColorFieldProps {
  value: string;
  onChange: (hex: string) => void;
  label: string;
  /** Compact puts the editable hex before the swatch for property rows. */
  variant?: 'default' | 'compact';
  disabled?: boolean;
}

const colorFieldVariants = cva('nx:flex nx:min-w-0 nx:items-center', {
  variants: {
    variant: { default: 'nx:gap-2', compact: 'nx:flex-row-reverse nx:gap-1' },
  },
  defaultVariants: { variant: 'default' },
});
const colorInputVariants = cva('nx:font-mono nx:uppercase', {
  variants: {
    variant: {
      default: 'nx:w-28',
      compact: 'nx:w-[9ch] nx:px-1 nx:text-right nx:typography-label-small',
    },
  },
  defaultVariants: { variant: 'default' },
});

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const HEX_BODY_RE = /^[0-9a-fA-F]{6}$/;

function normalizeHex(value: string) {
  const trimmed = value.trim();
  if (HEX_RE.test(trimmed)) return trimmed.toLowerCase();
  if (HEX_BODY_RE.test(trimmed)) return `#${trimmed.toLowerCase()}`;
  return null;
}

export function NxdsAppearanceColorField({
  value,
  onChange,
  label,
  variant = 'default',
  disabled = false,
}: NxdsAppearanceColorFieldProps) {
  const [draft, setDraft] = useState(value);
  // Re-sync the draft when the committed value changes, during render (no effect).
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }
  const normalizedValue = normalizeHex(value);
  const committedHex = normalizedValue ?? '#000000';

  const commit = (next: string) => {
    setDraft(next);
    const normalized = normalizeHex(next);
    if (normalized) onChange(normalized);
  };

  const resetDraft = () => setDraft(value);

  return (
    <div
      data-slot="appearance-color-field"
      data-variant={variant}
      data-disabled={disabled || undefined}
      className={colorFieldVariants({ variant })}
    >
      <div className="nx:relative nx:size-7 nx:shrink-0">
        <input
          type="color"
          disabled={disabled}
          value={committedHex}
          onChange={(event) => commit(event.target.value)}
          aria-label={label}
          className="nx:peer nx:absolute nx:inset-0 nx:cursor-pointer nx:opacity-0 nx:disabled:cursor-not-allowed"
        />
        <div
          aria-hidden="true"
          className="nx:size-full nx:rounded-full nx:border-default nx:border-border-default nx:peer-disabled:opacity-50 nx:peer-focus-visible:outline-2 nx:peer-focus-visible:outline-focus-default nx:peer-focus-visible:outline-offset-2"
          style={{
            backgroundColor: normalizedValue ?? 'transparent',
          }}
        />
      </div>
      <Input
        disabled={disabled}
        size={variant === 'compact' ? 'sm' : 'default'}
        variant={variant === 'compact' ? 'ghost' : 'bordered'}
        value={draft}
        onChange={(event) => commit(event.target.value)}
        onBlur={resetDraft}
        aria-label={`${label} hex value`}
        aria-invalid={normalizeHex(draft) === null}
        spellCheck={false}
        className={cn(colorInputVariants({ variant }))}
      />
    </div>
  );
}
