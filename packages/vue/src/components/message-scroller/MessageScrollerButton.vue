<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { computed } from 'vue';

import { IconArrowDown, IconArrowUp } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from '../button';

import {
  type MessageScrollerButtonVariants,
  messageScrollerButtonVariants,
  useMessageScroller,
} from '.';

export interface MessageScrollerButtonProps extends Omit<
  ButtonProps,
  'asChild' | 'iconOnly'
> {
  direction?: MessageScrollerButtonVariants['direction'];
}

const props = withDefaults(defineProps<MessageScrollerButtonProps>(), {
  as: 'button',
  direction: 'end',
  variant: 'outline',
  size: 'sm',
  loading: false,
  type: 'button',
});

const delegated = reactiveOmit(props, 'class', 'direction');

const { isScrollable, isAtEnd, isAtStart, scrollToEnd, scrollToStart } =
  useMessageScroller();

const icon = computed(() =>
  props.direction === 'end' ? IconArrowDown : IconArrowUp
);
const label = computed(() =>
  props.direction === 'end'
    ? 'Scroll to the latest message'
    : 'Scroll to the oldest message'
);

const isActive = computed(
  () =>
    isScrollable.value &&
    (props.direction === 'end' ? !isAtEnd.value : !isAtStart.value)
);
</script>

<template>
  <Button
    v-bind="delegated"
    data-slot="message-scroller-button"
    :data-direction="direction"
    :data-active="isActive"
    icon-only
    :class="cn(messageScrollerButtonVariants({ direction }), props.class)"
    @click="direction === 'end' ? scrollToEnd() : scrollToStart()"
  >
    <template #start-icon><component :is="icon" /></template>{{ label }}</Button
  >
</template>
