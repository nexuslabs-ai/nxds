import { cva, type VariantProps } from 'class-variance-authority';

export {
  default as DropdownMenuCheckboxItem,
  type DropdownMenuCheckboxItemProps,
} from './DropdownMenuCheckboxItem.vue';
export {
  default as DropdownMenuContent,
  type DropdownMenuContentProps,
} from './DropdownMenuContent.vue';
export {
  default as DropdownMenuItem,
  type DropdownMenuItemProps,
} from './DropdownMenuItem.vue';
export {
  default as DropdownMenuLabel,
  type DropdownMenuLabelProps,
} from './DropdownMenuLabel.vue';
export {
  default as DropdownMenuRadioItem,
  type DropdownMenuRadioItemProps,
} from './DropdownMenuRadioItem.vue';
export {
  default as DropdownMenuSeparator,
  type DropdownMenuSeparatorProps,
} from './DropdownMenuSeparator.vue';
export {
  default as DropdownMenuShortcut,
  type DropdownMenuShortcutProps,
} from './DropdownMenuShortcut.vue';
export {
  default as DropdownMenuSubContent,
  type DropdownMenuSubContentProps,
} from './DropdownMenuSubContent.vue';
export {
  default as DropdownMenuSubTrigger,
  type DropdownMenuSubTriggerProps,
} from './DropdownMenuSubTrigger.vue';
export {
  DropdownMenuRoot as DropdownMenu,
  DropdownMenuGroup,
  type DropdownMenuGroupProps,
  DropdownMenuPortal,
  type DropdownMenuPortalProps,
  type DropdownMenuRootProps as DropdownMenuProps,
  DropdownMenuRadioGroup,
  type DropdownMenuRadioGroupProps,
  DropdownMenuSub,
  type DropdownMenuSubProps,
  DropdownMenuTrigger,
  type DropdownMenuTriggerProps,
} from 'reka-ui';

export const dropdownMenuItemVariants = cva(
  'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center nx:gap-2 nx:rounded-sm nx:px-2 nx:py-1.5 nx:typography-body-default nx:outline-none nx:transition-colors nx:focus:bg-popover-hover nx:focus:text-popover-foreground nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:size-icon-glyph-default nx:[&_svg]:shrink-0 nx:icon-stroke',
  {
    variants: {
      variant: {
        default: '',
        destructive:
          'nx:text-error-subtle-foreground nx:focus:bg-error-background nx:focus:text-error-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type DropdownMenuItemVariants = VariantProps<
  typeof dropdownMenuItemVariants
>;

/** Starts item text after the check column: 8px, the check, then 8px. */
export const dropdownMenuInsetClassName =
  'nx:pl-[calc(var(--nx-icon-glyph-default)_+_var(--nx-spacing-2)*2)]';
