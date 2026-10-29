import { cva, type VariantProps } from 'class-variance-authority';

export { default as Marker, type MarkerProps } from './Marker.vue';
export {
  default as MarkerContent,
  type MarkerContentProps,
} from './MarkerContent.vue';
export { default as MarkerIcon, type MarkerIconProps } from './MarkerIcon.vue';

export const markerVariants = cva(
  "nx:group/marker nx:m-0 nx:flex nx:border-0 nx:bg-transparent nx:p-0 nx:no-underline nx:min-h-4 nx:items-center nx:gap-2 nx:text-left nx:typography-body-small nx:text-muted-foreground nx:transition-control nx:duration-faster nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:aria-disabled:pointer-events-none nx:aria-disabled:text-disabled-foreground nx:[&_svg:not([class*='size-'])]:size-icon-glyph-default nx:[&_svg]:shrink-0 nx:[a]:hover:text-foreground nx:[button]:cursor-pointer nx:[button]:hover:text-foreground",
  {
    variants: {
      variant: {
        default: '',
        separator:
          'nx:w-full nx:before:mr-1 nx:before:h-px nx:before:flex-1 nx:before:bg-border-default nx:after:ml-1 nx:after:h-px nx:after:flex-1 nx:after:bg-border-default',
        border: 'nx:border-b-default nx:border-border-default nx:pb-2',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type MarkerVariants = VariantProps<typeof markerVariants>;
