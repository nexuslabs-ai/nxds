<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Separator } from '../separator';

export interface SidebarSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SidebarSeparatorProps>();
</script>

<template>
  <Separator
    data-slot="sidebar-separator"
    :class="
      cn(
        'nx:mx-2 nx:data-[orientation=horizontal]:w-auto nx:bg-nav-border',
        props.class
      )
    "
  />
</template>
