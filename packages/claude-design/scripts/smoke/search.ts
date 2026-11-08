import {
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  type PageGlobals,
  x,
} from './harness.ts';

interface SearchCase {
  /** The list part whose items cmdk sorts. */
  list: string;
  markup: string;
  /** The button that opens the list, when it sits in a popover. */
  trigger?: string;
}

// Each list holds Banana and Cherry. Searching "Banana" leaves Banana.
export const SEARCH_CASES: readonly SearchCase[] = [
  {
    list: 'CommandList',
    markup: x(
      'Command',
      '',
      x('CommandInput', 'placeholder="Search…"'),
      x(
        'CommandList',
        '',
        x('CommandItem', 'value="banana"', 'Banana'),
        x('CommandItem', 'value="cherry"', 'Cherry')
      )
    ),
  },
  {
    list: 'ComboboxList',
    trigger: 'Fruit',
    markup: x(
      'Combobox',
      '',
      x('ComboboxTrigger', '', 'Fruit'),
      x(
        'ComboboxContent',
        'label="Fruit"',
        x('ComboboxInput', 'placeholder="Search…"'),
        x(
          'ComboboxList',
          '',
          x('ComboboxItem', 'value="banana"', 'Banana'),
          x('ComboboxItem', 'value="cherry"', 'Cherry')
        )
      )
    ),
  },
  {
    list: 'MultiSelectContent',
    trigger: 'Fruit',
    // The option's text, not its value, is what a viewer searches for, and
    // indented text reads as JSX reads it.
    markup: x(
      'MultiSelect',
      '',
      x('MultiSelectTrigger', 'aria-label="Fruit"', x('MultiSelectValue')),
      x(
        'MultiSelectContent',
        '',
        x('MultiSelectItem', 'value="b"', '\n          Banana\n        '),
        x('MultiSelectItem', 'value="c"', 'Cherry')
      )
    ),
  },
];

// Renders the case, types "Banana" and reads the options left.
async function searchResults(
  { list, markup, trigger }: SearchCase,
  wrapped: boolean
) {
  const { page, problems } = await openPage('Button', LIGHT);
  try {
    await page.evaluate(
      ({ markup, wrapped }) => {
        const { ReactDOM, __nxdsMarkup } = window as unknown as PageGlobals;
        const host = document.createElement('div');
        host.id = 'search-host';
        document.body.append(host);
        ReactDOM.createRoot(host).render(__nxdsMarkup(markup, wrapped));
      },
      { markup, wrapped }
    );
    if (trigger) await page.getByRole('button', { name: trigger }).click();
    await page.getByPlaceholder('Search…').fill('Banana');
    const options = await page.getByRole('option').allTextContents();
    return options.join(', ') || 'nothing';
  } catch (error) {
    return `an error (${error instanceof Error ? error.message.split('\n')[0] : error})`;
  } finally {
    await page.close();
    failOnProblems(`${list} search`, problems, wrapped);
  }
}

// Searching filters and sorts a list's items, plain and through the wrappers
// a canvas mounts each x-import in.
export async function checkSearch() {
  for (const searchCase of SEARCH_CASES) {
    const { list } = searchCase;
    const plain = await searchResults(searchCase, false);
    const wrapped = await searchResults(searchCase, true);
    if (plain !== 'Banana') {
      fail(`${list} search: "Banana" finds ${plain} as plain React.`);
    }
    if (wrapped !== plain) {
      fail(
        `${list} search: through canvas wrappers, "Banana" finds ${wrapped} instead of ${plain}.`
      );
    }
  }
}
