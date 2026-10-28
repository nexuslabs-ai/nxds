// The card and README for each part only the export ships (src/canvas/).
import { iconSet } from '../icon-set.ts';
import { previewHtml, propsSection } from '../previews.ts';
import type { FlatComponent } from '../props.ts';
import { NAMESPACE } from '../system-index.ts';

/** The icons the Icon card shows. */
const SHOWN = [
  'plus',
  'search',
  'settings',
  'bell',
  'user',
  'users',
  'mail',
  'calendar',
  'chart-bar',
  'file-text',
  'folder',
  'pencil',
  'trash',
  'download',
  'upload',
  'link',
  'filter',
  'check',
  'x',
  'alert-triangle',
  'info-circle',
  'lock',
  'home',
  'star',
  'brand-github',
  'brand-google',
];

// Plain script, run against the page's React and the bundle.
function iconScript() {
  return `(() => {
  const { React, ReactDOM, ${NAMESPACE} } = window;
  const h = React.createElement;
  const cells = ${JSON.stringify(SHOWN)}.map((name) =>
    h('figure', { key: name, style: { margin: 0, display: 'grid', justifyItems: 'center', gap: 'var(--nx-spacing-2)' } },
      h(${NAMESPACE}.Icon, { name, size: 20 }),
      h('figcaption', { className: 'typography-body-small', style: { color: 'var(--nx-color-muted-foreground)' } }, name)));
  ReactDOM.createRoot(document.getElementById('root')).render(
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 'var(--nx-spacing-4)' } }, cells));
})();`;
}

function iconReadme(part: FlatComponent) {
  const names = iconSet().map(({ name }) => name);
  return [
    '# Icon',
    '',
    `${part.description.split('`components/Icon/README.md`')[0]?.trim()}`,
    '',
    '## On the canvas',
    '',
    '```html',
    `<x-import component-from-global-scope="${NAMESPACE}.Icon" name="plus"></x-import>`,
    `<x-import component-from-global-scope="${NAMESPACE}.Button" start-icon="plus">Create project</x-import>`,
    '```',
    '',
    'Place an icon with `Nxds.Icon`, or name one on an icon prop: Button `start-icon` and `end-icon`, Badge `left-icon` and `right-icon`. Write the name as tabler.io lists it, in kebab-case. `Nxds.Icons.IconPlus` mounts the same icon as a component.',
    '',
    `## Names (${names.length})`,
    '',
    names.map((name) => `\`${name}\``).join(', '),
    '',
    ...propsSection([part]),
  ].join('\n');
}

const TOAST_EXAMPLE = [
  `<x-import component-from-global-scope="${NAMESPACE}.Toast" variant="success" title="Changes saved" description="Your profile is up to date."></x-import>`,
  `<x-import component-from-global-scope="${NAMESPACE}.Toast" title="Event has been created" description="Sunday, 1 March at 9:00" action="Undo"></x-import>`,
  `<x-import component-from-global-scope="${NAMESPACE}.Toast" variant="error" title="Something went wrong" cancel="Dismiss"></x-import>`,
].join('\n');

function toastScript() {
  return `(() => {
  const { React, ReactDOM, ${NAMESPACE} } = window;
  const h = React.createElement;
  ReactDOM.createRoot(document.getElementById('root')).render(
    h('div', { style: { display: 'grid', gap: 'var(--nx-spacing-3)' } },
      h(${NAMESPACE}.Toast, { variant: 'success', title: 'Changes saved', description: 'Your profile is up to date.' }),
      h(${NAMESPACE}.Toast, { title: 'Event has been created', description: 'Sunday, 1 March at 9:00', action: 'Undo' })));
})();`;
}

function toastReadme(part: FlatComponent) {
  return [
    '# Toast',
    '',
    part.description,
    '',
    '## On the canvas',
    '',
    '```html',
    TOAST_EXAMPLE,
    '```',
    '',
    'Each Toast sits where it is placed, the width of a toast. Stack several in a column with a gap to show a queue. Put one in a corner of the artboard to show where an app shows its toasts. `Nxds.Toaster` shows nothing on a static screen, because a toast needs a `toast()` call.',
    '',
    ...propsSection([part]),
  ].join('\n');
}

/** Each canvas part's files, by path under `components/`. */
export function canvasPartFiles(
  parts: readonly FlatComponent[],
  groups: ReadonlyMap<string, string>
): Record<string, string> {
  const icon = parts.find((part) => part.name === 'Icon');
  const toast = parts.find((part) => part.name === 'Toast');
  if (!icon || !toast) throw new Error('canvas parts: no Icon or Toast part.');
  return {
    'Toast/preview.html': previewHtml({
      name: 'Toast',
      group: groups.get('Toast') ?? '',
      script: toastScript(),
    }),
    'Toast/README.md': toastReadme(toast),
    'Icon/preview.html': previewHtml({
      name: 'Icon',
      group: groups.get('Icon') ?? '',
      script: iconScript(),
    }),
    'Icon/README.md': iconReadme(icon),
  };
}
