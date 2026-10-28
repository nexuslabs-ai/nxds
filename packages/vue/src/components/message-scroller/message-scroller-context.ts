import { inject, type InjectionKey, type Ref } from 'vue';

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

/** The setters the viewport and content register their elements with. */
export function useMessageScrollerNodes() {
  const context = inject(MessageScrollerKey, null);

  if (!context) {
    throw new Error(
      'MessageScroller parts must be used within a <MessageScrollerProvider />'
    );
  }

  return context;
}
