import { PhChatText } from '@phosphor-icons/vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { defineComponent, ref } from 'vue';

import { AvatarFallback } from '../avatar';
import { Bubble, BubbleContent } from '../bubble';
import { Button } from '../button';
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from '../empty-state';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
} from '../message';

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '.';

const meta = {
  component: MessageScroller,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'MessageScroller scrolls a message stream and keeps the latest turn in view. Use it for chat and assistant threads that grow as new turns arrive. For other scrolling content, use ScrollArea.',
      },
    },
  },
} satisfies Meta<typeof MessageScroller>;

export default meta;
type Story = StoryObj<typeof meta>;

const frame =
  'nx:h-80 nx:w-full nx:max-w-lg nx:rounded-md nx:border-default nx:border-border-default nx:bg-background';

const Turn = defineComponent({
  components: {
    AvatarFallback,
    Bubble,
    BubbleContent,
    Message,
    MessageAvatar,
    MessageContent,
    MessageFooter,
    MessageGroup,
  },
  props: { index: { type: Number, required: true } },
  setup: (props) => ({
    own: props.index % 2 === 1,
    time: `09:${String(10 + props.index).padStart(2, '0')}`,
  }),
  template: `
    <MessageGroup>
      <Message :align="own ? 'end' : 'start'">
        <MessageAvatar><AvatarFallback>{{ own ? 'YOU' : 'AB' }}</AvatarFallback></MessageAvatar>
        <MessageContent>
          <Bubble :variant="own ? 'primary' : 'muted'">
            <BubbleContent>Turn {{ index + 1 }} in the transcript.</BubbleContent>
          </Bubble>
          <MessageFooter>{{ time }}</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  `,
});

const Stream = defineComponent({
  components: {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerViewport,
    Turn,
  },
  props: { count: { type: Number, required: true } },
  setup: () => ({ frame }),
  template: `
    <MessageScroller :class="frame">
      <MessageScrollerViewport>
        <MessageScrollerContent>
          <MessageScrollerItem v-for="index in count" :key="index">
            <Turn :index="index - 1" />
          </MessageScrollerItem>
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton />
      <slot />
    </MessageScroller>
  `,
});

const ProvidedStream = defineComponent({
  components: { MessageScrollerProvider, Stream },
  props: { count: { type: Number, required: true } },
  template: `
    <MessageScrollerProvider>
      <Stream :count="count" />
    </MessageScrollerProvider>
  `,
});

// The composer reads `scrollToEnd` from the provider's slot props.
const AppendableStream = defineComponent({
  components: { Button, MessageScrollerProvider, Stream },
  setup: () => ({ count: ref(10) }),
  template: `
    <MessageScrollerProvider v-slot="{ scrollToEnd }">
      <div class="nx:flex nx:flex-col nx:gap-3">
        <Stream :count="count"><slot /></Stream>
        <div class="nx:flex nx:gap-2">
          <Button size="sm" variant="outline" @click="count++">Append turn</Button>
          <Button size="sm" @click="count++; scrollToEnd()">Send</Button>
        </div>
      </div>
    </MessageScrollerProvider>
  `,
});

const viewportOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>(
    '[data-slot="message-scroller-viewport"]'
  )!;

const buttonOf = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>(
    '[data-slot="message-scroller-button"]'
  )!;

// Resize observers are notified after a frame's animation callbacks, so only
// the frame after next is sure to have run them.
const afterResizeObservers = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: () => ({
    components: { ProvidedStream },
    template: '<ProvidedStream :count="12" />',
  }),
};

// ============================================
// SHOWCASE
// ============================================

