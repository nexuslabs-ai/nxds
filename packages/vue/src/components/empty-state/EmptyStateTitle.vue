<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface EmptyStateTitleProps extends PrimitiveProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<EmptyStateTitleProps>(), { as: 'div' });
</script>

<template>
  <Primitive
    data-slot="empty-state-title"
    :as="as"
    :as-child="asChild"
    :class="cn('nx:m-0 nx:typography-heading-xxsmall', props.class)"
  >
    <slot />
  </Primitive>
</template>
