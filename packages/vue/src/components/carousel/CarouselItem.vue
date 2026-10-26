<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { injectCarousel } from '.';

export interface CarouselItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CarouselItemProps>();

const { orientation } = injectCarousel();
</script>

<template>
  <div
    role="group"
    aria-roledescription="slide"
    data-slot="carousel-item"
    :class="
      cn(
        'nx:min-w-0 nx:shrink-0 nx:grow-0 nx:basis-full',
        orientation === 'horizontal' ? 'nx:pl-4' : 'nx:pt-4',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
