import { cva, type VariantProps } from 'class-variance-authority';

export { default as Bubble, type BubbleProps } from './Bubble.vue';
export {
  default as BubbleContent,
  type BubbleContentProps,
} from './BubbleContent.vue';
export {
  default as BubbleGroup,
  type BubbleGroupProps,
} from './BubbleGroup.vue';
export {
  default as BubbleReactions,
  type BubbleReactionsProps,
} from './BubbleReactions.vue';

export const bubbleVariants = cva(
  [
    'nx:relative nx:w-fit nx:max-w-[min(80%,45rem)] nx:rounded-xl nx:border-default nx:border-transparent nx:typography-body-default',
    'nx:has-[>[data-bubble-part=reactions][data-side=top]]:mt-3 nx:has-[>[data-bubble-part=reactions][data-side=bottom]]:mb-3',
  ],
  {
    variants: {
      variant: {
        primary: 'nx:bg-primary-background nx:text-primary-foreground',
        muted: 'nx:bg-muted nx:text-foreground',
        outline: 'nx:border-border-default nx:text-foreground',
        ghost: 'nx:text-foreground',
        destructive: 'nx:bg-error-subtle nx:text-error-subtle-foreground',
      },
      align: {
        start: 'nx:me-auto',
        end: 'nx:ms-auto',
      },
    },
    defaultVariants: {
      variant: 'muted',
    },
  }
);

export const bubbleReactionsVariants = cva(
  'nx:absolute nx:flex nx:w-fit nx:items-center nx:gap-1 nx:rounded-full nx:border-default nx:border-border-default nx:bg-popover nx:px-2 nx:py-0.5 nx:typography-label-small nx:text-popover-foreground nx:shadow-sm',
  {
    variants: {
      side: {
        top: 'nx:-top-3',
        bottom: 'nx:-bottom-3',
      },
      align: {
        start: 'nx:start-3',
        end: 'nx:end-3',
      },
    },
    defaultVariants: {
      side: 'bottom',
      align: 'end',
    },
  }
);

export type BubbleVariants = VariantProps<typeof bubbleVariants>;
export type BubbleReactionsVariants = VariantProps<
  typeof bubbleReactionsVariants
>;
