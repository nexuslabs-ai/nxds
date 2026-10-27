'use client';

import { type ReactNode, useState } from 'react';

import {
  IconAlertTriangle,
  IconCircleCheck,
  IconStackPush,
} from '@tabler/icons-react';

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/item/item';
import { Toggle } from '@/components/toggle/toggle';

import { BootstrapLogo, ShadcnLogo } from '../ecosystem-logos';
import type { ToolName } from '../tool-icons';

/** A part of the host app's sketch that reads a name a library writes. */
type Part =
  | 'accent'
  | 'muted'
  | 'surface'
  | 'heading'
  | 'list'
  | 'nav'
  | 'primary'
  | 'action';

/** A name or rule a library writes, and the sketch part that reads it. */
type Write = readonly [written: string, part: Part | null];

type Library = { name: string; file: string; icon: ReactNode };

type LaneName = 'other' | 'nexus';

/** One row: a library, the names it writes, and what happens to your app. */
type Lane = Library & {
  lane: LaneName;
  writes: readonly Write[];
  note: string;
  verdict: string;
  verdictIcon: ReactNode;
};

/** The name the visitor points at. */
type Target = { lane: LaneName; written: string; part: Part | null };

type SketchProps = {
  /** True for the sketch after the other library, false after Nexus. */
  broken: boolean;
  /** The part that reads the name the visitor points at. */
  pointed: Part | null;
};

function isPointed(pointed: Part | null, ...parts: Part[]) {
  return (pointed !== null && parts.includes(pointed)) || undefined;
}

// Each sketch draws the part of your app that the example touches, as it
// looks after the component is added. `data-active` outlines the parts that
// read the name the visitor points at.

// shadcn/ui's globals.css redefines names the host reads.
function TokensSketch({ broken, pointed }: SketchProps) {
  return (
    <div
      className="nx:coexist-lanes-app"
      data-broken={broken}
      data-active={isPointed(pointed, 'surface')}
      aria-hidden="true"
    >
      <span className="nx:typography-label-default">Design team</span>
      <span
        className="nx:coexist-lanes-app-text nx:typography-body-small"
        data-active={isPointed(pointed, 'muted')}
      >
        8 of 10 seats used
      </span>
      <span
        className="nx:coexist-lanes-app-button nx:typography-label-small"
        data-active={isPointed(pointed, 'accent')}
      >
        Invite teammate
      </span>
    </div>
  );
}

// Tailwind Preflight, which shadcn/ui's globals.css imports, resets the plain
// HTML in the host's own content.
function ResetSketch({ broken, pointed }: SketchProps) {
  return (
    <div
      className="nx:coexist-lanes-app"
      data-broken={broken}
      aria-hidden="true"
    >
      <span
        className="nx:coexist-lanes-app-heading nx:typography-heading-small"
        data-active={isPointed(pointed, 'heading')}
      >
        Release notes
      </span>
      <ul
        className="nx:coexist-lanes-app-list nx:typography-body-small"
        data-active={isPointed(pointed, 'list')}
      >
        <li>Faster search</li>
        <li>New roles</li>
      </ul>
    </div>
  );
}

// Tailwind makes a utility for a class name the host already uses.
function NavSketch({ broken, pointed }: SketchProps) {
  return (
    <div
      className="nx:coexist-lanes-app"
      data-broken={broken}
      aria-hidden="true"
    >
      <span className="nx:typography-label-default">Acme</span>
      <span
        className="nx:coexist-lanes-app-nav nx:typography-body-small"
        data-active={isPointed(pointed, 'nav')}
      >
        <span>Docs</span>
        <span>Pricing</span>
        <span>Blog</span>
      </span>
    </div>
  );
}

// In a shadcn/ui app, Bootstrap's `!important` utilities and unlayered reset
// beat Tailwind's.
function PrimarySketch({ broken, pointed }: SketchProps) {
  return (
    <div
      className="nx:coexist-lanes-app"
      data-broken={broken}
      aria-hidden="true"
    >
      <span className="nx:coexist-lanes-app-row">
        <span className="nx:typography-label-default">Design team</span>
        <span
          className="nx:coexist-lanes-app-primary nx:coexist-lanes-app-pill nx:typography-label-small"
          data-active={isPointed(pointed, 'primary')}
        >
          Pro
        </span>
      </span>
      <span
        className="nx:coexist-lanes-app-primary nx:coexist-lanes-app-action nx:typography-label-small"
        data-active={isPointed(pointed, 'primary', 'action')}
      >
        Invite teammate
      </span>
    </div>
  );
}

const shadcnSelect: Library = {
  name: 'shadcn/ui Select',
  file: 'globals.css',
  icon: <ShadcnLogo aria-hidden="true" />,
};

// One example per host app.
const hosts = [
  {
    tab: 'HeroUI',
    adds: shadcnSelect,
    writes: [
      ['--accent', 'accent'],
      ['--muted', 'muted'],
      ['--background', 'surface'],
      ['--radius', 'surface'],
    ],
    note: 'The same names your HeroUI app reads.',
    Sketch: TokensSketch,
  },
  {
    tab: 'MUI',
    adds: shadcnSelect,
    writes: [
      ['h1–h6 { font-size: inherit }', 'heading'],
      ['ul { list-style: none }', 'list'],
    ],
    note: 'Global rules for the plain HTML in your app. MUI components keep their look.',
    Sketch: ResetSketch,
  },
  {
    tab: 'Ant Design',
    adds: shadcnSelect,
    writes: [
      ['h1–h6 { font-size: inherit }', 'heading'],
      ['ul { list-style: none }', 'list'],
    ],
    note: 'Global rules that the Ant Design reset leaves open.',
    Sketch: ResetSketch,
  },
  {
    tab: 'Bootstrap',
    adds: shadcnSelect,
    writes: [['.collapse { visibility: collapse }', 'nav']],
    note: 'The class your Bootstrap navbar already uses. Its links stay in place but disappear.',
    Sketch: NavSketch,
  },
  {
    tab: 'shadcn/ui',
    adds: {
      name: 'react-bootstrap Dropdown',
      file: 'bootstrap.min.css',
      icon: <BootstrapLogo aria-hidden="true" />,
    },
    writes: [
      ['.bg-primary { background-color: … !important }', 'primary'],
      ['button { border-radius: 0 }', 'action'],
    ],
    note: 'The same class name your Tailwind uses, and a reset outside Tailwind’s layers.',
    Sketch: PrimarySketch,
  },
] as const;

