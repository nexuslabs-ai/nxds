import {
  DARK,
  DARK_CLASS,
  fail,
  LIGHT,
  openPage,
  type Theme,
} from './harness.ts';

async function background(theme: Theme) {
  const { page } = await openPage('Button', theme);
  const color = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor
  );
  await page.close();
  return color;
}

export async function checkThemes() {
  const light = await background(LIGHT);
  for (const [label, theme] of [
    ['data-theme="dark"', DARK],
    ['the .dark class', DARK_CLASS],
  ] as const) {
    if ((await background(theme)) === light)
      fail(`${label} leaves the page background unchanged.`);
  }
}
