import { cva, type VariantProps } from 'class-variance-authority';

import { fieldSizeVariants } from '../../lib/field-size';

export {
  default as SelectContent,
  type SelectContentProps,
} from './SelectContent.vue';
export { default as SelectItem, type SelectItemProps } from './SelectItem.vue';
export {
  default as SelectLabel,
  type SelectLabelProps,
} from './SelectLabel.vue';
export {
  default as SelectScrollDownButton,
  type SelectScrollDownButtonProps,
} from './SelectScrollDownButton.vue';
export {
  default as SelectScrollUpButton,
  type SelectScrollUpButtonProps,
} from './SelectScrollUpButton.vue';
export {
  default as SelectSeparator,
  type SelectSeparatorProps,
} from './SelectSeparator.vue';
export {
  default as SelectTrigger,
  type SelectTriggerProps,
} from './SelectTrigger.vue';
export {
  SelectRoot as Select,
  SelectGroup,
  type SelectGroupProps,
  type SelectRootProps as SelectProps,
  SelectValue,
  type SelectValueProps,
} from 'reka-ui';

export const selectTriggerVariants = cva(
  [
    'nx:group/select-trigger nx:flex nx:box-border nx:w-full nx:items-center nx:justify-between nx:gap-2 nx:icon-stroke',
    'nx:rounded-md nx:border-default nx:transition-field',
    'nx:whitespace-nowrap nx:text-inherit',
    'nx:data-[placeholder]:text-muted-foreground',
    'nx:focus-visible:outline-default nx:focus-visible:outline-focus-default nx:focus-visible:border-focus-default',
    'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error nx:aria-invalid:focus-visible:border-focus-error',
    'nx:disabled:cursor-not-allowed nx:disabled:bg-disabled nx:disabled:text-disabled-foreground',
    'nx:[&>span]:line-clamp-1',
  ],
  {
    variants: {
      size: fieldSizeVariants,
      variant: {
        bordered:
          'nx:border-border-default nx:bg-container nx:enabled:hover:bg-container-hover nx:disabled:border-border-disabled',
        borderless:
          'nx:border-transparent nx:bg-control-background nx:enabled:hover:bg-control-background-hover',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'bordered',
    },
  }
);

export type SelectTriggerVariants = VariantProps<typeof selectTriggerVariants>;

/** Starts item text after the check column: 8px, the check, then 8px. */
export const selectItemInsetClassName =
  'nx:pl-[calc(var(--nx-icon-glyph-default)_+_var(--nx-spacing-2)*2)]';
