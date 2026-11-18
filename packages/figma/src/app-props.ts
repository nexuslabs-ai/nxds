// An app's own props, read from its nxds folder with TypeScript the way the
// release reads nxds's: each part's flat props, as index.d.ts prints them,
// and the attributes its README examples convert. A prop the team added or
// a union they changed reaches Figma.
import type { CanvasSchema } from '@nxds/claude-design/attribute';
import { canvasSchema } from '@nxds/claude-design/canvas-schema';
import { componentParts, renderIndexDts } from '@nxds/claude-design/props';
import { publicExports } from '@nxds/source-model/props-contract.mjs';
import { isUnder } from '@nxds/source-model/roots.mjs';
import path from 'node:path';
import ts from 'typescript';

import { type AppSetup, componentFiles } from './app.ts';

export interface AppProps {
  /** The app's `<Part>Props` interfaces, then the release's, so a part the app has reads from the app. */
  indexDts: string;
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

export function appProps(app: AppSetup, releaseIndexDts: string): AppProps {
  const folder = path.join(app.root, app.dir, 'components');
  const files = componentFiles(folder);
  const program = ts.createProgram(files, OPTIONS);
  const checker = program.getTypeChecker();
  // A file may re-export a library's component, which isn't one of the app's parts.
  const exported = new Map(
    [...publicExports(checker, program, files)].filter(([, symbol]) => {
      const file = symbol.declarations?.[0]?.getSourceFile().fileName;
      return file !== undefined && isUnder(file, folder);
    })
  );
  const parts = componentParts(checker, exported, folder);
  return {
    indexDts: `${renderIndexDts(parts)}\n${releaseIndexDts}`,
    schema: canvasSchema(parts),
    newParts: parts
      .map((part) => part.name)
      .filter(
        (name) => !releaseIndexDts.includes(`export interface ${name}Props {`)
      ),
  };
}
