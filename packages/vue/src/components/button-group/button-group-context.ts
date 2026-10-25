import type { InjectionKey } from 'vue';

/** Size shared from a ButtonGroup to its members. */
export type ButtonGroupSize = 'sm' | 'default' | 'lg';

/**
 * A ButtonGroup provides its `size` through this key; `Button` and
 * `ButtonGroupText` inject it. Injection (not a walk over direct children) is
 * what lets a grouped Button inherit the group size even when it is nested
 * inside a trigger wrapper the group cannot reach directly. An explicit `size`
 * on the child wins over the group's.
 */
export const ButtonGroupKey: InjectionKey<{ size: ButtonGroupSize }> =
  Symbol('button-group');
