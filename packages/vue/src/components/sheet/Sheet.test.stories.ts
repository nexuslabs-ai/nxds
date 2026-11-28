import type { StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';

import sheetMeta, {
  OpenCloseInteraction,
  WithDataAttributes,
} from './Sheet.stories';

const meta = {
  ...sheetMeta,
  title: 'Tests/Sheet',
};

export default meta;
type Story = StoryObj<typeof sheetMeta>;

export const OpenCloseInteractionMotion: Story = {
  ...OpenCloseInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Sheet' }));

    const sheet = await within(document.body).findByRole('dialog');
    await expectInterruptibleOverlayMotion(sheet);
    await expect(sheet).toHaveClass('nx:transition-[translate]');
    await expect(sheet).toHaveClass('nx:data-[state=closed]:translate-x-full');
    const overlay = document.querySelector('[data-slot="sheet-overlay"]');
    await expectInterruptibleOverlayMotion(overlay);

    await userEvent.click(
      within(sheet).getByRole('button', { name: 'Dismiss' })
    );

    await expectExitBeforeUnmount(document.querySelector('[role="dialog"]'));
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Sheet' }));
    await within(document.body).findByRole('dialog');

    await expect(
      document.querySelector('[data-slot="sheet-content"]')
    ).toHaveClass('nx:h-svh', 'nx:overflow-hidden');

    await expect(
      document.querySelector('[data-slot="sheet-body"]')
    ).toHaveClass(
      'nx:min-h-0',
      'nx:overflow-y-auto',
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );

    await expect(
      document.querySelector('[data-slot="sheet-close-button"]')
    ).toHaveClass('nx:right-6', 'nx:top-6');

    await userEvent.keyboard('{Escape}');
  },
};
