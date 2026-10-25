import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { overlayPanelTransitionClassName } from '../overlay-layout/overlay-layout';

export { default as SheetBody, type SheetBodyProps } from './SheetBody.vue';
export {
  default as SheetContent,
  type SheetContentProps,
} from './SheetContent.vue';
export {
  default as SheetDescription,
  type SheetDescriptionProps,
} from './SheetDescription.vue';
export {
  default as SheetFooter,
  type SheetFooterProps,
} from './SheetFooter.vue';
export {
  default as SheetHeader,
  type SheetHeaderProps,
} from './SheetHeader.vue';
export {
  default as SheetOverlay,
  type SheetOverlayProps,
} from './SheetOverlay.vue';
export { default as SheetTitle, type SheetTitleProps } from './SheetTitle.vue';
export {
  DialogRoot as Sheet,
  DialogClose as SheetClose,
  type DialogCloseProps as SheetCloseProps,
  DialogPortal as SheetPortal,
  type DialogPortalProps as SheetPortalProps,
  type DialogRootProps as SheetProps,
  DialogTrigger as SheetTrigger,
  type DialogTriggerProps as SheetTriggerProps,
} from 'reka-ui';

/**
 * Per-side positioning and slide motion for the sheet panel. Each side pins the
 * panel to an edge and slides it fully on/off screen from that edge — the bare
 * `slide-*` utilities translate by 100% (the spacing-scaled `slide-*-N` forms
 * resolve to 0 under the nxds spacing reset, so they would not move).
 */
export const sheetContentVariants = cva(
  cn(
    'nx:fixed nx:z-modal nx:flex nx:flex-col nx:overflow-hidden',
    'nx:bg-container nx:shadow-lg',
    overlayPanelTransitionClassName
  ),
  {
    variants: {
      side: {
        top: cn(
          'nx:inset-x-0 nx:top-0 nx:h-auto nx:max-h-svh nx:border-b-default nx:border-border-default',
          'nx:data-[state=closed]:-translate-y-full'
        ),
        bottom: cn(
          'nx:inset-x-0 nx:bottom-0 nx:h-auto nx:max-h-svh nx:border-t-default nx:border-border-default',
          'nx:data-[state=closed]:translate-y-full'
        ),
        left: cn(
          'nx:left-0 nx:top-0 nx:h-svh nx:w-3/4 nx:border-r-default nx:border-border-default nx:sm:max-w-sm',
          'nx:data-[state=closed]:-translate-x-full'
        ),
        right: cn(
          'nx:right-0 nx:top-0 nx:h-svh nx:w-3/4 nx:border-l-default nx:border-border-default nx:sm:max-w-sm',
          'nx:data-[state=closed]:translate-x-full'
        ),
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

export type SheetContentVariants = VariantProps<typeof sheetContentVariants>;
