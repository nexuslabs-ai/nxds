import { cva, type VariantProps } from 'class-variance-authority';
import { inject, type InjectionKey, type Ref } from 'vue';

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

/** What `useMessageScroller` returns: the scroll position, and jumps to either end. */
export interface MessageScrollerContextValue {
  isScrollable: Readonly<Ref<boolean>>;
  isAtEnd: Readonly<Ref<boolean>>;
  isAtStart: Readonly<Ref<boolean>>;
  scrollToEnd: () => void;
  scrollToStart: () => void;
}

export const MessageScrollerKey: InjectionKey<
  MessageScrollerContextValue & {
    setViewport: (node: HTMLElement | null) => void;
    setContent: (node: HTMLElement | null) => void;
  }
> = Symbol('message-scroller');

/**
 * Reads or changes the scroll position from anywhere inside a
 * `MessageScrollerProvider`. Works outside the scroller too, such as in a
 * composer's send button.
 */
function injectMessageScroller(): MessageScrollerContextValue {
  const context = inject(MessageScrollerKey, null);

  if (!context) {
    throw new Error(
      'useMessageScroller must be used within a <MessageScrollerProvider />'
    );
  }

  return context;
}

/** The setters the viewport and content register their elements with. */
export function injectMessageScrollerNodes() {
  const context = inject(MessageScrollerKey, null);

  if (!context) {
    throw new Error(
      'MessageScroller parts must be used within a <MessageScrollerProvider />'
    );
  }

  return context;
}

export { injectMessageScroller as useMessageScroller };

export const messageScrollerButtonVariants = cva(
  'nx:absolute nx:inset-x-0 nx:z-sticky nx:mx-auto nx:rounded-full nx:[&_svg]:size-4 nx:data-[active=false]:invisible',
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
