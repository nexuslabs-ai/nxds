'use client';

import { type SyntheticEvent, useState } from 'react';

import {
  IconBorderAll,
  IconBrightness,
  IconShadow,
  IconStack2,
  IconWaveSine,
} from '@tabler/icons-react';

import { Badge } from '@/components/badge/badge';
import { Button } from '@/components/button/button';
import { Toggle } from '@/components/toggle/toggle';

import { toolIcons } from '../tool-icons';

const inputGroups = [
  {
    name: 'Theme inputs',
    lane: 'theme',
    items: [
      { name: 'Brand color', Icon: toolIcons.Colors },
      { name: 'Surfaces', Icon: IconStack2 },
      { name: 'Contrast', Icon: IconBrightness },
    ],
  },
  {
    name: 'Appearance inputs',
    lane: 'appearance',
    items: [
      { name: 'Typography', Icon: toolIcons.Typography },
      { name: 'Spacing', Icon: toolIcons.Spacing },
      { name: 'Radius', Icon: toolIcons.Radius },
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

// In the toolbar's order: a chip's index selects the toolbar tool.
const frameworks = [
  { name: 'React', status: 'Components' },
  { name: 'Vue', status: 'Growing library' },
  { name: 'Svelte', status: 'Planned' },
  { name: 'Angular', status: 'Planned' },
  { name: 'React Native', status: 'Planned' },
] as const;

type Framework = (typeof frameworks)[number]['name'];

// Diagram nodes stretch to fill their grid cell and anchor their flow traces.
const nodeClassName =
  'nx:relative nx:h-auto nx:min-h-0 nx:min-w-0 nx:w-full nx:whitespace-normal nx:data-[flowing=true]:bg-control-background-hover';

const tileClassName = `${nodeClassName} nx:bg-control-background`;

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
 * its flow.
 */
export function CoreChipChapter({
  framework,
  onSelect,
}: {
  /** The selected toolbar tool. */
  framework: Framework | undefined;
  /** Selects the toolbar tool at this index. */
  onSelect: (index: number) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const active = hovered ?? focused;
  const activeGroup = inputGroups.find(({ items }) =>
    items.some(({ name }) => name === active)
  );
  const activeModule = modules.find(({ name }) => name === active);
  const activeFramework = frameworks.find(({ name }) => name === active);
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
                      className={`nx:chip-token ${tileClassName} nx:[&_svg]:size-(--chip-icon-size)`}
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
            {frameworks.map(({ name, status }, index) => {
              const Icon = toolIcons[name];
              const flowing =
                Boolean(active) && (!activeFramework || active === name);
              return (
                <Toggle
                  className={`nx:chip-destination ${nodeClassName} nx:rounded-xl nx:bg-muted nx:data-[flowing=true]:bg-control-background nx:[&_svg]:size-(--chip-icon-size)`}
                  pressed={name === framework}
                  onPressedChange={() => onSelect(index)}
                  aria-label={`${name}, ${status}`}
                  data-planned={status === 'Planned' || undefined}
                  data-flow-node={name}
                  data-flowing={flowing}
                  key={name}
                  {...nodeEvents}
                >
                  <Icon stroke={1.5} aria-hidden="true" />
                  <strong className="nx:font-medium">{name}</strong>
                  <Badge variant="secondary" className="nx:chip-status">
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
