<script setup lang="ts">
import { type HTMLAttributes, provide, type VNode } from 'vue';

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

function splitMembers() {
  const members = flattenedNodes(slots.default?.());
  const hasMax = typeof props.max === 'number' && props.max > 0;
  const visible = hasMax ? members.slice(0, props.max) : members;
  return { visible, overflow: members.length - visible.length };
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
    <!-- A one-item v-for runs the default slot once per render. -->
    <template
      v-for="({ visible, overflow }, split) in [splitMembers()]"
      :key="split"
    >
      <component
        :is="member"
        v-for="(member, index) in visible"
        :key="member.key ?? index"
      />
      <Avatar v-if="overflow > 0" role="img" :aria-label="`${overflow} more`">
        <AvatarFallback aria-hidden="true">+{{ overflow }}</AvatarFallback>
      </Avatar>
    </template>
  </div>
</template>
