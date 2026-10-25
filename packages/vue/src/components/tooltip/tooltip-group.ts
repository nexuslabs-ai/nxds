import type { InjectionKey } from 'vue';

/** True inside a `TooltipProvider`. */
export const TooltipGroupKey: InjectionKey<boolean> = Symbol('tooltip-group');
