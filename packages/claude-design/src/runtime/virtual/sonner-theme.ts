// The types of nxds:sonner-theme: the sources' Sonner and the nxds Toaster's
// private theme, which bundle.js opens up for Nxds.Toast.
import type { ComponentType, ReactNode } from 'react';

import type { toast, ToasterProps } from 'sonner';

type ToastVariant = 'success' | 'info' | 'warning' | 'error' | 'loading';

export declare const Sonner: ComponentType<ToasterProps>;
export declare const sonnerToast: typeof toast;
export declare const toasterIcons: Record<ToastVariant, ReactNode>;
export declare const toasterThemeVars: Record<string, string>;
export declare function useToasterTheme(): 'light' | 'dark';
