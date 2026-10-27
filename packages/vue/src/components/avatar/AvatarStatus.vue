<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import {
  type AvatarStatusVariants,
  avatarStatusVariants,
  STATUS_LABELS,
} from '.';

export interface AvatarStatusProps {
  status?: AvatarStatusVariants['status'];
  /**
   * Screen reader text for the dot, the capitalized `status` by default. Pass `''` when visible text already shows presence.
   */
  label?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<AvatarStatusProps>(), {
  status: 'online',
});

const resolvedLabel = computed(
  () => props.label ?? STATUS_LABELS[props.status ?? 'online']
);
</script>

<template>
  <span
    data-slot="avatar-status"
    :data-status="status"
    :class="cn(avatarStatusVariants({ status }), props.class)"
  >
    <span class="nx:sr-only">{{ resolvedLabel }}</span>
  </span>
</template>
