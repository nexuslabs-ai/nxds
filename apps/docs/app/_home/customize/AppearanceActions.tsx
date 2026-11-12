'use client';

import { Show } from '@/components/show/show';
import { ToolbarButton } from '@/components/toolbar/toolbar';

import { useDocsTheme } from '../../_lib/docs-theme';
import { ResetActionIcon, ShuffleActionIcon } from '../tool-icons';

const actionClass = 'nx:w-8 nx:px-0 nx:sm:w-auto nx:sm:px-2.5';

/**
 * Shuffle and Reset in the Customize toolbar. They change the whole site, and
 * the docs theme panel's Undo reverses them.
 */
export function AppearanceActions() {
  const { shuffle, reset } = useDocsTheme();
  return (
    <>
      <ToolbarButton
        aria-label="Shuffle"
        startIcon={<ShuffleActionIcon />}
        className={actionClass}
        onClick={shuffle}
      >
        <Show above="sm">Shuffle</Show>
      </ToolbarButton>
      <ToolbarButton
        aria-label="Reset"
        startIcon={<ResetActionIcon />}
        className={actionClass}
        onClick={reset}
      >
        <Show above="sm">Reset</Show>
      </ToolbarButton>
    </>
  );
}
