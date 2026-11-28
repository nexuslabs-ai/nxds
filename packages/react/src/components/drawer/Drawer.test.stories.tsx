import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';

import type { Drawer } from './drawer';
import drawerMeta, {
  HandleVisibilityWhileOpen,
  OpenCloseInteraction,
  ScrollableContent,
  WithDataAttributes,
} from './Drawer.stories';

const meta: Meta<typeof Drawer> = {
  ...drawerMeta,
  title: 'Tests/Drawer',
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const waitForDrawerToClose = async () => {
  await waitFor(
    () => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    },
    { timeout: 3000 }
  );
};

export const ScrollableContentStyle: Story = {
  ...ScrollableContent,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Details' }));

    const drawer = await within(document.body).findByRole('dialog');
    const scrollArea = within(drawer).getByTestId('drawer-scroll-area');

    await expect(scrollArea).toHaveClass(
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );
    await waitFor(() => {
      expect(scrollArea.scrollHeight).toBeGreaterThan(scrollArea.clientHeight);
    });

    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Close' })
    );

    await waitForDrawerToClose();
  },
};

export const OpenCloseInteractionMotion: Story = {
  ...OpenCloseInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Drawer' }));

    const drawer = await within(document.body).findByRole('dialog');
    const overlay = document.querySelector('[data-slot="drawer-overlay"]');
    await expectInterruptibleOverlayMotion(overlay);

    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Dismiss' })
    );

    await expectExitBeforeUnmount(overlay);
    await waitForDrawerToClose();
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Drawer' }));
    await within(document.body).findByRole('dialog');

    await expect(
      document.querySelector('[data-slot="drawer-content"]')
    ).toHaveClass('nx:overflow-hidden');
    await expect(
      document.querySelector('[data-slot="drawer-body"]')
    ).toHaveClass(
      'nx:min-h-0',
      'nx:overflow-y-auto',
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );

    await userEvent.keyboard('{Escape}');
  },
};

export const HandleVisibilityWhileOpenGeometry: Story = {
  ...HandleVisibilityWhileOpen,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open handle toggle' })
    );
    const drawer = await within(document.body).findByRole('dialog');
    const header = drawer.querySelector<HTMLElement>(
      '[data-slot="drawer-header"]'
    );
    const hiddenOffset = header!.offsetTop;

    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Show handle' })
    );
    await expect(header!.offsetTop).toBeGreaterThanOrEqual(hiddenOffset + 8);
    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Hide handle' })
    );
    await expect(header!.offsetTop).toBe(hiddenOffset);

    await userEvent.click(
      within(drawer).getByRole('button', { name: 'Close preview' })
    );
    await waitForDrawerToClose();
  },
};
