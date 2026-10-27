import {
  type ComputedRef,
  inject,
  type InjectionKey,
  type Ref,
  type VNode,
} from 'vue';

export {
  default as MultiSelect,
  type MultiSelectProps,
} from './MultiSelect.vue';
export {
  default as MultiSelectContent,
  type MultiSelectContentProps,
} from './MultiSelectContent.vue';
export {
  default as MultiSelectGroup,
  type MultiSelectGroupProps,
} from './MultiSelectGroup.vue';
export {
  default as MultiSelectItem,
  type MultiSelectItemProps,
} from './MultiSelectItem.vue';
export {
  default as MultiSelectSeparator,
  type MultiSelectSeparatorProps,
} from './MultiSelectSeparator.vue';
export {
  default as MultiSelectTrigger,
  type MultiSelectTriggerProps,
} from './MultiSelectTrigger.vue';
export {
  default as MultiSelectValue,
  type MultiSelectValueProps,
} from './MultiSelectValue.vue';

export const MultiSelectKey: InjectionKey<{
  open: Ref<boolean>;
  selectedValues: ComputedRef<Set<string>>;
  /** Each option's chip label by value. Call it while rendering. */
  labels: () => Map<string, () => VNode[]>;
  toggle: (value: string) => void;
}> = Symbol('multi-select');

/** The selection the MultiSelect provides to its parts. */
export function injectMultiSelect() {
  const multiSelect = inject(MultiSelectKey);
  if (!multiSelect) {
    throw new Error('MultiSelect parts must be used inside <MultiSelect>.');
  }
  return multiSelect;
}
