'use client';

import { type ReactNode, useState } from 'react';

import {
  IconAlertTriangle,
  IconChevronDown,
  IconCircleCheck,
} from '@tabler/icons-react';

import { Badge } from '@/components/badge/badge';
import { Toggle } from '@/components/toggle/toggle';

import { toolIcons, type ToolName } from '../tool-icons';

/**
 * A part of the host app's sketch that reads a name a library writes. `mode`
 * is the whole app, which follows the light or dark mode.
 */
type Part =
  | 'mode'
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

type Library = { name: string; file: string };

type LaneName = 'other' | 'nexus';

/** One row: a library, the names it writes, and what happens to your app. */
type Lane = Library & {
  lane: LaneName;
  writes: readonly Write[];
  verdict: string;
  verdictIcon: ReactNode;
  /** The kind of conflict, when the library changes your app. */
  clash?: string;
};

/** The name the visitor points at. */
type Target = { written: string; part: Part | null };

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
// looks after the component is added, with that component in its place.
// `data-active` outlines the parts that read the name the visitor points at.

/** The component the visitor adds, drawn where your app would use it. */
function AddedSelect({ children }: { children: ReactNode }) {
  return (
    <span className="nx:coexist-lanes-app-select nx:typography-label-default">
      {children}
      <IconChevronDown className="nx:size-4" aria-hidden="true" />
      <span className="nx:coexist-lanes-app-new nx:typography-label-small">
        New
      </span>
    </span>
  );
}

// shadcn/ui's globals.css redefines names the host reads.
function TokensSketch({ broken, pointed }: SketchProps) {
  return (
    <div
      className="nx:coexist-lanes-app"
      data-broken={broken}
      data-active={isPointed(pointed, 'mode', 'surface')}
      aria-hidden="true"
    >
      <span className="nx:grid nx:gap-1">
        <span className="nx:typography-label-default">Design team</span>
        <span
          className="nx:coexist-lanes-app-text nx:typography-body-small"
          data-active={isPointed(pointed, 'muted')}
        >
          8 of 10 seats used
        </span>
      </span>
      <span className="nx:coexist-lanes-app-row">
        <AddedSelect>Member</AddedSelect>
        <span
          className="nx:coexist-lanes-app-button nx:typography-label-default"
          data-active={isPointed(pointed, 'accent')}
        >
          Invite
        </span>
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
      data-active={isPointed(pointed, 'mode')}
      aria-hidden="true"
    >
      <div className="nx:grid nx:gap-2">
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
      <AddedSelect>v2.4</AddedSelect>
    </div>
  );
}

// Tailwind makes a utility for a class name the host already uses.
function NavSketch({ broken, pointed }: SketchProps) {
  return (
    <div
      className="nx:coexist-lanes-app"
      data-broken={broken}
      data-active={isPointed(pointed, 'mode')}
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
      <AddedSelect>English</AddedSelect>
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
      data-active={isPointed(pointed, 'mode')}
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
      <span className="nx:coexist-lanes-app-row">
        <AddedSelect>Actions</AddedSelect>
        <span
          className="nx:coexist-lanes-app-primary nx:coexist-lanes-app-action nx:typography-label-default"
          data-active={isPointed(pointed, 'primary', 'action')}
        >
          Invite
        </span>
      </span>
    </div>
  );
}

const shadcnSelect: Library = {
  name: 'shadcn/ui Select',
  file: 'globals.css',
};

/** The Coexist chapter's toolbar tools, one per host app, in toolbar order. */
export const hostTabs = [
  'shadcn/ui',
  'MUI',
  'Ant Design',
  'Bootstrap',
  'HeroUI',
] as const satisfies readonly ToolName[];

export type HostTab = (typeof hostTabs)[number];

/** What another library does to one host app. */
type HostExample = {
  /** The kind of conflict. */
  clash: string;
  adds: Library;
  writes: readonly Write[];
  /** The app reads `.dark` on `<html>`, so it follows the mode Nexus sets. */
  readsDark: boolean;
  Sketch: typeof TokensSketch;
};

