import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AvatarFallback } from '../avatar/avatar';
import { Bubble, BubbleContent } from '../bubble/bubble';

import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from './message';
import messageMeta, {
  Alignment,
  ComposedScene,
  GroupedTurns,
  LongUnbrokenContent,
  RightToLeft,
  TypingIndicator,
  WithActions,
  WithAttachment,
  WithoutAvatar,
} from './Message.stories';

const meta: Meta<typeof Message> = {
  ...messageMeta,
  title: 'Tests/Message',
};

export default meta;
type Story = StoryObj<typeof Message>;

const topDelta = (a: Element, b: Element) =>
  Math.abs(a.getBoundingClientRect().top - b.getBoundingClientRect().top);

export const AlignmentPlacement: Story = {
  ...Alignment,
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="message"]'
    );
    const [startRow, endRow] = [rows[0]!, rows[1]!];

    const avatarLeft = (row: HTMLElement) =>
      row.querySelector('[data-slot="message-avatar"]')!.getBoundingClientRect()
        .left;
    const contentLeft = (row: HTMLElement) =>
      row
        .querySelector('[data-slot="message-content"]')!
        .getBoundingClientRect().left;

    await expect(avatarLeft(startRow)).toBeLessThan(contentLeft(startRow));
    await expect(avatarLeft(endRow)).toBeGreaterThan(contentLeft(endRow));

    // A turn declares its side once, on `Message`. The bubbles carry no `align`
    // of their own, so this fails if the column's alignment is ever overridden
    // by a cross-axis auto margin further down.
    const bubbleBox = (row: HTMLElement) =>
      row.querySelector('[data-slot="bubble"]')!.getBoundingClientRect();
    const columnBox = (row: HTMLElement) =>
      row
        .querySelector('[data-slot="message-content"]')!
        .getBoundingClientRect();

    await expect(bubbleBox(startRow).left).toBeCloseTo(
      columnBox(startRow).left,
      0
    );
    await expect(bubbleBox(endRow).right).toBeCloseTo(
      columnBox(endRow).right,
      0
    );
  },
};

export const WithoutAvatarSize: Story = {
  ...WithoutAvatar,
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message"]'
    )!;
    const content = row.querySelector<HTMLElement>(
      '[data-slot="message-content"]'
    )!;

    await expect(
      Math.abs(
        content.getBoundingClientRect().width -
          row.getBoundingClientRect().width
      )
    ).toBeLessThan(1);
  },
};

/**
 * Keep the avatar beside the turn for every header and footer combination,
 * short or wrapped.
 */
export const AvatarAlignmentMatrix: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      {(
        [
          { key: 'neither', header: false, footer: false },
          { key: 'header', header: true, footer: false },
          { key: 'footer', header: false, footer: true },
          { key: 'both', header: true, footer: true },
        ] as const
      ).map(({ key, header, footer }) => (
        <div key={key} className="nx:w-full nx:max-w-lg">
          <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
            {key}
          </p>
          <MessageGroup>
            <Message>
              <MessageAvatar>
                <AvatarFallback>AB</AvatarFallback>
              </MessageAvatar>
              <MessageContent>
                {header ? (
                  <MessageHeader>
                    Ana Bianchi &middot; Staff Engineer &middot; Platform
                    Infrastructure &middot; wraps onto a second line
                  </MessageHeader>
                ) : null}
                <Bubble>
                  <BubbleContent>Metadata combination: {key}.</BubbleContent>
                </Bubble>
                {footer ? (
                  <MessageFooter>
                    Delivered 09:14 &middot; read by Ana, Bruno, and Chandra
                    &middot; wraps onto a second line
                  </MessageFooter>
                ) : null}
              </MessageContent>
            </Message>
          </MessageGroup>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="message"]'
    );

    await expect(rows).toHaveLength(4);

    for (const row of rows) {
      const avatar = row.querySelector<HTMLElement>(
        '[data-slot="message-avatar"]'
      )!;
      const content = row.querySelector<HTMLElement>(
        '[data-slot="message-content"]'
      )!;

      await expect(topDelta(avatar, content)).toBeLessThan(1);
    }
  },
};

export const TypingIndicatorMotion: Story = {
  ...TypingIndicator,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('status');

    await userEvent.click(canvas.getByRole('button', { name: 'Start typing' }));

    const dotRow = status.querySelector<HTMLElement>(
      '[data-slot="bubble-content"] > span'
    )!;
    const dots = dotRow.querySelectorAll<HTMLElement>(':scope > span');

    const delays = Array.from(
      dots,
      (dot) => getComputedStyle(dot).animationDelay
    );
    await expect(new Set(delays).size).toBe(3);

    for (const dot of dots) {
      await expect(getComputedStyle(dot).animationName).not.toBe('none');
    }
  },
};

