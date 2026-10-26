import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { SPACING_STEPS } from './spacing-scale';

const SEMANTIC_DIR = resolve(process.cwd(), 'packages/core/tokens/semantic');

const spacingFiles = readdirSync(SEMANTIC_DIR).filter((file) =>
  /^spacing-.+\.json$/.test(file)
);

describe('spacing scale', () => {
  it.each(spacingFiles)('lists every step %s declares', (file) => {
    const document = JSON.parse(
      readFileSync(join(SEMANTIC_DIR, file), 'utf8')
    ) as { spacing: Record<string, unknown> };
    // A JSON key spells a half step with `_` (`0_5`).
    const steps = Object.keys(document.spacing).map((key) =>
      Number(key.replace('_', '.'))
    );

    expect([...steps].sort((a, b) => a - b)).toEqual([...SPACING_STEPS]);
  });
});
