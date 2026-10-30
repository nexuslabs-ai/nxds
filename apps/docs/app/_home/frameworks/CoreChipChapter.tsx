'use client';

import { type SyntheticEvent, useState } from 'react';

import {
  IconBorderAll,
  IconBorderRadius,
  IconBrandAngular,
  IconBrandReact,
  IconBrandReactNative,
  IconBrandSvelte,
  IconBrandVue,
  IconBrightness,
  IconColorSwatch,
  IconShadow,
  IconSpacingHorizontal,
  IconStack2,
  IconTypography,
  IconWaveSine,
} from '@tabler/icons-react';

import { Badge } from '@/components/badge/badge';
import { Button } from '@/components/button/button';
import { Toggle } from '@/components/toggle/toggle';

const inputGroups = [
  {
    name: 'Theme inputs',
    lane: 'theme',
    items: [
      { name: 'Brand color', Icon: IconColorSwatch },
      { name: 'Surfaces', Icon: IconStack2 },
      { name: 'Contrast', Icon: IconBrightness },
    ],
  },
  {
    name: 'Appearance inputs',
    lane: 'appearance',
    items: [
      { name: 'Typography', Icon: IconTypography },
      { name: 'Spacing', Icon: IconSpacingHorizontal },
      { name: 'Radius', Icon: IconBorderRadius },
      { name: 'Borders', Icon: IconBorderAll },
      { name: 'Shadows', Icon: IconShadow },
      { name: 'Motion', Icon: IconWaveSine },
    ],
  },
];

const modules = [
  { name: 'Theme engine', className: 'nx:chip-engine', lane: 'theme' },
  { name: 'Semantic colors', className: 'nx:chip-colors', lane: 'theme' },
  {
    name: 'Appearance engine',
    className: 'nx:chip-appearance',
    lane: 'appearance',
  },
  {
    name: 'Shared theme',
    className: 'nx:chip-shared nx:bg-control-background-hover',
    lane: 'shared',
  },
];

/** The frameworks the diagram ends in, in order. */
const frameworks = [
  'React',
  'Vue',
  'Svelte',
  'Angular',
  'React Native',
] as const;

type Framework = (typeof frameworks)[number];

const frameworkIcons = {
  React: IconBrandReact,
  Vue: IconBrandVue,
  Svelte: IconBrandSvelte,
  Angular: IconBrandAngular,
  'React Native': IconBrandReactNative,
};

const frameworkStatus: Record<Framework, string> = {
  React: 'Components',
  Vue: 'Growing library',
  Svelte: 'Planned',
  Angular: 'Planned',
  'React Native': 'Planned',
};

// Diagram nodes stretch to fill their grid cell and anchor their flow traces.
const nodeClassName =
  'nx:relative nx:h-auto nx:min-h-0 nx:min-w-0 nx:w-full nx:whitespace-normal nx:data-[flowing=true]:bg-control-background-hover';

const tileClassName = `${nodeClassName} nx:bg-control-background`;

// Logo and name share a centered row; the status badge spans the row below.
// Phones stack the frameworks as one row each.
const destinationClassName =
  'nx:grid nx:grid-cols-[1fr_auto_auto_1fr] nx:content-center nx:gap-x-2 nx:gap-y-3 nx:rounded-xl nx:bg-muted nx:data-[flowing=true]:bg-control-background nx:[&_svg]:size-(--chip-icon-size) nx:framework-compact:gap-y-2 nx:framework-compact:px-2 nx:framework-compact:py-0 nx:framework-narrow:flex nx:framework-narrow:justify-start nx:framework-narrow:gap-3 nx:framework-narrow:px-4';

function FlowTrace({
  kind,
  active,
}: {
  kind?: 'input' | 'output' | 'link';
  active: boolean;
}) {
  return (
    <span
      className="nx:chip-trace"
      data-trace={kind}
      data-flowing={active}
      aria-hidden="true"
    >
      <i />
    </span>
  );
}

/**
 * The Frameworks chapter: the design tokens feed the Nexus core, and the
 * shared theme reaches every framework. Hovering or focusing a node traces
 * its flow; pressing a framework keeps its flow traced.
 */
