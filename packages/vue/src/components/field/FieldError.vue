<script setup lang="ts">
import { computed, type HTMLAttributes, type VNode } from 'vue';

import { renderedNodes } from '../../lib/slots';
import { cn } from '../../lib/utils';

import { dedupeErrorMessages, type FieldErrors } from '.';

export interface FieldErrorProps {
  /**
   * Validation errors to show. Duplicate messages show once, and several render
   * as a list. Ignored when the error has content of its own.
   */
  errors?: FieldErrors;
  class?: HTMLAttributes['class'];
}

const props = defineProps<FieldErrorProps>();

const slots = defineSlots<{ default?: () => VNode[] }>();

const messages = computed(() => dedupeErrorMessages(props.errors));

function hasChildren() {
  return renderedNodes(slots.default?.()).length > 0;
}
</script>

<template>
  <div
    v-if="messages.length > 0 || hasChildren()"
    role="alert"
    aria-atomic="true"
    data-slot="field-error"
    :class="
      cn(
        'nx:typography-body-default nx:text-error-subtle-foreground',
        props.class
      )
    "
  >
    <slot>
      <template v-if="messages.length === 1">{{ messages[0] }}</template>
      <ul
        v-else
        class="nx:my-0 nx:ml-4 nx:flex nx:list-disc nx:flex-col nx:gap-1 nx:pl-0"
      >
        <li v-for="message in messages" :key="message">{{ message }}</li>
      </ul>
    </slot>
  </div>
</template>
