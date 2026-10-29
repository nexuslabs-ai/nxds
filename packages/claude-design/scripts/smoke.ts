// Loads dist/project the way a Design canvas does — React 18.3.1 as page
// globals, then exactly the files the README's "On a Design canvas" section
// links, in its order — and fails on anything a viewer would see break: a
// preview that renders nothing or logs an error in either theme, a theme
// switch that changes nothing, an overlay that doesn't open, close and return
// focus, a token or preset that doesn't reach a component, a tree or overlay
// that changes when each part sits in a canvas wrapper, or a request to the
// network. Each check lives in scripts/smoke/.
import { ATTRIBUTE_CASES, checkAttributes } from './smoke/attributes.ts';
import { BAD_INPUT_CASES, checkBadInput } from './smoke/bad-input.ts';
import { checkCards } from './smoke/cards.ts';
import { checkExamples } from './smoke/examples.ts';
import { checkExports } from './smoke/exports.ts';
import { browser, failures } from './smoke/harness.ts';
import { checkIcons } from './smoke/icons.ts';
import { checkOverlays, OVERLAYS } from './smoke/overlays.ts';
import { checkPresets, PRESET_CASES } from './smoke/presets.ts';
import { checkRecharts, RECHARTS_CASES } from './smoke/recharts.ts';
import { checkRefs } from './smoke/refs.ts';
import { checkRuntimeLayer } from './smoke/runtime-layer.ts';
import { checkThemes } from './smoke/themes.ts';
import { checkTimeZone } from './smoke/time-zone.ts';
import { checkToasts, checkToastStack, TOAST_CASES } from './smoke/toasts.ts';
import { checkTokens, TOKEN_CASES } from './smoke/tokens.ts';
import { checkWrapped, WRAPPED_CASES } from './smoke/wrapped.ts';
import {
  checkWrappedOverlays,
  WRAPPED_OVERLAYS,
} from './smoke/wrapped-overlays.ts';

const cardCount = await checkCards();
await checkThemes();
await checkOverlays();
await checkWrappedOverlays();
await checkWrapped();
const exampleCount = await checkExamples();
await checkAttributes();
await checkBadInput();
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
await browser.close();

if (failures.length > 0) {
  console.error(
    `Smoke test failed:\n${failures.map((failure) => `  ${failure}`).join('\n')}`
  );
  process.exit(1);
}
console.log(
  `Smoke test passed: ${cardCount} cards in two themes, ${OVERLAYS.length} overlays, ${WRAPPED_CASES.length} trees and ${WRAPPED_OVERLAYS.length} overlays through canvas wrappers, ${exampleCount} README examples against their stories, ${ATTRIBUTE_CASES.length} attribute conversions, ${BAD_INPUT_CASES.length} bad attributes, ${iconCount} icons, ${TOAST_CASES.length} toasts against toast(), ${RECHARTS_CASES.length} custom charts, ${TOKEN_CASES.length} token overrides, ${PRESET_CASES.length} preset attributes.`
);
