import {
  compareSignatures,
  date,
  failOnProblems,
  LIGHT,
  openPage,
  type Part,
  part,
  signatureOf,
  x,
} from './harness.ts';

export const TOGGLES = ['a', 'b', 'c'].map((value) =>
  x(
    'ToggleGroupItem',
    `value="${value}" aria-label="${value}"`,
    value.toUpperCase()
  )
);
export const toggleItems = ['a', 'b', 'c'].map((value) =>
  part('ToggleGroupItem', { value, 'aria-label': value }, value.toUpperCase())
);
const FRUITS = [
  ['apple', 'Apple'],
  ['banana', 'Banana'],
] as const;

/** Markup whose attribute strings must convert to the typed props beside it. */
export const ATTRIBUTE_CASES: {
  name: string;
  markup: string;
  expected: Part;
}[] = [
  {
    name: 'a comma list sets a Slider range',
    markup: x('Slider', 'default-value="20,80" aria-label="Price"'),
    expected: part('Slider', { defaultValue: [20, 80], 'aria-label': 'Price' }),
  },
  {
    name: 'a JSON list converts each number',
    markup: x('Slider', `default-value='["20",80]' aria-label="Price"`),
    expected: part('Slider', { defaultValue: [20, 80], 'aria-label': 'Price' }),
  },
  {
    name: 'one number sets a one-thumb Slider',
    markup: x('Slider', 'default-value=" 50 " max="200" aria-label="Volume"'),
    expected: part('Slider', {
      defaultValue: [50],
      max: 200,
      'aria-label': 'Volume',
    }),
  },
  {
    name: 'Slider markers take "steps" or numbers',
    markup: x(
      'Slider',
      'default-value="40" step="20" markers="steps" aria-label="Level"'
    ),
    expected: part('Slider', {
      defaultValue: [40],
      step: 20,
      markers: 'steps',
      'aria-label': 'Level',
    }),
  },
  {
    name: 'a number sets Progress',
    markup: x('Progress', 'value="60" aria-label="Upload"'),
    expected: part('Progress', { value: 60, 'aria-label': 'Upload' }),
  },
  {
    name: 'a negative number sets a Slider minimum',
    markup: x(
      'Slider',
      'min="-10" max="10" default-value="-5" aria-label="Offset"'
    ),
    expected: part('Slider', {
      min: -10,
      max: 10,
      defaultValue: [-5],
      'aria-label': 'Offset',
    }),
  },
  {
    name: 'a bare attribute is true',
    markup: x('Switch', 'disabled default-checked aria-label="Wi-Fi"'),
    expected: part('Switch', {
      disabled: true,
      defaultChecked: true,
      'aria-label': 'Wi-Fi',
    }),
  },
  {
    name: '"false" is false',
    markup: x('Switch', 'disabled="false" aria-label="Wi-Fi"'),
    expected: part('Switch', { disabled: false, 'aria-label': 'Wi-Fi' }),
  },
  {
    name: 'a literal beside a boolean stays a string',
    markup: x('Checkbox', 'checked="indeterminate" aria-label="Select all"'),
    expected: part('Checkbox', {
      checked: 'indeterminate',
      'aria-label': 'Select all',
    }),
  },
  {
    name: 'a numeric literal converts to its number',
    markup: x('ToggleGroup', 'type="single" spacing="2"', ...TOGGLES),
    expected: part(
      'ToggleGroup',
      { type: 'single', spacing: 2 },
      ...toggleItems
    ),
  },
  {
    name: 'type="multiple" reads a comma list',
    markup: x('ToggleGroup', 'type="multiple" default-value="b,c"', ...TOGGLES),
    expected: part(
      'ToggleGroup',
      { type: 'multiple', defaultValue: ['b', 'c'] },
      ...toggleItems
    ),
  },
  {
    name: 'type="single" keeps a comma in its one value',
    markup: x('ToggleGroup', 'type="single" default-value="a,b"', ...TOGGLES),
    expected: part(
      'ToggleGroup',
      { type: 'single', defaultValue: 'a,b' },
      ...toggleItems
    ),
  },
  {
    name: 'JSON escapes a comma in a list',
    markup: x(
      'ToggleGroup',
      `type="multiple" default-value='["a","c"]'`,
      ...TOGGLES
    ),
    expected: part(
      'ToggleGroup',
      { type: 'multiple', defaultValue: ['a', 'c'] },
      ...toggleItems
    ),
  },
  {
    name: 'a multiple Accordion opens each listed item',
    markup: x(
      'Accordion',
      'type="multiple" default-value="shipping,returns"',
      ...['shipping', 'returns'].map((value) =>
        x(
          'AccordionItem',
          `value="${value}"`,
          x('AccordionTrigger', '', value),
          x('AccordionContent', '', `${value} policy`)
        )
      )
    ),
    expected: part(
      'Accordion',
      { type: 'multiple', defaultValue: ['shipping', 'returns'] },
      ...['shipping', 'returns'].map((value) =>
        part(
          'AccordionItem',
          { value },
          part('AccordionTrigger', null, value),
          part('AccordionContent', null, `${value} policy`)
        )
      )
    ),
  },
  {
    name: 'MultiSelect shows chips for its default values through the wrappers',
    markup: x(
      'MultiSelect',
      'default-values="apple,banana"',
      x(
        'MultiSelectTrigger',
        'aria-label="Fruit"',
        x('MultiSelectValue', 'placeholder="Pick fruit"')
      ),
      x(
        'MultiSelectContent',
        '',
        ...FRUITS.map(([value, label]) =>
          x('MultiSelectItem', `value="${value}"`, label)
        )
      )
    ),
    expected: part(
      'MultiSelect',
      { defaultValues: ['apple', 'banana'] },
      part(
        'MultiSelectTrigger',
        { 'aria-label': 'Fruit' },
        part('MultiSelectValue', { placeholder: 'Pick fruit' })
      ),
      part(
        'MultiSelectContent',
        null,
        ...FRUITS.map(([value, label]) =>
          part('MultiSelectItem', { value }, label)
        )
      )
    ),
  },
  {
    name: 'an ISO date selects a day',
    markup: x(
      'DatePicker',
      'mode="single" selected="2026-10-15" default-month="2026-10"'
    ),
    expected: part('DatePicker', {
      mode: 'single',
      selected: date(2026, 10, 15),
      defaultMonth: date(2026, 10, 1),
    }),
  },
  {
    name: 'mode="multiple" reads a comma list of dates',
    markup: x(
      'DatePicker',
      'mode="multiple" selected="2026-10-05,2026-10-09" default-month="2026-10"'
    ),
    expected: part('DatePicker', {
      mode: 'multiple',
      selected: [date(2026, 10, 5), date(2026, 10, 9)],
      defaultMonth: date(2026, 10, 1),
    }),
  },
  {
    name: 'mode="multiple" reads a JSON list of dates',
    markup: x(
      'DatePicker',
      `mode="multiple" selected='["2026-10-05","2026-10-09"]' default-month="2026-10"`
    ),
    expected: part('DatePicker', {
      mode: 'multiple',
      selected: [date(2026, 10, 5), date(2026, 10, 9)],
      defaultMonth: date(2026, 10, 1),
    }),
  },
  {
    name: 'mode="range" reads the first and last date',
    markup: x(
      'DatePicker',
      'mode="range" selected="2026-10-01,2026-10-07" default-month="2026-10"'
    ),
    expected: part('DatePicker', {
      mode: 'range',
      selected: { from: date(2026, 10, 1), to: date(2026, 10, 7) },
      defaultMonth: date(2026, 10, 1),
    }),
  },
  {
    name: 'JSON disables weekends',
    markup: x(
      'DatePicker',
      `mode="single" default-month="2026-10" disabled='[{"dayOfWeek":[0,6]}]'`
    ),
    expected: part('DatePicker', {
      mode: 'single',
      defaultMonth: date(2026, 10, 1),
      disabled: [{ dayOfWeek: [0, 6] }],
    }),
  },
  {
    name: 'JSON dates disable the days before one',
    markup: x(
      'DatePicker',
      `mode="single" default-month="2026-10" disabled='{"before":"2026-10-10"}'`
    ),
    expected: part('DatePicker', {
      mode: 'single',
      defaultMonth: date(2026, 10, 1),
      disabled: { before: date(2026, 10, 10) },
    }),
  },
  {
    name: 'JSON lists FieldError messages',
    markup: x('FieldError', `errors='[{"message":"Enter an email address."}]'`),
    expected: part('FieldError', {
      errors: [{ message: 'Enter an email address.' }],
    }),
  },
  {
    name: 'a number field takes a number',
    markup: x('Input', 'type="number" min="1" max="5" aria-label="Seats"'),
    expected: part('Input', {
      type: 'number',
      min: 1,
      max: 5,
      'aria-label': 'Seats',
    }),
  },
  {
    name: 'a date field keeps its date min',
    markup: x('Input', 'type="date" min="2026-01-01" aria-label="Start"'),
    expected: part('Input', {
      type: 'date',
      min: '2026-01-01',
      'aria-label': 'Start',
    }),
  },
  {
    name: 'an icon prop takes an icon name',
    markup: x('Button', 'start-icon="plus"', 'Create project'),
    expected: part(
      'Button',
      { startIcon: { __icon: 'plus' } },
      'Create project'
    ),
  },
  {
    name: 'an end icon takes an icon name',
    markup: x('Button', 'variant="outline" end-icon="chevron-down"', 'Sort'),
    expected: part(
      'Button',
      { variant: 'outline', endIcon: { __icon: 'chevron-down' } },
      'Sort'
    ),
  },
  {
    name: 'Badge icons take icon names',
    markup: x('Badge', 'left-icon="circle-check" right-icon="x"', 'Paid'),
    expected: part(
      'Badge',
      { leftIcon: { __icon: 'circle-check' }, rightIcon: { __icon: 'x' } },
      'Paid'
    ),
  },
  {
    name: 'an InputGroupButton icon takes an icon name',
    markup: x(
      'InputGroup',
      '',
      x('InputGroupInput', 'aria-label="Search"'),
      x(
        'InputGroupAddon',
        'align="inline-end"',
        x('InputGroupButton', 'start-icon="search" aria-label="Search"')
      )
    ),
    expected: part(
      'InputGroup',
      null,
      part('InputGroupInput', { 'aria-label': 'Search' }),
      part(
        'InputGroupAddon',
        { align: 'inline-end' },
        part('InputGroupButton', {
          startIcon: { __icon: 'search' },
          'aria-label': 'Search',
        })
      )
    ),
  },
  {
    name: 'an icon element in an icon slot passes through',
    markup: x('Button', '', x('Icon', 'name="device-floppy"'), 'Save'),
    expected: part(
      'Button',
      null,
      part('Icon', { name: 'device-floppy' }),
      'Save'
    ),
  },
  {
    name: 'Icon takes its size and stroke as numbers',
    markup: x('Icon', 'name="bell" size="20" stroke="1.5"'),
    expected: part('Icon', { name: 'bell', size: 20, stroke: 1.5 }),
  },
  {
    name: 'an empty Icon label leaves the icon hidden',
    markup: x('Icon', 'name="bell" aria-label=""'),
    expected: part('Icon', { name: 'bell' }),
  },
  {
    name: 'a labelled Icon is an image',
    markup: x('Icon', 'name="bell" aria-label="Notifications"'),
    expected: part('Icon', { name: 'bell', 'aria-label': 'Notifications' }),
  },
  {
    name: 'a link target is a dropdown value',
    markup: x(
      'Breadcrumb',
      '',
      x(
        'BreadcrumbList',
        '',
        x(
          'BreadcrumbItem',
          '',
          x('BreadcrumbLink', 'href="#home" target="_blank"', 'Home')
        )
      )
    ),
    expected: part(
      'Breadcrumb',
      null,
      part(
        'BreadcrumbList',
        null,
        part(
          'BreadcrumbItem',
          null,
          part('BreadcrumbLink', { href: '#home', target: '_blank' }, 'Home')
        )
      )
    ),
  },
];

export async function checkAttributes() {
  const { page, problems } = await openPage('Button', LIGHT);
  for (const { name, markup, expected } of ATTRIBUTE_CASES) {
    const want = await signatureOf(page, { tree: expected });
    failOnProblems(name, problems, false);
    const got = await signatureOf(page, { markup });
    failOnProblems(name, problems, true);
    compareSignatures(name, want, got);
  }
  await page.close();
}
