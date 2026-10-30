import type { ToolName } from '../tool-icons';

/** The Stories chapter's tools, in toolbar order. */
export const storyTools = [
  'States',
  'Interactions',
  'Callbacks',
  'Accessibility',
] as const satisfies readonly ToolName[];

export type StoryTool = (typeof storyTools)[number];

/** The story each tool shows, and the choices in its panel. */
export const storyModes = {
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
} as const;

type StoryModes = typeof storyModes;

export type StoryModeId = StoryModes[StoryTool]['id'];

/** The picked option of every mode, by mode id. */
export type StoryChoices = {
  [Tool in StoryTool as StoryModes[Tool]['id']]: StoryModes[Tool]['options'][number]['value'];
};

/**
 * A story read from `Switch.stories.tsx`. Each check labels one `expect` line
 * of its play function, in order.
 */
type FileStory<Label extends string = string> = {
  name: string;
  checks: readonly Label[];
  manualChecks?: readonly string[];
};

/** A hand-written story that illustrates one idea. It is not in the file. */
type ExampleStory<Label extends string = string> = FileStory<Label> & {
  source: readonly string[];
  /** The source line each check runs. */
  lines: readonly number[];
};

export type Story = FileStory | ExampleStory;

/** The file the chapter reads its stories from, relative to the repo root. */
export const STORY_FILE =
  'packages/react/src/components/switch/Switch.stories.tsx';

export function isExample(story: Story): story is ExampleStory {
  return 'source' in story;
}

/** A line of story source, or one that runs the named check. */
type SourceLine<Label extends string> = string | { code: string; check: Label };

/** An example story whose checks are marked on the lines that run them. */
function example<const Label extends string>(
  name: string,
  source: readonly SourceLine<Label>[],
  manualChecks?: readonly string[]
): ExampleStory<Label> {
  const lines: number[] = [];
  const checks: Label[] = [];
  source.forEach((line, index) => {
    if (typeof line === 'string') return;
    lines.push(index);
    checks.push(line.check);
  });
  return {
    name,
    source: source.map((line) => (typeof line === 'string' ? line : line.code)),
    lines,
    checks,
    manualChecks,
  };
}

export function stateStory(choice: StoryChoices['states']) {
  return example(`${choice.charAt(0).toUpperCase()}${choice.slice(1)}State`, [
    'args: {',
    { code: `  defaultChecked: ${choice === 'on'},`, check: 'Visible state' },
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
}

export const interactionStories = {
  click: {
    name: 'ClickInteraction',
    checks: [
      'Starts off',
      'Click turns on',
      'Reports true',
      'Click turns off',
      'Reports false',
    ],
  },
  disabled: {
    name: 'DisabledInteraction',
    checks: ['Is disabled', 'Stays off', 'No callback'],
  },
  keyboard: {
    name: 'KeyboardInteraction',
    checks: [
      'Receives focus',
      'Space turns it on',
      'Reports true',
      'Space turns it off',
      'Reports false',
    ],
  },
} as const satisfies Record<StoryChoices['interactions'], Story>;

export const callbackStory = example('CallbackContract', [
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

export const accessibilityStory = example(
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

/** The story a mode shows for the picked choices. */
export function describeStory(mode: StoryModeId, choices: StoryChoices): Story {
  if (mode === 'states') return stateStory(choices.states);
  if (mode === 'interactions') return interactionStories[choices.interactions];
  if (mode === 'callbacks') return callbackStory;
  return accessibilityStory;
}

/** Every story the chapter can show. */
export function allStories(): Story[] {
  return [
    ...storyModes.States.options.map(({ value }) => stateStory(value)),
    ...Object.values(interactionStories),
    callbackStory,
    accessibilityStory,
  ];
}

export function storyLabels(story: Story) {
  return [...story.checks, ...(story.manualChecks ?? [])];
}

/** The position of a check in a story's checks. */
export function checkIndex(story: Story, label: string) {
  const index = story.checks.indexOf(label);
  if (index === -1) throw new Error(`${story.name} has no check "${label}".`);
  return index;
}

export type CheckStatus = 'pending' | 'running' | 'pass' | 'fail' | 'manual';

export type Check = { status: CheckStatus; detail: string };

export function initialChecks(story: Story): Check[] {
  return [
    ...story.checks.map(
      (): Check => ({ status: 'pending', detail: 'Not run' })
    ),
    ...(story.manualChecks ?? []).map(
      (): Check => ({ status: 'manual', detail: 'Separate review required' })
    ),
  ];
}

/** Runs one check on the live example. */
export type CheckStep = () => Check;

/** The step that runs each of a story's checks, by check label. */
export type CheckSteps<S extends Story> = Record<
  S['checks'][number],
  CheckStep
>;

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
