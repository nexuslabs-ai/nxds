<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import type { AvatarRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Avatar, type AvatarVariants } from '../avatar';

export interface MessageAvatarProps extends AvatarRootProps {
  size?: AvatarVariants['size'];
  shape?: AvatarVariants['shape'];
  /**
   * Draws a non-interactive emphasis ring, such as for a selected person. Put focus rings on the interactive wrapper.
   */
  ring?: boolean;
  /**
   * Keeps the avatar's space but hides it. Use it on follow-up turns from the
   * same speaker so their bodies line up with the first turn.
   */
  placeholder?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<MessageAvatarProps>(), {
  size: 'sm',
  ring: false,
  placeholder: false,
});

const delegated = reactiveOmit(props, 'class', 'placeholder');
</script>

<template>
  <Avatar
    v-bind="delegated"
    data-slot="message-avatar"
    :data-placeholder="placeholder || undefined"
    :class="cn('nx:self-start', placeholder && 'nx:invisible', props.class)"
  >
    <slot />
  </Avatar>
</template>
