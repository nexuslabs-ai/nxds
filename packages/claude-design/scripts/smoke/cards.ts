import { cards, DARK, fail, LIGHT, openPage, rendered } from './harness.ts';

async function checkCard(card: string) {
  for (const theme of [LIGHT, DARK]) {
    const { page, problems } = await openPage(card, theme);
    if (card !== 'Cover' && !(await rendered(page))) {
      fail(`${card} (${theme.attribute}): the preview rendered nothing.`);
    }
    for (const problem of problems)
      fail(`${card} (${theme.attribute}): ${problem}`);
    await page.close();
  }
}

// Every card renders in both themes and logs nothing.
export async function checkCards() {
  for (const card of cards()) await checkCard(card);
  return cards().length;
}
