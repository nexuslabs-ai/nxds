import { NxdsAppearanceProvider } from '@nxds/react/appearance';
import { NxdsAppearanceScript } from '@nxds/react/appearance/server';

import {
  DOCS_APPEARANCE_DEFAULT_STATE,
  DOCS_APPEARANCE_STORAGE_KEY,
} from '../_lib/appearance-controls';
import {
  FRAMEWORK_BOOTSTRAP_SCRIPT,
  FRAMEWORK_PANEL_CSS,
} from '../_lib/frameworks';
import { SITE_METADATA } from '../_lib/site';

import '../globals.css';

export const metadata = SITE_METADATA;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="nx:scroll-pt-(--docs-scroll-offset) nx:scroll-pb-(--docs-panel-offset)"
      data-density={DOCS_APPEARANCE_DEFAULT_STATE.density}
      data-radius={DOCS_APPEARANCE_DEFAULT_STATE.corners}
      data-shadow={DOCS_APPEARANCE_DEFAULT_STATE.elevation}
      data-borderwidth={DOCS_APPEARANCE_DEFAULT_STATE.stroke}
      suppressHydrationWarning
    >
      <head>
        <NxdsAppearanceScript
          storageKey={DOCS_APPEARANCE_STORAGE_KEY}
          defaultState={DOCS_APPEARANCE_DEFAULT_STATE}
        />
        <script
          data-docs-framework-script=""
          dangerouslySetInnerHTML={{ __html: FRAMEWORK_BOOTSTRAP_SCRIPT }}
        />
        <style
          data-docs-framework-style=""
          dangerouslySetInnerHTML={{ __html: FRAMEWORK_PANEL_CSS }}
        />
      </head>
      <body className="nx:min-h-svh nx:bg-background nx:text-foreground nx:typography-body-default">
        <NxdsAppearanceProvider
          storageKey={DOCS_APPEARANCE_STORAGE_KEY}
          defaultState={DOCS_APPEARANCE_DEFAULT_STATE}
        >
          {children}
        </NxdsAppearanceProvider>
      </body>
    </html>
  );
}
