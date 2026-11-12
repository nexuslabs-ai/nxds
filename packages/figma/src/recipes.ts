// What each component becomes in Figma: its variant properties, the states it
// is captured in, its optional parts and text, and the tree each variant
// renders. A variant property that maps to a prop takes its values from the
// release's components/index.d.ts, so a recipe never lists them.
import type { PartTree } from './page.ts';

/** A variant property. `prop` takes its values from index.d.ts, the default first; `values` lists them for a property no single prop has. */
export type Axis =
  | { name: string; prop: string }
  | { name: string; values: readonly string[] };

/** How a state is shown: props on the root, or pseudo-classes forced on it. */
export const FORCED: Readonly<Record<string, readonly string[]>> = {
  hover: ['hover'],
  pressed: ['hover', 'active'],
  focus: ['focus', 'focus-visible'],
};

export interface Recipe {
  name: string;
  /** The root's `data-slot`. Another recipe that renders it gets an instance of this component. */
  slot: string;
  axes: readonly Axis[];
  /** The State values, the default first. Empty when the component has no states. */
  states: readonly string[];
  /** Root width for a component that fills its container. */
  width?: number;
  /** Optional parts, by selector inside the capture wrapper. Each becomes a boolean property. */
  parts: readonly { selector: string; name: string; default: boolean }[];
  /** Elements whose own text becomes a text property. */
  texts: readonly { selector: string; name: string }[];
  /** The tree for one variant. `full` adds the parts that are off by default, so the layers exist to toggle. */
  render(
    values: Record<string, string>,
    state: string,
    full: boolean
  ): PartTree;
  /** An instance's variant, from its root's attributes. */
  instanceVariant?(attributes: Record<string, string>): Record<string, string>;
}

const icon = (name: string) => ({ __icon: name });

const isIconSize = (size: string | undefined) =>
  size?.startsWith('icon') ?? false;

const button: Recipe = {
  name: 'Button',
  slot: 'button',
  axes: [
    { name: 'Variant', prop: 'variant' },
    { name: 'Size', prop: 'size' },
  ],
  states: ['default', 'hover', 'pressed', 'focus', 'disabled', 'loading'],
  parts: [
    {
      selector: '[data-slot=button-start-icon]',
      name: 'Start icon',
      default: false,
    },
    {
      selector: '[data-slot=button-end-icon]',
      name: 'End icon',
      default: false,
    },
  ],
  texts: [
    { selector: '[data-slot=button]', name: 'Label' },
    { selector: '[data-slot=button-loading-label]', name: 'Label' },
  ],
  render({ Variant, Size }, state, full) {
    const props: Record<string, unknown> = { variant: Variant, size: Size };
    if (state === 'disabled') props['disabled'] = true;
    if (state === 'loading') props['loading'] = true;
    if (isIconSize(Size)) {
      return {
        part: 'Button',
        props: { ...props, 'aria-label': 'Add' },
        children: [{ part: 'Icon', props: { name: 'plus' } }],
      };
    }
    if (full) {
      props['startIcon'] = icon('plus');
      props['endIcon'] = icon('arrow-right');
    }
    return { part: 'Button', props, children: ['Button'] };
  },
  instanceVariant(attributes) {
    const state =
      attributes['data-loading'] !== undefined
        ? 'loading'
        : attributes['disabled'] !== undefined
          ? 'disabled'
          : 'default';
    return {
      Variant: attributes['data-variant'] ?? 'default',
      Size: attributes['data-size'] ?? 'default',
      State: state,
    };
  },
};

const input: Recipe = {
  name: 'Input',
  slot: 'input',
  axes: [
    { name: 'Variant', prop: 'variant' },
    { name: 'Size', prop: 'size' },
  ],
  states: ['default', 'hover', 'focus', 'filled', 'disabled', 'invalid'],
  width: 280,
  parts: [],
  texts: [{ selector: '[data-slot=input]', name: 'Text' }],
  render({ Variant, Size }, state) {
    const props: Record<string, unknown> = {
      variant: Variant,
      size: Size,
      placeholder: 'you@example.com',
      'aria-label': 'Email',
    };
    if (state === 'filled') props['defaultValue'] = 'ada@example.com';
    if (state === 'disabled') props['disabled'] = true;
    if (state === 'invalid') props['aria-invalid'] = true;
    return { part: 'Input', props };
  },
};

const badge: Recipe = {
  name: 'Badge',
  slot: 'badge',
  axes: [
    { name: 'Variant', prop: 'variant' },
    { name: 'Fill', prop: 'fill' },
    { name: 'Caps', values: ['true', 'false'] },
  ],
  states: [],
  parts: [
    {
      selector: '[data-slot=badge] > span:first-child',
      name: 'Left icon',
      default: false,
    },
    {
      selector: '[data-slot=badge] > span:last-child',
      name: 'Right icon',
      default: false,
    },
  ],
  texts: [{ selector: '[data-slot=badge]', name: 'Label' }],
  render({ Variant, Fill, Caps }, _state, full) {
    const props: Record<string, unknown> = {
      variant: Variant,
      fill: Fill,
      isCaps: Caps === 'true',
    };
    if (full) {
      props['leftIcon'] = icon('check');
      props['rightIcon'] = icon('x');
    }
    return { part: 'Badge', props, children: ['Badge'] };
  },
};

