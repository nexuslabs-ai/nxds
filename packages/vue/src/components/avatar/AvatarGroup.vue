<script setup lang="ts">
import { h, type HTMLAttributes, provide, type VNode } from 'vue';

import { flattenedNodes } from '../../lib/slots';
import { cn } from '../../lib/utils';

import Avatar from './Avatar.vue';
import AvatarFallback from './AvatarFallback.vue';

import { AvatarGroupKey, type AvatarVariants } from '.';

export interface AvatarGroupProps {
  size?: AvatarVariants['size'];
  shape?: AvatarVariants['shape'];
  /**
   * Number of avatars shown before the rest collapse into a +N tile.
   */
  max?: number;
  class?: HTMLAttributes['class'];
}

const props = defineProps<AvatarGroupProps>();

const slots = defineSlots<{ default?: () => VNode[] }>();

provide(AvatarGroupKey, props);

// The visible members, then a +N tile for the rest.
function Members() {
  const items = flattenedNodes(slots.default?.());
  const hasMax = typeof props.max === 'number' && props.max > 0;
  const visible = hasMax ? items.slice(0, props.max) : items;
  const overflowCount = items.length - visible.length;
  if (overflowCount === 0) return visible;

  return [
    ...visible,
    h(Avatar, { role: 'img', 'aria-label': `${overflowCount} more` }, () =>
      h(AvatarFallback, { 'aria-hidden': 'true' }, () => `+${overflowCount}`)
    ),
  ];
}
</script>

<template>
  <div
    data-slot="avatar-group"
    :data-size="size"
    :data-shape="shape"
    :class="
      cn(
        'nx:flex nx:items-center',
        // Overlap scales with each avatar's font-size (set per size), so the
        // tuck stays ~proportional from 2xs to 4xl instead of a fixed px.
        'nx:[&>[data-slot=avatar]+[data-slot=avatar]]:ms-[-0.7em]',
        'nx:*:data-[slot=avatar]:relative',
        'nx:*:data-[slot=avatar]:ring-[0.1em] nx:*:data-[slot=avatar]:ring-surface',
        props.class
      )
    "
  >
    <Members />
  </div>
</template>
