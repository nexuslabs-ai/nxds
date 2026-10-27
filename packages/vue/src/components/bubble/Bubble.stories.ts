import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { IconChecks, IconInfoCircle } from '@tabler/icons-vue';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

import { Button } from '../button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';

import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  type BubbleProps,
  BubbleReactions,
} from '.';

const meta = {
  title: 'Components/Bubble',
  component: Bubble,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Bubble shows one message in a conversation. Use it as the body of a chat or assistant turn. For the avatar, header and footer around it, use Message.',
      },
    },
  },
} satisfies Meta<typeof Bubble>;

export default meta;
type Story = StoryObj<typeof meta>;
type RetryStory = StoryObj<BubbleProps & { onRetry: () => void }>;
type OpenRunStory = StoryObj<BubbleProps & { onOpenRun: () => void }>;

const bubbleComponents = {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
};

function bubbleOf(element: Element): HTMLElement {
  return element.closest<HTMLElement>('[data-slot="bubble"]')!;
}

const VARIANTS: NonNullable<BubbleProps['variant']>[] = [
  'muted',
  'primary',
  'outline',
  'ghost',
  'destructive',
];

// ============================================
// BASIC STORIES
// ============================================

export const Default: Story = {
  render: () => ({
    components: bubbleComponents,
    template: `
      <div class="nx:w-full nx:max-w-md">
        <Bubble>
          <BubbleContent>How do I rotate the signing key?</BubbleContent>
        </Bubble>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const bubble = canvasElement.querySelector('[data-slot="bubble"]')!;

    // The JS default and the cva `defaultVariants` have to agree, and an unset
    // `align` must emit no attribute at all — a turn that defaulted to `start`
    // could not be positioned by its parent.
    await expect(bubble).toHaveAttribute('data-variant', 'muted');
    await expect(bubble).not.toHaveAttribute('data-align');
  },
};

export const Outline: Story = {
  render: () => ({
    components: bubbleComponents,
    template: `
      <div class="nx:w-full nx:max-w-md">
        <Bubble variant="outline">
          <BubbleContent>A bordered turn, for streams that sit on a tinted page.</BubbleContent>
        </Bubble>
      </div>
    `,
  }),
};

export const Ghost: Story = {
  render: () => ({
    components: bubbleComponents,
    template: `
      <div class="nx:w-full nx:max-w-md">
        <Bubble variant="ghost">
          <BubbleContent>No surface at all — for assistant prose that should read as page text.</BubbleContent>
        </Bubble>
      </div>
    `,
  }),
};

export const Destructive: Story = {
  render: () => ({
    components: bubbleComponents,
    template: `
      <div class="nx:w-full nx:max-w-md">
        <Bubble variant="destructive">
          <BubbleContent>Message failed to send. Check your connection and retry.</BubbleContent>
        </Bubble>
      </div>
    `,
  }),
};

// ============================================
// ALIGNMENT
// ============================================

export const Alignment: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Bubble, BubbleContent, BubbleGroup },
    template: `
      <BubbleGroup class="nx:w-full nx:max-w-md">
        <Bubble align="start">
          <BubbleContent>Start-aligned turns hug the inline start.</BubbleContent>
        </Bubble>
        <Bubble align="end" variant="primary">
          <BubbleContent>End-aligned turns hug the inline end.</BubbleContent>
        </Bubble>
      </BubbleGroup>
    `,
  }),
};

export const RightToLeft: Story = {
  render: () => ({
    components: bubbleComponents,
    template: `
      <div class="nx:flex nx:flex-col nx:gap-8">
        <div class="nx:w-full nx:max-w-md">
          <p class="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">dir="ltr"</p>
          <BubbleGroup dir="ltr">
            <Bubble align="start">
              <BubbleContent>Where did the build fail?</BubbleContent>
            </Bubble>
            <Bubble align="end" variant="primary">
              <BubbleContent>On the type-check step.</BubbleContent>
            </Bubble>
          </BubbleGroup>
        </div>
        <div class="nx:w-full nx:max-w-md">
          <p class="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">dir="rtl" — same markup, no physical-side overrides</p>
          <BubbleGroup dir="rtl">
            <Bubble align="start">
              <BubbleContent>أين فشل البناء؟</BubbleContent>
              <BubbleReactions align="start">🎉 3</BubbleReactions>
            </Bubble>
            <Bubble align="end" variant="primary">
              <BubbleContent>في خطوة فحص الأنواع.</BubbleContent>
              <BubbleReactions align="end">👀 1</BubbleReactions>
            </Bubble>
          </BubbleGroup>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const groups = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="bubble-group"]'
    );
    const ltrGroup = groups[0]!;
    const rtlGroup = groups[1]!;

    const leftEdge = (root: HTMLElement, text: string) =>
      within(root).getByText(text).getBoundingClientRect().left;

    await expect(leftEdge(ltrGroup, 'On the type-check step.')).toBeGreaterThan(
      leftEdge(ltrGroup, 'Where did the build fail?')
    );
    await expect(leftEdge(rtlGroup, 'في خطوة فحص الأنواع.')).toBeLessThan(
      leftEdge(rtlGroup, 'أين فشل البناء؟')
    );

    const pills = rtlGroup.querySelectorAll<HTMLElement>(
      '[data-slot="bubble-reactions"]'
    );

    await expect(pills).toHaveLength(2);

    for (const pill of pills) {
      const bubbleBox = bubbleOf(pill).getBoundingClientRect();
      const pillBox = pill.getBoundingClientRect();

      // Under RTL, inline-start is the right edge.
      const inlineGap =
        pill.dataset['align'] === 'start'
          ? bubbleBox.right - pillBox.right
          : pillBox.left - bubbleBox.left;

      await expect(inlineGap).toBeGreaterThan(8);
      await expect(inlineGap).toBeLessThan(16);
    }
  },
};

