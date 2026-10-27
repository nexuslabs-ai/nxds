// Writes src/lib/token-scales.generated.ts: the spacing steps and palette
// names the runtime types are built from, read from the token JSON. `--check`
// fails instead of writing when the committed file is stale.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';

import { isPaletteShadeKey } from '../src/token-source/perceptual-grid.ts';
import { SPACING_MODE_FILE_PATTERN } from '../src/token-source/spacing.ts';

const CORE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SEMANTIC_DIR = path.join(CORE_DIR, 'tokens/semantic');
const COLOR_FILE = path.join(CORE_DIR, 'tokens/primitives/color.json');
const OUTPUT = path.join(CORE_DIR, 'src/lib/token-scales.generated.ts');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

// A JSON key spells a half step with `_` (`0_5`).
function spacingSteps() {
  const steps = new Set();
  for (const file of fs.readdirSync(SEMANTIC_DIR)) {
    if (!SPACING_MODE_FILE_PATTERN.test(file)) continue;
    const { spacing } = readJson(path.join(SEMANTIC_DIR, file));
    for (const key of Object.keys(spacing)) {
      steps.add(Number(key.replace('_', '.')));
    }
  }
  return [...steps].sort((a, b) => a - b);
}

// `white` and `black` hold alpha steps, not a shade ramp.
function paletteNames() {
  return Object.entries(readJson(COLOR_FILE))
    .filter(([, ramp]) => Object.keys(ramp).some(isPaletteShadeKey))
    .map(([name]) => name);
}

async function render() {
  const source = `// Generated from packages/core/tokens by scripts/generate-token-scales.js.
// Run \`pnpm --filter @nxds/core generate:scales\` after editing the tokens.

/** The spacing scale. Each step has its own \`--nx-spacing-*\` variable. */
export const SPACING_STEPS = ${JSON.stringify(spacingSteps())} as const;

/** A step on the spacing scale. */
export type SpacingStep = (typeof SPACING_STEPS)[number];

/** The primitive colour palettes that have a shade ramp. */
export const PRIMITIVE_PALETTE_NAMES = ${JSON.stringify(paletteNames())} as const;

export type PrimitivePaletteName = (typeof PRIMITIVE_PALETTE_NAMES)[number];
`;
  const config = await prettier.resolveConfig(OUTPUT);
  return prettier.format(source, { ...config, filepath: OUTPUT });
}

const next = await render();
const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8') : null;
const relative = path.relative(process.cwd(), OUTPUT);

if (process.argv.includes('--check')) {
  if (current !== next) {
    console.error(
      `${relative} is stale. Run \`pnpm --filter @nxds/core generate:scales\` and commit the result.`
    );
    process.exit(1);
  }
  console.log(`✓ ${relative} matches the tokens.`);
} else if (current !== next) {
  fs.writeFileSync(OUTPUT, next);
  console.log(`✓ Wrote ${relative}.`);
} else {
  console.log(`✓ ${relative} is up to date.`);
}
