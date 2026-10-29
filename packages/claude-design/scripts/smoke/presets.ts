import { PRESETS } from '../../src/presets.ts';

import { DARK, fail, LIGHT, openPage } from './harness.ts';
import { CARD, measure, tokenLists } from './probes.ts';

// Each attribute's values, the default first. A preset changes only some of
// its family's tokens, so the check reads them all.
export const PRESET_CASES = Object.entries(PRESETS).map(
  ([attribute, { options, initial, family }]) => ({
    attribute,
    family,
    values: [
      initial,
      ...options.map(({ value }) => value).filter((value) => value !== initial),
    ],
  })
);

export async function checkPresets() {
  for (const theme of [LIGHT, DARK]) {
    const { page } = await openPage('Button', theme);
    for (const { attribute, family, values } of PRESET_CASES) {
      const probe = { ...CARD, property: tokenLists().get(family) ?? [] };
      const [initial = '', ...others] = values;
      const fallback = await measure(page, probe);
      const base = await measure(page, probe, {
        attributes: { [attribute]: initial },
      });
      if (base !== fallback) {
        fail(
          `${attribute}="${initial}" (${theme.attribute}): differs from the default, ${base} against ${fallback}.`
        );
      }
      for (const value of others) {
        const moved = await measure(page, probe, {
          attributes: { [attribute]: value },
        });
        if (moved === base) {
          fail(
            `${attribute}="${value}" (${theme.attribute}): no ${family} token changes inside it.`
          );
        }
      }
    }
    await page.close();
  }
}