// ============================================
// REACTIONS
// ============================================

export const WithReactions: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Pin a reaction pill to the corner of each bubble.',
      },
    },
  },
  render: () => ({
    components: { Bubble, BubbleContent, BubbleGroup, BubbleReactions },
    template: `
      <BubbleGroup class="nx:w-full nx:max-w-md">
        <Bubble align="start">
          <BubbleContent>Landed the marker primitive.</BubbleContent>
          <BubbleReactions>🎉 3</BubbleReactions>
        </Bubble>
        <Bubble align="end" variant="primary">
          <BubbleContent>Reviewing it now.</BubbleContent>
          <BubbleReactions>👀 1</BubbleReactions>
        </Bubble>
      </BubbleGroup>
    `,
  }),
};

export const ReactionSideAndAlign: Story = {
  render: () => ({
    components: bubbleComponents,
    setup: () => ({
      corners: ['top', 'bottom'].flatMap((side) =>
        ['start', 'end'].map((align) => ({ side, align }))
      ),
    }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-10 nx:pt-4">
        <div v-for="corner in corners" :key="corner.side + '-' + corner.align" class="nx:w-full nx:max-w-md">
          <p class="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">side="{{ corner.side }}" align="{{ corner.align }}"</p>
          <Bubble variant="muted">
            <BubbleContent>Every corner is reachable.</BubbleContent>
            <BubbleReactions :side="corner.side" :align="corner.align">✅ 2</BubbleReactions>
          </Bubble>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const pills = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="bubble-reactions"]'
    );

    await expect(pills).toHaveLength(4);

    for (const pill of pills) {
      const bubble = bubbleOf(pill);
      const bubbleBox = bubble.getBoundingClientRect();
      const pillBox = pill.getBoundingClientRect();

      // Guards against a silently-undefined utility: an unresolved inset would
      // leave the pill at its static position instead of the named corner.
      const pillStyle = getComputedStyle(pill);
      await expect(pillStyle.position).toBe('absolute');
      await expect(
        pill.dataset['align'] === 'start'
          ? pillStyle.insetInlineStart
          : pillStyle.insetInlineEnd
      ).not.toBe('auto');

      // The overhang is reserved by the turn itself, so the pill stays clear of
      // its neighbour whatever gap the surrounding stack happens to set.
      const bubbleStyle = getComputedStyle(bubble);

      if (pill.dataset['side'] === 'top') {
        await expect(pillBox.top).toBeLessThan(bubbleBox.top);
        await expect(bubbleBox.top - pillBox.top).toBeLessThanOrEqual(
          parseFloat(bubbleStyle.marginTop)
        );
      } else {
        await expect(pillBox.bottom).toBeGreaterThan(bubbleBox.bottom);
        await expect(pillBox.bottom - bubbleBox.bottom).toBeLessThanOrEqual(
          parseFloat(bubbleStyle.marginBottom)
        );
      }

      const inlineGap =
        pill.dataset['align'] === 'start'
          ? pillBox.left - bubbleBox.left
          : bubbleBox.right - pillBox.right;

      // 12px from `start-3` / `end-3`, plus the reserved 1px border.
      await expect(inlineGap).toBeGreaterThan(8);
      await expect(inlineGap).toBeLessThan(16);
    }
  },
};

