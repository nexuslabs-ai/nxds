// An app's own props, read from its nxds folder with TypeScript the way the
// release reads nxds's: each part's flat props, and the attributes its README
// examples convert. A prop the team added or a union they changed reaches
// Figma.
import type { CanvasSchema } from '@nxds/claude-design/attribute';
import { canvasSchema } from '@nxds/claude-design/canvas-schema';
import { type PartProps, partProps } from '@nxds/claude-design/index-dts';
import { componentParts } from '@nxds/claude-design/props';
import {
  publicExports,
  toSlugFolder,
} from '@nxds/source-model/props-contract.mjs';
import path from 'node:path';
import ts from 'typescript';

import { type AppSetup, componentFiles } from './app.ts';
import { ExportError } from './errors.ts';

export interface AppProps {
  /** The app's parts' props, then the release's, so a part the app has reads from the app. */
  props: PartProps;
  /** What each of the app's parts converts its attribute strings to. */
  schema: CanvasSchema;
  /** The app's parts the release has no props for, so no example draws them. */
  newParts: string[];
}

/** @nxds/react's compiler options, which every app's copy of nxds compiles under. */
const OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2020,
  lib: ['lib.es2020.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  noUncheckedIndexedAccess: true,
  esModuleInterop: true,
  skipLibCheck: true,
  resolveJsonModule: true,
  types: [],
  noEmit: true,
};

/** The app's parts in `folder`, its components folder. */
function readParts(folder: string, icons: readonly string[]) {
  const files = componentFiles(folder);
  const program = ts.createProgram(files, OPTIONS);
  const checker = program.getTypeChecker();
  // A part sits in a folder of its own, as nxds's do. A file directly in the
  // components folder, or a library's component re-exported, isn't one.
  const exported = new Map(
    [...publicExports(checker, program, files)].filter(([, symbol]) => {
      const file = symbol.declarations?.[0]?.getSourceFile().fileName;
      return (
        file !== undefined && toSlugFolder(path.relative(folder, file)) !== null
      );
    })
  );
  return componentParts(checker, exported, folder, icons);
}

export function appProps(app: AppSetup, release: PartProps): AppProps {
  const components = path.join(app.dir, 'components');
  // An icon prop takes the names the release's Icon draws.
  const icons =
    release.get('Icon')?.find((prop) => prop.name === 'name')?.literals ?? [];
  let parts: ReturnType<typeof componentParts>;
  try {
    parts = readParts(path.join(app.root, components), icons);
  } catch (error) {
    throw new ExportError(
      `The Figma export can't read the props of the app's components in ${components}: ${(error as Error).message}`
    );
  }
  return {
    props: new Map([...release, ...partProps(parts)]),
    schema: canvasSchema(parts),
    newParts: parts
      .map((part) => part.name)
      .filter((name) => !release.has(name)),
  };
}
