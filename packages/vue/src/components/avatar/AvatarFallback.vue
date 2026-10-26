<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  AvatarFallback,
  type AvatarFallbackProps as RekaAvatarFallbackProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AvatarFallbackProps extends RekaAvatarFallbackProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AvatarFallbackProps>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <AvatarFallback
    v-bind="delegated"
    data-slot="avatar-fallback"
    :class="
      cn(
        'nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-[inherit] nx:bg-muted nx:text-foreground nx:font-medium nx:leading-none',
        props.class
      )
    "
  >
    <slot />
  </AvatarFallback>
</template>