// ============================================
// INTERACTION
// ============================================

export const LinksAndButtons: Story = {
  render: () => ({
    components: bubbleComponents,
    template: `
      <BubbleGroup class="nx:w-full nx:max-w-md">
        <Bubble align="start" variant="ghost">
          <BubbleContent as-child><a href="#thread">Jump to the full thread</a></BubbleContent>
        </Bubble>
        <Bubble align="start" variant="outline">
          <BubbleContent as-child><button type="button">Retry sending</button></BubbleContent>
        </Bubble>
        <Bubble align="end" variant="ghost">
          <BubbleContent as-child><a href="#release">Open the release notes</a></BubbleContent>
        </Bubble>
        <Bubble align="end" variant="destructive">
          <BubbleContent as-child><button type="button">Report this message</button></BubbleContent>
        </Bubble>
        <Bubble align="start" variant="muted">
          <BubbleContent>
            An inline <a href="#docs">link inside prose</a> is underlined the same
            way as a whole-bubble link, and a
            <a href="#opt-out" class="nx:no-underline!">consumer can opt out</a>.
          </BubbleContent>
        </Bubble>
        <Bubble align="start" variant="ghost">
          <BubbleContent as-child><a href="#quiet" class="nx:no-underline!">Opt a whole-bubble link out too</a></BubbleContent>
        </Bubble>
      </BubbleGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link', { name: 'Jump to the full thread' });
    const button = canvas.getByRole('button', { name: 'Retry sending' });

    await expect(link).toHaveAttribute('href', '#thread');
    await expect(link).toHaveAttribute('data-slot', 'bubble-content');
    await expect(button).toHaveAttribute('data-slot', 'bubble-content');

    // Links read as links on every surface, whether the body is the anchor or
    // merely contains one.
    const inlineLink = canvas.getByRole('link', {
      name: 'link inside prose',
    });

    for (const anchor of [link, inlineLink]) {
      await expect(getComputedStyle(anchor).textDecorationLine).toBe(
        'underline'
      );
    }

    // `!` is the documented way out for both halves of the underline rule —
    // the body's own anchor and a nested one. `!important` wins outright, so
    // this pins the escape hatch, not the specificity either rule carries.
    for (const name of [
      'consumer can opt out',
      'Opt a whole-bubble link out too',
    ]) {
      await expect(
        getComputedStyle(canvas.getByRole('link', { name })).textDecorationLine,
        name
      ).toBe('none');
    }

    await expect(getComputedStyle(link).cursor).toBe('pointer');
    await expect(getComputedStyle(button).cursor).toBe('pointer');

    // The padding lives on the content, so the hit target — and the focus ring
    // that traces it — covers the whole surface, not a box inset within it.
    for (const control of [link, button]) {
      const controlBox = control.getBoundingClientRect();
      const surfaceBox = bubbleOf(control).getBoundingClientRect();

      // 1px on every side: the border the surface reserves for `outline`.
      await expect(controlBox.left - surfaceBox.left).toBeLessThanOrEqual(1);
      await expect(surfaceBox.right - controlBox.right).toBeLessThanOrEqual(1);
      await expect(controlBox.top - surfaceBox.top).toBeLessThanOrEqual(1);
      await expect(surfaceBox.bottom - controlBox.bottom).toBeLessThanOrEqual(
        1
      );
    }

    // A whole-bubble link is identified by its underline, not by a surface.
    const linkBubbleStyle = getComputedStyle(bubbleOf(link));

    await expect(linkBubbleStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await expect(linkBubbleStyle.borderTopColor).toBe('rgba(0, 0, 0, 0)');

    // The prose bubble around an inline link keeps its surface.
    await expect(
      getComputedStyle(bubbleOf(inlineLink)).backgroundColor
    ).not.toBe('rgba(0, 0, 0, 0)');

    // Every interactive turn is reachable in document order.
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};

export const ClickInteraction: RetryStory = {
  args: { onRetry: fn() },
  render: (args) => ({
    components: bubbleComponents,
    setup: () => ({ args }),
    template: `
      <div class="nx:w-full nx:max-w-md">
        <Bubble variant="outline">
          <BubbleContent as-child>
            <button type="button" @click="args.onRetry">Retry sending this message</button>
          </BubbleContent>
        </Bubble>
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', {
      name: 'Retry sending this message',
    });

    await userEvent.click(button);
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};

