'use client';

import { useId } from 'react';

import { CORNER_OPTIONS, type NxdsCorners } from '@nxds/core';
import { IconCheck } from '@tabler/icons-react';

import { Field, FieldDescription, FieldLabel } from '@/components/field/field';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/toggle-group/toggle-group';

/** The corner presets as specimens, each drawn with its own radius. */
export function CornerChoices({
  value,
  onChange,
}: {
  value: NxdsCorners;
  onChange: (corners: NxdsCorners) => void;
}) {
  const id = useId();
  function select(next: string) {
    const option = CORNER_OPTIONS.find((corner) => corner.value === next);
    if (option) onChange(option.value);
  }
  return (
    <Field className="nx:@container">
      <FieldLabel
        id={id}
        asChild
        className="nx:typography-label-small nx:text-muted-foreground"
      >
        <span>Corners</span>
      </FieldLabel>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={select}
        aria-labelledby={id}
        aria-describedby={`${id}-help`}
        spacing={2}
        size="sm"
        variant="outline-primary"
        className="nx:appearance-corner-options nx:w-full"
      >
        {CORNER_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="nx:relative nx:flex-col nx:gap-2 nx:px-1 nx:py-3 nx:whitespace-normal"
          >
            <span
              className="nx:appearance-corner-sample"
              data-radius={option.value}
              aria-hidden="true"
            />
            <span>{option.label}</span>
            {value === option.value && (
              <IconCheck
                className="nx:absolute nx:top-1 nx:right-1"
                size={16}
                aria-hidden="true"
              />
            )}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <FieldDescription id={`${id}-help`}>
        One preset shapes every component.
      </FieldDescription>
    </Field>
  );
}
