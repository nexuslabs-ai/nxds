import type { NxdsIconLibrary } from '@nxds/core';

/** One docs story of a framework other than React, as its generator writes it. */
export interface FrameworkDemo {
  /** `{slug}/{story}` for a story tagged `docs`. */
  id: string;
  title: string;
  description: string | null;
  /** The demo as the file a reader copies, as each icon library draws it. */
  sources: Readonly<Record<NxdsIconLibrary, string>>;
  /** Components the demo needs beyond its own. */
  alsoInstall: readonly string[];
  /** `name@range` packages it imports that its component doesn't install, by icon library. */
  packages: Readonly<Record<NxdsIconLibrary, readonly string[]>>;
}

/** A component page's docs in a framework other than React. */
export interface FrameworkComponentDocs {
  description: string;
  preview: string;
  examples: readonly string[];
  imports: string;
}
