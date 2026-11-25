import type { StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';

import tooltipMeta, { HoverInteraction } from './Tooltip.stories';

const meta = {
  ...tooltipMeta,
  title: 'Tests/Tooltip',
};

export default meta;
type Story = StoryObj<typeof tooltipMeta>;

export const HoverInteractionMotion: Story = {
  ...HoverInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Hover me' });

    await userEvent.hover(trigger);
    await waitFor(() => {
      const tooltip = document.querySelector('[data-slot="tooltip-content"]');
      expect(tooltip).toBeInTheDocument();
    });
    const tooltip = document.querySelector('[data-slot="tooltip-content"]');
    await expectInterruptibleOverlayMotion(tooltip, {
      oldOpenAnimationClass: 'nx:animate-in',
    });

    // Reka closes only once the pointer leaves the trigger-to-tooltip grace
    // area.
    await userEvent.unhover(trigger);
    await userEvent.pointer({
      coords: {
        clientX: window.innerWidth - 1,
        clientY: window.innerHeight - 1,
      },
    });

    await expectExitBeforeUnmount(tooltip);
  },
};