export const KeyboardInteraction: OpenRunStory = {
  args: { onOpenRun: fn() },
  render: (args) => ({
    components: bubbleComponents,
    setup: () => ({ args }),
    template: `
      <div class="nx:w-full nx:max-w-md">
        <Bubble variant="outline">
          <BubbleContent as-child>
            <button type="button" @click="args.onOpenRun">Open the failing run</button>
          </BubbleContent>
        </Bubble>
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Open the failing run' });

    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onOpenRun).toHaveBeenCalledTimes(1);

    await userEvent.keyboard(' ');
    await expect(args.onOpenRun).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: RetryStory = {
  args: { onRetry: fn() },
  render: (args) => ({
    components: bubbleComponents,
    setup: () => ({ args }),
    template: `
      <div class="nx:w-full nx:max-w-md">
        <Bubble variant="outline">
          <BubbleContent as-child>
            <button type="button" disabled @click="args.onRetry">Retry sending this message</button>
          </BubbleContent>
        </Bubble>
        <Bubble variant="outline">
          <BubbleContent as-child>
            <button type="button" aria-disabled="true">Resending this message</button>
          </BubbleContent>
        </Bubble>
        <Bubble variant="ghost">
          <BubbleContent as-child>
            <a>Thread unavailable</a>
          </BubbleContent>
        </Bubble>
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', {
      name: 'Retry sending this message',
    });

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onRetry).not.toHaveBeenCalled();

    // A dead body must not advertise itself as actionable, however it is
    // deadened — `disabled`, `aria-disabled` (which nxds `Button` sets while
    // loading), or an anchor with nowhere to go. `LinksAndButtons` asserts the
    // live bodies do get the pointer.
    const deadAnchor = canvasElement.querySelector<HTMLElement>(
      'a[data-slot="bubble-content"]:not([href])'
    )!;
    const inert = [
      button,
      canvas.getByRole('button', { name: 'Resending this message' }),
      deadAnchor,
    ];

    for (const body of inert) {
      await expect(getComputedStyle(body).cursor).not.toBe('pointer');
    }

    // The underline is the whole-bubble link affordance, so an anchor with
    // nowhere to go must not wear it. Widening `a[href]` to `a` in
    // `BubbleContent.vue` fails here.
    await expect(getComputedStyle(deadAnchor).textDecorationLine).toBe('none');
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: bubbleComponents,
    template: `
      <div class="nx:w-full nx:max-w-md">
        <Bubble variant="destructive" align="end">
          <BubbleContent>Delivery failed.</BubbleContent>
          <BubbleReactions>⚠️ 1</BubbleReactions>
        </Bubble>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const bubble = canvasElement.querySelector('[data-slot="bubble"]')!;

    await expect(bubble).toHaveAttribute('data-slot', 'bubble');
    await expect(bubble).toHaveAttribute('data-variant', 'destructive');
    await expect(bubble).toHaveAttribute('data-align', 'end');

    await expect(
      bubble.querySelector('[data-slot="bubble-content"]')
    ).not.toBeNull();
    const pill = bubble.querySelector('[data-slot="bubble-reactions"]')!;

    await expect(pill).not.toBeNull();
    await expect(pill).toHaveAttribute('data-side', 'bottom');
    await expect(pill).toHaveAttribute('data-align', 'end');
  },
};

// ============================================
// EDGE CASES
// ============================================

export const LongUnbrokenContent: Story = {
  render: () => ({
    components: bubbleComponents,
    template: `
      <BubbleGroup class="nx:w-full nx:max-w-md">
        <Bubble>
          <BubbleContent>https://nexuslabs.example.com/observability/traces/0f3a9c1b-77de-4a02-9d31-2c8be5f10a44?span=render&amp;expand=all</BubbleContent>
        </Bubble>
        <Bubble align="end" variant="primary">
          <BubbleContent>Supercalifragilisticexpialidociousantidisestablishmentarianismpneumonoultramicroscopicsilicovolcanoconiosis</BubbleContent>
        </Bubble>
      </BubbleGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector<HTMLElement>(
      '[data-slot="bubble-group"]'
    )!;
    const bubbles = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="bubble"]'
    );

    // `max-w-[min(80%,45rem)]` against a 28rem column, so the 80% binds. The
    // container width alone would pass a bubble that had lost its cap.
    const cap = 0.8 * group.getBoundingClientRect().width;

    for (const bubble of bubbles) {
      await expect(bubble.getBoundingClientRect().width).toBeLessThanOrEqual(
        cap + 1
      );
      await expect(bubble.scrollWidth).toBeLessThanOrEqual(
        bubble.clientWidth + 1
      );
    }
  },
};

