import { computed } from 'vue';
import {
  type ExternalToast,
  toast as sonnerToast,
  type ToastT,
  type ToastToDismiss,
  useVueSonner,
} from 'vue-sonner';

import { NXDS_TOASTER_ID } from './Toaster.vue';

export { default as Toaster, type ToasterProps } from './Toaster.vue';

function inNxdsToaster<Data extends object>(data?: Data) {
  return { ...data, toasterId: NXDS_TOASTER_ID };
}

function isNxdsToast(entry: ToastT | ToastToDismiss): entry is ToastT {
  return 'toasterId' in entry && entry.toasterId === NXDS_TOASTER_ID;
}

type Message = Parameters<typeof sonnerToast.success>[0];

const toast = Object.assign(
  (message: Parameters<typeof sonnerToast>[0], data?: ExternalToast) =>
    sonnerToast(message, inNxdsToaster(data)),
  {
    success: (message: Message, data?: ExternalToast) =>
      sonnerToast.success(message, inNxdsToaster(data)),
    info: (message: Message, data?: ExternalToast) =>
      sonnerToast.info(message, inNxdsToaster(data)),
    warning: (message: Message, data?: ExternalToast) =>
      sonnerToast.warning(message, inNxdsToaster(data)),
    error: (message: Message, data?: ExternalToast) =>
      sonnerToast.error(message, inNxdsToaster(data)),
    message: (message: Message, data?: ExternalToast) =>
      sonnerToast.message(message, inNxdsToaster(data)),
    loading: (message: Message, data?: ExternalToast) =>
      sonnerToast.loading(message, inNxdsToaster(data)),
    custom: (
      content: Parameters<typeof sonnerToast.custom>[0],
      data?: ExternalToast
    ) => sonnerToast.custom(content, inNxdsToaster(data)),
    promise<ToastData>(
      promise: Parameters<typeof sonnerToast.promise<ToastData>>[0],
      data?: Parameters<typeof sonnerToast.promise<ToastData>>[1]
    ) {
      return sonnerToast.promise(promise, data && inNxdsToaster(data));
    },
    // Without an id, dismisses every nxds toast and leaves the host's alone.
    dismiss: (id?: number | string) => {
      if (id !== undefined) return sonnerToast.dismiss(id);
      for (const entry of sonnerToast.getToasts().filter(isNxdsToast)) {
        sonnerToast.dismiss(entry.id);
      }
    },
    getHistory: () => sonnerToast.getHistory().filter(isNxdsToast),
    getToasts: () => sonnerToast.getToasts().filter(isNxdsToast),
  }
);

/** The nxds toasts currently on screen. Call it during a component's setup. */
function useNxdsToasts() {
  const { activeToasts } = useVueSonner();
  return { toasts: computed(() => activeToasts.value.filter(isNxdsToast)) };
}

export { toast, useNxdsToasts as useSonner };
