import { toggleItems, TOGGLES } from './attributes.ts';
import {
  compareSignatures,
  date,
  el,
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  type Part,
  part,
  signatureOf,
  WRAPPER_NESTING,
  x,
} from './harness.ts';

/**
 * Markup with an attribute that doesn't fit its prop: it logs exactly
 * `warnings`, renders `expected` (the prop left at its default, or a
 * placeholder for a required one), and never throws.
 */
export const BAD_INPUT_CASES: {
  name: string;
  markup: string;
  expected: Part | null;
  warnings: RegExp[];
}[] = [
  {
    name: 'a boolean is lowercase',
    markup: x('Switch', 'disabled="TRUE" aria-label="Wi-Fi"'),
    expected: part('Switch', { 'aria-label': 'Wi-Fi' }),
    warnings: [
      /^\[nxds\] Switch: disabled="TRUE" isn't true or false\. Using the default\.$/,
    ],
  },
  {
    name: 'a number is decimal',
    markup: x('Progress', 'value="0x10" aria-label="Upload"'),
    expected: part('Progress', { 'aria-label': 'Upload' }),
    warnings: [/^\[nxds\] Progress: value="0x10" isn't a number/],
  },
  {
    name: 'an exponent is not a number',
    markup: x('Progress', 'value="1e3" aria-label="Upload"'),
    expected: part('Progress', { 'aria-label': 'Upload' }),
    warnings: [/^\[nxds\] Progress: value="1e3" isn't a number/],
  },
  {
    name: 'a bare number attribute is empty',
    markup: x('Progress', 'value aria-label="Upload"'),
    expected: part('Progress', { 'aria-label': 'Upload' }),
    warnings: [/^\[nxds\] Progress: value="" isn't a number/],
  },
  {
    name: 'a comma list has no empty item',
    markup: x('Slider', 'default-value="20,,80" aria-label="Price"'),
    expected: part('Slider', { 'aria-label': 'Price' }),
    warnings: [/^\[nxds\] Slider: default-value="20,,80" has an empty item/],
  },
  {
    name: 'a literal union takes only its members',
    markup: x('Button', 'variant="huge"', 'Save'),
    expected: part('Button', null, 'Save'),
    warnings: [/^\[nxds\] Button: variant="huge" isn't "link", "default", /],
  },
  {
    name: 'a date that does not exist does not roll over',
    markup: x(
      'DatePicker',
      'mode="single" selected="2026-02-30" default-month="2026-02"'
    ),
    expected: part('DatePicker', {
      mode: 'single',
      defaultMonth: date(2026, 2, 1),
    }),
    warnings: [/^\[nxds\] DatePicker: selected="2026-02-30" isn't a date/],
  },
  {
    name: 'a month that does not exist does not roll over',
    markup: x('DatePicker', 'mode="single" default-month="2026-13"'),
    expected: part('DatePicker', { mode: 'single' }),
    warnings: [/^\[nxds\] DatePicker: default-month="2026-13" isn't a date/],
  },
  {
    name: 'a range needs two dates',
    markup: x(
      'DatePicker',
      'mode="range" selected="2026-10-01" default-month="2026-10"'
    ),
    expected: part('DatePicker', {
      mode: 'range',
      defaultMonth: date(2026, 10, 1),
    }),
    warnings: [/^\[nxds\] DatePicker: selected="2026-10-01" isn't two dates/],
  },
  {
    name: 'JSON must parse',
    markup: x('FieldError', "errors='[{message: oops}]'"),
    expected: part('FieldError', null),
    warnings: [/^\[nxds\] FieldError: errors=".*" isn't valid JSON/],
  },
  {
    name: 'JSON must have the shape its prop takes',
    markup: x('FieldError', `errors='{"message":"Enter an email address."}'`),
    expected: part('FieldError', null),
    warnings: [/^\[nxds\] FieldError: errors=".*" isn't a JSON array/],
  },
  {
    name: 'a required literal union falls back to its first member',
    markup: x('ToggleGroup', 'type="multi"', ...TOGGLES),
    expected: part('ToggleGroup', { type: 'single' }, ...toggleItems),
    warnings: [
      /^\[nxds\] ToggleGroup: type="multi" isn't "single", "multiple"\. Using "single"\.$/,
    ],
  },
  {
    name: 'a renamed data-key is converted',
    markup: x('Recharts.Area', 'data-key=""'),
    expected: null,
    warnings: [
      /^\[nxds\] RechartsArea: data-key="" is empty\. Using "dataKey-\w+"\.$/,
    ],
  },
  {
    name: 'a required value is never empty',
    markup: x(
      'Select',
      'default-open',
      x(
        'SelectTrigger',
        'aria-label="Fruit"',
        x('SelectValue', 'placeholder="Pick fruit"')
      ),
      x('SelectContent', '', x('SelectItem', 'value', 'Apple'))
    ),
    expected: null,
    warnings: [
      /^\[nxds\] SelectItem: value="" is empty\. Using "value-\w+"\.$/,
    ],
  },
  {
    name: 'an unknown icon name renders nothing',
    markup: x('Icon', 'name="sparkle-heart"'),
    expected: part('', null),
    warnings: [
      /^\[nxds\] Icon: name="sparkle-heart" isn't an icon name in components\/Icon\/README\.md\. Using nothing\.$/,
    ],
  },
  {
    name: 'a component name points at the icon name',
    markup: x('Button', 'start-icon="PlusIcon"', 'Create project'),
    expected: part('Button', null, 'Create project'),
    warnings: [
      /^\[nxds\] Button: start-icon="PlusIcon" isn't an icon name; write "plus"\. Using the default\.$/,
    ],
  },
  {
    name: 'an icon size is a number',
    markup: x('Icon', 'name="bell" size=""'),
    expected: part('Icon', { name: 'bell' }),
    warnings: [/^\[nxds\] Icon: size="" isn't a number/],
  },
  {
    name: 'one bad value warns once however often it renders',
    markup: el(
      'div',
      '',
      x('Switch', 'disabled="yes" aria-label="Wi-Fi"'),
      x('Switch', 'disabled="yes" aria-label="Bluetooth"'),
      x('Switch', 'disabled="yes" aria-label="Airplane mode"')
    ),
    expected: part(
      'div',
      null,
      part('Switch', { 'aria-label': 'Wi-Fi' }),
      part('Switch', { 'aria-label': 'Bluetooth' }),
      part('Switch', { 'aria-label': 'Airplane mode' })
    ),
    warnings: [/^\[nxds\] Switch: disabled="yes"/],
  },
  {
    name: 'the same bad value warns once per part',
    markup: el(
      'div',
      '',
      x('Switch', 'disabled="yes" aria-label="Wi-Fi"'),
      x('Checkbox', 'disabled="yes" aria-label="Remember me"')
    ),
    expected: part(
      'div',
      null,
      part('Switch', { 'aria-label': 'Wi-Fi' }),
      part('Checkbox', { 'aria-label': 'Remember me' })
    ),
    warnings: [
      /^\[nxds\] Switch: disabled="yes"/,
      /^\[nxds\] Checkbox: disabled="yes"/,
    ],
  },
];

const NXDS_WARNING = /^console warning: (\[nxds\] .*)$/;

// Each case on a fresh page, so no earlier case has already logged its warning.
export async function checkBadInput() {
  for (const { name, markup, expected, warnings } of BAD_INPUT_CASES) {
    const { page, problems } = await openPage('Button', LIGHT);
    const got = await signatureOf(page, { markup });
    const logged = problems.splice(0).flatMap((problem) => {
      const match = NXDS_WARNING.exec(problem);
      if (match?.[1]) return [match[1]];
      if (!WRAPPER_NESTING.test(problem)) fail(`${name}: ${problem}`);
      return [];
    });
    if (
      logged.length !== warnings.length ||
      !warnings.every((warning, index) => warning.test(logged[index] ?? ''))
    ) {
      fail(
        `${name}: logged ${logged.length > 0 ? logged.join(' | ') : 'no warning'}, not ${warnings.length} matching ${warnings.join(', ')}.`
      );
    }
    if (expected) {
      const want = await signatureOf(page, { tree: expected });
      failOnProblems(name, problems, false);
      compareSignatures(name, want, got);
    } else if ('error' in got) {
      fail(`${name}: the canvas markup throws ${got.error}`);
    }
    await page.close();
  }
}
