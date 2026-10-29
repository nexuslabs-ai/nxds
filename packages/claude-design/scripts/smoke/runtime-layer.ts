import {
  createNxdsThemeContract,
  DEFAULT_NXDS_APPEARANCE,
  deriveTheme,
  themeToCss,
} from '@nxds/core';

import { fail, LIGHT, openPage } from './harness.ts';
import { BUTTON, measure } from './probes.ts';

// The provider writes its runtime theme into the nx-runtime layer, which
// must still win over tokens.css.
export async function checkRuntimeLayer() {
  const { page } = await openPage('Button', LIGHT);
  const probe = { ...BUTTON, property: 'background-color' };
  const css = themeToCss(
    deriveTheme(
      createNxdsThemeContract({
        ...DEFAULT_NXDS_APPEARANCE,
        brandColor: '#d03801',
      })
    )
  );
  if ((await measure(page, probe, { css })) === (await measure(page, probe))) {
    fail("The provider's nx-runtime theme doesn't override tokens.css.");
  }
  await page.close();
}
