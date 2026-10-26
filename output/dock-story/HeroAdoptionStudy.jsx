import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Field,
  FieldLabel,
  NativeSelect,
  NativeSelectOption,
  Switch,
} from '@nxds/react';

import './hero-adoption-study.css';

const channel = 'nexus-hero-adoption-v1';

const shadcnTheming = [
  'shadcn default theme',
  'https://ui.shadcn.com/docs/theming',
];
const studies = {
  HeroUI: {
    host: 'heroui',
    other: 'shadcn',
    otherName: 'shadcn',
    beforeOutcome:
      'Blue accent. Readable secondary text. Your existing components.',
    otherOutcome:
      'Shared token names can change the accent, text and surface of the existing app.',
    cause: (
      <>
        HeroUI uses <code>--accent</code> for its accent color and{' '}
        <code>--muted</code> for secondary text. The imported shadcn stylesheet
        defines those same names.{' '}
      </>
    ),
    sources:
      'installed HeroUI 3.2.6, the checked-in shadcn Select and default stylesheet',
    links: [
      [
        'HeroUI source anatomy',
        'https://heroui.com/en/docs/react/components/progress-bar',
      ],
      shadcnTheming,
    ],
  },
  MUI: {
    host: 'mui',
    other: 'shadcn',
    otherName: 'shadcn',
    sources:
      'installed MUI 9.5.0 with its theme and CssBaseline, the checked-in shadcn Select and default stylesheet',
    links: [
      ['MUI theming', 'https://mui.com/material-ui/customization/theming/'],
      shadcnTheming,
    ],
  },
  'Ant Design': {
    host: 'antd',
    other: 'shadcn',
    otherName: 'shadcn',
    sources:
      'installed Ant Design 6.6.7 with its theme and reset stylesheet, the checked-in shadcn Select and default stylesheet',
    links: [
      ['Ant Design theming', 'https://ant.design/docs/react/customize-theme'],
      shadcnTheming,
    ],
  },
  'shadcn/ui': {
    host: 'shadcn',
    other: 'heroui',
    otherName: 'HeroUI',
    sources:
      'the checked-in shadcn components and default stylesheet, installed HeroUI 3.2.6 Select and styles',
    links: [
      shadcnTheming,
      [
        'HeroUI theming',
        'https://heroui.com/en/docs/react/getting-started/theming',
      ],
    ],
  },
};

function casesFor(library, study) {
  return [
    {
      id: 'before',
      number: '01',
      title: `Your ${library} app`,
      subtitle: 'The starting point',
    },
    {
      id: study.other,
      number: '02',
      title: `Add a ${study.otherName} Select`,
      subtitle: 'With its default global styles',
    },
    {
      id: 'nexus',
      number: '03',
      title: 'Add a Nexus Select',
      subtitle: 'With its prefixed styles',
    },
  ];
}

function outcome(id, study, changed) {
  if (id === 'before')
    return study.beforeOutcome ?? 'Your existing components and styles.';
  if (changed && id !== 'nexus')
    return (
      study.otherOutcome ??
      'Its default styles changed parts of the existing app.'
    );
  if (changed) return 'Its styles changed parts of the existing app.';
  if (id === 'nexus')
    return 'The new Select brings its own tokens. The host keeps its original appearance.';
  return 'The existing app kept its appearance.';
}

function ComparisonFrame({
  host,
  id,
  title,
  mode,
  highlight,
  role,
  onRoleChange,
  onReport,
}) {
  const frame = useRef(null);
  const configure = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      { channel, type: 'configuration', highlight, role },
      location.origin
    );
  }, [highlight, role]);
  useEffect(() => {
    function receive(event) {
      if (
        event.origin !== location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.channel !== channel
      )
        return;
      if (
        event.data.host !== host ||
        event.data.mode !== mode ||
        event.data.integration !== id
      )
        return;
      if (event.data.type === 'report') onReport(id, event.data.report);
      if (event.data.type === 'error')
        onReport(id, { error: event.data.message });
      if (event.data.type === 'role') onRoleChange(event.data.role);
    }
    window.addEventListener('message', receive);
    configure();
    return () => window.removeEventListener('message', receive);
  }, [host, id, mode, configure, onReport, onRoleChange]);
  return (
    <iframe
      ref={frame}
      onLoad={configure}
      className="hero-adoption-frame"
      title={title}
      src={`/hero-adoption-preview/index.html?host=${host}&integration=${id}&mode=${mode}`}
    />
  );
}

