<script setup lang="ts">
import { IconCheck, IconCopy, IconX } from '@tabler/icons-vue';
import { type HTMLAttributes, onBeforeUnmount, ref } from 'vue';

import { cn } from '../../lib/utils';
import Button from '../button/Button.vue';

defineOptions({ inheritAttrs: false });

export interface CodeBlockCopyButtonProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CodeBlockCopyButtonProps>();

const COPY_RESET_MS = 2000;

const COPY_ICONS = { idle: IconCopy, copied: IconCheck, failed: IconX };

const COPY_MESSAGES = {
  idle: '',
  copied: 'Code copied to clipboard',
  failed: 'Could not copy code',
};

type CopyState = keyof typeof COPY_MESSAGES;

// Each line ends in a newline. Drop the last, so a pasted command doesn't run.
function codeText(button: HTMLElement) {
  const code = button
    .closest('[data-slot="code-block"]')
    ?.querySelector('code');
  return code?.textContent?.replace(/\n$/, '') ?? '';
}

const state = ref<CopyState>('idle');
// `seq` remounts the message, so a second copy announces again.
const seq = ref(0);
let timer: number | undefined;

onBeforeUnmount(() => window.clearTimeout(timer));

function settle(next: Exclude<CopyState, 'idle'>) {
  state.value = next;
  seq.value += 1;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    state.value = 'idle';
  }, COPY_RESET_MS);
}

async function handleClick(event: MouseEvent) {
  const text = codeText(event.currentTarget as HTMLElement);
  if (!text) {
    settle('failed');
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    settle('copied');
  } catch {
    settle('failed');
  }
}
</script>

<template>
  <Button
    data-slot="code-block-copy-button"
    :data-state="state"
    variant="outline"
    size="icon-sm"
    aria-label="Copy code"
    v-bind="$attrs"
    :class="
      cn(
        'nx:absolute nx:end-2 nx:top-2 nx:data-[state=copied]:text-success-subtle-foreground nx:data-[state=failed]:text-error-subtle-foreground',
        props.class
      )
    "
    @click="handleClick"
  >
    <component :is="COPY_ICONS[state]" />
  </Button>
  <span role="status" class="nx:sr-only"
    ><span :key="seq">{{ COPY_MESSAGES[state] }}</span></span
  >
</template>
