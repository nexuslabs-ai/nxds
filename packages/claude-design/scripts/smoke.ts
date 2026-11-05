// Exports dist/ with the built nxds-cli from a local npm registry, the way a
// user gets a release (smoke/release.ts), then loads the exported project/ the
// way a Design canvas does — React 18.3.1 as page
// globals, then exactly the files the README's "On a Design canvas" section
// links, in its order — and fails on anything a viewer would see break: a
// preview that renders nothing or logs an error in either theme, a theme
// switch that changes nothing, an overlay that doesn't open, close and return
// focus, a token or preset that doesn't reach a component, a tree or overlay
// that changes when each part sits in a canvas wrapper, a sampler artboard
// that logs a problem or doesn't fill its board, or a request to the network.
// Then it exports the release again with every theme flag set, and checks
// that the theme reaches the components, the presets and the sampler, and
// once more with spacious density and 20px text for the sampler alone. Each
// check lives in scripts/smoke/.
import { FULL_THEME } from './full-theme.ts';
import { ATTRIBUTE_CASES, checkAttributes } from './smoke/attributes.ts';
import { BAD_INPUT_CASES, checkBadInput } from './smoke/bad-input.ts';
import { checkCards } from './smoke/cards.ts';
import { checkExamples } from './smoke/examples.ts';
import { checkExports } from './smoke/exports.ts';
import { closeCanvas, failures, openCanvas } from './smoke/harness.ts';
import { checkIcons } from './smoke/icons.ts';
import { checkOverlays, OVERLAYS } from './smoke/overlays.ts';
import { checkPresets, PRESET_CASES } from './smoke/presets.ts';
import { checkRecharts, RECHARTS_CASES } from './smoke/recharts.ts';
import { checkRefs } from './smoke/refs.ts';
import { exportRelease } from './smoke/release.ts';
import { checkRuntimeLayer } from './smoke/runtime-layer.ts';
import { checkSampler } from './smoke/sampler.ts';
import { checkSearch, SEARCH_CASES } from './smoke/search.ts';
import { checkTheme } from './smoke/theme.ts';
import { checkThemes } from './smoke/themes.ts';
import { checkTimeZone } from './smoke/time-zone.ts';
import { checkToasts, checkToastStack, TOAST_CASES } from './smoke/toasts.ts';
import { checkTokens, TOKEN_CASES } from './smoke/tokens.ts';
import { checkWrapped, WRAPPED_CASES } from './smoke/wrapped.ts';
import {
  checkWrappedOverlays,
  WRAPPED_OVERLAYS,
} from './smoke/wrapped-overlays.ts';

await openCanvas(await exportRelease());
const cardCount = await checkCards();
await checkThemes();
await checkOverlays();
await checkWrappedOverlays();
await checkWrapped();
const exampleCount = await checkExamples();
await checkAttributes();
await checkBadInput();
await checkSearch();
await checkTimeZone();
const iconCount = await checkIcons();
await checkToasts();
await checkToastStack();
await checkRecharts();
await checkRefs();
await checkExports();
await checkTokens();
await checkPresets();
await checkRuntimeLayer();
await checkSampler();
await checkTheme();

await openCanvas(
  await exportRelease(
    Object.entries(FULL_THEME).map(([flag, value]) => `--${flag}=${value}`)
  )
);
await checkThemes();
await checkTokens();
await checkPresets();
await checkTheme();
await checkSampler({ themed: true });

// The largest text the sampler fits without a sideways scroll.
await openCanvas(await exportRelease(['--density=spacious', '--font-size=20']));
await checkSampler({ themed: true });
await closeCanvas();

if (failures.length > 0) {
  console.error(
    `Smoke test failed:\n${failures.map((failure) => `  ${failure}`).join('\n')}`
  );
  process.exit(1);
}
console.log(
  `Smoke test passed: ${cardCount} cards in two themes, ${OVERLAYS.length} overlays, ${WRAPPED_CASES.length} trees and ${WRAPPED_OVERLAYS.length} overlays through canvas wrappers, ${exampleCount} README examples, ${ATTRIBUTE_CASES.length} attribute conversions, ${BAD_INPUT_CASES.length} bad attributes, ${SEARCH_CASES.length} list searches, ${iconCount} icons, ${TOAST_CASES.length} toasts against toast(), ${RECHARTS_CASES.length} custom charts, ${TOKEN_CASES.length} token overrides, ${PRESET_CASES.length} preset attributes, and the sampler artboard in both modes, then a themed export through the themes, tokens, presets, theme and sampler checks, and the sampler at 20px text.`
);
