'use client';

import {
  createNxdsAppearanceSnapshotFromState,
  type NxdsAppearanceState,
  type NxdsTheme,
  nxdsThemeFlags,
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

import { useIconLibrary } from '../_lib/icon-library';

import { DocsCodeBlock } from './CodeBlock';

function configurationSource(state: NxdsAppearanceState) {
  return `import type { NxdsAppearanceState } from '@nxds/core';

export const appearance = ${JSON.stringify(state, null, 2)} satisfies NxdsAppearanceState;
`;
}

/** A flag value as a shell reads it: quoted unless it's a plain word. */
function shellValue(value: string) {
  return /^[\w.-]+$/.test(value) ? value : `"${value}"`;
}

/** The `nxds-cli init` that sets up `theme`, with a flag for each part off nxds's default. */
function initCommand(theme: NxdsTheme) {
  return [
    'npx nxds-cli@latest init',
    ...nxdsThemeFlags(theme).map(
      ({ flag, value }) => `--${flag} ${shellValue(value)}`
    ),
  ].join(' ');
}

function CodeFile({ name, code }: { name: string; code: string }) {
  return (
    <section className="nx:space-y-2">
      <h3 className="nx:typography-label-default">{name}</h3>
      <DocsCodeBlock className="nx:max-h-64">
        {code
          .trimEnd()
          .split('\n')
          .map((line, index) => (
            <CodeBlockLine key={index}>{line}</CodeBlockLine>
          ))}
      </DocsCodeBlock>
    </section>
  );
}

/** Rendered only while the dialog is open, so the export is built on demand. */
function ExportFiles() {
  const { state } = useNxdsAppearance();
  const iconLibrary = useIconLibrary();
  const snapshot = createNxdsAppearanceSnapshotFromState(state);

  return (
    <>
      <CodeFile
        name="Terminal"
        code={initCommand({ appearance: state, iconLibrary })}
      />
      <section className="nx:space-y-4 nx:pt-2">
        <div className="nx:space-y-1">
          <h3 className="nx:typography-label-default">Without the CLI</h3>
          <p className="nx:typography-body-small nx:text-muted-foreground">
            Pass the configuration to NxdsAppearanceProvider and
            NxdsAppearanceScript as their default state. The style sheets are
            the CSS they apply for it.
          </p>
        </div>
        <CodeFile
          name="nxds-appearance.ts"
          code={configurationSource(snapshot.state)}
        />
        <CodeFile name="theme.css" code={snapshot.themeCss} />
        <CodeFile name="preferences.css" code={snapshot.prefsCss} />
      </section>
    </>
  );
}

/** "Use this theme": the one command that sets up the docs theme in an app. */
export function ThemeExport({ className }: { className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={className}>Use this theme</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use this theme</DialogTitle>
          <DialogDescription>
            Run this in your app. It sets up nxds with this theme, and installs
            its fonts and icon library.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="nx:space-y-4">
          <ExportFiles />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" asChild>
            <Link href="/getting-started/install">Setup guide</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
