import type { InjectionKey } from 'vue';

import type {
  OverlayLayoutContextValue,
  OverlayVariant,
} from '../overlay-layout/overlay-layout';

export {
  default as AlertDialogAction,
  type AlertDialogActionProps,
} from './AlertDialogAction.vue';
export {
  default as AlertDialogBody,
  type AlertDialogBodyProps,
} from './AlertDialogBody.vue';
export {
  default as AlertDialogCancel,
  type AlertDialogCancelProps,
} from './AlertDialogCancel.vue';
export {
  default as AlertDialogContent,
  type AlertDialogContentProps,
} from './AlertDialogContent.vue';
export {
  default as AlertDialogDescription,
  type AlertDialogDescriptionProps,
} from './AlertDialogDescription.vue';
export {
  default as AlertDialogFooter,
  type AlertDialogFooterProps,
} from './AlertDialogFooter.vue';
export {
  default as AlertDialogHeader,
  type AlertDialogHeaderProps,
} from './AlertDialogHeader.vue';
export {
  default as AlertDialogOverlay,
  type AlertDialogOverlayProps,
} from './AlertDialogOverlay.vue';
export {
  default as AlertDialogTitle,
  type AlertDialogTitleProps,
} from './AlertDialogTitle.vue';
export {
  AlertDialogRoot as AlertDialog,
  AlertDialogPortal,
  type AlertDialogPortalProps,
  type AlertDialogProps,
  AlertDialogTrigger,
  type AlertDialogTriggerProps,
} from 'reka-ui';

export type AlertDialogVariant = OverlayVariant;

export const AlertDialogLayoutKey: InjectionKey<OverlayLayoutContextValue> =
  Symbol('alert-dialog-layout');
