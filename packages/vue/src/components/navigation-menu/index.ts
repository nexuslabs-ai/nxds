import { cva } from 'class-variance-authority';

export {
  default as NavigationMenu,
  type NavigationMenuProps,
} from './NavigationMenu.vue';
export {
  default as NavigationMenuContent,
  type NavigationMenuContentProps,
} from './NavigationMenuContent.vue';
export {
  default as NavigationMenuIndicator,
  type NavigationMenuIndicatorProps,
} from './NavigationMenuIndicator.vue';
export {
  default as NavigationMenuItem,
  type NavigationMenuItemProps,
} from './NavigationMenuItem.vue';
export {
  default as NavigationMenuLink,
  type NavigationMenuLinkProps,
} from './NavigationMenuLink.vue';
export {
  default as NavigationMenuList,
  type NavigationMenuListProps,
} from './NavigationMenuList.vue';
export {
  default as NavigationMenuTrigger,
  type NavigationMenuTriggerProps,
} from './NavigationMenuTrigger.vue';
export {
  default as NavigationMenuViewport,
  type NavigationMenuViewportProps,
} from './NavigationMenuViewport.vue';

export const navigationMenuTriggerStyle = cva(
  'nx:group nx:inline-flex nx:w-max nx:items-center nx:justify-center nx:rounded-md nx:border-0 nx:bg-background nx:px-4 nx:py-2 nx:text-inherit nx:typography-label-default nx:transition-control nx:hover:bg-background-hover nx:hover:text-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:data-[state=open]:bg-background-hover nx:data-[state=open]:text-foreground nx:icon-stroke'
);
