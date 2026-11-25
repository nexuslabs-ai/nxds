import * as React from 'react';

import {
  ArrowClockwiseIcon,
  CopyIcon,
  FileTextIcon,
} from '@phosphor-icons/react/ssr';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { cn } from '../../lib/utils';
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '../attachment/attachment';
import { AvatarFallback } from '../avatar/avatar';
import { Bubble, BubbleContent } from '../bubble/bubble';
import { Button } from '../button/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip/tooltip';

import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from './message';

const meta: Meta<typeof Message> = {
  component: Message,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Message lays out one conversation turn, with an avatar, a header, a body and a footer. Use it for chat and assistant threads, with Bubble or Attachment as the body. Message holds no chat state, so your app owns the messages and MessageScroller handles scrolling.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Message>;

const column = 'nx:w-full nx:max-w-lg';

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  tags: ['docs'],
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi</MessageHeader>
          <Bubble>
            <BubbleContent>
              Can you take a look at the failing run?
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:14</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};

export const Alignment: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `align="end"` on your own turns to place them on the opposite side.',
      },
    },
  },
  render: () => (
    <MessageGroup className={column}>
      <Message align="start">
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi</MessageHeader>
          <Bubble>
            <BubbleContent>
              Incoming turns keep the avatar rail at the inline start.
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:14</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          <Bubble variant="primary">
            <BubbleContent>Own turns move it to the inline end.</BubbleContent>
          </Bubble>
          <MessageFooter>09:16</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};

export const WithoutAvatar: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Leave out MessageAvatar for a compact thread with no avatar column.',
      },
    },
  },
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageContent>
          <MessageHeader>System</MessageHeader>
          <Bubble variant="outline">
            <BubbleContent>
              A turn with no avatar rail still fills the row.
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:12</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message"]'
    )!;

    await expect(row.querySelector('[data-slot="message-avatar"]')).toBeNull();
  },
};

// ============================================
// GROUPING
// ============================================

const typingDotClassName =
  'nx:size-1.5 nx:animate-bounce nx:rounded-full nx:bg-muted-foreground';

function TypingIndicatorExample() {
  const [typing, setTyping] = React.useState(false);

  return (
    <div className={cn(column, 'nx:flex nx:flex-col nx:gap-4')}>
      <MessageGroup announce>
        <Message>
          <MessageAvatar>
            <AvatarFallback>AB</AvatarFallback>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Ana Bianchi</MessageHeader>
            <Bubble>
              <BubbleContent>
                Can you take a look at the failing run?
              </BubbleContent>
            </Bubble>
            <MessageFooter>09:22</MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>
      <div role="status">
        {typing && (
          <Message>
            <MessageAvatar placeholder />
            <MessageContent>
              <Bubble>
                <BubbleContent>
                  <span
                    aria-hidden="true"
                    className="nx:flex nx:items-center nx:gap-1 nx:py-1"
                  >
                    <span className={typingDotClassName} />
                    <span
                      className={cn(
                        typingDotClassName,
                        'nx:[animation-delay:150ms]'
                      )}
                    />
                    <span
                      className={cn(
                        typingDotClassName,
                        'nx:[animation-delay:300ms]'
                      )}
                    />
                  </span>
                </BubbleContent>
              </Bubble>
              <MessageFooter>Ana Bianchi is typing&hellip;</MessageFooter>
            </MessageContent>
          </Message>
        )}
      </div>
      <Button
        variant="outline"
        className="nx:self-start"
        onClick={() => setTyping((current) => !current)}
      >
        {typing ? 'Stop typing' : 'Start typing'}
      </Button>
    </div>
  );
}

export const TypingIndicator: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Show typing in an always-mounted `role="status"` region next to the log, with the state also written in the footer.',
      },
    },
  },
  render: () => <TypingIndicatorExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const log = canvas.getByRole('log');
    const status = canvas.getByRole('status');

    await expect(status).toBeEmptyDOMElement();

    await userEvent.click(canvas.getByRole('button', { name: 'Start typing' }));

    await expect(canvas.getByRole('status')).toBe(status);
    await expect(
      within(status).getByText(/Ana Bianchi is typing/)
    ).toBeVisible();
    await expect(
      within(log).queryByText(/Ana Bianchi is typing/)
    ).not.toBeInTheDocument();

    const dotRow = status.querySelector<HTMLElement>(
      '[data-slot="bubble-content"] > span'
    )!;
    const dots = dotRow.querySelectorAll<HTMLElement>(':scope > span');

    await expect(dotRow).toHaveAttribute('aria-hidden', 'true');
    await expect(dots).toHaveLength(3);

    await userEvent.click(canvas.getByRole('button', { name: 'Stop typing' }));

    await expect(canvas.getByRole('status')).toBe(status);
    await expect(status).toBeEmptyDOMElement();
  },
};

