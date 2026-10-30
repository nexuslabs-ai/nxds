'use client';

import { useNxdsAppearance } from '@nxds/react/appearance';

import { Button } from '@/components/button/button';

import { ThemeActions } from '../_components/ThemeActions';
import { ThemeExport } from '../_components/ThemeExport';
import { useDocsTheme } from '../_lib/docs-theme';

import { AppearanceControls } from './appearance-controls';
import { PageHeading } from './page-heading';
import { PlaygroundViewNav } from './playground-view-nav';
import { Sampler } from './sampler';
import { WorkspaceLayout } from './workspace-layout';

export function PlaygroundWorkspace() {
  const { state, iconLibrary, change, changeIconLibrary, startStep } =
    useDocsTheme();
  const { resolvedMode } = useNxdsAppearance();

  const panel = (
    <div className="nx:space-y-8">
      <AppearanceControls
        state={state}
        resolvedMode={resolvedMode}
        iconLibrary={iconLibrary}
        onChange={change}
        onIconLibraryChange={changeIconLibrary}
        onGestureStart={startStep}
      />
      <div className="nx:flex nx:flex-col nx:gap-2 nx:pt-4 nx:border-t-default nx:border-border-default">
        <ThemeActions />
        <ThemeExport />
      </div>
    </div>
  );

  return (
    <WorkspaceLayout
      panelTitle="Appearance"
      panelDescription="Style the docs and the examples."
      aside={panel}
      sheetTrigger={<Button variant="outline">Appearance</Button>}
    >
      <PlaygroundViewNav />
      <div className="nx:space-y-8">
        <header className="nx:space-y-2">
          <p className="nx:typography-label-small nx:text-muted-foreground">
            PLAYGROUND
          </p>
          <PageHeading>Try a theme on every component</PageHeading>
          <p className="nx:max-w-2xl nx:text-muted-foreground">
            Change the appearance, and these examples, the docs and every
            overlay they open follow it. When you like the result, select Use
            this theme to copy it into your app.
          </p>
        </header>
        <Sampler />
      </div>
    </WorkspaceLayout>
  );
}