export const AllVariants: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      AvatarFallback,
      Bubble,
      BubbleContent,
      Message,
      MessageAvatar,
      MessageContent,
      MessageFooter,
      MessageGroup,
      MessageScroller,
      MessageScrollerButton,
      MessageScrollerContent,
      MessageScrollerItem,
      MessageScrollerProvider,
      MessageScrollerViewport,
    },
    template: `
      <MessageScrollerProvider>
        <MessageScroller class="nx:h-80 nx:w-full nx:max-w-lg nx:rounded-md nx:border-default nx:border-border-default nx:bg-background">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <MessageScrollerItem v-for="index in 14" :key="index">
                <MessageGroup>
                  <Message :align="index % 2 === 0 ? 'end' : 'start'">
                    <MessageAvatar>
                      <AvatarFallback>{{ index % 2 === 0 ? 'YOU' : 'AB' }}</AvatarFallback>
                    </MessageAvatar>
                    <MessageContent>
                      <Bubble :variant="index % 2 === 0 ? 'primary' : 'muted'">
                        <BubbleContent>Turn {{ index }} in the transcript.</BubbleContent>
                      </Bubble>
                      <MessageFooter>09:{{ String(9 + index).padStart(2, '0') }}</MessageFooter>
                    </MessageContent>
                  </Message>
                </MessageGroup>
              </MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton direction="start" />
          <MessageScrollerButton direction="end" />
        </MessageScroller>
      </MessageScrollerProvider>
    `,
  }),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-scroller"]'
    )!;
    const buttons = root.querySelectorAll<HTMLElement>(
      '[data-slot="message-scroller-button"]'
    );

    await expect(buttons).toHaveLength(2);
    await expect(buttons[0]).toHaveAttribute('data-direction', 'start');
    await expect(buttons[1]).toHaveAttribute('data-direction', 'end');
  },
};

