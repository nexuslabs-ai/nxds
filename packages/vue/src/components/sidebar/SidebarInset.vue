<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarInsetProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SidebarInsetProps>();
</script>

<template>
  <main
    data-slot="sidebar-inset"
    :class="
      cn(
        'nx:relative nx:flex nx:w-full nx:min-w-0 nx:flex-1 nx:flex-col nx:bg-background',
        'nx:md:peer-data-[variant=inset]:m-2 nx:md:peer-data-[variant=inset]:ml-0 nx:md:peer-data-[variant=inset]:rounded-xl nx:md:peer-data-[variant=inset]:shadow-sm nx:md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        props.class
      )
    "
  >
    <slot />
  </main>
</template>
