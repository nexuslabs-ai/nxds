<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { IconCircleFilled } from '../../lib/icons';
import { cn } from '../../lib/utils';

export interface InputOTPSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<InputOTPSeparatorProps>();
</script>

<template>
  <div
    data-slot="input-otp-separator"
    aria-hidden="true"
    :class="cn('nx:flex nx:items-center', props.class)"
  >
    <IconCircleFilled class="nx:size-1 nx:text-muted-foreground" />
  </div>
</template>
