<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  AvatarImage,
  type AvatarImageEmits,
  type AvatarImageProps as RekaAvatarImageProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AvatarImageProps extends RekaAvatarImageProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AvatarImageProps>();
const emits = defineEmits<AvatarImageEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <AvatarImage
    v-bind="forwarded"
    data-slot="avatar-image"
    decoding="async"
    :class="
      cn(
        'nx:aspect-square nx:size-full nx:rounded-[inherit] nx:object-cover',
        'nx:animate-in nx:fade-in-0 nx:duration-fast nx:ease-enter',
        props.class
      )
    "
  />
</template>
