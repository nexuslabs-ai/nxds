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
