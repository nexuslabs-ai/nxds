'use client';

import { useNxdsAppearance } from '@nxds/react/appearance';
import dynamic from 'next/dynamic';

const MaterialUiScene = dynamic(() => import('./material-ui-scene'), {
  ssr: false,
  loading: () => (
    <div className="nx:h-96 nx:rounded-lg nx:border nx:border-border-hairline" />
  ),
});

/**
 * The settings screen built with Material UI itself. Material UI loads in the
 * browser only, on this page only, and follows the page's light or dark mode.
 */
export function MaterialUiReference() {
  const { resolvedMode } = useNxdsAppearance();

  return <MaterialUiScene mode={resolvedMode} />;
}
