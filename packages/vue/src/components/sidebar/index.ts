import { cva, type VariantProps } from 'class-variance-authority';
import { inject } from 'vue';

import { cn } from '../../lib/utils';

import { SidebarKey } from './sidebar-context';

export { default as Sidebar, type SidebarProps } from './Sidebar.vue';
export {
  default as SidebarContent,
  type SidebarContentProps,
} from './SidebarContent.vue';
export {
  default as SidebarFooter,
  type SidebarFooterProps,
} from './SidebarFooter.vue';
export {
  default as SidebarGroup,
  type SidebarGroupProps,
} from './SidebarGroup.vue';
export {
  default as SidebarGroupAction,
  type SidebarGroupActionProps,
} from './SidebarGroupAction.vue';
export {
  default as SidebarGroupContent,
  type SidebarGroupContentProps,
} from './SidebarGroupContent.vue';
export {
  default as SidebarGroupLabel,
  type SidebarGroupLabelProps,
} from './SidebarGroupLabel.vue';
export {
  default as SidebarHeader,
  type SidebarHeaderProps,
} from './SidebarHeader.vue';
export {
  default as SidebarInput,
  type SidebarInputProps,
} from './SidebarInput.vue';
export {
  default as SidebarInset,
  type SidebarInsetProps,
} from './SidebarInset.vue';
export {
  default as SidebarMenu,
  type SidebarMenuProps,
} from './SidebarMenu.vue';
export {
  default as SidebarMenuAction,
  type SidebarMenuActionProps,
} from './SidebarMenuAction.vue';
export {
  default as SidebarMenuBadge,
  type SidebarMenuBadgeProps,
} from './SidebarMenuBadge.vue';
export {
  default as SidebarMenuButton,
  type SidebarMenuButtonProps,
} from './SidebarMenuButton.vue';
export {
  default as SidebarMenuItem,
  type SidebarMenuItemProps,
} from './SidebarMenuItem.vue';
export {
  default as SidebarMenuSkeleton,
  type SidebarMenuSkeletonProps,
} from './SidebarMenuSkeleton.vue';
export {
  default as SidebarMenuSub,
  type SidebarMenuSubProps,
} from './SidebarMenuSub.vue';
export {
  default as SidebarMenuSubButton,
  type SidebarMenuSubButtonProps,
} from './SidebarMenuSubButton.vue';
export {
  default as SidebarMenuSubItem,
  type SidebarMenuSubItemProps,
} from './SidebarMenuSubItem.vue';
export {
  default as SidebarProvider,
  type SidebarProviderProps,
} from './SidebarProvider.vue';
export {
  default as SidebarRail,
  type SidebarRailProps,
} from './SidebarRail.vue';
export {
  default as SidebarSeparator,
  type SidebarSeparatorProps,
} from './SidebarSeparator.vue';
export {
  default as SidebarTrigger,
  type SidebarTriggerProps,
} from './SidebarTrigger.vue';

/**
 * Reads the sidebar state and the `toggleSidebar` helper. Call it inside a
 * `SidebarProvider`, or it throws.
 */
export function useSidebar() {
  const context = inject(SidebarKey, null);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

export const sidebarMenuButtonVariants = cva(
  cn(
    'nx:peer/menu-button nx:flex nx:w-full nx:items-center nx:gap-2 nx:overflow-hidden nx:rounded-md nx:border-0 nx:bg-transparent nx:p-2 nx:text-left nx:text-nav-muted-foreground nx:no-underline nx:transition-[width,height,padding] nx:duration-fast',
    'nx:group-has-data-[slot=sidebar-menu-action]/menu-item:pr-8 nx:group-data-[collapsible=icon]:size-8',
    'nx:group-data-[collapsible=icon]:justify-center nx:group-data-[collapsible=icon]:[&>span]:sr-only nx:group-data-[collapsible=icon]:[&>svg:not(:first-child)]:hidden',
    'nx:hover:bg-nav-item-hover nx:active:bg-nav-item-active',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
    'nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:aria-disabled:pointer-events-none nx:aria-disabled:text-disabled-foreground',
    'nx:data-[active=true]:bg-nav-item-active nx:data-[active=true]:text-nav-foreground',
    'nx:data-[state=open]:hover:bg-nav-item-hover',
    'nx:[&>span:last-child]:truncate nx:[&>svg]:size-icon-glyph-default nx:[&>svg]:shrink-0 nx:icon-stroke'
  ),
  {
    variants: {
      variant: {
        default: 'nx:hover:bg-nav-item-hover',
        outline:
          'nx:border-default nx:border-nav-border nx:bg-nav-background nx:hover:bg-nav-item-hover',
      },
      size: {
        default:
          'nx:h-8 nx:typography-body-default nx:group-data-[collapsible=icon]:p-2',
        sm: 'nx:h-7 nx:typography-body-small nx:group-data-[collapsible=icon]:p-2',
        lg: 'nx:h-12 nx:typography-body-default nx:group-data-[collapsible=icon]:p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type SidebarMenuButtonVariants = VariantProps<
  typeof sidebarMenuButtonVariants
>;
