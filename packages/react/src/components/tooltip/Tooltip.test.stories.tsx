import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';

import type { Tooltip } from './tooltip';
import tooltipMeta, { HoverInteraction } from './Tooltip.stories';

const meta: Meta<typeof Tooltip> = {
  ...tooltipMeta,
  title: 'Tests/Tooltip',
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

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

    await userEvent.unhover(trigger);

    await expectExitBeforeUnmount(tooltip);
  },
};
