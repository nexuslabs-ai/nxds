import type { StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectExitBeforeUnmount } from '../../stories/support/overlay-motion-test-utils';
import { Button } from '../button';

import dialogMeta, {
  CloseButtonFocus,
  NestedOverlayStacking,
  OpenCloseInteraction,
  PropDrivenContent,
  ViewportBoundContent,
  WithDataAttributes,
} from './Dialog.stories';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '.';

const meta = {
  ...dialogMeta,
  title: 'Tests/Dialog',
};

export default meta;
type Story = StoryObj<typeof dialogMeta>;

export const PropDrivenContentStyle: Story = {
  ...PropDrivenContent,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open invite dialog' })
    );

    await within(document.body).findByRole('dialog', {
      name: 'Invite teammate',
    });
    await expect(
      document.querySelector('[data-slot="dialog-body"]')
    ).toHaveClass('nx:px-6');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const ViewportBoundContentStyle: Story = {
  ...ViewportBoundContent,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open viewport-bound dialog' })
    );

    const dialog = await within(document.body).findByRole('dialog', {
      name: 'Viewport bounded dialog',
    });

    await expect(dialog).toHaveClass(
      'nx:max-h-[calc(100svh-2rem)]',
      'nx:overflow-hidden'
    );

    const body = document.querySelector('[data-slot="dialog-body"]');
    await expect(body).toHaveClass(
      'nx:min-h-0',
      'nx:overflow-y-auto',
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );

    await userEvent.click(
      within(dialog).getByRole('button', {
        name: 'Close viewport-bound dialog',
      })
    );
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const CloseButtonFocusStyle: Story = {
  ...CloseButtonFocus,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open focus dialog' })
    );

    const dialog = await within(document.body).findByRole('dialog');
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });

    await expect(closeButton).toHaveClass(
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default'
    );
    await expect(closeButton).toHaveClass('nx:right-6', 'nx:top-6');
    await expect(closeButton).toHaveClass(
      'nx:hover:bg-container-hover',
      'nx:focus-visible:bg-container-hover'
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const CloseButtonTargetAtSmallScale: Story = {
  globals: { uiScale: 'small' },
  render: () => ({
    components: {
      Button,
      Dialog,
      DialogContent,
      DialogDescription,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
    },
    template: `
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="outline">Open settings dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>The close button keeps a 24px target at every UI scale.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open settings dialog' })
    );

    const dialog = await within(document.body).findByRole('dialog');
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    const box = closeButton.getBoundingClientRect();
    const before =
      parseFloat(getComputedStyle(closeButton, '::before').width) || 0;
    // At the Small scale the button shrinks, but its target stays 24px.
    await expect(
      Math.min(Math.max(box.width, before), Math.max(box.height, before))
    ).toBeGreaterThanOrEqual(24);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

/**
 * Verifies the z-index layering contract: a DropdownMenu opened inside a Dialog
 * must render *above* the dialog (popover z=70 > modal z=50) so the menu stays
 * usable when nested. See issue #91.
 */
export const NestedOverlayStackingStyle: Story = {
  ...NestedOverlayStacking,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    // Open the dialog (modal layer).
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open stacking dialog' })
    );
    const dialog = await body.findByRole('dialog');
    await expect(dialog).toHaveClass('nx:z-modal');

    // Open the dropdown nested inside the dialog (popover layer).
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Open menu' })
    );
    const menu = await body.findByRole('menu');
    await expect(menu).toHaveClass('nx:z-popover');

    // The popover layer must stack above the modal layer.
    const zIndexOf = (el: Element) => Number(getComputedStyle(el).zIndex);
    await expect(zIndexOf(menu)).toBeGreaterThan(zIndexOf(dialog));

    // Cleanup: close the menu, then the dialog.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="menu"]')).toBeNull();
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const OpenCloseInteractionMotion: Story = {
  ...OpenCloseInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));

    const dialog = await within(document.body).findByRole('dialog');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Dismiss' })
    );

    await expectExitBeforeUnmount(dialog);
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));
    await within(document.body).findByRole('dialog');

    const content = document.querySelector('[data-slot="dialog-content"]');
    await expect(content).toHaveClass(
      'nx:py-6',
      'nx:gap-4',
      'nx:max-h-[calc(100svh-2rem)]',
      'nx:overflow-hidden'
    );
    await expect(content).not.toHaveClass('nx:p-6');
    await expect(
      document.querySelector('[data-slot="dialog-header"]')
    ).toHaveClass('nx:px-6');
    await expect(
      document.querySelector('[data-slot="dialog-footer"]')
    ).toHaveClass('nx:px-6');
    await expect(
      document.querySelector('[data-slot="dialog-body"]')
    ).toHaveClass(
      'nx:px-6',
      'nx:min-h-0',
      'nx:overflow-y-auto',
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );

    // Close the dialog
    await userEvent.keyboard('{Escape}');
  },
};
