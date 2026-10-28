// Nxds.Toast: one toast, shown in place on a static screen. A real toast
// needs a `toast()` call, which a canvas can't make. Each Toast renders its
// own Sonner toaster, styled as the nxds Toaster is, and shows one toast in
// it that stays until it's dismissed.
import * as React from 'react';

import {
  Sonner,
  sonnerToast,
  toasterIcons,
  toasterThemeVars,
  useToasterTheme,
} from 'nxds:sonner-theme';

import { coerce } from '../attributes.ts';

import { Icon } from './icon.ts';

type ToastVariant =
  | 'default'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'loading';

export interface ToastProps {
  variant?: ToastVariant;
  title: string;
  description?: string;
  action?: string;
  cancel?: string;
  closeButton?: boolean;
  richColors?: boolean;
  icon?: string;
  className?: string;
}

// Sonner pins its toaster to the viewport and stacks toasts absolutely. Its
// stylesheet is unlayered, so only inline styles move them back in place.
const IN_PLACE: React.CSSProperties = {
  position: 'relative',
  inset: 'auto',
  transform: 'none',
};

function show(variant: ToastVariant) {
  return variant === 'default' ? sonnerToast : sonnerToast[variant];
}

export function Toast(raw: ToastProps) {
  const {
    variant = 'default',
    title,
    description,
    action,
    cancel,
    closeButton = false,
    richColors = false,
    icon,
    className,
  } = coerce('Toast', raw);
  const toasterId = `nxds-canvas-toast-${React.useId().replace(/:/g, '')}`;
  const theme = useToasterTheme();

  // Sonner keeps toasts in a store outside React; this toaster shows one.
  React.useEffect(() => {
    show(variant)(title, {
      id: toasterId,
      toasterId,
      duration: Infinity,
      style: IN_PLACE,
      description,
      closeButton,
      icon: icon ? React.createElement(Icon, { name: icon }) : undefined,
      action: action ? { label: action, onClick: () => {} } : undefined,
      cancel: cancel ? { label: cancel, onClick: () => {} } : undefined,
    });
    return () => {
      sonnerToast.dismiss(toasterId);
    };
  }, [
    variant,
    title,
    description,
    action,
    cancel,
    closeButton,
    icon,
    toasterId,
  ]);

  return React.createElement(
    'div',
    {
      'data-slot': 'toast',
      className,
    },
    React.createElement(Sonner, {
      id: toasterId,
      theme,
      icons: toasterIcons,
      richColors,
      style: { ...toasterThemeVars, ...IN_PLACE },
    })
  );
}
