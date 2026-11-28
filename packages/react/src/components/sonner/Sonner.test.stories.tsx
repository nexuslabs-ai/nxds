import type { Meta, StoryObj } from '@storybook/react-vite';
import { Star } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../button/button';

import { toast, Toaster } from './sonner';
import sonnerMeta from './Sonner.stories';

const meta: Meta<typeof Toaster> = {
  ...sonnerMeta,
  title: 'Tests/Sonner',
};

export default meta;
type Story = StoryObj<typeof Toaster>;

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

// Your icons replace the ones you name, and the rest stay the nxds icons. A
// close icon you pass draws the line the stroke tokens set for its size.
export const PartialIcons: Story = {
  render: () => {
    const showToasts = () => {
      toast.success('Changes saved');
      toast.error('Something went wrong');
    };
    return (
      <>
        <Button onClick={showToasts}>Show toasts</Button>
        <Toaster
          closeButton
          icons={{
            success: <Star className="nx:size-4" />,
            error: undefined,
            close: <Star className="nx:size-icon-glyph-xs" />,
          }}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Show toasts' }));

    const saved = await body.findByText('Changes saved');
    const failed = await body.findByText('Something went wrong');
    await expect(
      toastPart(saved, '[data-icon] svg.lucide-star')
    ).toBeInTheDocument();
    await expect(
      drawnLine(toastPart(saved, '[data-close-button] svg.lucide-star'))
    ).toEqual(expectedLine(canvasElement, 12));
    await expect(drawnLine(toastPart(failed, '[data-icon] svg')).size).toBe(16);
    toast.dismiss();
  },
};