function Study({ library, mode, setMode }) {
  const study = studies[library];
  const cases = casesFor(library, study);
  const [highlight, setHighlight] = useState(true);
  const [role, setRole] = useState('editor');
  const [reports, setReports] = useState({});
  const receiveReport = useCallback((id, report) => {
    setReports((current) => ({ ...current, [id]: report }));
  }, []);
  const baselineMatches =
    cases.every(({ id }) => reports[id]?.before) &&
    cases.every(
      ({ id }) =>
        JSON.stringify(reports[id].before) ===
        JSON.stringify(reports.before.before)
    );
  return (
    <section
      className="hero-adoption-study"
      aria-label={`${library} incremental adoption comparison`}
    >
      <div className="hero-adoption-intro">
        <div>
          <h2 className="nx:typography-heading-xsmall">
            Add one component. Keep everything else.
          </h2>
          <p className="nx:typography-body-small">
            The same {library} workspace. The same new role selector. Two ways
            to bring it in.
          </p>
        </div>
        <div className="hero-adoption-options">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="hero-adoption-mode">Mode</FieldLabel>
            <NativeSelect
              id="hero-adoption-mode"
              size="sm"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <NativeSelectOption value="dark">Dark</NativeSelectOption>
              <NativeSelectOption value="light">Light</NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field orientation="horizontal">
            <Switch
              id="hero-adoption-highlight"
              checked={highlight}
              onCheckedChange={setHighlight}
            />
            <FieldLabel htmlFor="hero-adoption-highlight">
              Highlight changes
            </FieldLabel>
          </Field>
        </div>
      </div>
      <div className="hero-adoption-cases">
        {cases.map(({ id, number, title, subtitle }) => {
          const report = reports[id];
          const changed = report?.changes?.length ?? 0;
          return (
            <article
              className="hero-adoption-case"
              key={id}
              data-result={
                report?.changes ? (changed ? 'changed' : 'intact') : 'pending'
              }
            >
              <header>
                <span className="nx:typography-label-caps">{number}</span>
                <div>
                  <h3 className="nx:typography-label-small">{title}</h3>
                  <p className="nx:typography-body-small">{subtitle}</p>
                </div>
              </header>
              <div className="hero-adoption-frame-shell">
                <ComparisonFrame
                  host={study.host}
                  id={id}
                  title={title}
                  mode={mode}
                  highlight={highlight}
                  role={role}
                  onRoleChange={setRole}
                  onReport={receiveReport}
                />
              </div>
              <div
                className="hero-adoption-result nx:typography-body-small"
                role="status"
              >
                <span className="hero-adoption-result-dot" aria-hidden="true" />
                {!report
                  ? 'Measuring host styles…'
                  : report.error
                    ? 'Preview failed to load'
                    : id === 'before'
                      ? 'Original workspace'
                      : changed
                        ? `${changed} of ${report.total} host elements changed`
                        : `${report.total} of ${report.total} host elements unchanged`}
              </div>
              <p className="hero-adoption-outcome nx:typography-body-small">
                {report?.changes && outcome(id, study, changed)}
              </p>
            </article>
          );
        })}
      </div>
      <div className="hero-adoption-footnote nx:typography-body-small">
        <p>
          Both added Selects work. Choose a role in either one to update both.
        </p>
        <p>
          This tests default stylesheet imports after {library}. A scoped or
          customized {study.otherName} setup can avoid collisions.
        </p>
      </div>
      <details className="hero-adoption-evidence nx:typography-body-small">
        <summary>Inspect what changed and why</summary>
        <p>
          {baselineMatches
            ? 'All three frames started with identical sampled host styles.'
            : 'Waiting for matching baseline measurements.'}{' '}
          Each frame contains {library} and the added library in the same
          document. Frames separate the experiments from each other and from the
          dock; they do not isolate the added component from {library}.
        </p>
        <p>
          {study.cause}Nexus uses <code>--nx-*</code> tokens and{' '}
          <code>nx:</code> utilities. Its Select is mounted inside the Nexus
          Appearance Provider, with the same explicit mode and persistence
          disabled.
        </p>
        <p>
          Red outlines come from computed-style changes, not simulated breakage.
          We sample color, background, type and corners on eight host elements.
          This is a bounded demonstration, not a claim that all integrations
          break or that Nexus is immune to arbitrary global CSS.
        </p>
        <div className="hero-adoption-measurements">
          {cases
            .filter(({ id }) => id !== 'before')
            .map(({ id, title }) => (
              <section key={id}>
                <h3>{title}</h3>
                {!reports[id]?.changes ? (
                  <p>Measurements pending.</p>
                ) : reports[id].changes.length === 0 ? (
                  <p>No differences in the sampled host styles.</p>
                ) : (
                  reports[id].changes.map((change) => (
                    <div className="hero-adoption-measurement" key={change.id}>
                      <strong>{change.label}</strong>
                      {change.properties.map((property) => (
                        <p key={property.property}>
                          <code>{property.property}</code>:{' '}
                          <code>{property.before}</code> →{' '}
                          <code>{property.after}</code>
                        </p>
                      ))}
                    </div>
                  ))
                )}
              </section>
            ))}
        </div>
        <p>
          Uses {study.sources}, and Nexus source from this checkout.{' '}
          {study.links.map(([label, href], index) => (
            <span key={href}>
              {index > 0 && ' · '}
              <a href={href} target="_blank" rel="noreferrer">
                {label}
              </a>
            </span>
          ))}
        </p>
      </details>
    </section>
  );
}

export function HeroAdoptionStudy({ library = 'HeroUI' }) {
  const [mode, setMode] = useState('dark');
  return (
    <Study
      key={`${library}-${mode}`}
      library={library}
      mode={mode}
      setMode={setMode}
    />
  );
}
