'use client';

import { useState } from 'react';

import {
  DEFAULT_ICON_LIBRARY,
  type NxdsAppearanceState,
  type NxdsIconLibrary,
  shuffleNxdsAppearance,
  shuffleNxdsIconLibrary,
} from '@nxds/core';
import { useNxdsAppearance } from '@nxds/react/appearance';

import { DOCS_APPEARANCE_DEFAULT_STATE } from '../_lib/appearance-controls';
import { setIconLibrary, useIconLibrary } from '../_lib/icon-library';

const HISTORY_LIMIT = 100;

type AppearancePatch = Partial<NxdsAppearanceState>;
type AppearanceKey = keyof NxdsAppearanceState;

function isShallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;
  const aEntries = Object.entries(a);
  const bRecord = b as Record<string, unknown>;
  return (
    aEntries.length === Object.keys(b).length &&
    aEntries.every(([key, value]) => Object.is(value, bRecord[key]))
  );
}

/** The current values of the keys `patch` would change. */
function inverseOf(
  state: NxdsAppearanceState,
  patch: AppearancePatch
): AppearancePatch {
  const changedKeys = (Object.keys(patch) as AppearanceKey[]).filter(
    (key) => !isShallowEqual(state[key], patch[key])
  );
  return Object.fromEntries(
    changedKeys.map((key) => [key, state[key]])
  ) as AppearancePatch;
}

/**
 * One undo step: the previous values of the appearance keys it changed, and
 * the previous icon library when it changed that.
 */
type HistoryStep = {
  appearance: AppearancePatch;
  iconLibrary?: NxdsIconLibrary;
};

/**
 * The shared docs appearance and icon library, plus an undo history of the
 * edits made through `change`, `changeIconLibrary`, `shuffle` and `reset`.
 * Each step stores only the previous values of what it changed, so Undo leaves
 * writes made elsewhere (such as the top-nav mode toggle) in place.
 * Consecutive changes in the same `group` share one undo step until
 * `startStep` is called. Edits persist through the docs appearance provider.
 */
export function useAppearanceHistory() {
  const { state, setState } = useNxdsAppearance();
  const iconLibrary = useIconLibrary();
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [lastGroup, setLastGroup] = useState<AppearanceKey | null>(null);

  function record(
    patch: AppearancePatch,
    library: NxdsIconLibrary,
    group?: AppearanceKey
  ) {
    const step: HistoryStep = { appearance: inverseOf(state, patch) };
    if (library !== iconLibrary) step.iconLibrary = iconLibrary;
    if (Object.keys(step.appearance).length === 0 && !step.iconLibrary) return;

    const extendsStep = group !== undefined && group === lastGroup;
    setHistory((past) => {
      const open = past.at(-1);
      if (!extendsStep || !open) return [...past, step].slice(-HISTORY_LIMIT);
      // The open step keeps the value each key had before the group began.
      return [
        ...past.slice(0, -1),
        { ...open, appearance: { ...step.appearance, ...open.appearance } },
      ];
    });
    setLastGroup(group ?? null);
    setState((current) => ({ ...current, ...patch }));
    if (step.iconLibrary) setIconLibrary(library);
  }

  function change(patch: AppearancePatch, group?: AppearanceKey) {
    record(patch, iconLibrary, group);
  }

  function changeIconLibrary(library: NxdsIconLibrary) {
    record({}, library);
  }

  function shuffle() {
    record(shuffleNxdsAppearance(state), shuffleNxdsIconLibrary());
  }

  function reset() {
    record(DOCS_APPEARANCE_DEFAULT_STATE, DEFAULT_ICON_LIBRARY);
  }

  function startStep() {
    setLastGroup(null);
  }

  function undo() {
    const step = history.at(-1);
    if (!step) return;
    setHistory((past) => past.slice(0, -1));
    startStep();
    setState((current) => ({ ...current, ...step.appearance }));
    if (step.iconLibrary) setIconLibrary(step.iconLibrary);
  }

  return {
    state,
    iconLibrary,
    change,
    changeIconLibrary,
    shuffle,
    startStep,
    reset,
    undo,
    canUndo: history.length > 0,
  };
}
