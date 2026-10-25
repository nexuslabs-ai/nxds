<script setup lang="ts">
import { reactiveOmit, useVModel } from '@vueuse/core';
import { useForwardProps } from 'reka-ui';
import {
  DrawerRoot,
  type DrawerRootEmits,
  type DrawerRootProps,
} from 'vaul-vue';

export type DrawerProps = DrawerRootProps;

const props = withDefaults(defineProps<DrawerProps>(), {
  dismissible: true,
  modal: true,
  open: undefined,
  defaultOpen: undefined,
});
const emits = defineEmits<DrawerRootEmits>();

const delegated = reactiveOmit(props, 'open', 'defaultOpen');
const forwarded = useForwardProps(delegated);

const open = useVModel(props, 'open', emits, {
  defaultValue: props.defaultOpen ?? false,
  passive: (props.open === undefined) as false,
});

// vaul-vue closes on DrawerClose even when the drawer is not dismissible.
function handleOpenChange(value: boolean) {
  if (!value && !props.dismissible) return;
  open.value = value;
}
</script>

<template>
  <DrawerRoot
    v-bind="forwarded"
    :open="open"
    @update:open="handleOpenChange"
    @drag="(percentage) => emits('drag', percentage)"
    @release="(released) => emits('release', released)"
    @close="emits('close')"
    @update:active-snap-point="
      (value) => emits('update:activeSnapPoint', value)
    "
    @animation-end="(value) => emits('animationEnd', value)"
  >
    <slot />
  </DrawerRoot>
</template>
