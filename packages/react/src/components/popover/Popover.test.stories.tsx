import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
  expectPlacedBelow,
} from '../../stories/support/overlay-motion-test-utils';

import type { Popover } from './popover';
import popoverMeta, { OpenCloseInteraction } from './Popover.stories';

const meta: Meta<typeof Popover> = {
  ...popoverMeta,
  title: 'Tests/Popover',
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const OpenCloseInteractionMotion: Story = {
  ...OpenCloseInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open popover' }));
    const content = await within(document.body).findByText('Popover content');
    const panel = content.closest('[data-slot="popover-content"]');

    await expectInterruptibleOverlayMotion(panel);

    await userEvent.keyboard('{Escape}');
    await expectExitBeforeUnmount(panel);
  },
};

export const OpenCloseInteractionPlacement: Story = {
  ...OpenCloseInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open popover' });

    await userEvent.click(trigger);
    const content = await within(document.body).findByText('Popover content');
    const panel = content.closest('[data-slot="popover-content"]');

    await expectPlacedBelow(panel, trigger);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="popover-content"]')
      ).toBeNull();
    });
  },
};
