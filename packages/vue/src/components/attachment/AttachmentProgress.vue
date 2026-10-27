<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import type { ProgressRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Progress } from '../progress';

export interface AttachmentProgressProps extends ProgressRootProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AttachmentProgressProps>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <!-- A consumer's aria-label falls through over this default. -->
  <Progress
    v-bind="delegated"
    data-slot="attachment-progress"
    aria-label="Upload progress"
    :class="cn('nx:mt-1 nx:h-1', props.class)"
  />
</template>
