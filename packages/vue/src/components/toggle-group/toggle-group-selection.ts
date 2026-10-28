import { injectToggleGroupRootContext } from 'reka-ui';
import { computed } from 'vue';

/**
 * A single-select group is a radio group, as Radix renders it: each item
 * reports aria-checked instead of Reka's aria-pressed.
 */
export function useToggleGroupSelectionAttrs(value: () => string) {
  const root = injectToggleGroupRootContext();

  return computed(() => {
    if (!root.isSingle.value) return {};
    return {
      role: 'radio',
      'aria-checked': root.modelValue.value === value(),
      'aria-pressed': undefined,
    };
  });
}