export const WithCodeBlock: Story = {
  render: () => ({
    components: bubbleComponents,
    template: `
      <div class="nx:w-full nx:max-w-md">
        <Bubble>
          <BubbleContent>
            <p class="nx:mb-2">Run <code class="nx:typography-code-inline">pnpm audit:contrast</code> before pushing:</p>
            <pre class="nx:rounded-md nx:bg-container nx:p-3 nx:typography-code-block nx:text-container-foreground"><code>pnpm --filter @nxds/core audit:contrast --reporter=verbose --bail</code></pre>
          </BubbleContent>
        </Bubble>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const bubble = canvasElement.querySelector<HTMLElement>(
      '[data-slot="bubble"]'
    )!;
    const pre = bubble.querySelector<HTMLElement>('pre')!;

    await expect(getComputedStyle(pre).whiteSpace).toBe('pre-wrap');
    await expect(pre.scrollWidth).toBeLessThanOrEqual(pre.clientWidth + 1);
    await expect(pre.getBoundingClientRect().right).toBeLessThanOrEqual(
      bubble.getBoundingClientRect().right + 1
    );
    await expect(bubble.scrollWidth).toBeLessThanOrEqual(
      bubble.clientWidth + 1
    );
  },
};

export const InScrollContainer: Story = {
  render: () => ({
    components: bubbleComponents,
    template: `
      <div
        data-testid="scroller"
        role="region"
        aria-label="Conversation"
        tabindex="0"
        class="nx:h-56 nx:w-full nx:max-w-md nx:overflow-y-auto nx:rounded-md nx:border-default nx:border-border-default nx:px-3 nx:py-4 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
      >
        <BubbleGroup>
          <Bubble align="start">
            <BubbleContent>First turn, pinned to the top of the scroller.</BubbleContent>
            <BubbleReactions side="top" align="start">👍 4</BubbleReactions>
          </Bubble>
          <Bubble align="end" variant="primary">
            <BubbleContent>Scrolling must not clip either pill.</BubbleContent>
          </Bubble>
          <Bubble align="start">
            <BubbleContent>The overhang is reserved by the bubble, so a scroll container crops nothing that a non-scrolling stack would show.</BubbleContent>
            <BubbleReactions side="bottom" align="end">🎉 2</BubbleReactions>
          </Bubble>
        </BubbleGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const scroller = within(canvasElement).getByTestId('scroller');
    const pills = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="bubble-reactions"]'
    );

    await expect(pills).toHaveLength(2);

    // Everything below only means something while the column overflows, so
    // trimmed copy must fail here rather than silently stop testing scroll.
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);

    // A pill overhangs the bubble, so the scroller must not gain a horizontal
    // scroll region — that would mean the inline edge is being cropped.
    await expect(scroller.scrollWidth).toBeLessThanOrEqual(
      scroller.clientWidth + 1
    );

    const scrollerBox = scroller.getBoundingClientRect();

    for (const pill of pills) {
      const pillBox = pill.getBoundingClientRect();

      // Inline edges stay inside the padding box on both sides.
      await expect(pillBox.left).toBeGreaterThanOrEqual(scrollerBox.left);
      await expect(pillBox.right).toBeLessThanOrEqual(scrollerBox.right);
    }

    // The top pill hangs above its own bubble yet still clears the scroller's
    // top edge, because the bubble reserved the 12px rather than the stack.
    const topPill = [...pills].find((pill) => pill.dataset['side'] === 'top')!;
    const topBubble = bubbleOf(topPill);

    await expect(topPill.getBoundingClientRect().top).toBeLessThan(
      topBubble.getBoundingClientRect().top
    );
    await expect(topPill.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      scrollerBox.top
    );
  },
};

