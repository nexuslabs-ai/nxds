import { computed } from 'vue';
import {
  type ExternalToast,
  toast as sonnerToast,
  type ToastT,
  type ToastToDismiss,
  useVueSonner,
} from 'vue-sonner';

export { default as Toaster, type ToasterProps } from './Toaster.vue';

// nxds toasts render only in the nxds Toaster, and a host app's own sonner
// Toaster never shows them, so mounting both never doubles a toast.
export const NXDS_TOASTER_ID = 'nxds';

function inNxdsToaster<Data extends object>(data?: Data) {
  return { ...data, toasterId: NXDS_TOASTER_ID };
}

function isNxdsToast(entry: ToastT | ToastToDismiss): entry is ToastT {
  return 'toasterId' in entry && entry.toasterId === NXDS_TOASTER_ID;
}

type ToastMessage = Parameters<typeof sonnerToast.success>[0];

const nxdsToast = Object.assign(
  (message: Parameters<typeof sonnerToast>[0], data?: ExternalToast) =>
    sonnerToast(message, inNxdsToaster(data)),
  {
    success: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.success(message, inNxdsToaster(data)),
    info: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.info(message, inNxdsToaster(data)),
    warning: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.warning(message, inNxdsToaster(data)),
    error: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.error(message, inNxdsToaster(data)),
    message: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.message(message, inNxdsToaster(data)),
    loading: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.loading(message, inNxdsToaster(data)),
    custom: (
      component: Parameters<typeof sonnerToast.custom>[0],
      data?: ExternalToast
    ) => sonnerToast.custom(component, inNxdsToaster(data)),
    promise: <ToastData>(
      promise: Parameters<typeof sonnerToast.promise<ToastData>>[0],
      data?: Parameters<typeof sonnerToast.promise<ToastData>>[1]
    ) => sonnerToast.promise(promise, data && inNxdsToaster(data)),
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
function useToastList() {
  const { activeToasts } = useVueSonner();
  return { toasts: computed(() => activeToasts.value.filter(isNxdsToast)) };
}

export { nxdsToast as toast, useToastList as useSonner };
