<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type CodeBlockVariants, codeBlockVariants } from '.';

export interface CodeBlockProps {
  variant?: CodeBlockVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<CodeBlockProps>(), {
  variant: 'default',
});
</script>

<template>
  <div
    data-slot="code-block"
    :data-variant="variant"
    :class="cn(codeBlockVariants({ variant }), props.class)"
  >
    <slot />
  </div>
</template>
