import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';

import type { HoverCard } from './hover-card';
import hoverCardMeta, { OpenCloseInteraction } from './HoverCard.stories';

const meta: Meta<typeof HoverCard> = {
  ...hoverCardMeta,
  title: 'Tests/HoverCard',
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

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
    await expectExitBeforeUnmount(content);
  },
};
