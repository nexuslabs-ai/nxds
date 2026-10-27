import { NxdsAppearanceProvider } from '@nxds/react/appearance';
import { NxdsAppearanceScript } from '@nxds/react/appearance/server';

import { HOME_APPEARANCE } from '../_home/appearance';
import { SITE_METADATA } from '../_lib/site';

import '../globals.css';

export const metadata = SITE_METADATA;

/**
 * The homepage is its own document: its appearance starts from the homepage
 * look and is never saved, so Customize does not change the docs.
 */
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-density={HOME_APPEARANCE.density}
      data-radius={HOME_APPEARANCE.corners}
      data-shadow={HOME_APPEARANCE.elevation}
      data-borderwidth={HOME_APPEARANCE.stroke}
      suppressHydrationWarning
    >
      <head>
        <NxdsAppearanceScript
          storageKey={false}
          defaultState={HOME_APPEARANCE}
        />
      </head>
      <body className="nx:bg-background nx:text-foreground nx:typography-body-default">
        <NxdsAppearanceProvider
          storageKey={false}
          defaultState={HOME_APPEARANCE}
        >
          {children}
        </NxdsAppearanceProvider>
      </body>
    </html>
  );
}
