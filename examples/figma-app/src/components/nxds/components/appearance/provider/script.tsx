import {
  createNxdsAppearanceBootstrapScript,
  createNxdsAppearanceSnapshotFromState,
  DEFAULT_NXDS_APPEARANCE,
  type NxdsAppearanceState,
} from '@nxds/core';

export interface NxdsAppearanceScriptProps {
  storageKey?: string | false;
  defaultState?: NxdsAppearanceState;
  /**
   * `false` leaves every color to your own CSS. Pass what you pass to the
   * provider.
   */
  deriveColors?: boolean;
  nonce?: string;
}

export interface CreateNxdsAppearanceScriptOptions {
  storageKey?: string | false;
  defaultState?: NxdsAppearanceState;
  deriveColors?: boolean;
}

export function NxdsAppearanceScript({
  storageKey,
  defaultState,
  deriveColors = true,
  nonce,
}: NxdsAppearanceScriptProps) {
  return (
    <script
      data-nxds-appearance-script=""
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: createNxdsAppearanceBootstrapScript({
          storageKey,
          defaultSnapshot: createNxdsAppearanceSnapshotFromState(
            defaultState ?? DEFAULT_NXDS_APPEARANCE,
            { deriveColors }
          ),
        }),
      }}
    />
  );
}

export function createNxdsAppearanceScript({
  storageKey,
  defaultState,
  deriveColors,
}: CreateNxdsAppearanceScriptOptions = {}) {
  function ConfiguredNxdsAppearanceScript({
    nonce,
  }: Pick<NxdsAppearanceScriptProps, 'nonce'>) {
    return (
      <NxdsAppearanceScript
        nonce={nonce}
        storageKey={storageKey}
        defaultState={defaultState}
        deriveColors={deriveColors}
      />
    );
  }

  return ConfiguredNxdsAppearanceScript;
}
