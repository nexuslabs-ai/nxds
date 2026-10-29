<script setup lang="ts">
import { IconArrowLeft } from '@tabler/icons-vue';
import { reactiveOmit } from '@vueuse/core';

import { cn } from '../../lib/utils';
import { Button, type ButtonProps, type ButtonVariants } from '../button';

import { carouselControlClasses, injectCarousel } from '.';

export interface CarouselPreviousProps extends Omit<
  ButtonProps,
  'variant' | 'iconOnly' | 'asChild'
> {
  variant?: ButtonVariants['variant'];
}

const props = withDefaults(defineProps<CarouselPreviousProps>(), {
  as: 'button',
  variant: 'outline',
  loading: false,
  disabled: undefined,
  type: 'button',
});

const delegated = reactiveOmit(props, 'class', 'disabled');

const { orientation, scrollPrev, canScrollPrev } = injectCarousel();
</script>

<template>
  <Button
    v-bind="delegated"
    icon-only
    data-slot="carousel-previous"
    :disabled="disabled ?? !canScrollPrev"
    :class="
      cn(
        carouselControlClasses,
        orientation === 'horizontal'
          ? 'nx:top-1/2 nx:-left-12 nx:-translate-y-1/2'
          : 'nx:-top-12 nx:left-1/2 nx:-translate-x-1/2 nx:rotate-90',
        props.class
      )
    "
    @click="scrollPrev"
  >
    <template #start-icon><IconArrowLeft /></template>Previous slide</Button
  >
</template>
