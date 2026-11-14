import { cva, type VariantProps } from 'class-variance-authority';

export { default as Item, type ItemProps } from './Item.vue';
export {
  default as ItemActions,
  type ItemActionsProps,
} from './ItemActions.vue';
export {
  default as ItemContent,
  type ItemContentProps,
} from './ItemContent.vue';
export {
  default as ItemDescription,
  type ItemDescriptionProps,
} from './ItemDescription.vue';
export { default as ItemFooter, type ItemFooterProps } from './ItemFooter.vue';
export { default as ItemGroup, type ItemGroupProps } from './ItemGroup.vue';
export { default as ItemHeader, type ItemHeaderProps } from './ItemHeader.vue';
export { default as ItemMedia, type ItemMediaProps } from './ItemMedia.vue';
export {
  default as ItemSeparator,
  type ItemSeparatorProps,
} from './ItemSeparator.vue';
export { default as ItemTitle, type ItemTitleProps } from './ItemTitle.vue';

export const itemVariants = cva(
  'nx:text-inherit nx:no-underline nx:group/item nx:flex nx:flex-wrap nx:items-center nx:rounded-md nx:border-default nx:border-transparent nx:typography-body-default nx:transition-control nx:duration-faster nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[a]:hover:bg-background-hover',
  {
    variants: {
      variant: {
        default: 'nx:bg-transparent',
        outline: 'nx:border-border-default',
        muted: 'nx:bg-muted',
      },
      size: {
        default: 'nx:gap-4 nx:p-4',
        sm: 'nx:gap-2.5 nx:px-4 nx:py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const itemMediaVariants = cva(
  'nx:flex nx:shrink-0 nx:items-center nx:justify-center nx:gap-2 nx:group-has-[[data-item-part=description]]/item:translate-y-0.5 nx:group-has-[[data-item-part=description]]/item:self-start nx:[&_svg]:pointer-events-none nx:icon-stroke',
  {
    variants: {
      variant: {
        default: 'nx:bg-transparent',
        icon: 'nx:size-8 nx:rounded-sm nx:border-default nx:border-border-default nx:bg-muted nx:[&_svg]:size-icon-glyph-default',
        image:
          'nx:relative nx:size-10 nx:overflow-hidden nx:rounded-sm nx:[&_img]:size-full nx:[&_img]:object-cover nx:after:pointer-events-none nx:after:absolute nx:after:inset-0 nx:after:rounded-[inherit] nx:after:outline nx:after:outline-1 nx:after:-outline-offset-1 nx:after:outline-border-hairline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type ItemVariants = VariantProps<typeof itemVariants>;
export type ItemMediaVariants = VariantProps<typeof itemMediaVariants>;
