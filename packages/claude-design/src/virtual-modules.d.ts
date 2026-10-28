// The virtual module src/bundle.ts writes from index.d.ts's prop types.
declare module 'nxds:canvas-schema' {
  import type { CanvasSchema } from './attributes.ts';

  export const CANVAS_SCHEMA: CanvasSchema;
}

// Each icon component bundle.js ships, by its canvas name.
declare module 'nxds:icon-names' {
  import type { ComponentType } from 'react';

  export const ICON_COMPONENTS: Record<
    string,
    ComponentType<Record<string, unknown>> | undefined
  >;
}

// The sources' Sonner and the nxds Toaster's private theme, which bundle.js
// exports for Nxds.Toast.
declare module 'nxds:sonner-theme' {
  import type { ComponentType, ReactNode } from 'react';

  type ToastShow = (
    title: string,
    options: Record<string, unknown>
  ) => string | number;

  export const Sonner: ComponentType<Record<string, unknown>>;
  export const sonnerToast: ToastShow &
    Record<'success' | 'info' | 'warning' | 'error' | 'loading', ToastShow> & {
      dismiss: (id?: string | number) => void;
    };
  export const toasterIcons: Record<
    'success' | 'info' | 'warning' | 'error' | 'loading',
    ReactNode
  >;
  export const toasterThemeVars: Record<string, string>;
  export function useToasterTheme(): 'light' | 'dark';
}
