import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import commandMeta, { Disabled, WithDataAttributes } from './Command.stories';

const meta = {
  ...commandMeta,
  title: 'Tests/Command',
};

export default meta;
type Story = StoryObj<typeof commandMeta>;

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledItem = canvas.getByRole('option', {
      name: 'Search Emoji (disabled)',
    });

    // Disabled items use a semantic text token at full opacity (not a fade).
    await expect(disabledItem).toHaveClass(
      'nx:data-[disabled=true]:text-disabled-foreground'
    );
    await expect(getComputedStyle(disabledItem).opacity).toBe('1');
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const shortcut = canvasElement.querySelector(
      '[data-slot="command-shortcut"]'
    );
    await expect(shortcut).toHaveClass('nx:typography-shortcut');
    await expect(shortcut).not.toHaveClass(/tracking-/);
  },
};
