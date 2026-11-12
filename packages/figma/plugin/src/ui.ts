// The plugin's UI iframe: the only part of a plugin that can reach the
// network. It fetches the capture from nxds-cli, hands it to the builder, and
// posts the builder's report back.
import { LINK_PORT } from '../../src/port.ts';
import type { BuildReport } from '../../src/spec.ts';

const base = `http://localhost:${LINK_PORT}`;
const status = document.getElementById('status') as HTMLParagraphElement;
const retry = document.getElementById('retry') as HTMLButtonElement;
const reportBox = document.getElementById('report') as HTMLTextAreaElement;

const post = (message: unknown) =>
  parent.postMessage({ pluginMessage: message }, '*');

function summary(report: BuildReport) {
  const { created } = report;
  return `Built ${created.componentSets} component sets and ${created.components} components with ${created.variables} variables. ${report.failures.length} steps failed.`;
}

async function start() {
  retry.hidden = true;
  status.textContent = `Fetching the capture from ${base}…`;
  let capture: unknown;
  try {
    const response = await fetch(`${base}/capture`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    capture = await response.json();
  } catch {
    status.textContent = `Couldn't reach nxds-cli on ${base}. Run \`nxds-cli export figma\`, wait until it says it's waiting for the plugin, then retry.`;
    retry.hidden = false;
    return;
  }
  status.textContent = 'Building…';
  post({ type: 'capture', capture });
}

async function deliver(report: BuildReport) {
  const done = summary(report);
  status.textContent = `${done} Sending the report to nxds-cli…`;
  try {
    const response = await fetch(`${base}/report`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(report),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch {
    status.textContent = `${done} The report couldn't reach nxds-cli, so here it is. Close the plugin when you've copied it.`;
    reportBox.value = JSON.stringify(report, null, 2);
    reportBox.hidden = false;
    return;
  }
  post({ type: 'posted', summary: done });
}

window.onmessage = (
  event: MessageEvent<{
    pluginMessage?: { type: string; text?: string; report?: BuildReport };
  }>
) => {
  const message = event.data.pluginMessage;
  if (message?.type === 'progress' && message.text)
    status.textContent = message.text;
  if (message?.type === 'report' && message.report)
    void deliver(message.report);
};

retry.onclick = () => void start();
void start();
