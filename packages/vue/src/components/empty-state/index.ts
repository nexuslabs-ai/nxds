import { cva, type VariantProps } from 'class-variance-authority';

export { default as EmptyState, type EmptyStateProps } from './EmptyState.vue';
export {
  default as EmptyStateContent,
  type EmptyStateContentProps,
} from './EmptyStateContent.vue';
export {
  default as EmptyStateDescription,
  type EmptyStateDescriptionProps,
} from './EmptyStateDescription.vue';
export {
  default as EmptyStateHeader,
  type EmptyStateHeaderProps,
} from './EmptyStateHeader.vue';
export {
  default as EmptyStateMedia,
  type EmptyStateMediaProps,
} from './EmptyStateMedia.vue';
export {
  default as EmptyStateTitle,
  type EmptyStateTitleProps,
} from './EmptyStateTitle.vue';

export const emptyStateMediaVariants = cva(
  'nx:mb-2 nx:flex nx:shrink-0 nx:items-center nx:justify-center nx:[&_svg]:pointer-events-none nx:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: '',
        icon: 'nx:size-10 nx:rounded-lg nx:bg-muted nx:text-foreground nx:[&_svg]:size-6 nx:[&_svg]:[--nx-icon-size:var(--nx-spacing-6)] nx:icon-stroke',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type EmptyStateMediaVariants = VariantProps<
  typeof emptyStateMediaVariants
>;
