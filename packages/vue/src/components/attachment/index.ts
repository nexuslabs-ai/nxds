import { cva, type VariantProps } from 'class-variance-authority';

export { default as Attachment, type AttachmentProps } from './Attachment.vue';
export {
  default as AttachmentActions,
  type AttachmentActionsProps,
} from './AttachmentActions.vue';
export {
  default as AttachmentContent,
  type AttachmentContentProps,
} from './AttachmentContent.vue';
export {
  default as AttachmentDescription,
  type AttachmentDescriptionProps,
} from './AttachmentDescription.vue';
export {
  default as AttachmentGroup,
  type AttachmentGroupProps,
} from './AttachmentGroup.vue';
export {
  default as AttachmentMedia,
  type AttachmentMediaProps,
} from './AttachmentMedia.vue';
export {
  default as AttachmentProgress,
  type AttachmentProgressProps,
} from './AttachmentProgress.vue';
export {
  default as AttachmentTitle,
  type AttachmentTitleProps,
} from './AttachmentTitle.vue';
export {
  default as AttachmentTrigger,
  type AttachmentTriggerProps,
} from './AttachmentTrigger.vue';

/**
 * Upload lifecycle of one attachment, from empty drop target to done.
 */
export type AttachmentState =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'error'
  | 'done';

export const attachmentVariants = cva(
  [
    // isolate: AttachmentTrigger and AttachmentActions stack inside the card,
    // so the card must be their stacking context rather than the page.
    'nx:group/attachment nx:relative nx:isolate nx:min-w-0',
    'nx:data-[state=idle]:border-dashed',
    'nx:data-[state=error]:border-error-border',
  ],
  {
    variants: {
      size: {
        default: 'nx:gap-2.5 nx:p-2.5',
        sm: 'nx:gap-2 nx:p-2',
      },
      orientation: {
        horizontal: 'nx:flex-nowrap nx:items-center',
        vertical: 'nx:w-32 nx:flex-col nx:items-stretch',
      },
    },
    defaultVariants: {
      size: 'default',
      orientation: 'horizontal',
    },
  }
);

export type AttachmentVariants = VariantProps<typeof attachmentVariants>;
