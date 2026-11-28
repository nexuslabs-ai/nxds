import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { cn } from '../../lib/utils';

import { Slider, type SliderProps } from './slider';
import sliderMeta, {
  Disabled,
  ExplicitMarkers,
  Invalid,
  KeyboardInteraction,
  Range,
  Vertical,
} from './Slider.stories';

const meta: Meta<typeof Slider> = {
  ...sliderMeta,
  title: 'Tests/Slider',
};

export default meta;
type Story = StoryObj<typeof Slider>;

interface SliderControlRowProps extends Omit<
  SliderProps,
  'aria-label' | 'onValueChange' | 'size' | 'value'
> {
  formatValue?: (value: number) => string;
  label: string;
  valueLabel?: string;
}

function SliderControlRow({
  className,
  defaultValue,
  disabled,
  formatValue,
  label,
  max = 100,
  min = 0,
  step = 1,
  valueLabel,
  ...props
}: SliderControlRowProps) {
  const [sliderValue, setSliderValue] = useState(
    Array.isArray(defaultValue) ? defaultValue : [min]
  );
  const currentValue = sliderValue[0] ?? min;
  const displayValue =
    valueLabel ?? formatValue?.(currentValue) ?? String(currentValue);

  return (
    <div className="nx:relative nx:h-8 nx:w-full">
      <Slider
        {...props}
        disabled={disabled}
        max={max}
        min={min}
        onValueChange={setSliderValue}
        size="comfortable"
        step={step}
        value={sliderValue}
        aria-label={label}
        className={cn('nx:absolute nx:inset-0', className)}
      />
      <div
        className={cn(
          'nx:pointer-events-none nx:absolute nx:inset-0 nx:flex nx:items-center nx:justify-between nx:gap-4 nx:px-4 nx:typography-label-default nx:text-muted-foreground',
          disabled && 'nx:text-disabled-foreground'
        )}
      >
        <span className="nx:min-w-0 nx:truncate">{label}</span>
        <span className="nx:shrink-0 nx:text-right">{displayValue}</span>
      </div>
    </div>
  );
}

export const RangeStyle: Story = {
  ...Range,
  play: async ({ canvasElement }) => {
    const range = canvasElement.querySelector<HTMLElement>(
      '[data-slot="slider-range"]'
    )!;

    await expect(
      Number.parseFloat(getComputedStyle(range).borderTopLeftRadius)
    ).toBe(0);
    await expect(
      Number.parseFloat(getComputedStyle(range).borderTopRightRadius)
    ).toBe(0);
  },
};

export const ExplicitMarkersPlacement: Story = {
  ...ExplicitMarkers,
  play: async ({ canvasElement }) => {
    const markers = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="slider-marker"]')
    );
    const marker = markers[0];

    if (!marker) throw new Error('Expected one future explicit marker.');

    const markerRect = marker.getBoundingClientRect();
    const trackRect = marker
      .closest('[data-slot="slider-track"]')!
      .getBoundingClientRect();
    const markerCenter =
      ((markerRect.left + markerRect.width / 2 - trackRect.left) /
        trackRect.width) *
      100;

    await expect(markerCenter).toBeGreaterThan(74);
    await expect(markerCenter).toBeLessThan(76);
  },
};

export const VerticalStyle: Story = {
  ...Vertical,
  play: async ({ canvasElement }) => {
    const range = canvasElement.querySelector<HTMLElement>(
      '[data-slot="slider-range"]'
    )!;
    const thumb = canvasElement.querySelector<HTMLElement>(
      '[data-slot="slider-thumb"]'
    )!;
    const thumbHandleStyle = getComputedStyle(thumb, '::before');

    await expect(range).toHaveClass('nx:rounded-b-md');
    await expect(range).not.toHaveClass('nx:rounded-t-md');
    await expect(
      Number.parseFloat(getComputedStyle(range).borderTopLeftRadius)
    ).toBe(0);
    await expect(getComputedStyle(thumb).height).toBe('20px');
    await expect(getComputedStyle(thumb).width).toBe('20px');
    await expect(thumbHandleStyle.height).toBe('2px');
    await expect(thumbHandleStyle.width).toBe('20px');
  },
};

