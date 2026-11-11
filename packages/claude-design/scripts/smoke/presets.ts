import { PRESETS } from '../../src/presets.ts';

import { DARK, exportAppearance, fail, LIGHT, openPage } from './harness.ts';
import { CARD, measure, tokenLists } from './probes.ts';

export const PRESET_CASES = Object.keys(PRESETS);

// Each attribute's values, the export's own first: its theme bakes that one
// in as the default. A preset changes only some of its family's tokens, so
// the check reads them all.
function presetCases() {
  const appearance = exportAppearance();
  return Object.entries(PRESETS).map(
    ([attribute, { options, field, family }]) => {
      const initial = appearance[field];
      return {
        attribute,
        family,
        values: [
          initial,
          ...options
            .map(({ value }) => value)
            .filter((value) => value !== initial),
        ],
      };
    }
  );
}

export async function checkPresets() {
  for (const theme of [LIGHT, DARK]) {
    const { page } = await openPage('Button', theme);
    for (const { attribute, family, values } of presetCases()) {
      const probe = { ...CARD, property: tokenLists().get(family) ?? [] };
      const [initial = '', ...others] = values;
      const fallback = await measure(page, probe);
      const base = await measure(page, probe, {
        attributes: { [attribute]: initial },
      });
      if (base !== fallback) {
        fail(
          `${attribute}="${initial}" (${theme.attribute}): differs from the export's default, ${base} against ${fallback}.`
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
