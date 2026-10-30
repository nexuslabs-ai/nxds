import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  fail,
  LIGHT,
  openPage,
  type PageGlobals,
  projectDir,
} from './harness.ts';

export async function checkExports() {
  const { page } = await openPage('Button', LIGHT);
  const types = readFileSync(
    path.join(projectDir, 'components', 'index.d.ts'),
    'utf8'
  );
  const names = [...types.matchAll(/export interface (\w+)Props\b/g)].map(
    (match) => match[1] ?? ''
  );
  const missing = await page.evaluate((list) => {
    const { Nxds } = window as unknown as PageGlobals;
    // The canvas finds Nxds.Recharts.Bar's props as RechartsBarProps.
    const recharts = Nxds['Recharts'] as Record<string, unknown>;
    return list.filter(
      (name) => !(Nxds[name] ?? recharts[name.replace(/^Recharts/, '')])
    );
  }, names);
  for (const name of missing)
    fail(`index.d.ts declares ${name}Props, but window.Nxds has no ${name}.`);
  await page.close();
}
