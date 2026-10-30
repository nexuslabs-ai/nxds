'use client';

import { IconArrowsShuffle, IconRestore } from '@tabler/icons-react';

import { Show } from '@/components/show/show';
import { ToolbarButton } from '@/components/toolbar/toolbar';

import { useDocsTheme } from '../../_lib/docs-theme';

const actionClass =
  'nx:typography-label-default nx:sm:w-auto nx:sm:gap-2 nx:sm:px-2.5';

/**
 * Shuffle and Reset in the Customize toolbar. They change the whole site, and
 * the docs theme panel's Undo reverses them.
 */
export function AppearanceActions() {
  const { shuffle, reset } = useDocsTheme();
  return (
    <>
      <ToolbarButton
        size="icon-sm"
        aria-label="Shuffle"
        className={actionClass}
        onClick={shuffle}
      >
        <IconArrowsShuffle aria-hidden="true" />
        <Show above="sm">Shuffle</Show>
      </ToolbarButton>
      <ToolbarButton
        size="icon-sm"
        aria-label="Reset"
        className={actionClass}
        onClick={reset}
      >
        <IconRestore aria-hidden="true" />
        <Show above="sm">Reset</Show>
      </ToolbarButton>
    </>
  );
}
