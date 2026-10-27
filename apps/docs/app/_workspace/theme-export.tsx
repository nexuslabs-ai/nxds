'use client';

import {
  createNxdsAppearanceSnapshotFromState,
  findFontOption,
  type NxdsAppearanceState,
  type NxdsIconLibrary,
} from '@nxds/core';
import {
  Button,
  CodeBlockLine,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@nxds/react';
import { useNxdsAppearance } from '@nxds/react/appearance';
import Link from 'next/link';

import { CodeBlock } from '../_components/CodeBlock';
import { useIconLibrary } from '../_lib/icon-library';

function configurationSource(state: NxdsAppearanceState) {
  return `import type { NxdsAppearanceState } from '@nxds/core';

export const appearance = ${JSON.stringify(state, null, 2)} satisfies NxdsAppearanceState;
`;
}

/** The `init` that installs the theme's icon library and self-hosted fonts. */
function initCommand(state: NxdsAppearanceState, library: NxdsIconLibrary) {
  const font = findFontOption(state.prefs.uiFont);
  const headingFont =
    state.prefs.headingFont === null
      ? undefined
      : findFontOption(state.prefs.headingFont);
  return [
    'npx nxds-cli@latest init',
    `--icons ${library}`,
    ...(font ? [`--font ${font.value}`] : []),
    ...(headingFont ? [`--heading-font ${headingFont.value}`] : []),
  ].join(' ');
}

/** Rendered only while the dialog is open, so the export is built on demand. */
function ExportFiles() {
  const { state } = useNxdsAppearance();
  const library = useIconLibrary();
  const snapshot = createNxdsAppearanceSnapshotFromState(state);
  const files = [
    { name: 'Terminal', code: initCommand(state, library) },
    { name: 'nxds-appearance.ts', code: configurationSource(snapshot.state) },
    { name: 'theme.css', code: snapshot.themeCss },
    { name: 'preferences.css', code: snapshot.prefsCss },
  ];

  return files.map((file) => (
    <section key={file.name} className="nx:space-y-2">
      <h3 className="nx:typography-label-default">{file.name}</h3>
      <CodeBlock className="nx:max-h-64">
        {file.code
          .trimEnd()
          .split('\n')
          .map((line, index) => (
            <CodeBlockLine key={index}>{line}</CodeBlockLine>
          ))}
      </CodeBlock>
    </section>
  ));
}

export function ThemeExport() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Use this theme</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use this theme</DialogTitle>
          <DialogDescription>
            Run the command to install the icon library and fonts. Then pass the
            configuration to NxdsAppearanceProvider and NxdsAppearanceScript as
            their default state. The style sheets are the CSS they apply for it.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="nx:space-y-4">
          <ExportFiles />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" asChild>
            <Link href="/getting-started/install#step-3-add-the-appearance-provider">
              Setup guide
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