export function CoreChipChapter() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [pinned, setPinned] = useState<Framework | null>(null);
  const active = hovered ?? focused ?? pinned;
  const activeGroup = inputGroups.find(({ items }) =>
    items.some(({ name }) => name === active)
  );
  const activeModule = modules.find(({ name }) => name === active);
  const activeFramework = frameworks.find((name) => name === active);
  const allLanes = activeModule?.lane === 'shared' || Boolean(activeFramework);
  const activeLane = activeGroup?.lane ?? activeModule?.lane;
  const themeFlow = allLanes || activeLane === 'theme';
  const appearanceFlow = allLanes || activeLane === 'appearance';
  const linkFlow =
    allLanes || active === 'Theme engine' || active === 'Appearance engine';

  function laneFlowing(lane: string) {
    if (lane === 'shared') return Boolean(active);
    if (lane === 'theme') return themeFlow;
    return appearanceFlow;
  }

  function enterNode(event: SyntheticEvent<HTMLElement>) {
    setHovered(event.currentTarget.dataset.flowNode ?? null);
  }

  function leaveNode() {
    setHovered(null);
  }

  // Keyboard focus takes over from a stale hover. A click also counts as
  // focus, because some browsers don't focus a button on click.
  function focusNode(event: SyntheticEvent<HTMLElement>) {
    if (event.currentTarget.matches(':focus-visible')) setHovered(null);
    setFocused(event.currentTarget.dataset.flowNode ?? null);
  }

  function blurNode() {
    setFocused(null);
  }

  const nodeEvents = {
    onPointerEnter: enterNode,
    onPointerLeave: leaveNode,
    onFocus: focusNode,
    onBlur: blurNode,
    onClick: focusNode,
  };

  return (
    <div className="nx:framework-chapter">
      <div className="nx:chip-flow" data-flow-motion={Boolean(hovered)}>
        <div className="nx:framework-token-group">
          <span className="nx:framework-column-label">Design tokens</span>
          <div className="nx:chip-token-container">
            {inputGroups.map(({ name: groupName, lane, items }) => (
              <div
                className="nx:chip-token-lane"
                role="group"
                aria-label={groupName}
                key={groupName}
              >
                {items.map(({ name, Icon }) => {
                  const flowing = activeGroup
                    ? active === name
                    : laneFlowing(lane);
                  return (
                    <Button
                      variant="secondary"
                      className={`${tileClassName} nx:framework-compact:px-2 nx:[&_svg]:size-(--chip-icon-size)`}
                      data-flow-node={name}
                      data-flowing={flowing}
                      key={name}
                      {...nodeEvents}
                    >
                      <Icon stroke={1.5} aria-hidden="true" />
                      <span>{name}</span>
                      <FlowTrace kind="input" active={flowing} />
                    </Button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="nx:framework-core-column">
          <span className="nx:framework-column-label">Nexus core</span>
          <div
            className="nx:chip-core"
            role="group"
            aria-label="Nexus core: brand color, surfaces and contrast feed the theme engine to derive semantic colors. The remaining tokens feed the appearance engine, which runs the theme engine. Both contribute to the shared theme."
          >
            {modules.map(({ name, className, lane }) => {
              const flowing = laneFlowing(lane);
              return (
                <Button
                  variant="secondary"
                  className={`nx:chip-module ${tileClassName} ${className}`}
                  data-flow-node={name}
                  data-flowing={flowing}
                  key={name}
                  {...nodeEvents}
                >
                  {name}
                  {lane !== 'shared' && <FlowTrace active={flowing} />}
                  {name === 'Theme engine' && (
                    <FlowTrace kind="link" active={linkFlow} />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="nx:framework-output-group">
          <span className="nx:framework-column-label">Frameworks</span>
          <div className="nx:chip-destinations">
            {frameworks.map((name) => {
              const Icon = frameworkIcons[name];
              const status = frameworkStatus[name];
              const flowing =
                Boolean(active) && (!activeFramework || active === name);
              return (
                <Toggle
                  className={`nx:chip-destination ${nodeClassName} ${destinationClassName}`}
                  pressed={name === pinned}
                  onPressedChange={(on) => setPinned(on ? name : null)}
                  aria-label={`${name}, ${status}`}
                  data-planned={status === 'Planned' || undefined}
                  data-flow-node={name}
                  data-flowing={flowing}
                  key={name}
                  {...nodeEvents}
                >
                  <Icon stroke={1.5} aria-hidden="true" />
                  <strong className="nx:font-medium">{name}</strong>
                  <Badge
                    variant="secondary"
                    className="nx:chip-status nx:framework-narrow:hidden"
                  >
                    {status}
                  </Badge>
                  <FlowTrace kind="output" active={flowing} />
                </Toggle>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