// One example per host app.
const hosts: Record<HostTab, HostExample> = {
  'shadcn/ui': {
    clash: 'Specificity clash',
    adds: {
      name: 'react-bootstrap Dropdown',
      file: 'bootstrap.min.css',
    },
    writes: [
      ['.bg-primary { background-color: … !important }', 'primary'],
      ['button { border-radius: 0 }', 'action'],
    ],
    readsDark: true,
    Sketch: PrimarySketch,
  },
  MUI: {
    clash: 'Global reset',
    adds: shadcnSelect,
    writes: [
      ['h1–h6 { font-size: inherit }', 'heading'],
      ['ul { list-style: none }', 'list'],
    ],
    readsDark: false,
    Sketch: ResetSketch,
  },
  'Ant Design': {
    clash: 'Global reset',
    adds: shadcnSelect,
    writes: [
      ['h1–h6 { font-size: inherit }', 'heading'],
      ['ul { list-style: none }', 'list'],
    ],
    readsDark: false,
    Sketch: ResetSketch,
  },
  Bootstrap: {
    clash: 'Class name clash',
    adds: shadcnSelect,
    writes: [['.collapse { visibility: collapse }', 'nav']],
    readsDark: false,
    Sketch: NavSketch,
  },
  HeroUI: {
    clash: 'Token name clash',
    adds: shadcnSelect,
    writes: [
      ['--accent', 'accent'],
      ['--muted', 'muted'],
      ['--background', 'surface'],
      ['--radius', 'surface'],
    ],
    readsDark: true,
    Sketch: TokensSketch,
  },
};

// The provider owns light and dark mode: it sets `.dark` on <html>. An app
// that reads `.dark` too follows the same mode.
function nexusLane(readsDark: boolean): Lane {
  return {
    lane: 'nexus',
    name: 'Nexus Select',
    file: 'nxds.css',
    writes: [
      ['--nx-*', null],
      ['.nx:*', null],
      ['html.dark (shared mode)', readsDark ? 'mode' : null],
      ['html[data-*]', null],
    ],
    verdict: 'Your app stays the same',
    verdictIcon: <IconCircleCheck className="nx:size-4" aria-hidden="true" />,
  };
}

/** Another library and a Nexus Select, each added to the chosen host app. */
export function CoexistLanes({ host }: { host: HostTab }) {
  return <HostLanes key={host} tab={host} example={hosts[host]} />;
}

// Pointing at a name outlines, in both apps, the part that reads it. Nexus
// names reach no part, except the shared mode in an app that reads `.dark`.
// Hover or focus previews a name; pressing it pins it.
function HostLanes({ tab, example }: { tab: HostTab; example: HostExample }) {
  const [hovered, setHovered] = useState<Target | null>(null);
  const [pinned, setPinned] = useState<Target | null>(null);
  const pointed = hovered ?? pinned;
  const { Sketch } = example;
  const HostIcon = toolIcons[tab];
  const lanes: readonly Lane[] = [
    {
      lane: 'other',
      ...example.adds,
      writes: example.writes,
      verdict: 'Your app changed',
      verdictIcon: (
        <IconAlertTriangle className="nx:size-4" aria-hidden="true" />
      ),
      clash: example.clash,
    },
    nexusLane(example.readsDark),
  ];
  return (
    <div className="nx:coexist-lanes-chapter nx:@container">
      <div className="nx:coexist-lanes-host">
        <h3 className="nx:coexist-lanes-host-title nx:typography-label-default">
          <HostIcon aria-hidden="true" />
          Your {tab} app
        </h3>
        <div className="nx:coexist-lanes nx:@3xl:grid-cols-2">
          {lanes.map(
            ({ lane, name, file, writes, verdict, verdictIcon, clash }) => (
              <div
                key={lane}
                className="nx:coexist-lanes-column"
                data-lane={lane}
              >
                <div className="nx:coexist-lanes-library">
                  <h4 className="nx:m-0 nx:typography-label-default">
                    <span className="nx:text-muted-foreground">Add</span> {name}
                  </h4>
                  <span className="nx:typography-body-small nx:text-muted-foreground">
                    {file}
                  </span>
                  <span className="nx:coexist-lanes-flow" aria-hidden="true">
                    <i />
                  </span>
                </div>
                <div className="nx:coexist-lanes-card">
                  <div
                    className="nx:coexist-lanes-chips"
                    role="group"
                    aria-label={`${name} writes on the page`}
                  >
                    {writes.map(([written, part]) => {
                      const target: Target = { written, part };
                      return (
                        <Toggle
                          key={written}
                          size="sm"
                          className="nx:coexist-lanes-chip nx:h-auto nx:whitespace-normal nx:typography-code-inline"
                          pressed={pinned?.written === written}
                          onPressedChange={(on) =>
                            setPinned(on ? target : null)
                          }
                          data-active={
                            pointed?.written === written || undefined
                          }
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
                  <div className="nx:coexist-lanes-stage nx:dotted-stage">
                    <Sketch
                      broken={lane === 'other'}
                      pointed={pointed?.part ?? null}
                    />
                  </div>
                  <p className="nx:coexist-lanes-verdict nx:typography-label-default">
                    {verdictIcon}
                    {verdict}
                    {clash && (
                      <Badge variant="error" fill="light">
                        {clash}
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
