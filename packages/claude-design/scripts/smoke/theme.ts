// The theme the export bakes in reaches what a canvas renders: the primary
// fill in each mode, each text family, the fonts tokens.css loads from Google
// Fonts, and the code size. tokens.json's label size is the text size at the
// UI scale.
import { textSizePx } from '@nxds/core';

import {
  DARK,
  exportAppearance,
  exportTokens,
  fail,
  LIGHT,
  openPage,
} from './harness.ts';
import { BUTTON, measure } from './probes.ts';

function listToken(family: 'color' | 'typeScale', name: string) {
  const token = exportTokens()[family]?.tokens.find(
    (candidate) => candidate.name === name
  );
  if (!token) throw new Error(`tokens.json has no ${name}.`);
  return token.value;
}

/** Each text family's class and the first face its stack names. */
function familyHeads() {
  const { families } = exportTokens().type;
  const classes: Record<string, string> = {
    sans: 'typography-body-default',
    heading: 'typography-heading-large',
    mono: 'typography-code-block',
  };
  return Object.entries(classes).map(([key, className]) => ({
    className,
    head: (families[key] ?? '').split(',')[0]?.trim() ?? '',
  }));
}

export async function checkTheme() {
  const { textSize, uiScale } = exportAppearance();
  const label = listToken('typeScale', 'nx-typography-size-sm');
  const labelPx = `${textSizePx(textSize, uiScale)}px`;
  if (label !== labelPx) {
    fail(
      `the theme: tokens.json's label size is ${String(label)}, not ${labelPx}, the ${textSize}px text size at the ${uiScale} UI scale.`
    );
  }
  const primary = listToken('color', 'nx-color-primary-background');
  const codeSize = listToken('typeScale', 'nx-typography-code-size');
  const fonts = exportTokens().meta.fonts ?? [];
  for (const theme of [LIGHT, DARK]) {
    const mode = theme.attribute ?? 'light';
    const name = `the theme in ${mode}`;
    const { page } = await openPage('Button', theme);
    const fill = await measure(page, {
      ...BUTTON,
      property: 'background-color',
    });
    const result = await page.evaluate(
      async ({ expected, heads, fonts }) => {
        const probe = document.createElement('div');
        probe.style.backgroundColor = expected;
        document.body.append(probe);
        const sample = (className: string) => {
          const element = document.createElement('p');
          element.className = className;
          element.textContent = 'Quarterly revenue';
          document.body.append(element);
          return getComputedStyle(element);
        };
        const families = heads.map(({ className, head }) => ({
          className,
          head,
          family: sample(className).fontFamily,
        }));
        const loaded = await Promise.all(
          fonts.map(async (font) => ({
            font,
            faces: (await document.fonts.load(`16px "${font}"`)).length,
          }))
        );
        return {
          expected: getComputedStyle(probe).backgroundColor,
          families,
          loaded,
          codeBlock: sample('typography-code-block').fontSize,
        };
      },
      {
        expected: typeof primary === 'string' ? primary : (primary[mode] ?? ''),
        heads: familyHeads(),
        fonts,
      }
    );
    if (fill !== result.expected) {
      fail(
        `${name}: Button fills with ${fill}, not tokens.json's ${result.expected}.`
      );
    }
    // A computed font-family quotes only the names that need it.
    const unquoted = (text: string) => text.replace(/["']/g, '');
    for (const { className, head, family } of result.families) {
      if (!unquoted(family).startsWith(unquoted(head))) {
        fail(`${name}: .${className} is set in ${family}, not ${head}.`);
      }
    }
    for (const { font, faces } of result.loaded) {
      if (faces === 0) fail(`${name}: tokens.css loads no ${font} face.`);
    }
    if (result.codeBlock !== codeSize) {
      fail(
        `${name}: .typography-code-block is ${result.codeBlock}, not the code size ${String(codeSize)}.`
      );
    }
    await page.close();
  }
}
