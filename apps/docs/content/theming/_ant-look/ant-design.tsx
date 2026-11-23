'use client';

import { useNxdsAppearance } from '@nxds/react/appearance';
import dynamic from 'next/dynamic';

const AntDesignScene = dynamic(() => import('./ant-design-scene'), {
  ssr: false,
  loading: () => (
    <div className="nx:h-96 nx:rounded-lg nx:border nx:border-border-hairline" />
  ),
});

/**
 * The admin page built with Ant Design itself. Ant Design loads in the browser
 * only, on this page only, and follows the page's light or dark mode.
 */
export function AntDesignReference() {
  const { resolvedMode } = useNxdsAppearance();

  return <AntDesignScene mode={resolvedMode} />;
}
