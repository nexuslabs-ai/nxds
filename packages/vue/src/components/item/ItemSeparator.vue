<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import type { SeparatorProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Separator } from '../separator';

export interface ItemSeparatorProps extends SeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ItemSeparatorProps>(), {
  orientation: 'horizontal',
  decorative: true,
});

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <Separator
    v-bind="delegated"
    data-slot="item-separator"
    :class="cn('nx:my-0', props.class)"
  />
</template>
