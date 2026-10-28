<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { computed, type VNode } from 'vue';

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
  'asChild'
> {
  direction?: MessageScrollerButtonVariants['direction'];
}

const props = withDefaults(defineProps<MessageScrollerButtonProps>(), {
  as: 'button',
  direction: 'end',
  variant: 'outline',
  size: 'icon-sm',
  loading: false,
  type: 'button',
});

const slots = defineSlots<{
  'start-icon'?: () => VNode[];
  'end-icon'?: () => VNode[];
}>();

const delegated = reactiveOmit(props, 'class', 'direction');

const { isScrollable, isAtEnd, isAtStart, scrollToEnd, scrollToStart } =
  useMessageScroller();

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
    :aria-label="
      direction === 'end'
        ? 'Scroll to the latest message'
        : 'Scroll to the oldest message'
    "
    :class="cn(messageScrollerButtonVariants({ direction }), props.class)"
    @click="direction === 'end' ? scrollToEnd() : scrollToStart()"
  >
    <template v-if="slots['start-icon']" #start-icon>
      <slot name="start-icon" />
    </template>
    <IconArrowDown v-if="direction === 'end'" />
    <IconArrowUp v-else />
    <template v-if="slots['end-icon']" #end-icon>
      <slot name="end-icon" />
    </template>
  </Button>
</template>