export const EmptyStream: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Show an EmptyState inside the scroller before the first message, with the jump button hidden.',
      },
    },
  },
  render: () => ({
    components: {
      EmptyState,
      EmptyStateDescription,
      EmptyStateHeader,
      EmptyStateMedia,
      EmptyStateTitle,
      PhChatText,
      MessageScroller,
      MessageScrollerButton,
      MessageScrollerContent,
      MessageScrollerProvider,
      MessageScrollerViewport,
    },
    template: `
      <MessageScrollerProvider>
        <MessageScroller class="nx:h-80 nx:w-full nx:max-w-lg nx:rounded-md nx:border-default nx:border-border-default nx:bg-background">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <EmptyState>
                <EmptyStateHeader>
                  <EmptyStateMedia variant="icon"><PhChatText /></EmptyStateMedia>
                  <EmptyStateTitle>No messages yet</EmptyStateTitle>
                  <EmptyStateDescription>Send the first message to start this conversation.</EmptyStateDescription>
                </EmptyStateHeader>
              </EmptyState>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(buttonOf(canvasElement)).toHaveAttribute(
      'data-active',
      'false'
    );
  },
};

export const ShortStream: Story = {
  render: () => ({
    components: { ProvidedStream },
    template: '<ProvidedStream :count="2" />',
  }),
  play: async ({ canvasElement }) => {
    await expect(buttonOf(canvasElement)).toHaveAttribute(
      'data-active',
      'false'
    );
  },
};

// ============================================
// SCROLL AWAY AND RETURN
// ============================================

export const ScrolledAway: Story = {
  render: () => ({
    components: { ProvidedStream },
    template: '<ProvidedStream :count="14" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    const name = 'Scroll to the latest message';

    await expect(canvas.queryByRole('button', { name })).toBeNull();

    viewport.scrollTo({ top: 0, behavior: 'instant' });

    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

    const button = canvas.getByRole('button', { name });
    await expect(button).toBeVisible();

    await userEvent.click(button);

    await waitFor(
      async () => {
        await expect(canvas.queryByRole('button', { name })).toBeNull();
      },
      { timeout: 3000 }
    );
  },
};

// ============================================
// STREAMING
// ============================================

export const StreamingWhilePinned: Story = {
  render: () => ({
    components: { AppendableStream },
    template: '<AppendableStream />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Append turn' }));

    await waitFor(async () => {
      await expect(
        canvas.getByText('Turn 11 in the transcript.')
      ).toBeVisible();
    });
  },
};

export const StreamingWhileScrolledAway: Story = {
  render: () => ({
    components: { AppendableStream },
    template: '<AppendableStream />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    viewport.scrollTo({ top: 0, behavior: 'instant' });

    await userEvent.click(canvas.getByRole('button', { name: 'Append turn' }));

    await waitFor(async () => {
      await expect(
        canvas.getByText('Turn 11 in the transcript.')
      ).toBeVisible();
    });
    await afterResizeObservers();

    await expect(viewport.scrollTop).toBe(0);
  },
};

export const ScrollToStart: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Add a `direction="start"` button that jumps to the oldest turn.',
      },
    },
  },
  render: () => ({
    components: {
      AvatarFallback,
      Bubble,
      BubbleContent,
      Button,
      Message,
      MessageAvatar,
      MessageContent,
      MessageFooter,
      MessageGroup,
      MessageScroller,
      MessageScrollerButton,
      MessageScrollerContent,
      MessageScrollerItem,
      MessageScrollerProvider,
      MessageScrollerViewport,
    },
    setup: () => ({ count: ref(10) }),
    template: `
      <MessageScrollerProvider v-slot="{ scrollToEnd }">
        <div class="nx:flex nx:flex-col nx:gap-3">
          <MessageScroller class="nx:h-80 nx:w-full nx:max-w-lg nx:rounded-md nx:border-default nx:border-border-default nx:bg-background">
            <MessageScrollerViewport>
              <MessageScrollerContent>
                <MessageScrollerItem v-for="index in count" :key="index">
                  <MessageGroup>
                    <Message :align="index % 2 === 0 ? 'end' : 'start'">
                      <MessageAvatar>
                        <AvatarFallback>{{ index % 2 === 0 ? 'YOU' : 'AB' }}</AvatarFallback>
                      </MessageAvatar>
                      <MessageContent>
                        <Bubble :variant="index % 2 === 0 ? 'primary' : 'muted'">
                          <BubbleContent>Turn {{ index }} in the transcript.</BubbleContent>
                        </Bubble>
                        <MessageFooter>09:{{ String(9 + index).padStart(2, '0') }}</MessageFooter>
                      </MessageContent>
                    </Message>
                  </MessageGroup>
                </MessageScrollerItem>
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
            <MessageScrollerButton direction="start" />
          </MessageScroller>
          <div class="nx:flex nx:gap-2">
            <Button size="sm" variant="outline" @click="count++">Append turn</Button>
            <Button size="sm" @click="count++; scrollToEnd()">Send</Button>
          </div>
        </div>
      </MessageScrollerProvider>
    `,
  }),
};

export const SendFromComposer: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          "Call `scrollToEnd` from the provider's slot props in a composer to jump to the new turn on send. A child component of the provider reads the same state from `useMessageScroller`.",
      },
    },
  },
  render: () => ({
    components: {
      AvatarFallback,
      Bubble,
      BubbleContent,
      Button,
      Message,
      MessageAvatar,
      MessageContent,
      MessageFooter,
      MessageGroup,
      MessageScroller,
      MessageScrollerButton,
      MessageScrollerContent,
      MessageScrollerItem,
      MessageScrollerProvider,
      MessageScrollerViewport,
    },
    setup: () => ({ count: ref(10) }),
    template: `
      <MessageScrollerProvider v-slot="{ scrollToEnd }">
        <div class="nx:flex nx:flex-col nx:gap-3">
          <MessageScroller class="nx:h-80 nx:w-full nx:max-w-lg nx:rounded-md nx:border-default nx:border-border-default nx:bg-background">
            <MessageScrollerViewport>
              <MessageScrollerContent>
                <MessageScrollerItem v-for="index in count" :key="index">
                  <MessageGroup>
                    <Message :align="index % 2 === 0 ? 'end' : 'start'">
                      <MessageAvatar>
                        <AvatarFallback>{{ index % 2 === 0 ? 'YOU' : 'AB' }}</AvatarFallback>
                      </MessageAvatar>
                      <MessageContent>
                        <Bubble :variant="index % 2 === 0 ? 'primary' : 'muted'">
                          <BubbleContent>Turn {{ index }} in the transcript.</BubbleContent>
                        </Bubble>
                        <MessageFooter>09:{{ String(9 + index).padStart(2, '0') }}</MessageFooter>
                      </MessageContent>
                    </Message>
                  </MessageGroup>
                </MessageScrollerItem>
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
          <div class="nx:flex nx:gap-2">
            <Button size="sm" variant="outline" @click="count++">Append turn</Button>
            <Button size="sm" @click="count++; scrollToEnd()">Send</Button>
          </div>
        </div>
      </MessageScrollerProvider>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    viewport.scrollTo({ top: 0, behavior: 'instant' });
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Scroll to the latest message' })
      ).toHaveAttribute('data-active', 'true');
    });

    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));

    await waitFor(
      async () => {
        await expect(
          canvas.getByText('Turn 11 in the transcript.')
        ).toBeVisible();
      },
      { timeout: 3000 }
    );
  },
};

