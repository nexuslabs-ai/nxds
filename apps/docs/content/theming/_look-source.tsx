import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { SourceFile } from '../../app/_components/ComponentInstallation';

/** The looks with a page under Theming. Each keeps its files in `_{look}-look/`. */
type Look = 'material';

/**
 * A file of a look's example, as it sits in an app. A look keeps each part in
 * the folder an app's nxds folder has, so `file` is `button/button.tsx`. The
 * docs build nxds parts from source through `@/`, so the page shows those
 * imports as the relative ones an app's copy has.
 */
export async function LookSource({ look, file }: { look: Look; file: string }) {
  const source = await readFile(
    path.join(process.cwd(), 'content/theming', `_${look}-look`, file),
    'utf8'
  );

  return (
    <SourceFile
      path={`components/nxds/components/${file}`}
      source={source
        .replaceAll("'@/components/", "'../")
        .replaceAll("'@/lib/", "'../../lib/")}
    />
  );
}
