import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import './workspace.css';

const hosts = {
  heroui: () => import('./hosts/heroui'),
  mui: () => import('./hosts/mui'),
  antd: () => import('./hosts/antd'),
  shadcn: () => import('./hosts/shadcn'),
};
const additions = {
  shadcn: () => import('./ShadcnAddition'),
  heroui: () => import('./HeroUIAddition'),
  nexus: () => import('./NexusAddition'),
};

const params = new URLSearchParams(location.search);
const host = Object.hasOwn(hosts, params.get('host'))
  ? params.get('host')
  : 'heroui';
const integration = Object.hasOwn(additions, params.get('integration'))
  ? params.get('integration')
  : 'before';
const mode = params.get('mode') === 'light' ? 'light' : 'dark';
const channel = 'nexus-hero-adoption-v1';
document.documentElement.classList.toggle('dark', mode === 'dark');
document.documentElement.style.colorScheme = mode;
document.documentElement.dataset.highlight = 'true';

const probes = [
  [
    'workspace',
    'Workspace surface',
    ['backgroundColor', 'color', 'fontFamily'],
  ],
  ['title', 'Workspace title', ['color', 'fontSize', 'fontWeight']],
  ['badge', 'Pro badge', ['backgroundColor', 'color']],
  ['usage', 'Usage card', ['backgroundColor', 'borderRadius']],
  ['description', 'Usage description', ['color', 'fontSize']],
  ['progress', 'Usage accent', ['backgroundColor']],
  ['note', 'Available seats', ['color']],
  ['invite', 'Invite button', ['backgroundColor', 'color', 'borderRadius']],
];

const { Workspace, probeSelectors = {} } = await hosts[host]();

function probeNode(id) {
  return document.querySelector(probeSelectors[id] ?? `[data-probe="${id}"]`);
}

function measure() {
  return probes.map(([id, label, properties]) => {
    const style = getComputedStyle(probeNode(id));
    return {
      id,
      label,
      styles: Object.fromEntries(
        properties.map((property) => [property, style[property]])
      ),
    };
  });
}

async function settle() {
  await document.fonts.ready;
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
  const finite = document
    .getAnimations()
    .filter(
      (animation) => animation.effect?.getTiming().iterations !== Infinity
    );
  await Promise.allSettled(finite.map((animation) => animation.finished));
  await new Promise(requestAnimationFrame);
}

const root = createRoot(document.getElementById('root'));
let Addition;
let role = 'editor';
let report;
function render() {
  flushSync(() =>
    root.render(
      <Workspace
        Addition={Addition}
        role={role}
        onRoleChange={changeRole}
        mode={mode}
      />
    )
  );
}
function send(type, data = {}) {
  window.parent.postMessage(
    { channel, host, integration, mode, type, ...data },
    window.location.origin
  );
}
function changeRole(value) {
  role = value;
  render();
  send('role', { role });
}
window.addEventListener('message', (event) => {
  if (
    event.source !== window.parent ||
    event.origin !== location.origin ||
    event.data?.channel !== channel
  )
    return;
  const data = event.data;
  if (data.type !== 'configuration') return;
  document.documentElement.dataset.highlight = String(data.highlight);
  if (['viewer', 'editor', 'admin'].includes(data.role)) {
    role = data.role;
    render();
  }
  if (report) send('report', { report });
});

render();
await settle();
const before = measure();
try {
  if (integration !== 'before') ({ Addition } = await additions[integration]());
  render();
  await settle();
  const after = measure();
  const changes = after.flatMap((probe, index) => {
    const properties = Object.entries(probe.styles)
      .filter(([key, value]) => before[index].styles[key] !== value)
      .map(([property, value]) => ({
        property,
        before: before[index].styles[property],
        after: value,
      }));
    return properties.length
      ? [{ id: probe.id, label: probe.label, properties }]
      : [];
  });
  for (const change of changes) probeNode(change.id).dataset.changed = 'true';
  report = { before, after, changes, total: probes.length };
  document.documentElement.dataset.ready = 'true';
  send('report', { report });
} catch (error) {
  document.documentElement.dataset.ready = 'error';
  send('error', { message: error.message });
}
