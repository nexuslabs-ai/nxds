import * as React from 'react';

/** `useLayoutEffect` in the browser, `useEffect` on the server, where React 18 warns about it. */
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
