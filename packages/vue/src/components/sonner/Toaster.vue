<script lang="ts">
// nxds toasts render only in the nxds Toaster, and a host app's own sonner
// Toaster never shows them, so mounting both never doubles a toast.
export const NXDS_TOASTER_ID = 'nxds';
</script>

<script setup lang="ts">
import {
  computed,
  type CSSProperties,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
} from 'vue';
import {
  Toaster as Sonner,
  type ToasterProps as SonnerToasterProps,
} from 'vue-sonner';

import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconLoader2,
} from '../../lib/icons';

import 'vue-sonner/style.css';

export type ToasterProps = Omit<SonnerToasterProps, 'id'>;

defineOptions({ inheritAttrs: false });

const props = defineProps<ToasterProps>();

/**
 * Track the active theme by observing the `.dark` class on the document root
 * (where nxds toggles dark mode), or `data-theme="dark"` (where a Claude Design
 * page sets it), via MutationObserver, keeping sonner's own `theme` in sync
 * with the design system.
 */
function subscribeToTheme(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): 'light' | 'dark' {
  const root = document.documentElement;
  return root.classList.contains('dark') || root.dataset['theme'] === 'dark'
    ? 'dark'
    : 'light';
}

/**
 * Sonner reads these custom properties off the toaster container to size and
 * colour each toast; map every one to its nxds token. The `-bg`/`-text`/`-border`
 * triples for success/error/warning/info apply when `richColors` is enabled.
 */
const toasterThemeVars = {
  '--width': 'calc(356px*var(--nx-ui-scale))',
  '--normal-bg': 'var(--nx-color-container)',
  '--normal-text': 'var(--nx-color-foreground)',
  '--normal-border': 'var(--nx-color-border-default)',
  '--border-radius': 'var(--nx-radius-md)',
  '--success-bg': 'var(--nx-color-success-background)',
  '--success-text': 'var(--nx-color-success-foreground)',
  '--success-border': 'var(--nx-color-success-border)',
  '--info-bg': 'var(--nx-color-information-background)',
  '--info-text': 'var(--nx-color-information-foreground)',
  '--info-border': 'var(--nx-color-information-border)',
  '--warning-bg': 'var(--nx-color-warning-background)',
  '--warning-text': 'var(--nx-color-warning-foreground)',
  '--warning-border': 'var(--nx-color-warning-border)',
  '--error-bg': 'var(--nx-color-error-background)',
  '--error-text': 'var(--nx-color-error-foreground)',
  '--error-border': 'var(--nx-color-error-border)',
};

// The document is read only once mounted, so server rendering starts light.
const documentTheme = ref<'light' | 'dark'>('light');
let unsubscribe: (() => void) | undefined;

onMounted(() => {
  documentTheme.value = getThemeSnapshot();
  unsubscribe = subscribeToTheme(() => {
    documentTheme.value = getThemeSnapshot();
  });
});

onBeforeUnmount(() => unsubscribe?.());

// Sonner pins its toaster to z-index:999999999 in a stylesheet; an inline
// style outranks it without `!`.
const style = computed(
  () =>
    ({
      ...toasterThemeVars,
      zIndex: 'var(--nx-z-index-toast)',
      ...props.style,
    }) as CSSProperties
);

// Attributes go to Sonner, as React spreads its props there, not onto the
// wrapper.
const attrs = useAttrs();
const forwarded = computed(
  () => ({ ...attrs, ...props }) as SonnerToasterProps
);
</script>

<template>
  <div
    data-slot="toaster"
    class="nx:[&_[data-icon]]:icon-stroke nx:[&_[data-close-button]]:icon-stroke"
  >
    <Sonner
      v-bind="forwarded"
      :id="NXDS_TOASTER_ID"
      :theme="props.theme ?? documentTheme"
      :style="style"
    >
      <template #success-icon
        ><IconCircleCheck class="nx:size-icon-glyph-default"
      /></template>
      <template #info-icon
        ><IconInfoCircle class="nx:size-icon-glyph-default"
      /></template>
      <template #warning-icon
        ><IconAlertTriangle class="nx:size-icon-glyph-default"
      /></template>
      <template #error-icon
        ><IconAlertCircle class="nx:size-icon-glyph-default"
      /></template>
      <template #loading-icon
        ><IconLoader2 class="nx:size-icon-glyph-default nx:animate-spin"
      /></template>
    </Sonner>
  </div>
</template>
