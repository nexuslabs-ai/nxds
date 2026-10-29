'use client';

import { useDocsTheme } from '../_lib/docs-theme';

import { Button } from './nxds';

/** Shuffle, Undo and Reset for the docs theme, sharing one undo history. */
export function ThemeActions({ size }: { size?: 'sm' }) {
  const { shuffle, undo, canUndo, reset } = useDocsTheme();

  return (
    <div className="nx:grid nx:grid-cols-3 nx:gap-2">
      <Button variant="outline" size={size} onClick={shuffle}>
        Shuffle
      </Button>
      <Button
        variant="outline"
        size={size}
        onClick={undo}
        aria-disabled={!canUndo}
      >
        Undo
      </Button>
      <Button variant="outline" size={size} onClick={reset}>
        Reset
      </Button>
    </div>
  );
}
