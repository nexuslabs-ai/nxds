import { COLOR_FAMILIES } from '../lib/apca-pairs';
import { SEMANTIC_TOKEN_REGISTRY } from '../lib/token-registry';

type ColorFamily = (typeof COLOR_FAMILIES)[number];

const FAMILY_ROLES: Record<ColorFamily, string> = {
  primary: 'the main action on a surface',
  secondary: 'a supporting action beside a primary one',
  success: 'a completed or healthy state',
  warning: 'a state that needs attention soon',
  error: 'a failed, invalid or destructive state',
  information: 'neutral guidance or a status update',
};

function familyDescriptions(family: ColorFamily): [string, string][] {
  const role = FAMILY_ROLES[family];
  return [
    [
      `${family}-background`,
      `Solid fill for buttons, badges and other strong emphasis in this family. Pair with ${family}-foreground. Marks ${role}.`,
    ],
    [
      `${family}-background-hover`,
      `${family}-background while the pointer is over the control.`,
    ],
    [
      `${family}-background-active`,
      `${family}-background while the control is pressed.`,
    ],
    [
      `${family}-foreground`,
      `Foreground on ${family}-background. The surface relationship defines this role, not text alone: text and icons share it, and contrasting control parts or indicators may use it on the same surface. Other pairings require contrast coverage.`,
    ],
    [
      `${family}-disabled`,
      'Fill of a disabled control in this family. Pair with disabled-foreground.',
    ],
    [
      `${family}-subtle`,
      `Tinted fill for light badges, alerts and selected rows on background or container. Pair with ${family}-subtle-foreground. Marks ${role}.`,
    ],
    [
      `${family}-subtle-foreground`,
      `Foreground on ${family}-subtle. The surface relationship defines this role, not text alone: text and icons share it, and contrasting indicators may use it on that surface. Use on neutral surfaces only with contrast coverage for the intended content tier.`,
    ],
    [
      `${family}-subtle-hover`,
      `${family}-subtle while the pointer is over the control.`,
    ],
    [
      `${family}-subtle-active`,
      `${family}-subtle while the control is pressed.`,
    ],
    [
      `${family}-border`,
      'Border of an outlined control or alert in this family, on background or container.',
    ],
    [
      `${family}-border-active`,
      `${family}-border while the control is pressed or selected.`,
    ],
    [
      `border-${family}-active`,
      `${family}-border while the control is pressed or selected.`,
    ],
  ];
}

const NEUTRAL_DESCRIPTIONS: Record<string, string> = {
  background:
    'Page background, the base surface everything sits on. Pair with foreground.',
  'background-hover':
    'Row or ghost-control hover on background. Pair with foreground.',
  'background-active':
    'Row or ghost-control press and selection on background. Pair with foreground.',
  muted:
    'Quiet fill for wells, code, skeletons and inactive tracks on background. Pair with muted-foreground.',
  'muted-extralight':
    'Quietest muted surface — sits between background and muted for barely-there fills (empty states, subtle panels).',
  container:
    'Card and panel surface on background. Pair with container-foreground.',
  'container-hover': 'Row or control hover inside a container.',
  'container-active': 'Row or control press and selection inside a container.',
  popover:
    'Surface of menus, popovers, tooltips and dialogs. Pair with popover-foreground.',
  'popover-hover': 'Highlighted menu row inside a popover.',
  'popover-active': 'Pressed or checked menu row inside a popover.',
  'control-background':
    'Rail of neutral controls: switch tracks, slider tracks, segmented tabs. Also the hover fill on a neutral control rail.',
  'control-background-hover':
    'control-background while the pointer is over it.',
  'control-thumb': 'Thumb of switches and sliders, on control-background.',
  'nav-background': 'Sidebar and navigation surface. Pair with nav-foreground.',
  'nav-item-hover': 'Navigation item hover on nav-background.',
  'nav-item-active': 'Current navigation item on nav-background.',
  'nav-border': 'Border between the sidebar and the page, and inside it.',
  disabled:
    'Fill of a disabled neutral control or input. Pair with disabled-foreground.',
  'border-focus': 'Border of a focused input, on background or container.',
  foreground: 'Body text and icons on background, muted and the hover fills.',
  'container-foreground': 'Text and icons on container.',
  'popover-foreground': 'Text and icons on popover and its row fills.',
  'nav-foreground': 'Navigation text and icons on nav-background.',
  'muted-foreground':
    "It's a gray that softens contrast so primary content stands forward.",
  'nav-muted-foreground':
    'Secondary navigation text, such as group labels, on nav-background.',
  'muted-foreground-subtle':
    'Tertiary text tier below muted-foreground - helper text, captions, divider labels.',
  'disabled-foreground':
    'Text and icons of a disabled control, on disabled and the family disabled fills.',
  'border-default':
    'Default border of inputs, cards, tables and separators, on background or container.',
  'border-disabled': 'Border of a disabled control.',
  'border-hairline': 'Faint divider between rows and grouped items.',
  'chart-categorical-1':
    'First chart series, on container or background. Series colours stay in order.',
  'chart-categorical-2': 'Second chart series, on container or background.',
  'chart-categorical-3': 'Third chart series, on container or background.',
  'chart-categorical-4': 'Fourth chart series, on container or background.',
  'chart-categorical-5': 'Fifth chart series, on container or background.',
  'focus-default': 'Focus ring of every interactive control, on any surface.',
  'focus-error': 'Focus ring of an invalid control.',
  'background-hover-alpha':
    'Translucent hover fill for controls that sit on an image or an unknown surface.',
  'border-default-alpha':
    'Translucent border for controls that sit on an image or an unknown surface.',
  overlay: 'Scrim behind dialogs, sheets and drawers.',
  'popover-alpha': 'Translucent popover surface for frosted overlays.',
  'popover-backdrop': 'Backdrop behind a frosted popover.',
};

const REGISTRY_NAMES = new Set<string>(
  SEMANTIC_TOKEN_REGISTRY.map((token) => token.name)
);

/** Prose for derived colours, keyed by registry name. Authored leaves use `$description`. */
export const RUNTIME_COLOR_DESCRIPTIONS: Readonly<
  Partial<Record<string, string>>
> = Object.fromEntries(
  [
    ...Object.entries(NEUTRAL_DESCRIPTIONS),
    ...COLOR_FAMILIES.flatMap(familyDescriptions),
  ].filter(([name]) => REGISTRY_NAMES.has(name))
);
