import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from './bubble';
import bubbleMeta, {
  LinksAndButtons,
  LongUnbrokenContent,
  ReactionSideAndAlign,
  RightToLeft,
  WithCodeBlock,
} from './Bubble.stories';

const meta: Meta<typeof Bubble> = {
  ...bubbleMeta,
  title: 'Tests/Bubble',
};

export default meta;
type Story = StoryObj<typeof Bubble>;

function bubbleOf(element: Element): HTMLElement {
  return element.closest<HTMLElement>('[data-slot="bubble"]')!;
}

export const RightToLeftPlacement: Story = {
  ...RightToLeft,
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
        pill.dataset.align === 'start'
          ? bubbleBox.right - pillBox.right
          : pillBox.left - bubbleBox.left;

      await expect(inlineGap).toBeGreaterThan(8);
      await expect(inlineGap).toBeLessThan(16);
    }
  },
};

export const ReactionSideAndAlignPlacement: Story = {
  ...ReactionSideAndAlign,
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
        pill.dataset.align === 'start'
          ? pillStyle.insetInlineStart
          : pillStyle.insetInlineEnd
      ).not.toBe('auto');

      // The overhang is reserved by the turn itself, so the pill stays clear of
      // its neighbour whatever gap the surrounding stack happens to set.
      const bubbleStyle = getComputedStyle(bubble);

      if (pill.dataset.side === 'top') {
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
        pill.dataset.align === 'start'
          ? pillBox.left - bubbleBox.left
          : bubbleBox.right - pillBox.right;

      // 12px from `start-3` / `end-3`, plus the reserved 1px border.
      await expect(inlineGap).toBeGreaterThan(8);
      await expect(inlineGap).toBeLessThan(16);
    }
  },
};

export const LinksAndButtonsStyle: Story = {
  ...LinksAndButtons,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link', { name: 'Jump to the full thread' });
    const button = canvas.getByRole('button', { name: 'Retry sending' });

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
  },
};

export const DisabledStyle: Story = {
  render: () => (
    <div className="nx:w-full nx:max-w-md">
      <Bubble variant="outline">
        <BubbleContent asChild>
          <button type="button" disabled>
            Retry sending this message
          </button>
        </BubbleContent>
      </Bubble>
      <Bubble variant="outline">
        <BubbleContent asChild>
          <button type="button" aria-disabled="true">
            Resending this message
          </button>
        </BubbleContent>
      </Bubble>
      <Bubble variant="ghost">
        <BubbleContent asChild>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid -- the hrefless anchor is the case under test: an unnavigable body must not read as actionable */}
          <a>Thread unavailable</a>
        </BubbleContent>
      </Bubble>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // A dead body must not advertise itself as actionable, however it is
    // deadened — `disabled`, `aria-disabled` (which nxds `Button` sets while
    // loading), or an anchor with nowhere to go. `LinksAndButtonsStyle`
    // asserts the live bodies do get the pointer.
    const deadAnchor = canvasElement.querySelector<HTMLElement>(
      'a[data-slot="bubble-content"]:not([href])'
    )!;
    const inert = [
      canvas.getByRole('button', { name: 'Retry sending this message' }),
      canvas.getByRole('button', { name: 'Resending this message' }),
      deadAnchor,
    ];

    for (const body of inert) {
      await expect(getComputedStyle(body).cursor).not.toBe('pointer');
    }

    // The underline is the whole-bubble link affordance, so an anchor with
    // nowhere to go must not wear it. Widening `a[href]` to `a` in
    // `bubble.tsx` fails here.
    await expect(getComputedStyle(deadAnchor).textDecorationLine).toBe('none');
  },
};

export const LongUnbrokenContentGeometry: Story = {
  ...LongUnbrokenContent,
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

export const WithCodeBlockGeometry: Story = {
  ...WithCodeBlock,
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
  render: () => (
    <div
      data-testid="scroller"
      role="region"
      aria-label="Conversation"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- axe requires a scrollable region to be keyboard-reachable (scrollable-region-focusable), which is the behaviour this story exists to prove
      tabIndex={0}
      className="nx:h-56 nx:w-full nx:max-w-md nx:overflow-y-auto nx:rounded-md nx:border-default nx:border-border-default nx:px-3 nx:py-4 nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
    >
      <BubbleGroup>
        <Bubble align="start">
          <BubbleContent>
            First turn, pinned to the top of the scroller.
          </BubbleContent>
          <BubbleReactions side="top" align="start">
            👍 4
          </BubbleReactions>
        </Bubble>
        <Bubble align="end" variant="primary">
          <BubbleContent>Scrolling must not clip either pill.</BubbleContent>
        </Bubble>
        <Bubble align="start">
          <BubbleContent>
            The overhang is reserved by the bubble, so a scroll container crops
            nothing that a non-scrolling stack would show.
          </BubbleContent>
          <BubbleReactions side="bottom" align="end">
            🎉 2
          </BubbleReactions>
        </Bubble>
      </BubbleGroup>
    </div>
  ),
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
    const topPill = [...pills].find((pill) => pill.dataset.side === 'top')!;
    const topBubble = bubbleOf(topPill);

    await expect(topPill.getBoundingClientRect().top).toBeLessThan(
      topBubble.getBoundingClientRect().top
    );
    await expect(topPill.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      scrollerBox.top
    );
  },
};
