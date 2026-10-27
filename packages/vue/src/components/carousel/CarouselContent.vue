<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { injectCarousel } from '.';

defineOptions({ inheritAttrs: false });

export interface CarouselContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CarouselContentProps>();

const { carouselRef, orientation } = injectCarousel();
</script>

<template>
  <div
    ref="carouselRef"
    class="nx:overflow-hidden"
    data-slot="carousel-content"
  >
    <div
      v-bind="$attrs"
      :class="
        cn(
          'nx:flex',
          orientation === 'horizontal' ? 'nx:-ml-4' : 'nx:-mt-4 nx:flex-col',
          props.class
        )
      "
    >
      <slot />
    </div>
  </div>
</template>