type Host = (typeof hosts)[number];

/** The Coexist chapter's toolbar tools, one per host app. */
export const hostTabs: readonly ToolName[] = hosts.map(({ tab }) => tab);

const nexusLane: Lane = {
  lane: 'nexus',
  name: 'Nexus Select',
  file: 'nxds.css',
  icon: <IconStackPush aria-hidden="true" />,
  writes: [
    ['--nx-*', null],
    ['.nx:*', null],
  ],
  note: 'Only its own names. No global rules.',
  verdict: 'Your app stays the same',
  verdictIcon: <IconCircleCheck className="nx:size-4" aria-hidden="true" />,
};

// Phones keep only the "Your app" column, as the Frameworks chapter keeps
// only its frameworks.
const sideColumnClass = 'nx:coexist-lanes-column nx:hidden nx:@3xl:grid';

/** Another library and a Nexus Select, each added to the chosen host app. */
export function CoexistLanes({ tab }: { tab: ToolName | undefined }) {
  const host = hosts.find((entry) => entry.tab === tab) ?? hosts[0];
  return <HostLanes key={host.tab} host={host} />;
}

// Pointing at a name lights its row's traces and outlines, in both sketches,
// the part of your app that reads it. Nexus names reach no part. Hover or
// focus previews a name; pressing it pins the link.
function HostLanes({ host }: { host: Host }) {
  const [hovered, setHovered] = useState<Target | null>(null);
  const [pinned, setPinned] = useState<Target | null>(null);
  const pointed = hovered ?? pinned;
  const { Sketch } = host;
  const lanes: readonly Lane[] = [
    {
      lane: 'other',
      ...host.adds,
      writes: host.writes,
      note: host.note,
      verdict: 'Your app changed',
      verdictIcon: (
        <IconAlertTriangle className="nx:size-4" aria-hidden="true" />
      ),
    },
    nexusLane,
  ];
  return (
    <div className="nx:coexist-lanes-chapter nx:@container">
      <div className="nx:coexist-lanes nx:@3xl:grid-cols-3">
        <div className={sideColumnClass}>
          <span className="nx:coexist-lanes-label">You add</span>
          <div className="nx:coexist-lanes-panel">
            {lanes.map(({ lane, icon, name, file }) => (
              <Item
                key={lane}
                className="nx:coexist-lanes-tile nx:coexist-lanes-lib"
                data-lane={lane}
                data-hot={pointed?.lane === lane || undefined}
              >
                <ItemMedia className="nx:[&_svg]:size-10">{icon}</ItemMedia>
                <ItemContent className="nx:flex-none nx:items-center">
                  <ItemTitle>{name}</ItemTitle>
                  <ItemDescription>{file}</ItemDescription>
                </ItemContent>
                <span className="nx:coexist-lanes-trace" aria-hidden="true" />
              </Item>
            ))}
          </div>
        </div>
        <div className={sideColumnClass}>
          <span className="nx:coexist-lanes-label">It writes on the page</span>
          <div className="nx:coexist-lanes-panel">
            {lanes.map(({ lane, writes, note }) => (
              <div
                key={lane}
                className="nx:coexist-lanes-tile nx:coexist-lanes-names"
                data-lane={lane}
                data-hot={pointed?.lane === lane || undefined}
              >
                <div className="nx:coexist-lanes-chips">
                  {writes.map(([written, part]) => {
                    const target: Target = { lane, written, part };
                    return (
                      <Toggle
                        key={written}
                        size="sm"
                        className="nx:coexist-lanes-chip nx:h-auto nx:whitespace-normal nx:typography-code-inline"
                        pressed={pinned?.written === written}
                        onPressedChange={(on) => setPinned(on ? target : null)}
                        data-active={pointed?.written === written || undefined}
                        onPointerEnter={() => setHovered(target)}
                        onPointerLeave={() => setHovered(null)}
                        onFocus={() => setHovered(target)}
                        onBlur={() => setHovered(null)}
                      >
                        {written}
                      </Toggle>
                    );
                  })}
                </div>
                <p className="nx:coexist-lanes-note nx:typography-body-small">
                  {note}
                </p>
                <span className="nx:coexist-lanes-trace" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
        <div className="nx:coexist-lanes-column nx:grid">
          <span className="nx:coexist-lanes-label">Your {host.tab} app</span>
          <div className="nx:coexist-lanes-panel">
            {lanes.map(({ lane, name, verdict, verdictIcon }) => (
              <section
                key={lane}
                className="nx:coexist-lanes-tile"
                data-lane={lane}
                aria-label={`${name}: your ${host.tab} app ${lane === 'other' ? 'changed' : 'stays the same'}`}
              >
                <p className="nx:coexist-lanes-verdict nx:typography-label-default">
                  {verdictIcon}
                  {verdict}
                </p>
                <p className="nx:coexist-lanes-with nx:typography-body-small nx:@3xl:hidden">
                  With a {name}
                </p>
                <Sketch
                  broken={lane === 'other'}
                  pointed={pointed?.part ?? null}
                />
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