export const GroupedTurns: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Show the avatar once per run of turns, with `placeholder` avatars keeping later turns aligned.',
      },
    },
  },
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi</MessageHeader>
          <Bubble>
            <BubbleContent>
              Can you take a look at the failing run?
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:14</MessageFooter>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar placeholder />
        <MessageContent>
          <Bubble>
            <BubbleContent>It started after the token refactor.</BubbleContent>
          </Bubble>
          <MessageFooter>09:15</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          <Bubble variant="primary">
            <BubbleContent>Looking now.</BubbleContent>
          </Bubble>
          <MessageFooter>09:16</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar placeholder />
        <MessageContent>
          <Bubble variant="primary">
            <BubbleContent>Found it &mdash; a renamed token.</BubbleContent>
          </Bubble>
          <MessageFooter>09:17</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const placeholders = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="message-avatar"][data-placeholder]'
    );
    await expect(placeholders).toHaveLength(2);
  },
};

export const WithActions: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          "Put icon-only copy and retry buttons, each with a tooltip, in a turn's footer.",
      },
    },
  },
  render: () => (
    <TooltipProvider delayDuration={0}>
      <MessageGroup className={column}>
        <Message>
          <MessageAvatar>
            <AvatarFallback>AI</AvatarFallback>
          </MessageAvatar>
          <MessageContent>
            <Bubble>
              <BubbleContent>
                The audit passes once the four renamed tokens are rerouted.
              </BubbleContent>
            </Bubble>
            <MessageFooter>
              09:18
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    iconOnly
                    startIcon={<CopyIcon />}
                    variant="ghost"
                  >
                    Copy reply
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    iconOnly
                    startIcon={<ArrowClockwiseIcon />}
                    variant="ghost"
                  >
                    Regenerate reply
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate</TooltipContent>
              </Tooltip>
            </MessageFooter>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageAvatar>
            <AvatarFallback>YOU</AvatarFallback>
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="destructive">
              <BubbleContent>Rerun the contrast audit on main.</BubbleContent>
            </Bubble>
            <MessageFooter>
              09:20 &middot;{' '}
              <span className="nx:text-error-subtle-foreground">
                Failed to send
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    iconOnly
                    startIcon={<CopyIcon />}
                    variant="ghost"
                  >
                    Copy message
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    iconOnly
                    startIcon={<ArrowClockwiseIcon />}
                    variant="ghost"
                  >
                    Retry sending
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Retry</TooltipContent>
              </Tooltip>
            </MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Regenerate reply' })
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Retry sending' })
    ).toBeVisible();

    const copy = canvas.getByRole('button', { name: 'Copy reply' });

    await expect(
      document.querySelector('[data-slot="tooltip-content"]')
    ).toBeNull();

    await userEvent.hover(copy);
    await waitFor(async () => {
      await expect(
        document.querySelector('[data-slot="tooltip-content"]')
      ).toBeInTheDocument();
    });

    await userEvent.unhover(copy);
    await waitFor(async () => {
      await expect(
        document.querySelector('[data-slot="tooltip-content"]')
      ).toBeNull();
    });

    await userEvent.tab();
    await expect(copy).toHaveFocus();
  },
};

export const WithAttachment: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Use an Attachment as the body of a turn to share a file.',
      },
    },
  },
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi</MessageHeader>
          <Attachment>
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
              <AttachmentDescription>2.4 MB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <MessageFooter>09:14</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <Attachment>
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>contrast-audit.log</AttachmentTitle>
              <AttachmentDescription>18 KB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <MessageFooter>Read 09:16</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="message"]')
    );

    await expect(canvas.getByText('sales-dashboard.pdf')).toBeVisible();
    await expect(canvas.getByText('contrast-audit.log')).toBeVisible();

    for (const row of rows) {
      await expect(row.querySelector('[data-slot="bubble"]')).toBeNull();
    }
  },
};

// ============================================
// RTL
// ============================================

