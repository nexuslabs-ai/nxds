<script setup lang="ts">
import { provide, readonly, ref, shallowRef, type VNode, watch } from 'vue';

import { MessageScrollerKey } from './message-scroller-context';

export type MessageScrollerProviderProps = Record<string, never>;

defineSlots<{
  default?: (props: {
    isScrollable: boolean;
    isAtEnd: boolean;
    isAtStart: boolean;
    scrollToEnd: () => void;
    scrollToStart: () => void;
  }) => VNode[];
}>();

/** Slack a scroll position gets before it stops counting as "at the edge". */
const EDGE_THRESHOLD = 24;

// Inline, so `reduceMotion`'s `scroll-behavior: auto !important` still wins.
function smoothScrollTo(viewport: HTMLElement, top: number) {
  const previous = viewport.style.scrollBehavior;
  viewport.style.scrollBehavior = 'smooth';
  viewport.scrollTo({ top });
  viewport.style.scrollBehavior = previous;
}

const viewportNode = shallowRef<HTMLElement | null>(null);
const contentNode = shallowRef<HTMLElement | null>(null);
let pinned = true;
// Set while `scrollToStart` animates away from the end, whose first frames
// are still near enough to the end to re-pin.
let leavingEnd = false;

const isScrollable = ref(false);
const isAtEnd = ref(true);
const isAtStart = ref(true);

watch(
  [viewportNode, contentNode],
  ([viewport, content], _, onCleanup) => {
    if (!viewport || !content) return;

    let lastScrollTop = 0;

    const isNearEnd = () =>
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <=
      EDGE_THRESHOLD;

    const measure = () => {
      lastScrollTop = viewport.scrollTop;
      isAtEnd.value = isNearEnd();
      isAtStart.value = viewport.scrollTop <= EDGE_THRESHOLD;
      isScrollable.value = viewport.scrollHeight - viewport.clientHeight > 1;
    };

    // A scroll event can be dispatched after content has already grown, so it
    // would measure the old position against the new height. Only an upward
    // move releases the pin; reaching the end restores it, except while
    // `scrollToStart` is still animating away from the end.
    const handleScroll = () => {
      const { scrollTop } = viewport;
      if (scrollTop < lastScrollTop) pinned = false;
      if (scrollTop > lastScrollTop || scrollTop === 0) leavingEnd = false;
      if (isNearEnd() && !leavingEnd) pinned = true;
      measure();
    };

    const holdEnd = () => {
      if (pinned) viewport.scrollTo({ top: viewport.scrollHeight });
      measure();
    };

    const observer = new ResizeObserver(holdEnd);

    pinned = true;
    viewport.scrollTo({ top: viewport.scrollHeight });
    measure();
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    observer.observe(content);
    observer.observe(viewport);

    onCleanup(() => {
      viewport.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    });
  },
  { flush: 'post' }
);

// Pinning first lets the resize observer carry the scroll the rest of the
// way when content grows mid-animation.
function scrollToEnd() {
  const viewport = viewportNode.value;
  if (!viewport) return;
  pinned = true;
  leavingEnd = false;
  smoothScrollTo(viewport, viewport.scrollHeight);
}

function scrollToStart() {
  const viewport = viewportNode.value;
  // Already at the start, no scroll event would follow to clear the flag.
  if (!viewport || viewport.scrollTop === 0) return;
  pinned = false;
  leavingEnd = true;
  smoothScrollTo(viewport, 0);
}

provide(MessageScrollerKey, {
  isScrollable: readonly(isScrollable),
  isAtEnd: readonly(isAtEnd),
  isAtStart: readonly(isAtStart),
  scrollToEnd,
  scrollToStart,
  setViewport: (node) => {
    viewportNode.value = node;
  },
  setContent: (node) => {
    contentNode.value = node;
  },
});
</script>

<template>
  <slot
    :is-scrollable="isScrollable"
    :is-at-end="isAtEnd"
    :is-at-start="isAtStart"
    :scroll-to-end="scrollToEnd"
    :scroll-to-start="scrollToStart"
  />
</template>