// ============================================
// INTERACTION
// ============================================

export const KeyboardInteraction: Story = {
  render: () => ({
    components: { ProvidedStream },
    template: '<ProvidedStream :count="14" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = viewportOf(canvasElement);

    await expect(viewport).toHaveAttribute('tabindex', '0');

    viewport.scrollTo({ top: 0, behavior: 'instant' });

    const name = 'Scroll to the latest message';
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'data-active',
        'true'
      );
    });

    await userEvent.tab();
    await expect(viewport).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
  },
};

export const ReducedMotion: Story = {
  render: () => ({
    components: { ProvidedStream },
    template: '<ProvidedStream :count="14" />',
  }),
  globals: { reduceMotion: true },
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
  },
};

// ============================================
// RTL
// ============================================

export const RightToLeft: Story = {
  render: () => ({
    components: {
      AvatarFallback,
      Bubble,
      BubbleContent,
      Message,
      MessageAvatar,
      MessageContent,
      MessageFooter,
      MessageGroup,
      MessageScroller,
      MessageScrollerButton,
      MessageScrollerContent,
      MessageScrollerItem,
      MessageScrollerProvider,
      MessageScrollerViewport,
    },
    setup: () => ({ frame }),
    template: `
      <div dir="rtl">
        <MessageScrollerProvider>
          <MessageScroller :class="frame">
            <MessageScrollerViewport>
              <MessageScrollerContent>
                <MessageScrollerItem v-for="index in 12" :key="index">
                  <MessageGroup>
                    <Message :align="index % 2 === 0 ? 'end' : 'start'">
                      <MessageAvatar>
                        <AvatarFallback>{{ index % 2 === 0 ? 'أنت' : 'ع ب' }}</AvatarFallback>
                      </MessageAvatar>
                      <MessageContent>
                        <Bubble :variant="index % 2 === 0 ? 'primary' : 'muted'">
                          <BubbleContent>الرسالة رقم {{ index }} في المحادثة.</BubbleContent>
                        </Bubble>
                        <MessageFooter>09:{{ String(9 + index).padStart(2, '0') }}</MessageFooter>
                      </MessageContent>
                    </Message>
                  </MessageGroup>
                </MessageScrollerItem>
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
    `,
  }),
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
  },
};

// ============================================
// DATA ATTRIBUTES
// ============================================

export const WithDataAttributes: Story = {
  render: () => ({
    components: { ProvidedStream },
    template: '<ProvidedStream :count="12" />',
  }),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="message-scroller"]'
    )!;

    for (const slot of [
      'message-scroller-viewport',
      'message-scroller-content',
      'message-scroller-item',
      'message-scroller-button',
    ]) {
      await expect(root.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }

    await expect(buttonOf(canvasElement)).toHaveAttribute(
      'data-direction',
      'end'
    );

    await waitFor(async () => {
      await expect(root).toHaveAttribute('data-at-end', 'true');
      await expect(root).toHaveAttribute('data-at-start', 'false');
    });
  },
};
