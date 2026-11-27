'use client';

import * as React from 'react';

const COPY_RESET_MS = 2000;

export type CopyState = 'idle' | 'copied' | 'failed';

/**
 * A copy button's state: `settle` shows copied or failed for two seconds,
 * then idle again. `seq` changes on each settle, so a status message keyed on
 * it announces a second copy too.
 */
export function useCopyFeedback() {
  const [copy, setCopy] = React.useState<{ state: CopyState; seq: number }>({
    state: 'idle',
    seq: 0,
  });
  const timerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const settle = (state: Exclude<CopyState, 'idle'>) => {
    setCopy(({ seq }) => ({ state, seq: seq + 1 }));
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => setCopy(({ seq }) => ({ state: 'idle', seq })),
      COPY_RESET_MS
    );
  };

  return { ...copy, settle };
}
