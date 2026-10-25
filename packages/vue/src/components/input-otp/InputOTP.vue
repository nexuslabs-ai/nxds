<script setup lang="ts">
import { reactiveOmit, useVModel } from '@vueuse/core';
import { PinInputRoot, type PinInputRootProps, useForwardProps } from 'reka-ui';
import {
  computed,
  type HTMLAttributes,
  provide,
  ref,
  useAttrs,
  watch,
} from 'vue';

import { cn } from '../../lib/utils';

import { InputOTPKey } from '.';

export interface InputOTPProps extends Omit<
  PinInputRootProps,
  'modelValue' | 'defaultValue'
> {
  modelValue?: string;
  defaultValue?: string;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<InputOTPProps>(), {
  otp: true,
});
const emits = defineEmits<{
  'update:modelValue': [value: string];
  complete: [value: string];
}>();

// Reka holds one character per slot; the code is one string, as in React.
const model = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue ?? '',
});
const characters = ref([...(model.value ?? '')]);

// Reka leaves an empty slot after Delete, which the joined code can't hold, so
// the slots resync only when the code changes from outside.
watch(model, (code) => {
  if (code !== characters.value.join('')) characters.value = [...(code ?? '')];
});

function update(next: string[]) {
  characters.value = next;
  model.value = next.join('');
}

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
    data-slot="input-otp"
    :class="
      cn('nx:group/input-otp nx:flex nx:items-center nx:gap-2', props.class)
    "
    @update:model-value="update"
    @complete="emits('complete', $event.join(''))"
  >
    <slot />
  </PinInputRoot>
</template>
