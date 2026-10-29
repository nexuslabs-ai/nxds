import type * as ReactModule from 'react';

import { fail, LIGHT, openPage, type PageGlobals } from './harness.ts';

export async function checkRefs() {
  const { page } = await openPage('Button', LIGHT);
  const reached = await page.evaluate(() => {
    const { React, ReactDOM, Nxds } = window as unknown as PageGlobals;
    const results: Record<string, boolean> = {};
    for (const [name, element] of [
      ['Button', HTMLButtonElement],
      ['Input', HTMLInputElement],
    ] as const) {
      const ref = React.createRef<HTMLElement>();
      const host = document.createElement('div');
      document.body.append(host);
      const root = ReactDOM.createRoot(host);
      ReactDOM.flushSync(() =>
        root.render(
          React.createElement(Nxds[name] as ReactModule.ElementType, { ref })
        )
      );
      results[name] = ref.current instanceof element;
    }
    return results;
  });
  for (const [name, ok] of Object.entries(reached)) {
    if (!ok) fail(`${name}: its ref didn't reach the DOM element.`);
  }
  await page.close();
}
