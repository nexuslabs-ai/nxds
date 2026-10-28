import { fail, LIGHT, openPage } from './harness.ts';
import {
  BUTTON,
  CARD,
  CARD_CONTENT,
  INPUT,
  measure,
  type Probe,
  TABLE_HEAD,
  TEXT_STYLE,
  tokenFamilies,
} from './probes.ts';

/** One token per tokens.json family, set on a wrapper the way a canvas override is, and what it moves. */
export const TOKEN_CASES: (Probe & {
  family: string;
  name: string;
  value: string;
})[] = [
  {
    family: 'color',
    name: '--nx-color-primary-background',
    value: 'rgb(1, 2, 3)',
    ...BUTTON,
    property: 'background-color',
  },
  {
    family: 'spacing',
    name: '--nx-spacing-6',
    value: '37px',
    ...CARD_CONTENT,
    property: 'padding-left',
  },
  {
    family: 'radius',
    name: '--nx-radius-md',
    value: '11px',
    ...INPUT,
    property: 'border-top-left-radius',
  },
  {
    family: 'shadow',
    name: '--nx-shadow-sm',
    value: 'rgb(1, 2, 3) 0px 0px 0px 5px',
    ...CARD,
    property: 'box-shadow',
  },
  {
    family: 'borderWidth',
    name: '--nx-borderwidth-default',
    value: '5px',
    ...CARD,
    property: 'border-top-width',
  },
  {
    family: 'zIndex',
    name: '--nx-z-index-sticky',
    value: '7',
    ...TABLE_HEAD,
    property: 'z-index',
  },
  {
    family: 'motion',
    name: '--nx-motion-ease-enter',
    value: 'linear',
    ...BUTTON,
    property: 'transition-timing-function',
  },
  {
    family: 'typeScale',
    name: '--nx-typography-size-sm',
    value: '23px',
    ...BUTTON,
    property: 'font-size',
  },
  {
    family: 'type.families',
    name: '--nx-typography-family-font-sans',
    value: 'Georgia',
    ...BUTTON,
    property: 'font-family',
  },
  {
    family: 'type.groups',
    name: '--nx-typography-size-sm',
    value: '23px',
    ...TEXT_STYLE,
    property: 'font-size',
  },
];

export async function checkTokens() {
  const covered = new Set(TOKEN_CASES.map(({ family }) => family));
  for (const family of tokenFamilies()) {
    if (!covered.has(family))
      fail(`tokens.json ${family}: no smoke case changes one of its tokens.`);
  }
  const { page } = await openPage('Button', LIGHT);
  for (const { family, name, value, ...probe } of TOKEN_CASES) {
    const before = await measure(page, probe);
    const after = await measure(page, probe, { style: `${name}: ${value}` });
    if (before === null) fail(`${family}: ${probe.target} didn't render.`);
    else if (after === before) {
      fail(
        `${family}: setting ${name} on a wrapper left ${probe.target}'s ${probe.property} at ${before}.`
      );
    }
  }
  await page.close();
}
