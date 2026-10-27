<script setup lang="ts">
import { computed, provide, toRef, useId } from 'vue';

import { cn } from '../../lib/utils';

import { CommandGroupKey, type CommandGroupProps, injectCommand } from '.';

const props = withDefaults(defineProps<CommandGroupProps>(), {
  forceMount: false,
});

const command = injectCommand();
const id = useId();
const headingId = useId();

provide(CommandGroupKey, { id, forceMount: toRef(props, 'forceMount') });

const shown = computed(() => props.forceMount || command.isGroupShown(id));
</script>

<template>
  <div
    data-slot="command-group"
    cmdk-group
    role="presentation"
    :data-value="heading"
    :hidden="shown ? undefined : true"
    :class="
      cn(
        'nx:overflow-hidden nx:text-popover-foreground',
        'nx:p-2',
        'nx:**:[[cmdk-group-heading]]:px-2 nx:**:[[cmdk-group-heading]]:py-1.5',
        'nx:**:[[cmdk-group-heading]]:typography-label-small nx:**:[[cmdk-group-heading]]:text-muted-foreground',
        props.class
      )
    "
  >
    <div v-if="heading" :id="headingId" cmdk-group-heading aria-hidden="true">
      {{ heading }}
    </div>
    <div
      cmdk-group-items
      role="group"
      :aria-labelledby="heading ? headingId : undefined"
    >
      <slot />
    </div>
  </div>
</template>
