// The types of nxds:sonner-theme: the sources' Sonner and the nxds Toaster's
// private theme, which bundle.js opens up for Nxds.Toast.
import type { ComponentType, ReactNode } from 'react';

type ToastShow = (
  title: string,
  options: Record<string, unknown>
) => string | number;

type ToastVariant = 'success' | 'info' | 'warning' | 'error' | 'loading';

export declare const Sonner: ComponentType<Record<string, unknown>>;
export declare const sonnerToast: ToastShow &
  Record<ToastVariant, ToastShow> & {
    dismiss: (id?: string | number) => void;
  };
export declare const toasterIcons: Record<ToastVariant, ReactNode>;
export declare const toasterThemeVars: Record<string, string>;
export declare function useToasterTheme(): 'light' | 'dark';
