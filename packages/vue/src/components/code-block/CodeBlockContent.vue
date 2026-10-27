<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import type { ScrollAreaRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import ScrollArea from '../scroll-area/ScrollArea.vue';
import ScrollBar from '../scroll-area/ScrollBar.vue';

export interface CodeBlockContentProps extends ScrollAreaRootProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CodeBlockContentProps>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <ScrollArea
    v-bind="delegated"
    data-slot="code-block-content"
    :class="
      cn(
        'nx:rounded-[inherit] nx:[&>[data-slot=scroll-area-viewport]]:max-h-[inherit]',
        'nx:[&>[data-slot=scroll-area-viewport]]:-outline-offset-2',
        props.class
      )
    "
  >
    <pre
      class="nx:m-0"
    ><code class="nx:grid nx:grid-cols-[auto_auto_minmax(0,1fr)] nx:py-4 nx:typography-code-block"><slot /></code></pre>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
</template>
