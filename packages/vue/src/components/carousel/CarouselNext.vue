<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';

import { IconArrowRight } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button, type ButtonProps, type ButtonVariants } from '../button';

import { carouselControlClasses, injectCarousel } from '.';

export interface CarouselNextProps extends Omit<
  ButtonProps,
  'variant' | 'iconOnly' | 'asChild'
> {
  variant?: ButtonVariants['variant'];
}

const props = withDefaults(defineProps<CarouselNextProps>(), {
  as: 'button',
  variant: 'outline',
  loading: false,
  disabled: undefined,
  type: 'button',
});

const delegated = reactiveOmit(props, 'class', 'disabled');

const { orientation, scrollNext, canScrollNext } = injectCarousel();
</script>

<template>
  <Button
    v-bind="delegated"
    icon-only
    data-slot="carousel-next"
    :disabled="disabled ?? !canScrollNext"
    :class="
      cn(
        carouselControlClasses,
        orientation === 'horizontal'
          ? 'nx:top-1/2 nx:-right-12 nx:-translate-y-1/2'
          : 'nx:-bottom-12 nx:left-1/2 nx:-translate-x-1/2 nx:rotate-90',
        props.class
      )
    "
    @click="scrollNext"
  >
    <template #start-icon><IconArrowRight /></template>Next slide</Button
  >
</template>
