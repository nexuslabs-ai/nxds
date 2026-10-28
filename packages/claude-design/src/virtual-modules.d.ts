// The virtual module src/bundle.ts writes from index.d.ts's prop types.
declare module 'nxds:canvas-schema' {
  import type { CanvasSchema } from './attributes.ts';

  export const CANVAS_SCHEMA: CanvasSchema;
}
