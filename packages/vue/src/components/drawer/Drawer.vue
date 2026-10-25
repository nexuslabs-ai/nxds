<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { useForwardProps } from 'reka-ui';
import {
  DrawerRoot,
  type DrawerRootEmits,
  type DrawerRootProps,
} from 'vaul-vue';
import { computed, ref } from 'vue';

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

const uncontrolledOpen = ref(props.defaultOpen ?? false);
const open = computed(() => props.open ?? uncontrolledOpen.value);

// vaul-vue closes on DrawerClose even when the drawer is not dismissible.
function handleOpenChange(value: boolean) {
  if (!value && !props.dismissible) return;
  uncontrolledOpen.value = value;
  emits('update:open', value);
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
