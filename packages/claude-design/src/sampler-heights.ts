// How tall the sampler board is at each setting, as scripts/smoke/sampler.ts
// measures it. When a height is off, the smoke test prints the line to paste.
import type {
  NxdsDensity,
  NxdsStroke,
  NxdsTextSize,
  NxdsUiScale,
} from '@nxds/core';

// How much taller the sampler is at each UI scale, text size and density than
// at the Default scale, 14px text and Default density, at normal stroke, on
// the board `themedBoard` sizes for it. Text size and density don't add up,
// because controls keep a min-height that grows with density.
export const SAMPLER_EXTRA_HEIGHT: Record<
  NxdsUiScale,
  Record<NxdsTextSize, Record<NxdsDensity, number>>
> = {
  small: {
    12: {
      tight: -324,
      compact: -271,
      default: -245,
      comfortable: -192,
      relaxed: -155,
      spacious: -87,
    },
    13: {
      tight: -290,
      compact: -237,
      default: -211,
      comfortable: -158,
      relaxed: -121,
      spacious: -65,
    },
    14: {
      tight: -238,
      compact: -185,
      default: -159,
      comfortable: -106,
      relaxed: -69,
      spacious: -15,
    },
    15: {
      tight: -228,
      compact: -175,
      default: -149,
      comfortable: -96,
      relaxed: -59,
      spacious: -5,
    },
    16: {
      tight: -176,
      compact: -123,
      default: -97,
      comfortable: -44,
      relaxed: -7,
      spacious: 47,
    },
  },
  default: {
    12: {
      tight: -152,
      compact: -99,
      default: -62,
      comfortable: -9,
      relaxed: 28,
      spacious: 81,
    },
    13: {
      tight: -142,
      compact: -89,
      default: -52,
      comfortable: 1,
      relaxed: 38,
      spacious: 91,
    },
    14: {
      tight: -90,
      compact: -37,
      default: 0,
      comfortable: 53,
      relaxed: 90,
      spacious: 143,
    },
    15: {
      tight: -38,
      compact: 15,
      default: 52,
      comfortable: 105,
      relaxed: 142,
      spacious: 195,
    },
    16: {
      tight: -28,
      compact: 25,
      default: 62,
      comfortable: 115,
      relaxed: 152,
      spacious: 205,
    },
  },
  large: {
    12: {
      tight: -4,
      compact: 59,
      default: 97,
      comfortable: 149,
      relaxed: 187,
      spacious: 261,
    },
    13: {
      tight: 30,
      compact: 93,
      default: 131,
      comfortable: 183,
      relaxed: 221,
      spacious: 295,
    },
    14: {
      tight: 58,
      compact: 121,
      default: 159,
      comfortable: 211,
      relaxed: 249,
      spacious: 323,
    },
    15: {
      tight: 112,
      compact: 175,
      default: 213,
      comfortable: 265,
      relaxed: 303,
      spacious: 377,
    },
    16: {
      tight: 148,
      compact: 211,
      default: 249,
      comfortable: 301,
      relaxed: 339,
      spacious: 413,
    },
  },
  larger: {
    12: {
      tight: 214,
      compact: 268,
      default: 304,
      comfortable: 358,
      relaxed: 430,
      spacious: 500,
    },
    13: {
      tight: 270,
      compact: 324,
      default: 360,
      comfortable: 414,
      relaxed: 486,
      spacious: 556,
    },
    14: {
      tight: 308,
      compact: 362,
      default: 398,
      comfortable: 452,
      relaxed: 524,
      spacious: 594,
    },
    15: {
      tight: 362,
      compact: 416,
      default: 452,
      comfortable: 506,
      relaxed: 578,
      spacious: 648,
    },
    16: {
      tight: 420,
      compact: 474,
      default: 510,
      comfortable: 564,
      relaxed: 636,
      spacious: 706,
    },
  },
};

// How much taller the sampler is at each stroke than at normal stroke. Border
// widths don't follow the UI scale, text size or density, so one row holds
// for every scale, text size and density.
export const SAMPLER_STROKE_HEIGHT: Record<NxdsStroke, number> = {
  fine: -1,
  normal: 0,
  strong: 14,
};
