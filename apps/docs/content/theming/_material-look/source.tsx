import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { SourceFile } from '../../../app/_components/ComponentInstallation';

const FOLDER = 'content/theming/_material-look';

/** Where each file of the example lives in an app's nxds folder. */
const APP_PATHS = {
  'button-variants.ts': 'components/nxds/components/button/button-variants.ts',
  'button.tsx': 'components/nxds/components/button/button.tsx',
  'input.tsx': 'components/nxds/components/input/input.tsx',
} as const;

/**
 * A file of the Material look, as it sits in an app. The docs build nxds parts
 * from source through `@/`, so the page shows those imports as the relative
 * ones an app's copy has.
 */
export async function MaterialLookSource({
  file,
}: {
  file: keyof typeof APP_PATHS;
}) {
  const source = await readFile(path.join(process.cwd(), FOLDER, file), 'utf8');

  return (
    <SourceFile
      path={APP_PATHS[file]}
      source={source
        .replaceAll("'@/components/", "'../")
        .replaceAll("'@/lib/", "'../../lib/")}
    />
  );
}