export const RightToLeft: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      <div className={column}>
        <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
          dir=&quot;ltr&quot;
        </p>
        <MessageGroup dir="ltr">
          <Message align="start">
            <MessageAvatar>
              <AvatarFallback>AB</AvatarFallback>
            </MessageAvatar>
            <MessageContent>
              <Bubble>
                <BubbleContent>Where did the build fail?</BubbleContent>
              </Bubble>
              <MessageFooter>09:14</MessageFooter>
            </MessageContent>
          </Message>
          <Message align="end">
            <MessageAvatar>
              <AvatarFallback>YOU</AvatarFallback>
            </MessageAvatar>
            <MessageContent>
              <Bubble variant="primary">
                <BubbleContent>On the type-check step.</BubbleContent>
              </Bubble>
              <MessageFooter>09:16</MessageFooter>
            </MessageContent>
          </Message>
        </MessageGroup>
      </div>
      <div className={column}>
        <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
          dir=&quot;rtl&quot; &mdash; same markup, no physical-side overrides
        </p>
        <MessageGroup dir="rtl">
          <Message align="start">
            <MessageAvatar>
              <AvatarFallback>AB</AvatarFallback>
            </MessageAvatar>
            <MessageContent>
              <Bubble>
                <BubbleContent>أين فشل البناء؟</BubbleContent>
              </Bubble>
              <MessageFooter>09:14</MessageFooter>
            </MessageContent>
          </Message>
          <Message align="end">
            <MessageAvatar>
              <AvatarFallback>أنت</AvatarFallback>
            </MessageAvatar>
            <MessageContent>
              <Bubble variant="primary">
                <BubbleContent>في خطوة فحص الأنواع.</BubbleContent>
              </Bubble>
              <MessageFooter>09:16</MessageFooter>
            </MessageContent>
          </Message>
        </MessageGroup>
      </div>
    </div>
  ),
};

// ============================================
// COMPOSITION
// ============================================

export const ComposedScene: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ana Bianchi</MessageHeader>
          <Bubble>
            <BubbleContent>
              Here is the audit output from this morning&rsquo;s run.
            </BubbleContent>
          </Bubble>
          <Attachment>
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>contrast-audit.log</AttachmentTitle>
              <AttachmentDescription>18 KB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <MessageFooter>09:14</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          <Bubble variant="primary">
            <BubbleContent>Thanks — reading it now.</BubbleContent>
          </Bubble>
          <MessageFooter>Read 09:16</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('contrast-audit.log')).toBeVisible();
  },
};

// ============================================
// EDGE CASES
// ============================================

export const LongUnbrokenContent: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message>
        <MessageAvatar>
          <AvatarFallback>AB</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            trace_0f3a9c1b77de4a029d31e8b4c6a2f07d5c9e1b3a8f4d6e2c0b7a9f5d3e1c8b6a
          </MessageHeader>
          <Bubble>
            <BubbleContent>
              Supercalifragilisticexpialidociousantidisestablishmentarianismpneumonoultramicroscopic
            </BubbleContent>
          </Bubble>
          <MessageFooter>09:21</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
};

export const WithDataAttributes: Story = {
  render: () => (
    <MessageGroup className={column}>
      <Message align="end">
        <MessageAvatar>
          <AvatarFallback>YOU</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          <Bubble variant="primary">
            <BubbleContent>Shipped it.</BubbleContent>
          </Bubble>
          <MessageFooter>Read 09:16</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message"]'
    )!;

    await expect(row).toHaveAttribute('data-slot', 'message');
    await expect(row).toHaveAttribute('data-align', 'end');

    for (const slot of [
      'message-avatar',
      'message-content',
      'message-header',
      'message-footer',
    ]) {
      await expect(row.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }

    // MessageAvatar renders Avatar but owns its own identity hook.
    await expect(row.querySelector('[data-slot="avatar"]')).toBeNull();
  },
};

// ============================================
// SHOWCASE
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-8">
      {(['start', 'end'] as const).map((align) => (
        <div key={align} className={column}>
          <p className="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">
            align=&quot;{align}&quot;
          </p>
          <MessageGroup>
            <Message align={align}>
              <MessageAvatar>
                <AvatarFallback>AB</AvatarFallback>
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>Ana Bianchi</MessageHeader>
                <Bubble variant={align === 'end' ? 'primary' : 'muted'}>
                  <BubbleContent>
                    A turn aligned to the inline {align}.
                  </BubbleContent>
                </Bubble>
                <MessageFooter>09:14</MessageFooter>
              </MessageContent>
            </Message>
          </MessageGroup>
        </div>
      ))}
    </div>
  ),
};
