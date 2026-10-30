'use client';

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { useNxdsAppearance } from '@nxds/react/appearance';

import { Badge, type BadgeProps } from '@/components/badge/badge';
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from '@/components/card/card';
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockLine,
  type CodeBlockLineProps,
} from '@/components/code-block/code-block';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/field/field';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/item/item';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/native-select/native-select';
import { Separator } from '@/components/separator/separator';
import { Spinner } from '@/components/spinner/spinner';
import { Switch } from '@/components/switch/switch';
import { ToolbarButton } from '@/components/toolbar/toolbar';

import {
  IconCheck,
  IconInfoCircle,
  IconMinus,
  IconX,
} from '../../_lib/switchable-icons';
import { ChapterPreview } from '../ChapterPreview';

import type { StoryCode } from './story-code';
import {
  type Check,
  type CheckStatus,
  describeStory,
  initialChecks,
  isExample,
  result,
  resultSummary,
  type StoryChoices,
  storyLabels,
  type StoryModeId,
  storyModes,
  type StoryTool,
  storyTools,
} from './story-test-model';

const checkBadges: Record<
  CheckStatus,
  { label: string; variant: BadgeProps['variant']; fill?: BadgeProps['fill'] }
> = {
  pending: { label: 'Not run', variant: 'secondary', fill: 'outline' },
  running: { label: 'Checking', variant: 'secondary', fill: 'outline' },
  pass: { label: 'Passed', variant: 'success' },
  fail: { label: 'Failed', variant: 'error' },
  manual: { label: 'Manual review', variant: 'secondary', fill: 'outline' },
};

const lineStatuses: Partial<Record<CheckStatus, CodeBlockLineProps['status']>> =
  { pass: 'success', fail: 'error' };

const detailed: CheckStatus[] = ['fail', 'manual'];

function CheckIcon({ status }: { status: CheckStatus }) {
  if (status === 'running') return <Spinner />;
  if (status === 'pass')
    return (
      <IconCheck className="nx:size-4 nx:text-success-subtle-foreground" />
    );
  if (status === 'fail')
    return <IconX className="nx:size-4 nx:text-error-subtle-foreground" />;
  if (status === 'manual')
    return <IconInfoCircle className="nx:size-4 nx:text-muted-foreground" />;
  return <IconMinus className="nx:size-4 nx:text-muted-foreground" />;
}

function outcomeBadge(checks: Check[]): BadgeProps['variant'] {
  if (checks.some((check) => check.status === 'fail')) return 'error';
  if (checks.some((check) => check.status === 'pass')) return 'success';
  return 'secondary';
}

function isOn(element: HTMLButtonElement) {
  return element.getAttribute('aria-checked') === 'true';
}

function onOff(element: HTMLButtonElement) {
  return isOn(element) ? 'on' : 'off';
}

function stepDelay(reduceMotion: boolean) {
  if (reduceMotion) return 0;
  return parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      '--nx-motion-duration-slower'
    )
  );
}

/** One step per check of a story, each run on the live switch. */
type CheckStep = () => Check;

/**
 * The Stories chapter: a live Switch, the story that tests it, and a toolbar
 * that picks the story and runs its checks on the live example.
 */
