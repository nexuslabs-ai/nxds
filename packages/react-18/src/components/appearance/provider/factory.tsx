'use client';

import type {
  NxdsAppearanceCookieOptions,
  NxdsAppearanceState,
} from '@nxds/core';

import {
  NxdsAppearanceProvider,
  type NxdsAppearanceProviderProps,
} from './provider';

export interface CreateNxdsAppearanceOptions {
  storageKey?: string | false;
  cookieWriteKey?: string | false;
  cookieOptions?: NxdsAppearanceCookieOptions;
  defaultState?: NxdsAppearanceState;
  deriveColors?: boolean;
}

type ConfiguredProviderProps = Omit<
  NxdsAppearanceProviderProps,
  | 'storageKey'
  | 'cookieWriteKey'
  | 'cookieOptions'
  | 'defaultState'
  | 'deriveColors'
>;

export function createNxdsAppearance({
  storageKey,
  cookieWriteKey,
  cookieOptions,
  defaultState,
  deriveColors,
}: CreateNxdsAppearanceOptions = {}) {
  function ConfiguredNxdsAppearanceProvider({
    children,
    ...props
  }: ConfiguredProviderProps) {
    return (
      <NxdsAppearanceProvider
        {...props}
        storageKey={storageKey}
        cookieWriteKey={cookieWriteKey}
        cookieOptions={cookieOptions}
        defaultState={defaultState}
        deriveColors={deriveColors}
      >
        {children}
      </NxdsAppearanceProvider>
    );
  }

  return {
    NxdsAppearanceProvider: ConfiguredNxdsAppearanceProvider,
  };
}
