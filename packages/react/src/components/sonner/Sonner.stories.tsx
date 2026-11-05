import type { Meta, StoryObj } from '@storybook/react';
import { Star } from 'lucide-react';
import { toast as hostToast, Toaster as HostToaster } from 'sonner';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button/button';

import { toast, Toaster, useSonner } from './sonner';

const meta: Meta<typeof Toaster> = {
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
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  tags: ['docs'],
  render: () => {
    const showUndoToast = () =>
      toast('File deleted', {
        action: { label: 'Undo', onClick: () => toast('File restored') },
      });
    const showPromiseToast = () =>
      toast.promise(
        new Promise<void>((resolve) => {
          setTimeout(resolve, 1500);
        }),
        {
          loading: 'Saving…',
          success: 'Settings saved',
          error: 'Could not save',
        }
      );

    return (
      <>
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          <Button
            variant="outline"
            onClick={() => toast('Event has been created')}
          >
            Default
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success('Changes saved')}
          >
            Success
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error('Something went wrong')}
          >
            Error
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.warning('Your session is about to expire')}
          >
            Warning
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info('A new version is available')}
          >
            Info
          </Button>
          <Button variant="outline" onClick={showUndoToast}>
            With action
          </Button>
          <Button variant="outline" onClick={showPromiseToast}>
            Promise
          </Button>
        </div>
        <Toaster richColors />
      </>
    );
  },
};

export const ClickInteraction: Story = {
  render: () => (
    <>
      <Button onClick={() => toast('Event has been created')}>
        Show toast
      </Button>
      <Toaster />
    </>
  ),
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
  render: () => <Toaster />,
  play: async ({ canvasElement }) => {
    const toaster = canvasElement.querySelector('[data-slot="toaster"]');
    await expect(toaster).toBeInTheDocument();
    await expect(toaster).toHaveAttribute('data-slot', 'toaster');
  },
};

/** The element `selector` matches in the toast that shows `text`. */
function toastPart(text: HTMLElement, selector: string) {
  const part = text.closest('[data-sonner-toast]')?.querySelector(selector);
  if (!part) throw new Error(`The toast has no ${selector}`);
  return part;
}

/** The size an icon is drawn at, and the line its first shape draws. */
function drawnLine(icon: Element) {
  const shape = icon.querySelector('path, line') ?? icon;
  const style = getComputedStyle(shape);
  return {
    size: parseFloat(getComputedStyle(icon).width),
    line: parseFloat(style.strokeWidth),
    vectorEffect: style.vectorEffect,
  };
}

/** The line the stroke tokens set for an icon of `size` px. */
function expectedLine(element: Element, size: number) {
  const style = getComputedStyle(element);
  const base = parseFloat(style.getPropertyValue('--nx-icon-stroke-base'));
  const ratio = parseFloat(style.getPropertyValue('--nx-icon-stroke-ratio'));
  return {
    size,
    line: base + size * ratio,
    vectorEffect: 'non-scaling-stroke',
  };
}

// A toast's icon and its 12px close icon draw the line the stroke tokens set
// for their size. An icon in your own toast content keeps the line its library
// draws.
export const IconStroke: Story = {
  render: () => {
    const showToasts = () => {
      toast('Project starred', { icon: <Star className="nx:size-4" /> });
      toast.custom(() => (
        <div className="nx:flex nx:items-center nx:gap-2">
          <Star />
          Pinned to the top
        </div>
      ));
    };
    return (
      <>
        <Button onClick={showToasts}>Show toasts</Button>
        <Toaster closeButton />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Show toasts' }));

    const starred = await body.findByText('Project starred');
    const pinned = await body.findByText('Pinned to the top');
    await expect(drawnLine(toastPart(starred, '[data-icon] svg'))).toEqual(
      expectedLine(canvasElement, 16)
    );
    await expect(
      drawnLine(toastPart(starred, '[data-close-button] svg'))
    ).toEqual(expectedLine(canvasElement, 12));
    const contentIcon = toastPart(pinned, 'svg');
    await expect(drawnLine(contentIcon)).toEqual({
      size: 24,
      line: Number(contentIcon.getAttribute('stroke-width')),
      vectorEffect: 'none',
    });
    toast.dismiss();
  },
};

function NxdsToastCount() {
  const { toasts } = useSonner();
  return <output aria-label="nxds toast count">{toasts.length}</output>;
}

// A host app's own sonner Toaster sits beside nxds's. Each shows only its own
// toasts, and nxds's dismiss and getToasts leave the host's toast alone.
export const BesideHostToaster: Story = {
  render: () => (
    <>
      <div className="nx:flex nx:gap-2">
        <Button onClick={() => toast('Saved in nxds')}>nxds toast</Button>
        <Button variant="outline" onClick={() => hostToast('Saved in host')}>
          Host toast
        </Button>
      </div>
      <NxdsToastCount />
      <Toaster />
      <HostToaster containerAriaLabel="App notifications" />
    </>
  ),
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
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <Button variant="outline" onClick={() => toast('Default toast')}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success('Success toast')}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.error('Error toast')}>
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.warning('Warning toast')}>
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info('Info toast')}>
        Info
      </Button>
      <Toaster richColors />
    </div>
  ),
};