const switchRecipe: Recipe = {
  name: 'Switch',
  slot: 'switch',
  axes: [
    { name: 'Size', prop: 'size' },
    { name: 'Checked', values: ['false', 'true'] },
  ],
  states: ['default', 'hover', 'focus', 'disabled'],
  parts: [],
  texts: [],
  render({ Size, Checked }, state) {
    return {
      part: 'Switch',
      props: {
        size: Size,
        defaultChecked: Checked === 'true',
        disabled: state === 'disabled',
        'aria-label': 'Notifications',
      },
    };
  },
};

const alert: Recipe = {
  name: 'Alert',
  slot: 'alert',
  axes: [
    { name: 'Variant', prop: 'variant' },
    { name: 'Presentation', prop: 'presentation' },
    { name: 'Layout', prop: 'layout' },
  ],
  states: [],
  width: 480,
  parts: [
    { selector: '[data-slot=alert-icon]', name: 'Icon', default: true },
    {
      selector: '[data-slot=alert-description]',
      name: 'Description',
      default: true,
    },
    { selector: '[data-slot=alert-actions]', name: 'Actions', default: true },
  ],
  texts: [
    { selector: '[data-slot=alert-title]', name: 'Title' },
    { selector: '[data-slot=alert-description]', name: 'Description text' },
  ],
  render({ Variant, Presentation, Layout }) {
    const props = {
      variant: Variant,
      presentation: Presentation,
      layout: Layout,
    };
    const title = {
      part: 'AlertTitle',
      children: ['Your trial ends in 3 days'],
    };
    const description = {
      part: 'AlertDescription',
      children: ['Upgrade to keep your projects and team seats.'],
    };
    const alertIcon = {
      part: 'AlertIcon',
      children: [{ part: 'Icon', props: { name: 'info' } }],
    };
    if (Layout === 'inline') {
      return {
        part: 'Alert',
        props,
        children: [
          alertIcon,
          { part: 'AlertContent', children: [title, description] },
          {
            part: 'AlertActions',
            children: [
              {
                part: 'Button',
                props: { variant: 'outline' },
                children: ['Upgrade'],
              },
              { part: 'AlertClose' },
            ],
          },
        ],
      };
    }
    return {
      part: 'Alert',
      props,
      children: [
        alertIcon,
        title,
        description,
        {
          part: 'AlertActions',
          children: [
            {
              part: 'Button',
              props: { variant: 'outline' },
              children: ['Upgrade'],
            },
          ],
        },
      ],
    };
  },
};

const card: Recipe = {
  name: 'Card',
  slot: 'card',
  axes: [],
  states: [],
  width: 360,
  parts: [
    {
      selector: '[data-slot=card-description]',
      name: 'Description',
      default: true,
    },
    { selector: '[data-slot=card-action]', name: 'Action', default: true },
    { selector: '[data-slot=card-content]', name: 'Content', default: true },
    { selector: '[data-slot=card-footer]', name: 'Footer', default: true },
  ],
  texts: [
    { selector: '[data-slot=card-title]', name: 'Title' },
    { selector: '[data-slot=card-description]', name: 'Description text' },
    { selector: '[data-slot=card-content] > p', name: 'Content text' },
  ],
  render() {
    return {
      part: 'Card',
      children: [
        {
          part: 'CardHeader',
          children: [
            { part: 'CardTitle', children: ['Team plan'] },
            {
              part: 'CardDescription',
              children: ['Billed monthly. Cancel anytime.'],
            },
            {
              part: 'CardAction',
              children: [
                {
                  part: 'Button',
                  props: { size: 'sm', variant: 'outline' },
                  children: ['Edit'],
                },
              ],
            },
          ],
        },
        {
          part: 'CardContent',
          children: [
            {
              part: 'p',
              props: { className: 'nx:m-0 nx:typography-body-default' },
              children: [
                '8 of 10 seats used. Invite two more people before your next bill.',
              ],
            },
          ],
        },
        {
          part: 'CardFooter',
          children: [
            {
              part: 'Button',
              props: { variant: 'outline' },
              children: ['Cancel'],
            },
            { part: 'Button', children: ['Upgrade'] },
          ],
        },
      ],
    };
  },
};

/** In build order: a component comes after every component it holds an instance of. */
export const RECIPES: readonly Recipe[] = [
  button,
  input,
  badge,
  switchRecipe,
  alert,
  card,
];
