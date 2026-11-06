import { InjectionToken, type Signal } from '@angular/core';

/** Size shared from a ButtonGroup to its members. */
export type ButtonGroupSize = 'sm' | 'default' | 'lg';

/**
 * A ButtonGroup provides its `size` through this token; `NxButton` and
 * `NxButtonGroupText` read it. A Button nested inside a trigger wrapper still
 * finds it. An explicit `size` on the Button wins over the group's.
 */
export const NX_BUTTON_GROUP_SIZE = new InjectionToken<Signal<ButtonGroupSize>>(
  'NxButtonGroupSize'
);
