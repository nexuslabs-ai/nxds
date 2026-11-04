import {
  type Meta,
  moduleMetadata,
  type StoryObj,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectExitBeforeUnmount } from '../../stories/support/overlay-motion-test-utils';
import { NxButton } from '../button/button';
import { NxInput } from '../input/input';
import { NxLabel } from '../label/label';

import {
  NxDialog,
  NxDialogBody,
  NxDialogClose,
  NxDialogContent,
  NxDialogDescription,
  NxDialogFooter,
  NxDialogHeader,
  NxDialogTitle,
  NxDialogTrigger,
} from './dialog';

const meta: Meta<NxDialog> = {
  title: 'Components/Dialog',
  parameters: {
    docs: {
      description: {
        component:
          'Dialog opens a modal for a task that interrupts the page. The user can dismiss it without making a choice. It renders into `document.body`, traps focus, and returns focus to the trigger when it closes.',
      },
    },
  },
  component: NxDialog,
  decorators: [
    moduleMetadata({
      imports: [
        NxButton,
        NxDialog,
        NxDialogBody,
        NxDialogClose,
        NxDialogContent,
        NxDialogDescription,
        NxDialogFooter,
        NxDialogHeader,
        NxDialogTitle,
        NxDialogTrigger,
        NxInput,
        NxLabel,
      ],
    }),
  ],
  render: () => ({
    template: `
      <nx-dialog>
        <button nxButton nxDialogTrigger variant="outline">Edit profile</button>
        <ng-template nxDialogContent>
          <div nxDialogHeader>
            <h2 nxDialogTitle>Edit profile</h2>
            <p nxDialogDescription>Make changes to your profile, then save.</p>
          </div>
          <div nxDialogBody>
            <p class="nx:m-0">Your changes apply to every workspace.</p>
          </div>
          <div nxDialogFooter>
            <button nxButton nxDialogClose variant="outline">Cancel</button>
            <button nxButton nxDialogClose>Save changes</button>
          </div>
        </ng-template>
      </nx-dialog>
    `,
  }),
};

export default meta;
type Story = StoryObj<NxDialog>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    template: `
      <nx-dialog>
        <button nxButton nxDialogTrigger variant="outline">Open Dialog</button>
        <ng-template nxDialogContent>
          <div nxDialogHeader>
            <h2 nxDialogTitle>Dialog Title</h2>
            <p nxDialogDescription>This is a basic dialog with a title and description.</p>
          </div>
          <div nxDialogBody>
            <p class="nx:typography-body-default nx:text-foreground">Dialog content goes here. You can add any content you need.</p>
          </div>
          <div nxDialogFooter>
            <button nxButton nxDialogClose variant="outline">Cancel</button>
            <button nxButton>Save</button>
          </div>
        </ng-template>
      </nx-dialog>
    `,
  }),
};

export const WithDescription: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Add a DialogDescription and a short form to edit a profile.',
      },
    },
  },
  render: () => ({
    template: `
      <nx-dialog>
        <button nxButton nxDialogTrigger>Edit Profile</button>
        <ng-template nxDialogContent>
          <div nxDialogHeader>
            <h2 nxDialogTitle>Edit Profile</h2>
            <p nxDialogDescription>Make changes to your profile here. Click save when you're done.</p>
          </div>
          <div nxDialogBody class="nx:grid nx:gap-4 nx:py-4">
            <div class="nx:grid nx:grid-cols-4 nx:items-center nx:gap-4">
              <label nxLabel for="profile-name" class="nx:justify-end">Name</label>
              <input nxInput id="profile-name" value="John Doe" class="nx:col-span-3" />
            </div>
            <div class="nx:grid nx:grid-cols-4 nx:items-center nx:gap-4">
              <label nxLabel for="profile-username" class="nx:justify-end">Username</label>
              <input nxInput id="profile-username" value="@johndoe" class="nx:col-span-3" />
            </div>
          </div>
          <div nxDialogFooter>
            <button nxButton type="submit">Save changes</button>
          </div>
        </ng-template>
      </nx-dialog>
    `,
  }),
};

export const ScrollableContent: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Long DialogBody content scrolls while the header and footer stay in place.',
      },
    },
  },
  render: () => ({
    props: { paragraphs: Array.from({ length: 10 }) },
    template: `
      <nx-dialog>
        <button nxButton nxDialogTrigger variant="outline">Terms & Conditions</button>
        <ng-template nxDialogContent class="nx:max-h-[300px]">
          <div nxDialogHeader>
            <h2 nxDialogTitle>Terms of Service</h2>
            <p nxDialogDescription>Please read the following terms carefully.</p>
          </div>
          <div nxDialogBody class="nx:space-y-4 nx:typography-label-default nx:text-foreground">
            @for (paragraph of paragraphs; track $index) {
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            }
          </div>
          <div nxDialogFooter>
            <button nxButton nxDialogClose variant="outline">Decline</button>
            <button nxButton>Accept</button>
          </div>
        </ng-template>
      </nx-dialog>
    `,
  }),
};

