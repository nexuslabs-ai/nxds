import { cva, type VariantProps } from 'class-variance-authority';

export { default as Menubar, type MenubarProps } from './Menubar.vue';
export {
  default as MenubarCheckboxItem,
  type MenubarCheckboxItemProps,
} from './MenubarCheckboxItem.vue';
export {
  default as MenubarContent,
  type MenubarContentProps,
} from './MenubarContent.vue';
export {
  default as MenubarItem,
  type MenubarItemProps,
} from './MenubarItem.vue';
export {
  default as MenubarLabel,
  type MenubarLabelProps,
} from './MenubarLabel.vue';
export {
  default as MenubarRadioItem,
  type MenubarRadioItemProps,
} from './MenubarRadioItem.vue';
export {
  default as MenubarSeparator,
  type MenubarSeparatorProps,
} from './MenubarSeparator.vue';
export {
  default as MenubarShortcut,
  type MenubarShortcutProps,
} from './MenubarShortcut.vue';
export {
  default as MenubarSubContent,
  type MenubarSubContentProps,
} from './MenubarSubContent.vue';
export {
  default as MenubarSubTrigger,
  type MenubarSubTriggerProps,
} from './MenubarSubTrigger.vue';
export {
  default as MenubarTrigger,
  type MenubarTriggerProps,
} from './MenubarTrigger.vue';
export {
  MenubarGroup,
  type MenubarGroupProps,
  MenubarMenu,
  type MenubarMenuProps,
  MenubarPortal,
  type MenubarPortalProps,
  MenubarRadioGroup,
  type MenubarRadioGroupProps,
  MenubarSub,
  type MenubarSubProps,
} from 'reka-ui';

export const menubarItemVariants = cva(
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

export type MenubarItemVariants = VariantProps<typeof menubarItemVariants>;