export const GroupedTurnsPlacement: Story = {
  ...GroupedTurns,
  play: async ({ canvasElement }) => {
    const rows = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="message"]')
    );
    const box = (row: HTMLElement) =>
      row
        .querySelector('[data-slot="message-content"]')!
        .getBoundingClientRect();

    // The reserved rail keeps a continuation turn on the same inline edge as
    // the turn that owns the avatar, on both sides of the conversation.
    await expect(box(rows[1]!).left).toBe(box(rows[0]!).left);
    await expect(box(rows[3]!).right).toBe(box(rows[2]!).right);

    const placeholders = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="message-avatar"][data-placeholder]'
    );

    // Reserved, not merely blank: it holds width but leaves the a11y tree.
    for (const placeholder of placeholders) {
      await expect(getComputedStyle(placeholder).visibility).toBe('hidden');
      await expect(placeholder.getBoundingClientRect().width).toBeGreaterThan(
        0
      );
    }
  },
};

export const WithActionsPlacement: Story = {
  ...WithActions,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="message"]')
    );

    // The action row follows its turn's side, so own-message controls sit on
    // the inline end instead of stranded under the opposite edge.
    for (const row of rows) {
      const content = row
        .querySelector('[data-slot="message-content"]')!
        .getBoundingClientRect();
      const footer = row
        .querySelector('[data-slot="message-footer"]')!
        .getBoundingClientRect();

      const gap =
        row.dataset.align === 'end'
          ? content.right - footer.right
          : footer.left - content.left;

      await expect(Math.abs(gap)).toBeLessThan(1);
    }

    const failed = canvas.getByText('Failed to send');
    const footer = failed.closest<HTMLElement>('[data-slot="message-footer"]')!;

    // The failure reads as a status, not as one more muted metadata word.
    await expect(getComputedStyle(failed).color).not.toBe(
      getComputedStyle(footer).color
    );
  },
};

export const WithAttachmentPlacement: Story = {
  ...WithAttachment,
  play: async ({ canvasElement }) => {
    const rows = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="message"]')
    );

    for (const row of rows) {
      const content = row
        .querySelector('[data-slot="message-content"]')!
        .getBoundingClientRect();
      const attachment = row
        .querySelector('[data-slot="attachment"]')!
        .getBoundingClientRect();

      const gap =
        row.dataset.align === 'end'
          ? content.right - attachment.right
          : attachment.left - content.left;

      await expect(Math.abs(gap)).toBeLessThan(1);
    }
  },
};

export const RightToLeftPlacement: Story = {
  ...RightToLeft,
  play: async ({ canvasElement }) => {
    const groups = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="message-group"]'
    );
    const ltr = groups[0]!;
    const rtl = groups[1]!;

    const railSide = (group: HTMLElement, align: 'start' | 'end') => {
      const row = group.querySelector<HTMLElement>(
        `[data-slot="message"][data-align="${align}"]`
      )!;
      const avatar = row.querySelector('[data-slot="message-avatar"]')!;
      const content = row.querySelector('[data-slot="message-content"]')!;

      return (
        avatar.getBoundingClientRect().left <
        content.getBoundingClientRect().left
      );
    };

    await expect(railSide(ltr, 'start')).toBe(true);
    await expect(railSide(ltr, 'end')).toBe(false);
    await expect(railSide(rtl, 'start')).toBe(false);
    await expect(railSide(rtl, 'end')).toBe(true);
  },
};

export const ComposedScenePlacement: Story = {
  ...ComposedScene,
  play: async ({ canvasElement }) => {
    const endRow = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message"][data-align="end"]'
    )!;
    const content = endRow.querySelector<HTMLElement>(
      '[data-slot="message-content"]'
    )!;
    const bubble = endRow.querySelector<HTMLElement>('[data-slot="bubble"]')!;

    await expect(
      Math.abs(
        content.getBoundingClientRect().right -
          bubble.getBoundingClientRect().right
      )
    ).toBeLessThan(1);
  },
};

export const LongUnbrokenContentGeometry: Story = {
  ...LongUnbrokenContent,
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message"]'
    )!;

    const header = row.querySelector<HTMLElement>(
      '[data-slot="message-header"]'
    )!;

    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth + 1);
    await expect(header.scrollWidth).toBeLessThanOrEqual(
      header.clientWidth + 1
    );
  },
};
