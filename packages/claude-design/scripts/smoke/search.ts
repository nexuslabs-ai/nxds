import {
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  type PageGlobals,
  x,
} from './harness.ts';

// The option's text, not its value, is what a viewer searches for.
const MARKUP = x(
  'MultiSelect',
  '',
  x('MultiSelectTrigger', 'aria-label="Fruit"', x('MultiSelectValue')),
  x(
    'MultiSelectContent',
    '',
    x('MultiSelectItem', 'value="b"', 'Banana'),
    x('MultiSelectItem', 'value="c"', 'Cherry')
  )
);

// Opens the MultiSelect, types "Banana" and reads the options left.
async function searchResults(wrapped: boolean) {
  const { page, problems } = await openPage('Button', LIGHT);
  await page.evaluate(
    ({ markup, wrapped }) => {
      const { ReactDOM, __nxdsMarkup } = window as unknown as PageGlobals;
      const host = document.createElement('div');
      host.id = 'search-host';
      document.body.append(host);
      ReactDOM.createRoot(host).render(__nxdsMarkup(markup, wrapped));
    },
    { markup: MARKUP, wrapped }
  );
  await page.getByRole('button', { name: 'Fruit' }).click();
  await page.getByPlaceholder('Search…').fill('Banana');
  const options = await page.getByRole('option').allTextContents();
  await page.close();
  failOnProblems('MultiSelect search', problems, wrapped);
  return options.join(', ') || 'nothing';
}

// A MultiSelectItem's text children are its search keywords.
export async function checkSearch() {
  const plain = await searchResults(false);
  const wrapped = await searchResults(true);
  if (plain !== 'Banana') {
    fail(`MultiSelect search: "Banana" finds ${plain} as plain React.`);
  }
  if (wrapped !== plain) {
    fail(
      `MultiSelect search: through canvas wrappers, "Banana" finds ${wrapped} instead of ${plain}.`
    );
  }
}
