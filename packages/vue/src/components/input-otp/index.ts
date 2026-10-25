import type { ComputedRef, InjectionKey } from 'vue';

export { default as InputOTP, type InputOTPProps } from './InputOTP.vue';
export {
  default as InputOTPGroup,
  type InputOTPGroupProps,
} from './InputOTPGroup.vue';
export {
  default as InputOTPSeparator,
  type InputOTPSeparatorProps,
} from './InputOTPSeparator.vue';
export {
  default as InputOTPSlot,
  type InputOTPSlotProps,
} from './InputOTPSlot.vue';

export const InputOTPKey: InjectionKey<
  ComputedRef<{
    'aria-label'?: unknown;
    'aria-labelledby'?: unknown;
    'aria-invalid'?: unknown;
  }>
> = Symbol('input-otp');
