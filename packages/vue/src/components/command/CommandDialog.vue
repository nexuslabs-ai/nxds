<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  DialogRoot,
  type DialogRootEmits,
  type DialogRootProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { DialogContent, DialogDescription, DialogTitle } from '../dialog';

import Command from './Command.vue';

export interface CommandDialogProps extends DialogRootProps {
  /**
   * Visually hidden dialog title. Also labels the search input.
   */
  title?: string;
  /**
   * Visually hidden dialog description.
   */
  description?: string;
  /**
   * Shows the dialog's close button. Escape and clicking outside close it either way.
   */
  showCloseButton?: boolean;
  /**
   * Class names for the DialogContent.
   */
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<CommandDialogProps>(), {
  title: 'Command Palette',
  description: 'Search for a command to run...',
  showCloseButton: false,
});
const emits = defineEmits<DialogRootEmits>();

const delegated = reactiveOmit(
  props,
  'title',
  'description',
  'showCloseButton',
  'class'
);
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DialogRoot v-bind="forwarded">
    <DialogContent
      :show-close-button="showCloseButton"
      :class="cn('nx:overflow-hidden nx:p-0', props.class)"
    >
      <DialogTitle class="nx:sr-only">{{ title }}</DialogTitle>
      <DialogDescription class="nx:sr-only">
        {{ description }}
      </DialogDescription>
      <Command :label="title"><slot /></Command>
    </DialogContent>
  </DialogRoot>
</template>
