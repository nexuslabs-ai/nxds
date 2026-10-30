<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  RadioGroupIndicator,
  RadioGroupItem,
  type RadioGroupItemProps as RekaRadioGroupItemProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { IconCircleFilled } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';

export interface RadioGroupItemProps extends RekaRadioGroupItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<RadioGroupItemProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <RadioGroupItem
    v-bind="forwarded"
    data-slot="radio-group-item"
    :class="
      cn(
        'nx:group nx:relative nx:target-24 nx:size-icon-glyph-default nx:shrink-0 nx:cursor-pointer nx:rounded-full nx:p-0 nx:border-default nx:border-border-default nx:bg-container nx:icon-stroke',
        'nx:transition-control',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error',
        'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled nx:disabled:bg-disabled',
        'nx:data-[state=checked]:border-primary-background nx:data-[state=checked]:text-primary-background nx:data-[state=checked]:disabled:border-primary-disabled',
        'nx:aria-invalid:data-[state=checked]:border-error-border nx:aria-invalid:data-[state=checked]:text-error-background',
        props.class
      )
    "
  >
    <RadioGroupIndicator
      force-mount
      data-slot="radio-group-indicator"
      class="nx:flex nx:items-center nx:justify-center"
    >
      <IconCircleFilled
        data-slot="radio-group-dot"
        aria-hidden="true"
        :class="
          cn(
            'nx:size-[calc(var(--nx-icon-glyph-default)_-_6px)] nx:[--nx-icon-size:calc(var(--nx-icon-glyph-default)_-_6px)] nx:text-current',
            selectionIndicatorMotionClassName,
            'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
          )
        "
      />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
