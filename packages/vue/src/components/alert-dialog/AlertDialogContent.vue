<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  AlertDialogContent,
  type AlertDialogContentEmits,
  type AlertDialogContentProps as RekaAlertDialogContentProps,
  AlertDialogPortal,
  useForwardPropsEmits,
} from 'reka-ui';
import { computed, type HTMLAttributes, provide, reactive } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayContentVariants,
  resolveOverlayButtonOrientation,
} from '../overlay-layout/overlay-layout';

import AlertDialogOverlay from './AlertDialogOverlay.vue';

import { AlertDialogLayoutKey, type AlertDialogVariant } from '.';

export interface AlertDialogContentProps extends RekaAlertDialogContentProps {
  /**
   * Layout. `default` left-aligns the header and puts actions in a row.
   * `center` centers the header and stacks full-width actions.
   */
  variant?: AlertDialogVariant;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<AlertDialogContentProps>(), {
  variant: 'default',
});
const emits = defineEmits<AlertDialogContentEmits>();

const delegated = reactiveOmit(props, 'class', 'variant');
const forwarded = useForwardPropsEmits(delegated, emits);

const buttonOrientation = computed(() =>
  resolveOverlayButtonOrientation(props.variant)
);

provide(
  AlertDialogLayoutKey,
  reactive({ variant: computed(() => props.variant), buttonOrientation })
);
</script>

<template>
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="alert-dialog-content"
      :data-variant="variant"
      :data-orientation="buttonOrientation"
      :class="
        cn(
          overlayContentVariants(),
          variant === 'center' && 'nx:max-w-xs',
          props.class
        )
      "
    >
      <slot />
    </AlertDialogContent>
  </AlertDialogPortal>
</template>
