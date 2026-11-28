import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { MessageScroller } from './message-scroller';
import messageScrollerMeta, {
  Default,
  EmptyStream,
  KeyboardInteraction,
  ReducedMotion,
  RightToLeft,
  ScrolledAway,
  ScrollToStart,
  SendFromComposer,
  ShortStream,
  StreamingWhilePinned,
  StreamingWhileScrolledAway,
} from './MessageScroller.stories';

const meta: Meta<typeof MessageScroller> = {
  ...messageScrollerMeta,
  title: 'Tests/MessageScroller',
};

export default meta;
type Story = StoryObj<typeof MessageScroller>;

const viewportOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>(
    '[data-slot="message-scroller-viewport"]'
  )!;

// Resting on the last pixel, not merely within the component's edge slack.
const atEnd = (viewport: HTMLElement) =>
  viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= 1;

// Resize observers are notified after a frame's animation callbacks, so only
// the frame after next is sure to have run them.
const afterResizeObservers = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );

export const DefaultScrollPosition: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const viewport = viewportOf(canvasElement);

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });
  },
};

export const EmptyStreamGeometry: Story = {
  ...EmptyStream,
  play: async ({ canvasElement }) => {
    const viewport = viewportOf(canvasElement);

    await expect(viewport.scrollHeight).toBeLessThanOrEqual(
      viewport.clientHeight + 1
    );
  },
};

export const ShortStreamGeometry: Story = {
  ...ShortStream,
  play: async ({ canvasElement }) => {
    const viewport = viewportOf(canvasElement);

    await expect(viewport.scrollHeight).toBeLessThanOrEqual(
      viewport.clientHeight + 1
    );
  },
};

export const ScrolledAwayScrollPosition: Story = {
  ...ScrolledAway,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });

    viewport.scrollTo({ top: 0, behavior: 'instant' });

    const name = 'Scroll to the latest message';
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

    const button = canvas.getByRole('button', { name });
    const box = button.getBoundingClientRect();
    await expect(box.width).toBe(box.height);

    await userEvent.click(button);

    await waitFor(
      async () => {
        await expect(atEnd(viewport)).toBe(true);
      },
      { timeout: 3000 }
    );
  },
};

export const StreamingWhilePinnedScrollPosition: Story = {
  ...StreamingWhilePinned,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Append turn' }));

    await waitFor(async () => {
      await expect(
        canvas.getByText('Turn 11 in the transcript.')
      ).toBeVisible();
      await expect(atEnd(viewport)).toBe(true);
    });
  },
};

export const StreamingWhileScrolledAwayScrollPosition: Story = {
  ...StreamingWhileScrolledAway,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });

    viewport.scrollTo({ top: 0, behavior: 'instant' });
    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(false);
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Append turn' }));

    await waitFor(async () => {
      await expect(
        canvas.getByText('Turn 11 in the transcript.')
      ).toBeVisible();
    });
    await afterResizeObservers();

    await expect(atEnd(viewport)).toBe(false);
  },
};

export const ScrollToStartScrollPosition: Story = {
  ...ScrollToStart,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-scroller"]'
    )!;

    // Leave a scroll range short enough that its midpoint is near both edges,
    // yet long enough that the start button still arms.
    const range = () => viewport.scrollHeight - viewport.clientHeight;
    root.style.height = `${root.offsetHeight + range() - 36}px`;

    const start = canvas.getByRole('button', {
      name: 'Scroll to the oldest message',
    });
    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
      await expect(start).toHaveAttribute('data-active', 'true');
    });

    // Cutting the smooth scroll short at its midpoint stands in for the
    // animation frame that is still near the end, with no frame in between.
    const midpoint = Math.floor(range() / 2);
    start.click();
    viewport.scrollTo({ top: midpoint, behavior: 'instant' });
    await waitFor(async () => {
      await expect(root).toHaveAttribute('data-at-start', 'true');
      await expect(root).toHaveAttribute('data-at-end', 'true');
    });
    await afterResizeObservers();

    await userEvent.click(canvas.getByRole('button', { name: 'Append turn' }));

    await waitFor(async () => {
      await expect(
        canvas.getByText('Turn 11 in the transcript.')
      ).toBeVisible();
    });
    await afterResizeObservers();

    await expect(viewport.scrollTop).toBe(midpoint);
  },
};

export const SendFromComposerScrollPosition: Story = {
  ...SendFromComposer,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    await waitFor(async () => {
      await expect(atEnd(viewport)).toBe(true);
    });

    viewport.scrollTo({ top: 0, behavior: 'instant' });
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Scroll to the latest message' })
      ).toHaveAttribute('data-active', 'true');
    });

    // The jump starts before the new turn renders, so it aims at the old
    // height. Re-pinning is what carries it onto the turn that just arrived.
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));

    await waitFor(
      async () => {
        await expect(
          canvas.getByText('Turn 11 in the transcript.')
        ).toBeVisible();
        await expect(atEnd(viewport)).toBe(true);
      },
      { timeout: 3000 }
    );
  },
};

export const KeyboardInteractionScrollPosition: Story = {
  ...KeyboardInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    viewport.scrollTo({ top: 0, behavior: 'instant' });

    const name = 'Scroll to the latest message';
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    await waitFor(
      async () => {
        await expect(atEnd(viewport)).toBe(true);
      },
      { timeout: 3000 }
    );
  },
};

export const ReducedMotionScrollPosition: Story = {
  ...ReducedMotion,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    viewport.scrollTo({ top: 0, behavior: 'instant' });

    const name = 'Scroll to the latest message';
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

    await userEvent.click(canvas.getByRole('button', { name }));

    // No smooth scroll to wait out: the jump lands within the click.
    await expect(atEnd(viewport)).toBe(true);
  },
};

export const RightToLeftPlacement: Story = {
  ...RightToLeft,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-scroller"]'
    )!;

    viewport.scrollTo({ top: 0, behavior: 'instant' });

    const name = 'Scroll to the latest message';
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

    const rootBox = root.getBoundingClientRect();
    const buttonBox = canvas
      .getByRole('button', { name })
      .getBoundingClientRect();

    const startGap = buttonBox.left - rootBox.left;
    const endGap = rootBox.right - buttonBox.right;

    await expect(Math.abs(startGap - endGap)).toBeLessThan(2);
  },
};
