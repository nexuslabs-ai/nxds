'use client';

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { useNxdsAppearance } from '@nxds/react/appearance';

import { Badge, type BadgeProps } from '@/components/badge/badge';
import { Button } from '@/components/button/button';
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
import { ChapterToolbar } from '../ChapterToolbar';

import type { StoryCode } from './story-code';
import {
  type Check,
  type CheckStatus,
  describeStory,
  initialChecks,
  result,
  resultSummary,
  storyModeAt,
  type StoryModeId,
  storyModes,
} from './story-test-model';

// Stories' place in the walkthrough. The toolbar names its tools
// `story-tab-{chapter}-{index}`, and the canvas is labelled by the active one.
const CHAPTER = 4;

const tabs = storyModes.map(({ label }) => label);

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

function stepDelay(reduceMotion: boolean) {
  if (reduceMotion) return 0;
  return parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      '--nx-motion-duration-slower'
    )
  );
}

/**
 * The Stories chapter: a live Switch, the story that tests it, and a toolbar
 * that picks the story and runs its checks on the live example.
 */
export function StoryTestIterations({
  cta,
  href,
  storyCode,
  active,
}: {
  cta: string;
  href: string;
  /** Every story's highlighted source, from `highlightStories()`. */
  storyCode: StoryCode;
  /** Whether this chapter is the one on screen. */
  active: boolean;
}) {
  const { state } = useNxdsAppearance();
  const [modeIndex, setModeIndex] = useState(1);
  const [choices, setChoices] = useState<Record<StoryModeId, string>>({
    states: 'off',
    interactions: 'click',
    callbacks: 'correct',
    accessibility: 'present',
  });
  const [checked, setChecked] = useState(false);
  const [calls, setCalls] = useState<boolean[]>([]);
  const [checks, setChecks] = useState(() => initialChecks('interactions'));
  const [status, setStatus] = useState('Ready to run');
  const [running, setRunning] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);
  const example = useRef<HTMLButtonElement>(null);
  const callsRef = useRef<boolean[]>([]);
  const sequence = useRef(0);
  const programmatic = useRef(false);
  const keyboardArmed = useRef(false);
  const spacePressed = useRef(false);
  const frame = useRef(0);
  const id = useId();
  const mode = storyModeAt(modeIndex);
  const choice = choices[mode.id];
  const story = describeStory(mode.id, choice);
  const disabled =
    (mode.id === 'states' || mode.id === 'interactions') &&
    choice === 'disabled';
  const invalid = mode.id === 'states' && choice === 'invalid';
  const nameless = mode.id === 'accessibility' && choice === 'missing';

  useEffect(
    () => () => {
      sequence.current += 1;
      cancelAnimationFrame(frame.current);
    },
    []
  );

  function reset(nextMode: StoryModeId, nextChoice: string) {
    sequence.current += 1;
    cancelAnimationFrame(frame.current);
    keyboardArmed.current = false;
    spacePressed.current = false;
    callsRef.current = [];
    setCalls([]);
    setChecked(nextMode === 'states' && nextChoice === 'on');
    setChecks(initialChecks(nextMode));
    setRunning(false);
    setActiveLine(-1);
    setStatus(
      nextMode === 'states' ? 'Example · checks not run' : 'Ready to run'
    );
  }

  function selectMode(index: number) {
    if (index === modeIndex) return;
    const nextMode = storyModeAt(index).id;
    reset(nextMode, choices[nextMode]);
    setModeIndex(index);
  }

  function selectChoice(value: string) {
    reset(mode.id, value);
    setChoices((current) => ({ ...current, [mode.id]: value }));
  }

  function onCheckedChange(value: boolean) {
    setChecked(value);
    const implementation = mode.id === 'callbacks' ? choice : 'correct';
    if (implementation !== 'missing') {
      callsRef.current = [
        ...callsRef.current,
        implementation === 'wrong' ? !value : value,
      ];
      setCalls(callsRef.current);
    }
    if (programmatic.current || keyboardArmed.current) return;
    sequence.current += 1;
    setRunning(false);
    setActiveLine(-1);
    setChecks(initialChecks(mode.id));
    setStatus('Example changed · run again');
  }

  function clickExample(element: HTMLButtonElement) {
    programmatic.current = true;
    flushSync(() => element.click());
    programmatic.current = false;
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    spacePressed.current = event.key === ' ';
  }

  function onKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
    if (!keyboardArmed.current || !spacePressed.current || event.key !== ' ')
      return;
    const run = sequence.current;
    frame.current = requestAnimationFrame(() => {
      const element = example.current;
      if (run !== sequence.current || !element) return;
      const next = [
        result(
          document.activeElement === element,
          'Expected focus on the switch'
        ),
        result(
          isOn(element),
          `Expected: on · received: ${isOn(element) ? 'on' : 'off'}`
        ),
        result(
          callsRef.current.length === 1 && callsRef.current[0] === true,
          `Expected: true once · received: ${JSON.stringify(callsRef.current)}`
        ),
      ];
      keyboardArmed.current = false;
      spacePressed.current = false;
      setChecks(next);
      setStatus(resultSummary(next));
      setActiveLine(-1);
    });
  }

  function cancelKeyboard() {
    spacePressed.current = false;
    if (!keyboardArmed.current) return;
    keyboardArmed.current = false;
    sequence.current += 1;
    setChecks(initialChecks('interactions'));
    setActiveLine(-1);
    setStatus('Keyboard check paused · focus the example again');
  }

  // One step per check of the current story, each run on the live switch.
  function checkSteps(element: HTMLButtonElement): (() => Check)[] {
    if (mode.id === 'callbacks')
      return [
        () => {
          clickExample(element);
          return result(
            isOn(element),
            `Expected: on · received: ${isOn(element) ? 'on' : 'off'}`
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
    if (mode.id === 'accessibility')
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
    if (mode.id === 'states')
      return [
        () =>
          result(
            isOn(element) === (choice === 'on'),
            `Expected: ${choice === 'on' ? 'on' : 'off'} · received: ${isOn(element) ? 'on' : 'off'}`
          ),
        () => {
          const was = isOn(element);
          clickExample(element);
          const changed = isOn(element) !== was;
          const ok = choice === 'disabled' ? !changed : changed;
          flushSync(() => setChecked(was));
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
    if (choice === 'disabled')
      return [
        () => result(element.disabled, 'Expected disabled control'),
        () => {
          clickExample(element);
          return result(
            !isOn(element),
            `After click: ${isOn(element) ? 'on' : 'off'}`
          );
        },
        () =>
          result(
            callsRef.current.length === 0,
            `Expected: 0 calls · received: ${callsRef.current.length}`
          ),
      ];
    return [
      () => result(!isOn(element), 'Expected initial state: off'),
      () => {
        clickExample(element);
        return result(
          isOn(element),
          `After first click: ${isOn(element) ? 'on' : 'off'}`
        );
      },
      () => {
        clickExample(element);
        return result(
          !isOn(element),
          `After second click: ${isOn(element) ? 'on' : 'off'}`
        );
      },
    ];
  }

  async function runExample() {
    flushSync(() => reset(mode.id, choice));
    const element = example.current;
    if (!element) return;
    const run = sequence.current;
    const next = initialChecks(mode.id);
    if (mode.id === 'interactions' && choice === 'keyboard') {
      element.focus({ preventScroll: true });
      keyboardArmed.current = true;
      next[0] = result(
        document.activeElement === element,
        'Switch focused · press Space'
      );
      setChecks(next);
      setActiveLine(story.lines[0] ?? -1);
      setStatus('Press Space to test the switch');
      return;
    }
    setRunning(true);
    setStatus('Running local checks…');
    const steps = checkSteps(element);
    for (const [index, step] of steps.entries()) {
      if (run !== sequence.current) return;
      next[index] = { status: 'running', detail: 'Checking…' };
      setChecks([...next]);
      setActiveLine(story.lines[index] ?? -1);
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
    const check = checks[story.lines.indexOf(line)];
    return check && lineStatuses[check.status];
  }

  return (
    <>
      <div className="nx:chapter-heading">
        <h2 id="stories-title">Stories are the tests.</h2>
        <p className="nx:m-0 nx:-mt-3 nx:mb-6 nx:typography-body-small nx:text-balance nx:text-muted-foreground">
          The example you explore is the example we check.
        </p>
        <div className="nx:story-ctas">
          <Button variant="outline" asChild>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${cta} (opens in a new tab)`}
            >
              <img src="/brand/storybook.svg" alt="" className="nx:size-3.5" />
              {cta}
            </a>
          </Button>
        </div>
      </div>
      <div
        className="nx:story-canvas nx:story-tests-canvas"
        role="region"
        aria-labelledby={`story-tab-${CHAPTER}-${modeIndex}`}
      >
        <div className="nx:flex nx:flex-col nx:gap-4 nx:pb-(--story-toolbar-clearance) nx:@3xl:h-full">
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
              <div className="nx:story-test-canvas nx:flex nx:flex-1 nx:flex-col nx:gap-6 nx:p-6">
                <div className="nx:flex nx:flex-1 nx:items-center nx:justify-center">
                  <Field
                    orientation="horizontal"
                    className="nx:max-w-sm"
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
                    <Item key={story.labels[index]} role="listitem" size="sm">
                      <ItemMedia>
                        <CheckIcon status={check.status} />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{story.labels[index]}</ItemTitle>
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
                <CardTitle>Switch.stories.tsx</CardTitle>
                <CardAction className="nx:row-span-1 nx:self-center">
                  <code className="nx:typography-code-inline nx:text-muted-foreground">
                    {story.name}
                  </code>
                </CardAction>
              </CardHeader>
              <Separator />
              <CodeBlock variant="flush" className="nx:min-h-0 nx:flex-1">
                <CodeBlockContent className="nx:h-full">
                  {storyCode[story.name]?.map((tokens, index) => (
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
      </div>
      <ChapterToolbar
        chapter={CHAPTER}
        title="Explore the stories"
        tabs={tabs}
        selected={modeIndex}
        onSelect={selectMode}
        active={active}
        actions={
          <ToolbarButton
            variant="default"
            size="lg"
            onClick={runExample}
            disabled={running}
          >
            Run
          </ToolbarButton>
        }
      >
        <div className="nx:flex nx:min-w-0 nx:flex-col nx:gap-3">
          <p className="nx:m-0 nx:typography-body-small nx:text-muted-foreground">
            {mode.description}
          </p>
          <Field>
            <FieldLabel htmlFor={`${id}-choice`}>{mode.field}</FieldLabel>
            <NativeSelect
              id={`${id}-choice`}
              size="sm"
              value={choice}
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
      </ChapterToolbar>
    </>
  );
}
