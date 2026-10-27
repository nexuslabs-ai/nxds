<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ItemDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ItemDescriptionProps>();
</script>

<template>
  <p
    data-slot="item-description"
    data-item-part="description"
    :class="
      cn(
        'nx:m-0 nx:line-clamp-2 nx:typography-body-default nx:text-balance nx:text-muted-foreground nx:[&>a]:text-inherit nx:[&>a]:underline nx:[&>a]:underline-offset-4 nx:[&>a:hover]:text-primary-subtle-foreground',
        props.class
      )
    "
  >
    <slot />
  </p>
</template>
