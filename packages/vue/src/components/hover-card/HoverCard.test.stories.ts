import type { StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';

import hoverCardMeta, { OpenCloseInteraction } from './HoverCard.stories';

const meta = {
  ...hoverCardMeta,
  title: 'Tests/HoverCard',
};

export default meta;
type Story = StoryObj<typeof hoverCardMeta>;

export const OpenCloseInteractionMotion: Story = {
  ...OpenCloseInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: '@nxds' });

    await userEvent.hover(trigger);
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="hover-card-content"]')
      ).toBeInTheDocument();
    });
    const content = document.querySelector('[data-slot="hover-card-content"]');
    await expectInterruptibleOverlayMotion(content);

    await userEvent.unhover(trigger);
    // Reka closes only once the pointer leaves the trigger-to-card grace area.
    await userEvent.pointer({
      coords: {
        clientX: window.innerWidth - 1,
        clientY: window.innerHeight - 1,
      },
    });
    await expectExitBeforeUnmount(content);
  },
};
