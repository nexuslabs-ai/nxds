import { DENSITY_OPTIONS } from '@nxds/core';
import { PhTextItalic } from '@phosphor-icons/vue';
import type { StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button';

import toggleMeta, {
  Disabled,
  InvalidOutlinePrimary,
  KeyboardInteraction,
  Sizes,
} from './Toggle.stories';

import { Toggle } from '.';

const meta = {
  ...toggleMeta,
  title: 'Tests/Toggle',
};

export default meta;
type Story = StoryObj<typeof toggleMeta>;

function tokenColor(element: Element, name: string) {
  return getComputedStyle(element)
    .getPropertyValue(`--nx-color-${name}`)
    .trim();
}

export const SizesStyle: Story = {
  ...Sizes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sm = canvas.getByRole('button', { name: 'Small' });
    const md = canvas.getByRole('button', { name: 'Default' });
    const lg = canvas.getByRole('button', { name: 'Large' });

    await expect(sm).toHaveClass('nx:typography-label-small');
    await expect(sm).toHaveClass('nx:min-h-8', 'nx:px-3', 'nx:gap-1.5');

    await expect(md).toHaveClass('nx:typography-label-default');
    await expect(md).toHaveClass('nx:min-h-10', 'nx:px-4', 'nx:gap-2');
    await expect(lg).toHaveClass('nx:typography-label-default');
    await expect(lg).toHaveClass('nx:min-h-12', 'nx:px-8', 'nx:gap-2.5');
  },
};

// Pressed outline-primary keeps a transparent background, takes the primary
// active border, and never changes size.
export const KeyboardInteractionStyle: Story = {
  ...KeyboardInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Italic' });
    const initial = toggle.getBoundingClientRect();
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await expect(getComputedStyle(toggle).outlineWidth).toBe('2px');
    await expect(getComputedStyle(toggle).outlineColor).toBe(
      tokenColor(toggle, 'focus-default')
    );
    await userEvent.keyboard('{Enter}');
    await expect(getComputedStyle(toggle).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)'
    );
    // border-color eases through transition-control; wait for it to settle.
    await waitFor(() =>
      expect(getComputedStyle(toggle).borderTopColor).toBe(
        tokenColor(toggle, 'primary-border-active')
      )
    );
    await userEvent.keyboard(' ');
    const final = toggle.getBoundingClientRect();
    await expect([final.width, final.height]).toEqual([
      initial.width,
      initial.height,
    ]);
  },
};

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Bold' });

    // Disabled state uses a semantic text token at full opacity (not a fade).
    await expect(toggle).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(toggle).opacity).toBe('1');
  },
};

export const InvalidOutlinePrimaryStyle: Story = {
  ...InvalidOutlinePrimary,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const resting = canvas.getByRole('button', { name: 'Invalid resting' });
    const selected = canvas.getByRole('button', { name: 'Invalid selected' });
    await expect(getComputedStyle(resting).borderTopColor).toBe(
      tokenColor(resting, 'error-border')
    );
    await expect(getComputedStyle(selected).borderTopColor).toBe(
      tokenColor(selected, 'border-error-active')
    );
    for (const toggle of [resting, selected]) {
      await userEvent.tab();
      await expect(toggle).toHaveFocus();
      await expect(getComputedStyle(toggle).outlineColor).toBe(
        tokenColor(toggle, 'focus-error')
      );
    }
  },
};

const DENSITIES = DENSITY_OPTIONS.map((option) => option.value);
const SIZES = ['sm', 'default', 'lg'] as const;

export const HeightAtEveryDensity: Story = {
  render: () => ({
    components: { Button, PhTextItalic, Toggle },
    setup: () => ({ densities: DENSITIES, sizes: SIZES }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-3">
        <div
          v-for="density in densities"
          :key="density"
          :data-density="density"
          :data-testid="'row-' + density"
          class="nx:flex nx:items-center nx:gap-3"
        >
          <Toggle v-for="size in sizes" :key="size" :size="size">Bold</Toggle>
          <Toggle aria-label="Italic">
            <PhTextItalic />
          </Toggle>
          <Toggle variant="outline">Bold</Toggle>
          <Button v-for="size in sizes" :key="size" :size="size" variant="outline">
            Save
          </Button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heights = SIZES.map(() => [] as number[]);
    for (const density of DENSITIES) {
      const [small, standard, large, icon, outline, ...buttons] = within(
        canvas.getByTestId(`row-${density}`)
      )
        .getAllByRole('button')
        .map((control) => control.getBoundingClientRect().height);
      // An icon or a border doesn't change the height.
      await expect(icon).toBe(standard);
      await expect(outline).toBe(standard);
      // Each size matches the Button of the same size.
      await expect([small, standard, large]).toEqual(buttons);
      [small, standard, large].forEach((height, index) =>
        heights[index]!.push(height!)
      );
    }
    // Each size grows at every step from Tight to Spacious.
    for (const sizeHeights of heights) {
      await expect(new Set(sizeHeights).size).toBe(DENSITIES.length);
      await expect(sizeHeights).toEqual([...sizeHeights].sort((a, b) => a - b));
    }
  },
};
