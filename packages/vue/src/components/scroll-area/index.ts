import { cva } from 'class-variance-authority';

export { default as ScrollArea, type ScrollAreaProps } from './ScrollArea.vue';
export { default as ScrollBar, type ScrollBarProps } from './ScrollBar.vue';

export const scrollBarVariants = cva(
  'nx:flex nx:touch-none nx:select-none nx:p-px nx:transition-colors',
  {
    variants: {
      orientation: {
        vertical:
          'nx:h-full nx:w-2.5 nx:border-l-default nx:border-l-transparent',
        horizontal:
          'nx:h-2.5 nx:flex-col nx:border-t-default nx:border-t-transparent',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  }
);
