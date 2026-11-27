import { afterEach, describe, expect, it } from 'vitest';

import {
  applyNxdsAppearance,
  persistNxdsAppearance,
  removeNxdsAppearance,
} from './appearance-dom';
import {
  appearancePrefsToCss,
  DEFAULT_NXDS_APPEARANCE,
  type NxdsAppearanceState,
} from './appearance-model';

const STORAGE_KEY = 'nxds-appearance';

const materialBlueDark: NxdsAppearanceState = {
  ...DEFAULT_NXDS_APPEARANCE,
  mode: 'dark',
  brandColor: '#1976d2',
  density: 'compact',
};

const themeStyle = () =>
  document.querySelector('style[data-nxds-appearance-theme]')?.textContent;

afterEach(() => {
  removeNxdsAppearance();
  window.localStorage.clear();
});

describe('applyNxdsAppearance', () => {
  it('derives the colours by default', () => {
    applyNxdsAppearance(materialBlueDark, false);

    expect(themeStyle()).toContain('--nx-color-primary-background');
  });

  it('switches the mode, presets and fonts, and writes no colours, when the app owns its colours', () => {
    applyNxdsAppearance(materialBlueDark, false, { deriveColors: false });

    const root = document.documentElement;
    expect(root.classList.contains('dark')).toBe(true);
    expect(root.getAttribute('data-density')).toBe('compact');
    expect(themeStyle()).toBe('');
    expect(
      document.querySelector('style[data-nxds-appearance-prefs]')?.textContent
    ).toBe(appearancePrefsToCss(materialBlueDark.prefs));
  });

  it('clears derived colours when the app takes its colours back', () => {
    applyNxdsAppearance(materialBlueDark, false);
    applyNxdsAppearance(materialBlueDark, false, { deriveColors: false });

    expect(themeStyle()).toBe('');
  });
});

describe('persistNxdsAppearance', () => {
  it('saves the choices without colours when the app owns its colours', () => {
    persistNxdsAppearance(materialBlueDark, {
      storageKey: STORAGE_KEY,
      deriveColors: false,
    });

    expect(
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    ).toMatchObject({ state: materialBlueDark, themeCss: '' });
  });
});
