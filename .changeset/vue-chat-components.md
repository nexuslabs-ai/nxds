---
'@nxds/vue': minor
---

Add chat components that match their React counterparts.

| Component       | Parts                                                                                                                                                                               | Notes                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Attachment      | `Attachment`, `AttachmentMedia`, `AttachmentContent`, `AttachmentTitle`, `AttachmentDescription`, `AttachmentActions`, `AttachmentProgress`, `AttachmentTrigger`, `AttachmentGroup` | Put a badge after the file name in `AttachmentTitle`'s `#trailing` slot                                 |
| Bubble          | `Bubble`, `BubbleGroup`, `BubbleContent`, `BubbleReactions`                                                                                                                         |                                                                                                         |
| Message         | `Message`, `MessageGroup`, `MessageAvatar`, `MessageContent`, `MessageHeader`, `MessageFooter`                                                                                      |                                                                                                         |
| MessageScroller | `MessageScrollerProvider`, `MessageScroller`, `MessageScrollerViewport`, `MessageScrollerContent`, `MessageScrollerItem`, `MessageScrollerButton`                                   | Read the scroll state with `useMessageScroller`, or from `MessageScrollerProvider`'s default slot props |
| Sonner          | `Toaster`, `toast`, `useSonner`                                                                                                                                                     | Install `vue-sonner` in your app to use it                                                              |
