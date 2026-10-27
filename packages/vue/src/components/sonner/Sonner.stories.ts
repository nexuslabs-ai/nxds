import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { defineComponent } from 'vue';
import { toast as hostToast, Toaster as HostToaster } from 'vue-sonner';

import { Button } from '../button';

import { toast, Toaster, useSonner } from '.';

const meta = {
  title: 'Components/Sonner',
  component: Toaster,
  parameters: {
    docs: {
      description: {
        component:
          'Toaster shows short, temporary notifications. Mount it once near your app root, then call `toast()` from anywhere. For a message that stays on the page, use Alert.',
      },
    },
    layout: 'centered',
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Button, Toaster },
    setup: () => ({
      showToast: () => toast('Event has been created'),
      showSuccessToast: () => toast.success('Changes saved'),
      showErrorToast: () => toast.error('Something went wrong'),
      showWarningToast: () => toast.warning('Your session is about to expire'),
      showInfoToast: () => toast.info('A new version is available'),
      showUndoToast: () =>
        toast('File deleted', {
          action: { label: 'Undo', onClick: () => toast('File restored') },
        }),
      showPromiseToast: () =>
        toast.promise(
          new Promise<void>((resolve) => {
            setTimeout(resolve, 1500);
          }),
          {
            loading: 'Saving…',
            success: 'Settings saved',
            error: 'Could not save',
          }
        ),
    }),
    template: `
      <div class="nx:flex nx:flex-wrap nx:gap-2">
        <Button variant="outline" @click="showToast">Default</Button>
        <Button variant="outline" @click="showSuccessToast">Success</Button>
        <Button variant="outline" @click="showErrorToast">Error</Button>
        <Button variant="outline" @click="showWarningToast">Warning</Button>
        <Button variant="outline" @click="showInfoToast">Info</Button>
        <Button variant="outline" @click="showUndoToast">With action</Button>
        <Button variant="outline" @click="showPromiseToast">Promise</Button>
      </div>
      <Toaster rich-colors />
    `,
  }),
};

export const ClickInteraction: Story = {
  render: () => ({
    components: { Button, Toaster },
    setup: () => ({ toast }),
    template: `
      <Button @click="toast('Event has been created')">Show toast</Button>
      <Toaster />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));

    // Sonner renders the toast outside the canvas subtree — query the document.
    const status = await within(document.body).findByText(
      'Event has been created'
    );
    await expect(status).toBeInTheDocument();
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: { Toaster },
    template: '<Toaster />',
  }),
  play: async ({ canvasElement }) => {
    const toaster = canvasElement.querySelector('[data-slot="toaster"]');
    await expect(toaster).toBeInTheDocument();
    await expect(toaster).toHaveAttribute('data-slot', 'toaster');
  },
};

const NxdsToastCount = defineComponent({
  setup: () => useSonner(),
  template:
    '<output aria-label="nxds toast count">{{ toasts.length }}</output>',
});

// A host app's own sonner Toaster sits beside nxds's. Each shows only its own
// toasts, and nxds's dismiss and getToasts leave the host's toast alone.
export const BesideHostToaster: Story = {
  render: () => ({
    components: { Button, HostToaster, NxdsToastCount, Toaster },
    setup: () => ({ hostToast, toast }),
    template: `
      <div class="nx:flex nx:gap-2">
        <Button @click="toast('Saved in nxds')">nxds toast</Button>
        <Button variant="outline" @click="hostToast('Saved in host')">Host toast</Button>
      </div>
      <NxdsToastCount />
      <Toaster />
      <HostToaster container-aria-label="App notifications" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const count = canvas.getByRole('status', { name: 'nxds toast count' });
    await userEvent.click(canvas.getByRole('button', { name: 'nxds toast' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Host toast' }));

    const nxdsToast = await body.findByText('Saved in nxds');
    const hostToastText = await body.findByText('Saved in host');
    await expect(body.getAllByText('Saved in nxds')).toHaveLength(1);
    await expect(body.getAllByText('Saved in host')).toHaveLength(1);
    await expect(nxdsToast.closest('[data-slot="toaster"]')).not.toBeNull();
    await expect(hostToastText.closest('[data-slot="toaster"]')).toBeNull();
    const titles = toast.getToasts().map((entry) => entry.title);
    await expect(titles).toContain('Saved in nxds');
    await expect(titles).not.toContain('Saved in host');
    // useSonner counts only the nxds toast.
    await expect(count).toHaveTextContent('1');

    toast.dismiss();
    await waitFor(async () => {
      await expect(body.queryByText('Saved in nxds')).toBeNull();
    });
    await expect(body.getByText('Saved in host')).toBeInTheDocument();
    hostToast.dismiss();
  },
};

export const AllVariants: Story = {
  render: () => ({
    components: { Button, Toaster },
    setup: () => ({ toast }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <Button variant="outline" @click="toast('Default toast')">Default</Button>
        <Button variant="outline" @click="toast.success('Success toast')">Success</Button>
        <Button variant="outline" @click="toast.error('Error toast')">Error</Button>
        <Button variant="outline" @click="toast.warning('Warning toast')">Warning</Button>
        <Button variant="outline" @click="toast.info('Info toast')">Info</Button>
        <Toaster rich-colors />
      </div>
    `,
  }),
};