export const PropDrivenContent: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `title`, `description` and `body` on `nxDialogContent` instead of composing the header and body.',
      },
    },
  },
  render: () => ({
    template: `
      <nx-dialog>
        <button nxButton nxDialogTrigger variant="outline">Open invite dialog</button>
        <ng-template
          nxDialogContent
          title="Invite teammate"
          description="Send an invitation to a teammate and assign their first workspace role."
          body="The invitation expires in seven days and can be revoked from team settings."
        >
          <div nxDialogFooter>
            <button nxButton nxDialogClose variant="outline">Cancel</button>
            <button nxButton>Send invite</button>
          </div>
        </ng-template>
      </nx-dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open invite dialog' })
    );

    const dialog = await within(document.body).findByRole('dialog', {
      name: 'Invite teammate',
    });
    await expect(dialog).toHaveAttribute('data-variant', 'default');
    await expect(dialog).toHaveAttribute('data-orientation', 'horizontal');

    await expect(
      document.querySelector('[data-slot="dialog-header"]')
    ).toHaveAttribute('data-variant', 'default');
    await expect(
      document.querySelector('[data-slot="dialog-title"]')
    ).toHaveTextContent('Invite teammate');
    await expect(
      document.querySelector('[data-slot="dialog-description"]')
    ).toHaveTextContent('Send an invitation to a teammate');
    await expect(
      document.querySelector('[data-slot="dialog-body"]')
    ).toHaveClass('nx:px-6');
    await expect(dialog).toHaveTextContent(
      'The invitation expires in seven days'
    );

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

// The dialog renders into document.body, outside the story canvas.
const page = within(document.body);

async function openDialog(canvasElement: HTMLElement) {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Edit profile' })
  );
  return page.findByRole('dialog', { name: 'Edit profile' });
}

async function expectClosed() {
  await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
}

export const ViewportBoundContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Manual check: on a narrow viewport, long DialogBody content scrolls while the close button stays pinned.',
      },
    },
  },
  render: () => ({
    props: { rows: Array.from({ length: 16 }) },
    template: `
      <nx-dialog>
        <button nxButton nxDialogTrigger variant="outline">Open viewport-bound dialog</button>
        <ng-template nxDialogContent>
          <div nxDialogHeader>
            <h2 nxDialogTitle>Viewport bounded dialog</h2>
            <p nxDialogDescription>Long modal content stays within the stable visible viewport.</p>
          </div>
          <div nxDialogBody class="nx:space-y-4 nx:typography-label-default nx:text-foreground">
            @for (row of rows; track $index) {
            <p>A representative row of dialog content that makes the modal tall enough to exercise its viewport max-height contract.</p>
            }
          </div>
          <div nxDialogFooter>
            <button nxButton nxDialogClose variant="outline">Close viewport-bound dialog</button>
          </div>
        </ng-template>
      </nx-dialog>
    `,
  }),
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
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });
    await expect(body).toHaveAttribute('tabindex', '0');
    await expect(body).toHaveClass(
      'nx:min-h-0',
      'nx:overflow-y-auto',
      'nx:focus-visible:outline-2',
      'nx:focus-visible:outline-focus-default',
      'nx:focus-visible:[outline-offset:-2px]'
    );
    expect(body).not.toContainElement(closeButton);

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

export const CloseButtonFocus: Story = {
  render: () => ({
    template: `
      <nx-dialog>
        <button nxButton nxDialogTrigger variant="outline">Open focus dialog</button>
        <ng-template nxDialogContent>
          <div nxDialogHeader>
            <h2 nxDialogTitle>Close button focus</h2>
            <p nxDialogDescription>The close button keeps the canonical focus outline.</p>
          </div>
        </ng-template>
      </nx-dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open focus dialog' })
    );

    const dialog = await within(document.body).findByRole('dialog');
    const closeButton = within(dialog).getByRole('button', { name: 'Close' });

    await waitFor(() => expect(closeButton).toHaveFocus());
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

export const OpenCloseInteraction: Story = {
  render: () => ({
    template: `
      <nx-dialog>
        <button nxButton nxDialogTrigger variant="outline">Open Dialog</button>
        <ng-template nxDialogContent>
          <div nxDialogHeader>
            <h2 nxDialogTitle>Interaction Test</h2>
            <p nxDialogDescription>Testing open and close behavior.</p>
          </div>
          <div nxDialogFooter>
            <button nxButton nxDialogClose>Dismiss</button>
          </div>
        </ng-template>
      </nx-dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Dialog should not be visible initially
    const trigger = canvas.getByRole('button', { name: 'Open Dialog' });
    await expect(trigger).toBeInTheDocument();

    // Open the dialog
    await userEvent.click(trigger);

    // Dialog content should now be visible (in document body)
    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await expect(dialog).toHaveAttribute('data-slot', 'dialog-content');

    // Title should be visible
    const title = within(dialog).getByText('Interaction Test');
    await expect(title).toBeInTheDocument();

    // Close the dialog using the footer button (not the X button which also has "Close" sr-only text)
    const dismissButton = within(dialog).getByRole('button', {
      name: 'Dismiss',
    });
    await userEvent.click(dismissButton);

    await expectExitBeforeUnmount(dialog);

    // Reopen and close with the corner close button
    await userEvent.click(trigger);
    const reopened = await within(document.body).findByRole('dialog');
    await userEvent.click(
      within(reopened).getByRole('button', { name: 'Close' })
    );
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const KeyboardInteraction: Story = {
  render: () => ({
    template: `
      <nx-dialog>
        <button nxButton nxDialogTrigger variant="outline">Open Dialog</button>
        <ng-template nxDialogContent>
          <div nxDialogHeader>
            <h2 nxDialogTitle>Keyboard Test</h2>
            <p nxDialogDescription>Testing keyboard interactions.</p>
          </div>
          <div nxDialogFooter>
            <button nxButton nxDialogClose>Close</button>
          </div>
        </ng-template>
      </nx-dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open dialog by clicking the trigger
    const trigger = canvas.getByRole('button', { name: 'Open Dialog' });
    await userEvent.click(trigger);

    // Dialog should be open
    const dialog = await within(document.body).findByRole('dialog');
    await expect(dialog).toBeInTheDocument();

    // Close with Escape key
    await userEvent.keyboard('{Escape}');

    // Wait for dialog to be removed from DOM
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    template: `
      <nx-dialog>
        <button nxButton nxDialogTrigger variant="outline">Open Dialog</button>
        <ng-template nxDialogContent>
          <div nxDialogHeader>
            <h2 nxDialogTitle>Data Attributes</h2>
            <p nxDialogDescription>Testing data-slot attributes.</p>
          </div>
          <div nxDialogBody>
            <p class="nx:typography-body-default">Content here</p>
          </div>
          <div nxDialogFooter>
            <button nxButton nxDialogClose>Close</button>
          </div>
        </ng-template>
      </nx-dialog>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the dialog
    const trigger = canvas.getByRole('button', { name: 'Open Dialog' });
    await userEvent.click(trigger);

    // Wait for dialog to be visible
    await within(document.body).findByRole('dialog');

    // Check data-slot attributes using querySelector on document body
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="dialog-overlay"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-content"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-header"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-title"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-description"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-footer"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-close-button"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('[data-slot="dialog-body"]')
      ).toBeInTheDocument();
    });

    const content = document.querySelector('[data-slot="dialog-content"]');
    await expect(content).toHaveAttribute('data-variant', 'default');
    await expect(content).toHaveAttribute('data-orientation', 'horizontal');
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
      document.querySelector('[data-slot="dialog-header"]')
    ).toHaveAttribute('data-variant', 'default');
    await expect(
      document.querySelector('[data-slot="dialog-footer"]')
    ).toHaveClass('nx:px-6');
    await expect(
      document.querySelector('[data-slot="dialog-footer"]')
    ).toHaveAttribute('data-orientation', 'horizontal');
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
    await expect(
      document.querySelector('[data-slot="dialog-body"]')
    ).toHaveAttribute('tabindex', '0');

    // Close the dialog
    await userEvent.keyboard('{Escape}');
  },
};

export const OverlayClick: Story = {
  play: async ({ canvasElement }) => {
    await openDialog(canvasElement);
    const overlay = document.querySelector<HTMLElement>(
      '[data-slot="dialog-overlay"]'
    );

    await userEvent.click(overlay!);
    await expectClosed();
  },
};

export const LocksPageScroll: Story = {
  play: async ({ canvasElement }) => {
    const before = document.body.style.overflow;

    await openDialog(canvasElement);
    await expect(document.body.style.overflow).toBe('hidden');

    await userEvent.keyboard('{Escape}');
    await expectClosed();
    await expect(document.body.style.overflow).toBe(before);
  },
};
