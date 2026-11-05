import { cva, type VariantProps } from 'class-variance-authority';

export {
  default as ContextMenuCheckboxItem,
  type ContextMenuCheckboxItemProps,
} from './ContextMenuCheckboxItem.vue';
export {
  default as ContextMenuContent,
  type ContextMenuContentProps,
} from './ContextMenuContent.vue';
export {
  default as ContextMenuItem,
  type ContextMenuItemProps,
} from './ContextMenuItem.vue';
export {
  default as ContextMenuLabel,
  type ContextMenuLabelProps,
} from './ContextMenuLabel.vue';
export {
  default as ContextMenuRadioItem,
  type ContextMenuRadioItemProps,
} from './ContextMenuRadioItem.vue';
export {
  default as ContextMenuSeparator,
  type ContextMenuSeparatorProps,
} from './ContextMenuSeparator.vue';
export {
  default as ContextMenuShortcut,
  type ContextMenuShortcutProps,
} from './ContextMenuShortcut.vue';
export {
  default as ContextMenuSubContent,
  type ContextMenuSubContentProps,
} from './ContextMenuSubContent.vue';
export {
  default as ContextMenuSubTrigger,
  type ContextMenuSubTriggerProps,
} from './ContextMenuSubTrigger.vue';
export {
  default as ContextMenuTrigger,
  type ContextMenuTriggerProps,
} from './ContextMenuTrigger.vue';
export {
  ContextMenuRoot as ContextMenu,
  ContextMenuGroup,
  type ContextMenuGroupProps,
  ContextMenuPortal,
  type ContextMenuPortalProps,
  type ContextMenuRootProps as ContextMenuProps,
  ContextMenuRadioGroup,
  type ContextMenuRadioGroupProps,
  ContextMenuSub,
  type ContextMenuSubProps,
} from 'reka-ui';

export const contextMenuItemVariants = cva(
  'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center nx:gap-2 nx:rounded-sm nx:px-2 nx:py-1.5 nx:typography-body-default nx:outline-none nx:transition-colors nx:focus:bg-popover-hover nx:focus:text-popover-foreground nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:size-4 nx:[&_svg]:shrink-0 nx:icon-stroke',
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

export type ContextMenuItemVariants = VariantProps<
  typeof contextMenuItemVariants
>;