// Slider ends follow the active nxds corner mode instead of staying fully pill-shaped.
export const CornerModes: Story = {
  render: () => (
    <div className="nx:grid nx:w-full nx:gap-6">
      {(['square', 'subtle', 'round'] as const).map((radius) => (
        <div
          key={radius}
          data-radius={radius}
          data-testid={`radius-${radius}`}
          className="nx:grid nx:gap-2"
        >
          <span className="nx:typography-label-small nx:text-muted-foreground">
            {radius}
          </span>
          <SliderControlRow
            formatValue={String}
            label="Roundness"
            defaultValue={[2]}
            max={4}
            markers="steps"
            step={1}
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trackRadiusFor = (radius: string) => {
      const track = canvasElement.querySelector<HTMLElement>(
        `[data-testid="radius-${radius}"] [data-slot="slider-track"]`
      )!;

      return Number.parseFloat(getComputedStyle(track).borderTopLeftRadius);
    };
    const rangeRadiusFor = (radius: string) => {
      const range = canvasElement.querySelector<HTMLElement>(
        `[data-testid="radius-${radius}"] [data-slot="slider-range"]`
      )!;

      return Number.parseFloat(getComputedStyle(range).borderTopLeftRadius);
    };

    const squareRadius = trackRadiusFor('square');
    const subtleRadius = trackRadiusFor('subtle');
    const roundRadius = trackRadiusFor('round');
    const squareRangeRadius = rangeRadiusFor('square');
    const subtleRangeRadius = rangeRadiusFor('subtle');
    const roundRangeRadius = rangeRadiusFor('round');

    await expect(squareRadius).toBe(0);
    await expect(subtleRadius).toBeGreaterThan(squareRadius);
    await expect(roundRadius).toBeGreaterThan(subtleRadius);
    await expect(squareRangeRadius).toBe(0);
    await expect(subtleRangeRadius).toBeGreaterThan(squareRangeRadius);
    await expect(roundRangeRadius).toBeGreaterThan(subtleRangeRadius);
  },
};

export const KeyboardInteractionStyle: Story = {
  ...KeyboardInteraction,
  play: async ({ canvasElement }) => {
    const [marker] = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="slider-marker"]')
    );

    if (!marker) throw new Error('Expected one future step marker.');

    const markerRect = marker.getBoundingClientRect();
    const trackRect = marker
      .closest('[data-slot="slider-track"]')!
      .getBoundingClientRect();
    const markerCenter =
      ((markerRect.left + markerRect.width / 2 - trackRect.left) /
        trackRect.width) *
      100;

    await expect(markerCenter).toBeGreaterThan(74);
    await expect(markerCenter).toBeLessThan(76);
    await expect(marker).toHaveClass('nx:bg-muted-foreground-subtle');
    await expect(getComputedStyle(marker).height).toBe('6px');
    await expect(getComputedStyle(marker).width).toBe('6px');
  },
};

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    // The track/range recolor to semantic disabled tokens at full opacity (not
    // a fade).
    const track = canvasElement.querySelector<HTMLElement>(
      '[data-slot="slider-track"]'
    )!;
    await expect(track).toHaveClass('nx:data-disabled:bg-disabled');
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="slider"]'
    )!;
    await expect(getComputedStyle(root).opacity).toBe('1');
  },
};

export const InvalidStyle: Story = {
  ...Invalid,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const thumbs = canvas.getAllByRole('slider');
    for (const thumb of thumbs) {
      await expect(thumb).toHaveClass(
        'nx:aria-invalid:focus-visible:outline-focus-error'
      );
    }
  },
};
