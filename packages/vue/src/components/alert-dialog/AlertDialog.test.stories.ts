import type { StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectExitBeforeUnmount } from '../../stories/support/overlay-motion-test-utils';

import alertDialogMeta, {
  Centered,
  FocusManagement,
  ViewportBoundContent,
} from './AlertDialog.stories';

const meta = {
  ...alertDialogMeta,
  title: 'Tests/AlertDialog',
};

export default meta;
type Story = StoryObj<typeof alertDialogMeta>;

export const ViewportBoundContentStyle: Story = {
  ...ViewportBoundContent,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Show viewport alert' })
    );

    const dialog = await within(document.body).findByRole('alertdialog', {
      name: 'Viewport bounded alert dialog',
    });
    await expect(dialog).toHaveClass(
      'nx:max-h-[calc(100svh-2rem)]',
      'nx:overflow-hidden',
      'nx:py-6',
      'nx:gap-4'
    );
    await expect(dialog).not.toHaveClass('nx:p-6');
    await expect(
      document.querySelector('[data-slot="alert-dialog-header"]')
    ).toHaveClass('nx:px-6');
    await expect(
      document.querySelector('[data-slot="alert-dialog-footer"]')
    ).toHaveClass('nx:px-6');
    await expect(
      document.querySelector('[data-slot="alert-dialog-body"]')
    ).toHaveClass(
      'nx:px-6',
      'nx:min-h-0',
      'nx:overflow-y-auto',
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel viewport alert' })
    );
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeNull();
    });
  },
};

export const CenteredStyle: Story = {
  ...Centered,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Show centered dialog' })
    );

    const dialog = await within(document.body).findByRole('alertdialog');
    await expect(dialog.className).toContain('nx:max-w-xs');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="alert-dialog-content"]')
      ).toBeNull();
    });
  },
};

export const FocusManagementMotion: Story = {
  ...FocusManagement,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Show focus dialog' })
    );

    const dialog = await within(document.body).findByRole('alertdialog');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' })
    );

    await expectExitBeforeUnmount(dialog);
  },
};
