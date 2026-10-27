'use client';

import {
  DEFAULT_ICON_LIBRARY,
  ICON_LIBRARY_OPTIONS,
  shuffleNxdsAppearance,
} from '@nxds/core';
import { useNxdsAppearance } from '@nxds/react/appearance';
import { IconArrowsShuffle, IconRestore } from '@tabler/icons-react';

import { Show } from '@/components/show/show';
import { ToolbarButton } from '@/components/toolbar/toolbar';

import { setIconLibrary } from '../../_lib/icon-library';
import { homeAppearance } from '../appearance';

const actionClass =
  'nx:typography-label-default nx:sm:w-auto nx:sm:gap-2 nx:sm:px-3.5';

/** Shuffle and Reset in the Customize toolbar. They change the whole page. */
export function AppearanceActions() {
  const { state, setState } = useNxdsAppearance();
  function shuffle() {
    setState(shuffleNxdsAppearance(state));
    const index = Math.floor(Math.random() * ICON_LIBRARY_OPTIONS.length);
    const option = ICON_LIBRARY_OPTIONS[index];
    if (option) setIconLibrary(option.value);
  }
  function reset() {
    setState(homeAppearance(state.mode));
    setIconLibrary(DEFAULT_ICON_LIBRARY);
  }
  return (
    <>
      <ToolbarButton
        size="icon-lg"
        aria-label="Shuffle"
        className={actionClass}
        onClick={shuffle}
      >
        <IconArrowsShuffle aria-hidden="true" />
        <Show above="sm">Shuffle</Show>
      </ToolbarButton>
      <ToolbarButton
        size="icon-lg"
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
