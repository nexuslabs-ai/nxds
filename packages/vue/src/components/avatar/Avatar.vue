<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { AvatarRoot, type AvatarRootProps } from 'reka-ui';
import { computed, type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';

import { AvatarGroupKey, type AvatarVariants, avatarVariants } from '.';

export interface AvatarProps extends AvatarRootProps {
  size?: AvatarVariants['size'];
  shape?: AvatarVariants['shape'];
  /**
   * Draws a non-interactive emphasis ring, such as for a selected person. Put focus rings on the interactive wrapper.
   */
  ring?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<AvatarProps>(), { ring: false });

const delegated = reactiveOmit(props, 'class', 'size', 'shape', 'ring');

const group = inject(AvatarGroupKey, undefined);
const size = computed(() => props.size ?? group?.size);
const shape = computed(() => props.shape ?? group?.shape);
</script>

<template>
  <AvatarRoot
    v-bind="delegated"
    data-slot="avatar"
    :data-size="size ?? 'md'"
    :data-shape="shape ?? 'circle'"
    :data-ring="ring || undefined"
    :class="
      cn(
        avatarVariants({ size, shape }),
        ring &&
          'nx:ring-2 nx:ring-primary-border nx:ring-offset-2 nx:ring-offset-surface',
        props.class
      )
    "
  >
    <slot />
  </AvatarRoot>
</template>
