<script setup lang="ts">
import { reactiveOmit, useVModel } from '@vueuse/core';
import { PinInputRoot, type PinInputRootProps, useForwardProps } from 'reka-ui';
import { computed, type HTMLAttributes, provide, useAttrs } from 'vue';

import { cn } from '../../lib/utils';

import { InputOTPKey } from '.';

export interface InputOTPProps extends Omit<
  PinInputRootProps,
  'modelValue' | 'defaultValue' | 'otp'
> {
  modelValue?: string;
  defaultValue?: string;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<InputOTPProps>();
const emits = defineEmits<{
  'update:modelValue': [value: string];
  complete: [value: string];
}>();

// Reka holds one character per slot; the code is one string, as in React.
const model = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue ?? '',
});
const characters = computed(() => [...(model.value ?? '')]);

// The root is a role-less <div>, so each slot's <input> takes the naming and
// invalid ARIA instead.
const attrs = useAttrs();
const slotAttrs = computed(() => ({
  'aria-label': attrs['aria-label'],
  'aria-labelledby': attrs['aria-labelledby'],
  'aria-invalid': attrs['aria-invalid'],
}));
provide(InputOTPKey, slotAttrs);

function rootAttrs() {
  return Object.fromEntries(
    Object.entries(attrs).filter(([name]) => !(name in slotAttrs.value))
  );
}

const delegated = reactiveOmit(props, 'class', 'modelValue', 'defaultValue');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <PinInputRoot
    v-bind="{ ...forwarded, ...rootAttrs() }"
    :model-value="characters"
    otp
    data-slot="input-otp"
    :class="
      cn('nx:group/input-otp nx:flex nx:items-center nx:gap-2', props.class)
    "
    @update:model-value="model = $event.join('')"
    @complete="emits('complete', $event.join(''))"
  >
    <slot />
  </PinInputRoot>
</template>
