<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue';
import {
  computed,
  type HTMLAttributes,
  type MaybeRef,
  provide,
  ref,
  toRef,
  watch,
} from 'vue';

import { cn } from '../../lib/utils';

import { type CarouselApi, CarouselKey } from '.';

// Embla's option and plugin types are unwrapped inline, so the props table
// prints Embla's own type names.
export interface CarouselProps {
  /** Embla options, such as `loop`, `align` or `dragFree`. */
  opts?: Parameters<typeof emblaCarouselVue>[0] extends
    | MaybeRef<infer Options>
    | undefined
    ? Options
    : never;
  /** Embla plugins, such as autoplay or wheel gestures. */
  plugins?: Parameters<typeof emblaCarouselVue>[1] extends
    | MaybeRef<infer Plugins>
    | undefined
    ? Plugins
    : never;
  /**
   * Scroll axis.
   */
  orientation?: 'horizontal' | 'vertical';
  /** Receives the Embla API after setup, for external control. */
  setApi?: (api: CarouselApi) => void;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<CarouselProps>(), {
  orientation: 'horizontal',
});

const [carouselRef, api] = emblaCarouselVue(
  computed(() => ({
    ...props.opts,
    axis: props.orientation === 'horizontal' ? 'x' : 'y',
  })),
  computed(() => props.plugins ?? [])
);

const canScrollPrev = ref(false);
const canScrollNext = ref(false);

function readScrollState(carousel: CarouselApi) {
  canScrollPrev.value = carousel.canScrollPrev();
  canScrollNext.value = carousel.canScrollNext();
}

// Embla is an external system: read its scroll position now, follow it on
// select and reInit, and hand the API to the consumer once it exists.
watch(api, (carousel, _, onCleanup) => {
  if (!carousel) return;
  readScrollState(carousel);
  carousel.on('select', readScrollState).on('reInit', readScrollState);
  onCleanup(() => {
    carousel.off('select', readScrollState).off('reInit', readScrollState);
  });
  props.setApi?.(carousel);
});

function scrollPrev() {
  api.value?.scrollPrev();
}

function scrollNext() {
  api.value?.scrollNext();
}

function handleKeyDown(event: KeyboardEvent) {
  const isPrev =
    event.key ===
    (props.orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp');
  const isNext =
    event.key ===
    (props.orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown');
  if (!isPrev && !isNext) return;
  // Don't hijack arrow keys from a focused control that uses them itself.
  if (
    (event.target as HTMLElement).closest(
      'input, textarea, select, [contenteditable="true"]'
    )
  ) {
    return;
  }

  if (isPrev && !canScrollPrev.value) return;
  if (isNext && !canScrollNext.value) return;

  event.preventDefault();
  if (isPrev) scrollPrev();
  else scrollNext();
}

provide(CarouselKey, {
  carouselRef,
  orientation: toRef(props, 'orientation'),
  scrollPrev,
  scrollNext,
  canScrollPrev,
  canScrollNext,
});
</script>

<template>
  <div
    :class="cn('nx:relative', props.class)"
    role="region"
    aria-roledescription="carousel"
    data-slot="carousel"
    :data-orientation="orientation"
    @keydown.capture="handleKeyDown"
  >
    <slot />
  </div>
</template>
