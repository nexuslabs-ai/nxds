import type * as ReactModule from 'react';

import { iconSet } from '../../src/icon-set.ts';

import {
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  type PageGlobals,
} from './harness.ts';

// Every icon name the README lists draws an svg.
export async function checkIcons() {
  const { page, problems } = await openPage('Button', LIGHT);
  const names = iconSet().map(({ name }) => name);
  const missing = await page.evaluate((names) => {
    const { React, ReactDOM, Nxds } = window as unknown as PageGlobals;
    const host = document.createElement('div');
    document.body.append(host);
    const root = ReactDOM.createRoot(host);
    ReactDOM.flushSync(() =>
      root.render(
        React.createElement(
          React.Fragment,
          null,
          ...names.map((name) =>
            React.createElement(
              'span',
              { key: name, 'data-name': name },
              React.createElement(Nxds['Icon'] as ReactModule.ElementType, {
                name,
              })
            )
          )
        )
      )
    );
    const drawn = names.filter((name) =>
      host.querySelector(`[data-name="${name}"] svg path`)
    );
    root.unmount();
    host.remove();
    return names.filter((name) => !drawn.includes(name));
  }, names);
  failOnProblems('icons', problems, false);
  for (const name of missing) fail(`Icon: "${name}" draws no svg.`);
  await page.close();
  return names.length;
}