// ============================================
// COMPOSITION
// ============================================

const receiptIconClassName =
  'nx:inline-flex nx:size-5 nx:shrink-0 nx:cursor-pointer nx:items-center nx:justify-center nx:rounded-sm nx:opacity-70 nx:transition-opacity nx:duration-faster nx:hover:opacity-100 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&_svg]:size-4';

export const WithTooltip: Story = {
  render: () => ({
    components: {
      ...bubbleComponents,
      IconChecks,
      Tooltip,
      TooltipContent,
      TooltipProvider,
      TooltipTrigger,
    },
    setup: () => ({ receiptIconClassName }),
    template: `
      <TooltipProvider :delay-duration="0">
        <BubbleGroup class="nx:w-full nx:max-w-md">
          <Bubble align="end" variant="primary" class="nx:flex nx:items-end nx:gap-2">
            <BubbleContent>Deployed the release candidate.</BubbleContent>
            <Tooltip>
              <TooltipTrigger as-child>
                <button type="button" aria-label="Delivery details" :class="receiptIconClassName">
                  <IconChecks />
                </button>
              </TooltipTrigger>
              <TooltipContent>Read 09:15 &middot; 24 Aug 2026</TooltipContent>
            </Tooltip>
          </Bubble>
        </BubbleGroup>
      </TooltipProvider>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('button', { name: 'Delivery details' });

    await expect(
      document.querySelector('[data-slot="tooltip-content"]')
    ).toBeNull();

    await userEvent.hover(icon);
    await waitFor(async () => {
      await expect(
        document.querySelector('[data-slot="tooltip-content"]')
      ).toBeInTheDocument();
    });

    // Reka closes only once the pointer leaves the trigger-to-tooltip grace
    // area.
    await userEvent.unhover(icon);
    await userEvent.pointer({
      coords: {
        clientX: window.innerWidth - 1,
        clientY: window.innerHeight - 1,
      },
    });
    await waitFor(async () => {
      await expect(
        document.querySelector('[data-slot="tooltip-content"]')
      ).toBeNull();
    });
  },
};

export const WithPopover: Story = {
  render: () => ({
    components: {
      ...bubbleComponents,
      IconInfoCircle,
      Popover,
      PopoverContent,
      PopoverTrigger,
    },
    setup: () => ({ receiptIconClassName }),
    template: `
      <BubbleGroup class="nx:w-full nx:max-w-md">
        <Bubble align="start" class="nx:flex nx:items-end nx:gap-2">
          <BubbleContent>Merged #666 into main.</BubbleContent>
          <Popover>
            <PopoverTrigger as-child>
              <button type="button" aria-label="Message details" :class="receiptIconClassName">
                <IconInfoCircle />
              </button>
            </PopoverTrigger>
            <PopoverContent aria-labelledby="bubble-popover-heading" class="nx:flex nx:flex-col nx:gap-1">
              <p id="bubble-popover-heading" class="nx:typography-label-default">Message details</p>
              <p class="nx:typography-body-small nx:text-muted-foreground">Sent 09:14 &middot; edited once &middot; seen by 3 people</p>
            </PopoverContent>
          </Popover>
        </Bubble>
      </BubbleGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('button', { name: 'Message details' });
    const body = within(document.body);

    await expect(icon).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(icon);
    await waitFor(async () => {
      await expect(body.getByText('Message details')).toBeVisible();
    });
    await expect(icon).toHaveAttribute('aria-expanded', 'true');

    // The panel is a `role="dialog"`, so it owns an accessible name of its own.
    await expect(
      body.getByRole('dialog', { name: 'Message details' })
    ).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(body.queryByText('Message details')).toBeNull();
    });
    await expect(icon).toHaveFocus();
  },
};