export function StoryTestIterations({
  storyCode,
}: {
  /** Every story's highlighted source, from `highlightStories()`. */
  storyCode: StoryCode;
}) {
  const { state } = useNxdsAppearance();
  const [tool, setTool] = useState<StoryTool>('Interactions');
  const [choices, setChoices] = useState<StoryChoices>({
    states: 'off',
    interactions: 'click',
    callbacks: 'correct',
    accessibility: 'present',
  });
  const [checked, setChecked] = useState(false);
  const [calls, setCalls] = useState<boolean[]>([]);
  const [checks, setChecks] = useState(() =>
    initialChecks(describeStory('interactions', choices))
  );
  const [status, setStatus] = useState('Ready to run');
  const [running, setRunning] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);
  const example = useRef<HTMLButtonElement>(null);
  const callsRef = useRef<boolean[]>([]);
  const sequence = useRef(0);
  const programmatic = useRef(false);
  const keyboardChecks = useRef<Check[] | null>(null);
  const spacePresses = useRef(0);
  const spacePressed = useRef(false);
  const frame = useRef(0);
  const id = useId();
  const mode = storyModes[tool];
  const story = describeStory(mode.id, choices);
  const code = storyCode[story.name];
  const labels = storyLabels(story);
  const disabled =
    (mode.id === 'states' && choices.states === 'disabled') ||
    (mode.id === 'interactions' && choices.interactions === 'disabled');
  const invalid = mode.id === 'states' && choices.states === 'invalid';
  const nameless =
    mode.id === 'accessibility' && choices.accessibility === 'missing';

  useEffect(
    () => () => {
      sequence.current += 1;
      cancelAnimationFrame(frame.current);
    },
    []
  );

  function clearCalls() {
    callsRef.current = [];
    setCalls([]);
  }

  function reset(nextMode: StoryModeId, nextChoices: StoryChoices) {
    sequence.current += 1;
    cancelAnimationFrame(frame.current);
    keyboardChecks.current = null;
    spacePressed.current = false;
    clearCalls();
    setChecked(nextMode === 'states' && nextChoices.states === 'on');
    setChecks(initialChecks(describeStory(nextMode, nextChoices)));
    setRunning(false);
    setActiveLine(-1);
    setStatus(
      nextMode === 'states' ? 'Example · checks not run' : 'Ready to run'
    );
  }

  function selectTool(next: StoryTool) {
    if (next === tool) return;
    reset(storyModes[next].id, choices);
    setTool(next);
  }

  function selectChoice(value: string) {
    const option = mode.options.find((item) => item.value === value);
    if (!option) return;
    const next = { ...choices, [mode.id]: option.value };
    reset(mode.id, next);
    setChoices(next);
  }

  function onCheckedChange(value: boolean) {
    setChecked(value);
    const implementation =
      mode.id === 'callbacks' ? choices.callbacks : 'correct';
    if (implementation !== 'missing') {
      callsRef.current = [
        ...callsRef.current,
        implementation === 'wrong' ? !value : value,
      ];
      setCalls(callsRef.current);
    }
    if (programmatic.current || keyboardChecks.current) return;
    sequence.current += 1;
    setRunning(false);
    setActiveLine(-1);
    setChecks(initialChecks(story));
    setStatus('Example changed · run again');
  }

  function clickExample(element: HTMLButtonElement) {
    programmatic.current = true;
    flushSync(() => element.click());
    programmatic.current = false;
  }

  function reported(value: boolean): Check {
    return result(
      callsRef.current.includes(value),
      `Expected a call with ${value} · received: ${JSON.stringify(callsRef.current)}`
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    spacePressed.current = event.key === ' ';
  }

  // Each Space press runs the next two checks: the new state, then its call.
  function onKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
    if (!keyboardChecks.current || !spacePressed.current || event.key !== ' ')
      return;
    const run = sequence.current;
    frame.current = requestAnimationFrame(() => {
      const element = example.current;
      const next = keyboardChecks.current;
      if (run !== sequence.current || !element || !next) return;
      const first = spacePresses.current === 0;
      const at = first ? 1 : 3;
      next[at] = result(
        isOn(element) === first,
        `After Space: ${onOff(element)}`
      );
      next[at + 1] = reported(first);
      spacePresses.current += 1;
      spacePressed.current = false;
      setChecks([...next]);
      if (first) {
        setActiveLine(code?.lines[3] ?? -1);
        setStatus('Press Space again');
        return;
      }
      keyboardChecks.current = null;
      setStatus(resultSummary(next));
      setActiveLine(-1);
    });
  }

  function cancelKeyboard() {
    spacePressed.current = false;
    if (!keyboardChecks.current) return;
    keyboardChecks.current = null;
    sequence.current += 1;
    setChecks(initialChecks(story));
    setActiveLine(-1);
    setStatus('Keyboard check paused · focus the example again');
  }

  function stateSteps(element: HTMLButtonElement): CheckStep[] {
    const choice = choices.states;
    return [
      () =>
        result(
          isOn(element) === (choice === 'on'),
          `Expected: ${choice === 'on' ? 'on' : 'off'} · received: ${onOff(element)}`
        ),
      () => {
        const was = isOn(element);
        clickExample(element);
        const changed = isOn(element) !== was;
        const ok = choice === 'disabled' ? !changed : changed;
        // The click only probes the state: restore it and its callback.
        flushSync(() => {
          setChecked(was);
          clearCalls();
        });
        return result(ok, changed ? 'Click accepted' : 'Click ignored');
      },
      () =>
        result(
          (element.getAttribute('aria-invalid') === 'true') ===
            (choice === 'invalid'),
          choice === 'invalid'
            ? 'Invalid state · error linked below'
            : 'No error state'
        ),
    ];
  }

  function clickSteps(element: HTMLButtonElement): CheckStep[] {
    return [
      () => result(!isOn(element), 'Expected initial state: off'),
      () => {
        clickExample(element);
        return result(isOn(element), `After first click: ${onOff(element)}`);
      },
      () => reported(true),
      () => {
        clickExample(element);
        return result(!isOn(element), `After second click: ${onOff(element)}`);
      },
      () => reported(false),
    ];
  }

  function disabledSteps(element: HTMLButtonElement): CheckStep[] {
    return [
      () => result(element.disabled, 'Expected disabled control'),
      () => {
        clickExample(element);
        return result(!isOn(element), `After click: ${onOff(element)}`);
      },
      () =>
        result(
          callsRef.current.length === 0,
          `Expected: 0 calls · received: ${callsRef.current.length}`
        ),
    ];
  }

  function interactionSteps(element: HTMLButtonElement): CheckStep[] {
    if (choices.interactions === 'disabled') return disabledSteps(element);
    return clickSteps(element);
  }

  function callbackSteps(element: HTMLButtonElement): CheckStep[] {
    return [
      () => {
        clickExample(element);
        return result(
          isOn(element),
          `Expected: on · received: ${onOff(element)}`
        );
      },
      () =>
        result(
          callsRef.current.length === 1,
          `Expected: 1 call · received: ${callsRef.current.length}`
        ),
      () =>
        result(
          callsRef.current.at(-1) === true,
          `Expected: true · received: ${callsRef.current.length ? String(callsRef.current.at(-1)) : 'nothing'}`
        ),
    ];
  }

  function nameSteps(element: HTMLButtonElement): CheckStep[] {
    return [
      () => {
        const name = Array.from(element.labels, (label) =>
          label.textContent.trim()
        ).join(' ');
        return result(
          name === 'Email notifications',
          name || 'No associated accessible name'
        );
      },
    ];
  }

  const checkSteps: Record<
    StoryModeId,
    (element: HTMLButtonElement) => CheckStep[]
  > = {
    states: stateSteps,
    interactions: interactionSteps,
    callbacks: callbackSteps,
    accessibility: nameSteps,
  };

  function armKeyboard(element: HTMLButtonElement) {
    element.focus({ preventScroll: true });
    const next = initialChecks(story);
    next[0] = result(
      document.activeElement === element,
      'Switch focused · press Space'
    );
    keyboardChecks.current = next;
    spacePresses.current = 0;
    setChecks([...next]);
    setActiveLine(code?.lines[1] ?? -1);
    setStatus('Press Space to test the switch');
  }

  async function runExample() {
    flushSync(() => reset(mode.id, choices));
    const element = example.current;
    if (!element) return;
    if (mode.id === 'interactions' && choices.interactions === 'keyboard') {
      armKeyboard(element);
      return;
    }
    const run = sequence.current;
    const next = initialChecks(story);
    setRunning(true);
    setStatus('Running local checks…');
    for (const [index, step] of checkSteps[mode.id](element).entries()) {
      if (run !== sequence.current) return;
      next[index] = { status: 'running', detail: 'Checking…' };
      setChecks([...next]);
      setActiveLine(code?.lines[index] ?? -1);
      await new Promise((resolve) =>
        setTimeout(resolve, stepDelay(state.prefs.reduceMotion))
      );
      if (run !== sequence.current) return;
      next[index] = step();
      setChecks([...next]);
    }
    if (run !== sequence.current) return;
    setRunning(false);
    setActiveLine(-1);
    setStatus(resultSummary(next));
  }

  function lineStatus(line: number) {
    const check = checks[code?.lines.indexOf(line) ?? -1];
    return check && lineStatuses[check.status];
  }

  const runButton = (
    <ToolbarButton
      variant="default"
      size="sm"
      onClick={runExample}
      disabled={running}
    >
      Run checks
    </ToolbarButton>
  );
  const modePanel = (
    <div className="nx:flex nx:min-w-0 nx:flex-col nx:gap-3">
      <p className="nx:m-0 nx:typography-body-small nx:text-muted-foreground">
        {mode.description}
      </p>
      <Field>
        <FieldLabel htmlFor={`${id}-choice`}>{mode.field}</FieldLabel>
        <NativeSelect
          id={`${id}-choice`}
          size="sm"
          value={choices[mode.id]}
          onChange={(event) => selectChoice(event.target.value)}
        >
          {mode.options.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <p className="nx:m-0 nx:typography-body-small nx:text-muted-foreground">
        {mode.id === 'accessibility'
          ? 'Name check only · not an axe audit.'
          : 'Runs on the live example above.'}
      </p>
    </div>
  );

  return (
    <ChapterPreview
      label="Stories"
      tools={storyTools}
      selected={tool}
      onSelect={selectTool}
      grows
      actions={runButton}
      panel={modePanel}
    >
      <div className="nx:flex nx:flex-col nx:gap-4 nx:@3xl:h-full">
        <Card className="nx:flex nx:flex-col nx:@3xl:grid nx:@3xl:min-h-0 nx:@3xl:flex-1 nx:@3xl:grid-cols-2">
          <div
            className="nx:flex nx:min-h-0 nx:flex-col"
            aria-label="Live switch example"
            role="group"
          >
            <CardHeader className="nx:items-center nx:py-4">
              <CardTitle>Live example</CardTitle>
              <CardAction className="nx:row-span-1 nx:self-center">
                <Badge role="status" variant={outcomeBadge(checks)}>
                  {status}
                </Badge>
              </CardAction>
            </CardHeader>
            <Separator />
            <div className="nx:dotted-stage nx:flex nx:flex-1 nx:flex-col nx:gap-6 nx:p-6">
              <div className="nx:flex nx:flex-1 nx:items-center nx:justify-center">
                <Item
                  variant="outline"
                  className="nx:w-full nx:max-w-sm nx:bg-background"
                >
                  <Field
                    orientation="horizontal"
                    data-invalid={invalid || undefined}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={nameless ? undefined : id}>
                        Email notifications
                      </FieldLabel>
                      <FieldDescription id={`${id}-description`}>
                        Product updates, on your terms.
                      </FieldDescription>
                      {invalid && (
                        <FieldError id={`${id}-error`}>
                          Choose a notification preference.
                        </FieldError>
                      )}
                      {nameless && (
                        <FieldError>
                          The visible label is deliberately disconnected in this
                          example.
                        </FieldError>
                      )}
                    </FieldContent>
                    <Switch
                      ref={example}
                      id={id}
                      checked={checked}
                      disabled={disabled}
                      aria-invalid={invalid || undefined}
                      aria-describedby={
                        invalid ? `${id}-error` : `${id}-description`
                      }
                      onCheckedChange={onCheckedChange}
                      onKeyDown={onKeyDown}
                      onKeyUp={onKeyUp}
                      onPointerDown={cancelKeyboard}
                      onBlur={cancelKeyboard}
                    />
                  </Field>
                </Item>
              </div>
              <p className="nx:m-0 nx:flex nx:flex-wrap nx:gap-x-4 nx:typography-body-small nx:text-muted-foreground">
                <span>
                  State{' '}
                  <code className="nx:typography-code-inline nx:text-foreground">
                    {checked ? 'on' : 'off'}
                    {disabled ? ' · disabled' : ''}
                  </code>
                </span>
                <span>
                  Callback{' '}
                  <code className="nx:typography-code-inline nx:text-foreground">
                    {calls.length ? String(calls.at(-1)) : '—'}
                  </code>
                </span>
              </p>
            </div>
            <Separator />
            <ItemGroup role="list" aria-label="Checks" className="nx:p-2">
              {checks.map((check, index) => {
                const { label, ...badge } = checkBadges[check.status];
                return (
                  <Item key={labels[index]} role="listitem" size="sm">
                    <ItemMedia>
                      <CheckIcon status={check.status} />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{labels[index]}</ItemTitle>
                      {detailed.includes(check.status) && (
                        <ItemDescription>{check.detail}</ItemDescription>
                      )}
                    </ItemContent>
                    <ItemActions>
                      <Badge {...badge}>{label}</Badge>
                    </ItemActions>
                  </Item>
                );
              })}
            </ItemGroup>
          </div>
          <div
            className="nx:flex nx:min-h-0 nx:flex-col nx:border-t-default nx:border-border-default nx:@3xl:border-t-0 nx:@3xl:border-l-default"
            aria-label="Storybook source excerpt"
            role="group"
          >
            <CardHeader className="nx:items-center nx:py-4">
              <CardTitle>
                {isExample(story) ? 'Example story' : 'Switch.stories.tsx'}
              </CardTitle>
              <CardAction className="nx:row-span-1 nx:self-center">
                <code className="nx:typography-code-inline nx:text-muted-foreground">
                  {story.name}
                </code>
              </CardAction>
            </CardHeader>
            <Separator />
            <CodeBlock variant="flush" className="nx:min-h-0 nx:flex-1">
              <CodeBlockContent className="nx:h-full">
                {code?.tokens.map((tokens, index) => (
                  <CodeBlockLine
                    key={index}
                    number={index + 1}
                    highlighted={activeLine === index}
                    status={lineStatus(index)}
                  >
                    {tokens.map((token, at) => (
                      <span key={at} style={{ color: token.color }}>
                        {token.content}
                      </span>
                    ))}
                  </CodeBlockLine>
                ))}
              </CodeBlockContent>
            </CodeBlock>
          </div>
        </Card>
        <p className="nx:m-0 nx:text-center nx:typography-body-small nx:text-muted-foreground">
          Read the action. See its effect. Inspect the result.{' '}
          {mode.id === 'accessibility'
            ? 'Accessible-name check only. Automated checks are one part of accessibility testing.'
            : 'Interactive prototype · local checks, not the Nexus CI suite.'}
        </p>
      </div>
    </ChapterPreview>
  );
}
