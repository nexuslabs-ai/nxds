import type { ToolName } from '../tool-icons';

export type StoryModeId =
  | 'states'
  | 'interactions'
  | 'callbacks'
  | 'accessibility';

type StoryMode = {
  id: StoryModeId;
  /** The label of the option select in the tool's panel. */
  field: string;
  description: string;
  options: readonly { value: string; label: string }[];
};

/** The Stories chapter's tools, in toolbar order. */
export const storyTools = [
  'States',
  'Interactions',
  'Callbacks',
  'Accessibility',
] as const satisfies readonly ToolName[];

export type StoryTool = (typeof storyTools)[number];

/** The story each tool shows, and the choices in its panel. */
export const storyModes: Record<StoryTool, StoryMode> = {
  States: {
    id: 'states',
    field: 'Starting state',
    description: 'A known starting point, ready to inspect.',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on', label: 'On' },
      { value: 'disabled', label: 'Disabled' },
      { value: 'invalid', label: 'Invalid' },
    ],
  },
  Interactions: {
    id: 'interactions',
    field: 'Scenario',
    description: 'The same action. A repeatable expectation.',
    options: [
      { value: 'click', label: 'Click on, then off' },
      { value: 'disabled', label: 'Disabled click' },
      { value: 'keyboard', label: 'Try Space yourself' },
    ],
  },
  Callbacks: {
    id: 'callbacks',
    field: 'Implementation',
    description: 'Check what the app hears, too.',
    options: [
      { value: 'correct', label: 'Correct callback' },
      { value: 'wrong', label: 'Wrong value' },
      { value: 'missing', label: 'No callback' },
    ],
  },
  Accessibility: {
    id: 'accessibility',
    field: 'Accessible name',
    description: 'One automated rule. A clear testing scope.',
    options: [
      { value: 'present', label: 'Name present' },
      { value: 'missing', label: 'Name missing' },
    ],
  },
};

type Story = {
  name: string;
  source: string[];
  /** The source line each check runs, or -1 for a check outside the story. */
  lines: number[];
  labels: string[];
};

/** A line of story source, or one that runs the named check. */
type SourceLine = string | { code: string; check: string };

/**
 * A story whose checks are marked on the lines that run them, then the
 * manual checks, which no line runs.
 */
function story(
  name: string,
  source: readonly SourceLine[],
  manualChecks: readonly string[] = []
): Story {
  const lines: number[] = [];
  const labels: string[] = [];
  source.forEach((line, index) => {
    if (typeof line === 'string') return;
    lines.push(index);
    labels.push(line.check);
  });
  return {
    name,
    source: source.map((line) => (typeof line === 'string' ? line : line.code)),
    lines: [...lines, ...manualChecks.map(() => -1)],
    labels: [...labels, ...manualChecks],
  };
}

const clickSource: SourceLine[] = [
  'play: async ({ canvas, args }) => {',
  '  const el = canvas.getByRole("switch");',
  { code: '  await expect(el).not.toBeChecked();', check: 'Starts off' },
  '  await userEvent.click(el);',
  { code: '  await expect(el).toBeChecked();', check: 'Click turns on' },
  '  await userEvent.click(el);',
  { code: '  await expect(el).not.toBeChecked();', check: 'Click turns off' },
  '};',
];

export function describeStory(mode: StoryModeId, choice: string): Story {
  if (mode === 'states')
    return story(choice.charAt(0).toUpperCase() + choice.slice(1), [
      'args: {',
      {
        code: `  defaultChecked: ${choice === 'on'},`,
        check: 'Visible state',
      },
      {
        code: `  disabled: ${choice === 'disabled'},`,
        check: 'Disabled behavior',
      },
      {
        code: `  "aria-invalid": ${choice === 'invalid'},`,
        check: 'Validation state',
      },
      '},',
      '',
      '// Each state is a living example.',
      '// Run the example to verify it.',
    ]);
  if (mode === 'callbacks')
    return story('CallbackContract', [
      'args: { onCheckedChange: fn() },',
      '',
      'play: async ({ canvas, args }) => {',
      '  const el = canvas.getByRole("switch");',
      '  await userEvent.click(el);',
      { code: '  await expect(el).toBeChecked();', check: 'Switch is on' },
      '  await expect(args.onCheckedChange)',
      { code: '    .toHaveBeenCalledTimes(1);', check: 'One callback' },
      '  await expect(args.onCheckedChange)',
      { code: '    .toHaveBeenCalledWith(true);', check: 'Callback is true' },
      '};',
    ]);
  if (mode === 'accessibility')
    return story(
      'AccessibleName',
      [
        '// Storybook can also run axe checks.',
        'parameters: { a11y: { test: "error" } },',
        '',
        '// This demo checks the name only:',
        'play: async ({ canvas }) => {',
        '  const el = canvas.getByRole("switch");',
        {
          code: '  await expect(el).toHaveAccessibleName(',
          check: 'Accessible name',
        },
        '    "Email notifications"',
        '  );',
        '};',
        '// Manual accessibility review matters too.',
      ],
      ['Keyboard review', 'Screen-reader review']
    );
  if (choice === 'disabled')
    return story('DisabledInteraction', [
      'args: { disabled: true, onCheckedChange: fn() },',
      '',
      'play: async ({ canvas, args }) => {',
      '  const el = canvas.getByRole("switch");',
      { code: '  await expect(el).toBeDisabled();', check: 'Is disabled' },
      '  await userEvent.click(el);',
      { code: '  await expect(el).not.toBeChecked();', check: 'Stays off' },
      '  await expect(args.onCheckedChange)',
      { code: '    .not.toHaveBeenCalled();', check: 'No callback' },
      '};',
    ]);
  if (choice === 'keyboard')
    return story('KeyboardInteraction', [
      'play: async ({ canvas, args }) => {',
      '  const el = canvas.getByRole("switch");',
      '  await userEvent.tab();',
      { code: '  await expect(el).toHaveFocus();', check: 'Receives focus' },
      '  await userEvent.keyboard(" ");',
      {
        code: '  await expect(el).toBeChecked();',
        check: 'Space turns it on',
      },
      '  await expect(args.onCheckedChange)',
      {
        code: '    .toHaveBeenCalledWith(true);',
        check: 'Reports new value',
      },
      '};',
    ]);
  return story('ClickInteraction', clickSource);
}

export type CheckStatus = 'pending' | 'running' | 'pass' | 'fail' | 'manual';

export type Check = { status: CheckStatus; detail: string };

export function initialChecks(mode: StoryModeId): Check[] {
  const notRun: Check = { status: 'pending', detail: 'Not run' };
  if (mode !== 'accessibility') return [notRun, notRun, notRun];
  const manual: Check = {
    status: 'manual',
    detail: 'Separate review required',
  };
  return [notRun, manual, manual];
}

export function result(ok: boolean, detail: string): Check {
  return { status: ok ? 'pass' : 'fail', detail };
}

export function resultSummary(checks: Check[]) {
  const failed = checks.filter((check) => check.status === 'fail').length;
  const passed = checks.filter((check) => check.status === 'pass').length;
  return failed
    ? `${failed} ${failed === 1 ? 'check' : 'checks'} failed`
    : `${passed} ${passed === 1 ? 'check' : 'checks'} passed`;
}
