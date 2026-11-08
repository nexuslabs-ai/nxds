import { cva, type VariantProps } from 'class-variance-authority';
import { inject } from 'vue';

import {
  type MessageScrollerContextValue,
  MessageScrollerKey,
} from './message-scroller-context';

export {
  default as MessageScroller,
  type MessageScrollerProps,
} from './MessageScroller.vue';
export {
  default as MessageScrollerButton,
  type MessageScrollerButtonProps,
} from './MessageScrollerButton.vue';
export {
  default as MessageScrollerContent,
  type MessageScrollerContentProps,
} from './MessageScrollerContent.vue';
export {
  default as MessageScrollerItem,
  type MessageScrollerItemProps,
} from './MessageScrollerItem.vue';
export {
  default as MessageScrollerProvider,
  type MessageScrollerProviderProps,
} from './MessageScrollerProvider.vue';
export {
  default as MessageScrollerViewport,
  type MessageScrollerViewportProps,
} from './MessageScrollerViewport.vue';

/**
 * Reads or changes the scroll position from anywhere inside a
 * `MessageScrollerProvider`. Works outside the scroller too, such as in a
 * composer's send button.
 */
export function useMessageScroller(): MessageScrollerContextValue {
  const context = inject(MessageScrollerKey, null);

  if (!context) {
    throw new Error(
      'useMessageScroller must be used within a <MessageScrollerProvider />'
    );
  }

  return context;
}

export const messageScrollerButtonVariants = cva(
  'nx:absolute nx:inset-x-0 nx:z-sticky nx:mx-auto nx:rounded-full nx:[&_svg]:size-icon-glyph-default nx:icon-stroke nx:data-[active=false]:invisible',
  {
    variants: {
      direction: {
        start: 'nx:top-4',
        end: 'nx:bottom-4',
      },
    },
    defaultVariants: {
      direction: 'end',
    },
  }
);

export type MessageScrollerButtonVariants = VariantProps<
  typeof messageScrollerButtonVariants
>;
