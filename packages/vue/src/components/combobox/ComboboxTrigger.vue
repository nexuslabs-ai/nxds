<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { PopoverTrigger } from 'reka-ui';
import type { HTMLAttributes, VNode } from 'vue';

import { IconSelector } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from '../button';

export interface ComboboxTriggerProps extends Omit<
  ButtonProps,
  'class' | 'iconOnly'
> {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ComboboxTriggerProps>(), {
  as: 'button',
  variant: 'outline',
  type: 'button',
});

const slots = defineSlots<{
  default?: () => VNode[];
  'start-icon'?: () => VNode[];
  'end-icon'?: () => VNode[];
}>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <PopoverTrigger as-child>
    <Button
      v-bind="{ ...delegated, ...$attrs }"
      data-slot="combobox-trigger"
      :class="
        cn(
          'nx:w-full nx:justify-between',
          'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error',
          props.class
        )
      "
    >
      <template v-if="slots['start-icon']" #start-icon>
        <slot name="start-icon" />
      </template>
      <slot />
      <IconSelector
        aria-hidden="true"
        data-slot="combobox-trigger-icon"
        class="nx:shrink-0 nx:text-muted-foreground"
      />
      <template v-if="slots['end-icon']" #end-icon>
        <slot name="end-icon" />
      </template>
    </Button>
  </PopoverTrigger>
</template>