export const ShowMore: Story = {
  render: () => ({
    components: {
      ...bubbleComponents,
      Button,
      Collapsible,
      CollapsibleContent,
      CollapsibleTrigger,
    },
    setup: () => ({ open: ref(false) }),
    template: `
      <BubbleGroup class="nx:w-full nx:max-w-md">
        <Bubble align="start">
          <BubbleContent>
            <Collapsible v-model:open="open">
              <p>The token refactor renamed four semantic entries without updating the registry, so the theme engine fell back to primitives.</p>
              <CollapsibleContent class="nx:mt-2 nx:flex nx:flex-col nx:gap-2">
                <p>The APCA gate still passed because it reads resolved values, not registry membership &mdash; which is why the audit stayed green.</p>
                <p>Fix is to reroute the four entries and add a registry-membership assertion to the class-ref audit.</p>
              </CollapsibleContent>
              <CollapsibleTrigger as-child>
                <Button variant="ghost" size="sm" class="nx:mt-2 nx:-ms-2.5">{{ open ? 'Show less' : 'Show more' }}</Button>
              </CollapsibleTrigger>
            </Collapsible>
          </BubbleContent>
        </Bubble>
      </BubbleGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Show more' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText(/APCA gate still passed/)).toBeNull();

    await userEvent.click(trigger);

    await waitFor(async () => {
      await expect(canvas.getByText(/APCA gate still passed/)).toBeVisible();
    });
    const collapseTrigger = canvas.getByRole('button', { name: 'Show less' });
    await expect(collapseTrigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(collapseTrigger);

    await waitFor(async () => {
      await expect(canvas.queryByText(/APCA gate still passed/)).toBeNull();
    });
    await expect(
      canvas.getByRole('button', { name: 'Show more' })
    ).toBeInTheDocument();
  },
};

// ============================================
// SHOWCASE
// ============================================

export const AllVariants: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Compare every variant aligned to the start and the end.',
      },
    },
  },
  render: () => ({
    components: { Bubble, BubbleContent, BubbleGroup },
    setup: () => ({
      variants: ['muted', 'primary', 'outline', 'ghost', 'destructive'],
    }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-6">
        <div v-for="variant in variants" :key="variant" class="nx:w-full nx:max-w-md">
          <p class="nx:mb-2 nx:typography-label-small nx:text-muted-foreground">{{ variant }}</p>
          <BubbleGroup>
            <Bubble :variant="variant" align="start">
              <BubbleContent>Aligned to the inline start.</BubbleContent>
            </Bubble>
            <Bubble :variant="variant" align="end">
              <BubbleContent>Aligned to the inline end.</BubbleContent>
            </Bubble>
          </BubbleGroup>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const bubbles = canvasElement.querySelectorAll('[data-slot="bubble"]');

    await expect(bubbles).toHaveLength(VARIANTS.length * 2);
  },
};
