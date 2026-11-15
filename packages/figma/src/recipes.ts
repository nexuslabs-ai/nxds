// What each Figma component is. By default a component renders its card's
// README example from the release, its variant properties are the
// string-literal props of its part in index.d.ts, and it is captured from the
// element whose `data-slot` matches its name. An entry here only says what
// differs: a part captured on its own, an overlay to open, the states to
// capture, or markup when the example doesn't show the component well.
import type { ElementFacts, Override } from './page.ts';

export interface StateSpec {
  /** Props on the recipe's part, or on `on`. */
  props?: Record<string, unknown>;
  /** The part `props` go on, when it isn't the recipe's part. */
  on?: string;
  /** Pseudo-classes forced on the captured element. */
  pseudo?: readonly string[];
  /** Attributes set on the captured element after it mounts. */
  attributes?: Record<string, string>;
  /** Moves focus off whatever an overlay focused when it opened. */
  blur?: boolean;
}

export interface Axis {
  name: string;
  /** The prop it sets, on `part` (default: the recipe's part). Its values come from index.d.ts unless `values` lists them. */
  prop?: string;
  part?: string;
  values?: readonly string[];
  /** What each value sets, for a property no single prop sets, such as which tab is selected. `values` holds every property's value for the variant. */
  set?: (value: string, values: Record<string, string>) => Override[];
}

export interface Recipe {
  /** The Figma component's name. */
  name: string;
  /** The release card whose README example it renders. Default: `name`. */
  card?: string;
  /** Markup to render in place of the README example. */
  markup?: string | ((values: Record<string, string>) => string);
  /** The part whose props become variant properties and take each state's props. Default: `name`. */
  part?: string;
  /** The variant properties. Default: every string-literal prop of `part`, plus `booleans`. */
  axes?: readonly Axis[];
  /** Boolean props of `part` that become variant properties. */
  booleans?: readonly string[];
  /** Props of `part` left out of the default variant properties. */
  exclude?: readonly string[];
  states?: Readonly<Record<string, StateSpec>>;
  /** Props on the example's outermost part, such as `open` on an overlay's root. */
  rootProps?: Record<string, unknown>;
  /** A real click on the first element `click` matches, or a key pressed on `press`, that opens it. */
  open?:
    | { click: string; button?: 'left' | 'right' }
    | { press: string; key: string };
  /** The element captured. Default: `[data-slot=<kebab name>]`, else the first part in the container. */
  target?: string | ((values: Record<string, string>) => string);
  /** The container's width. Default 400. */
  width?: number;
  /** Props on `part` that add the optional parts that start hidden, so their layers exist to toggle. */
  full?: (values: Record<string, string>) => Record<string, unknown>;
  /** Optional parts, by selector. Each becomes a boolean property. */
  parts?: readonly { selector: string; name: string; default: boolean }[];
  /** Text property names by the `data-slot` of the element holding the text, when its name isn't right, such as a loading label that is still the Label. */
  textNames?: Readonly<Record<string, string>>;
  /** Other components' slots this component also draws, such as `context-menu-item` for Menu item. */
  alsoSlots?: readonly string[];
  /** An instance's variant, from its element and the elements around it, when attributes alone don't say. */
  instanceVariant?(
    element: ElementFacts,
    ancestors: readonly ElementFacts[]
  ): Record<string, string>;
}

/** Canvas markup for one part. A `true` attribute is written bare. */
function x(
  part: string,
  attributes: Record<string, string | true> = {},
  ...children: string[]
) {
  const written = Object.entries(attributes)
    .map(([name, value]) =>
      value === true
        ? ` ${name}`
        : ` ${name}="${value.replace(/"/g, '&quot;')}"`
    )
    .join('');
  return `<x-import component-from-global-scope="Nxds.${part}"${written}>${children.join('')}</x-import>`;
}

const icon = (name: string) => ({ __icon: name });

const HOVER: StateSpec = { pseudo: ['hover'] };
const FOCUS: StateSpec = { pseudo: ['focus', 'focus-visible'] };
const DISABLED: StateSpec = { props: { disabled: true } };
const INVALID: StateSpec = { props: { 'aria-invalid': true } };

const BUTTON_STATES = {
  default: {},
  hover: HOVER,
  pressed: { pseudo: ['hover', 'active'] },
  focus: FOCUS,
  disabled: DISABLED,
};
const CONTROL_STATES = {
  default: {},
  hover: HOVER,
  focus: FOCUS,
  disabled: DISABLED,
};
const FIELD_STATES = {
  default: {},
  hover: HOVER,
  focus: FOCUS,
  disabled: DISABLED,
  invalid: INVALID,
};
const LINK_STATES = { default: {}, hover: HOVER, focus: FOCUS };
/** Radix highlights a menu or select item by focusing it and setting `data-highlighted`. */
const ITEM_STATES = {
  default: {},
  highlighted: { pseudo: ['focus'], attributes: { 'data-highlighted': '' } },
  disabled: DISABLED,
};

const ancestor = (ancestors: readonly ElementFacts[], slot: string) =>
  [...ancestors].reverse().find((facts) => facts.slot === slot);

const POSITION_SELECTOR: Record<string, string> = {
  first: 'first-child',
  middle: 'nth-child(2)',
  last: 'last-child',
};
/** The value of the ToggleGroup README example's item at each position. */
const ITEM_VALUES: Record<string, string> = {
  first: 'left',
  middle: 'center',
  last: 'right',
};

/** Where an element sits among its parent's element children: first, middle or last. */
function positionOf(element: ElementFacts, ancestors: readonly ElementFacts[]) {
  const siblings =
    ancestors[ancestors.length - 1]?.children.filter(
      (child) => child.kind === 'element'
    ) ?? [];
  const index = siblings.indexOf(element);
  if (index === 0) return 'first';
  return index === siblings.length - 1 ? 'last' : 'middle';
}

const stateOf = (element: ElementFacts) =>
  element.attributes['disabled'] !== undefined ||
  element.attributes['data-disabled'] !== undefined
    ? 'disabled'
    : 'default';

const CHART_DATA = JSON.stringify([
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 173, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 264, mobile: 140 },
]);
const PIE_DATA = JSON.stringify([
  { browser: 'Chrome', visitors: 275 },
  { browser: 'Safari', visitors: 200 },
  { browser: 'Firefox', visitors: 187 },
  { browser: 'Edge', visitors: 173 },
]);

const chart = (name: string, axes: Partial<Recipe>): Recipe => ({
  name,
  card: 'Chart',
  markup: x(name, {
    data: CHART_DATA,
    'x-key': 'month',
    series: 'desktop,mobile',
  }),
  exclude: ['indicator'],
  width: 480,
  ...axes,
});

const SIDEBAR = x(
  'SidebarProvider',
  {},
  x(
    'Sidebar',
    { collapsible: 'none' },
    x(
      'SidebarHeader',
      {},
      x(
        'SidebarMenu',
        {},
        x(
          'SidebarMenuItem',
          {},
          x('SidebarMenuButton', { size: 'lg' }, 'Acme Inc')
        )
      )
    ),
    x(
      'SidebarContent',
      {},
      x(
        'SidebarGroup',
        {},
        x('SidebarGroupLabel', {}, 'Platform'),
        x(
          'SidebarGroupContent',
          {},
          x(
            'SidebarMenu',
            {},
            x(
              'SidebarMenuItem',
              {},
              x('SidebarMenuButton', {}, x('Icon', { name: 'house' }), 'Home')
            ),
            x(
              'SidebarMenuItem',
              {},
              x('SidebarMenuButton', {}, x('Icon', { name: 'tray' }), 'Inbox'),
              x('SidebarMenuBadge', {}, '24')
            ),
            x(
              'SidebarMenuItem',
              {},
              x(
                'SidebarMenuButton',
                {},
                x('Icon', { name: 'gear' }),
                'Settings'
              )
            )
          )
        )
      )
    ),
    x(
      'SidebarFooter',
      {},
      x(
        'SidebarMenu',
        {},
        x(
          'SidebarMenuItem',
          {},
          x(
            'SidebarMenuButton',
            {},
            x('Icon', { name: 'user' }),
            'Ada Lovelace'
          )
        )
      )
    )
  )
);

const ALERT = ({ Layout }: Record<string, string>) => {
  const title = x('AlertTitle', {}, 'Your trial ends in 3 days');
  const description = x(
    'AlertDescription',
    {},
    'Upgrade to keep your projects and team seats.'
  );
  const alertIcon = x('AlertIcon', {}, x('Icon', { name: 'info' }));
  const upgrade = x('Button', { variant: 'outline' }, 'Upgrade');
  if (Layout === 'inline') {
    return x(
      'Alert',
      {},
      alertIcon,
      x('AlertContent', {}, title, description),
      x('AlertActions', {}, upgrade, x('AlertClose'))
    );
  }
  return x(
    'Alert',
    {},
    alertIcon,
    title,
    description,
    x('AlertActions', {}, upgrade)
  );
};

const CARD = x(
  'Card',
  {},
  x(
    'CardHeader',
    {},
    x('CardTitle', {}, 'Team plan'),
    x('CardDescription', {}, 'Billed monthly. Cancel anytime.'),
    x('CardAction', {}, x('Button', { size: 'sm', variant: 'outline' }, 'Edit'))
  ),
  x(
    'CardContent',
    {},
    '<p class="nx:m-0 nx:typography-body-default">8 of 10 seats used. Invite two more people before your next bill.</p>'
  ),
  x(
    'CardFooter',
    {},
    x('Button', { variant: 'outline' }, 'Cancel'),
    x('Button', {}, 'Upgrade')
  )
);

const CHECKED = ['false', 'true'] as const;

/** In capture order: a component comes after every component it holds an instance of. */
export const RECIPES: readonly Recipe[] = [
  // Components that others hold.
  {
    name: 'Button',
    markup: x('Button', {}, 'Button'),
    axes: [
      { name: 'Variant', prop: 'variant' },
      { name: 'Size', prop: 'size' },
      // An icon-only Button shows its start icon, and its children become its name.
      {
        name: 'Icon only',
        values: CHECKED,
        set: (value) =>
          value === 'true'
            ? [
                {
                  part: 'Button',
                  props: { iconOnly: true, startIcon: icon('plus') },
                },
              ]
            : [],
      },
    ],
    states: { ...BUTTON_STATES, loading: { props: { loading: true } } },
    textNames: { 'button-loading-label': 'Label' },
    full: (values) =>
      values['Icon only'] === 'true'
        ? {}
        : { startIcon: icon('plus'), endIcon: icon('arrow-right') },
    parts: [
      {
        selector:
          '[data-slot=button]:not([data-icon-only]) [data-slot=button-start-icon]',
        name: 'Show start icon',
        default: false,
      },
      {
        selector:
          '[data-slot=button]:not([data-icon-only]) [data-slot=button-end-icon]',
        name: 'Show end icon',
        default: false,
      },
    ],
    instanceVariant: (element) => ({
      Variant: element.attributes['data-variant'] ?? 'default',
      Size: element.attributes['data-size'] ?? 'default',
      'Icon only':
        element.attributes['data-icon-only'] !== undefined ? 'true' : 'false',
      State:
        element.attributes['data-loading'] !== undefined
          ? 'loading'
          : stateOf(element),
    }),
  },
  {
    name: 'Badge',
    markup: x('Badge', {}, 'Badge'),
    booleans: ['isCaps'],
    full: () => ({ leftIcon: icon('check'), rightIcon: icon('x') }),
    parts: [
      {
        selector: '[data-slot=badge] > span:first-child',
        name: 'Show left icon',
        default: false,
      },
      {
        selector: '[data-slot=badge] > span:last-child',
        name: 'Show right icon',
        default: false,
      },
    ],
  },
  { name: 'Kbd' },
  { name: 'Label', markup: x('Label', {}, 'Email address') },
  { name: 'Separator' },
  { name: 'Spinner' },
  { name: 'Skeleton' },
  { name: 'Progress' },
  { name: 'Marker' },
  {
    name: 'Avatar',
    markup: x('Avatar', {}, x('AvatarFallback', {}, 'AL')),
    booleans: ['ring'],
  },
  {
    name: 'Checkbox',
    axes: [
      {
        name: 'Checked',
        values: CHECKED,
        set: (value) => [
          { part: 'Checkbox', props: { defaultChecked: value === 'true' } },
        ],
      },
    ],
    states: CONTROL_STATES,
    instanceVariant: (element) => ({
      Checked:
        element.attributes['data-state'] === 'checked' ? 'true' : 'false',
      State: stateOf(element),
    }),
  },
  {
    name: 'Switch',
    markup: x('Switch', { 'aria-label': 'Notifications' }),
    axes: [
      { name: 'Size', prop: 'size' },
      {
        name: 'Checked',
        values: CHECKED,
        set: (value) => [
          { part: 'Switch', props: { defaultChecked: value === 'true' } },
        ],
      },
    ],
    states: CONTROL_STATES,
    instanceVariant: (element) => ({
      Size: element.attributes['data-size'] ?? 'default',
      Checked:
        element.attributes['data-state'] === 'checked' ? 'true' : 'false',
      State: stateOf(element),
    }),
  },
  {
    name: 'Toggle',
    axes: [
      { name: 'Variant', prop: 'variant' },
      { name: 'Size', prop: 'size' },
      {
        name: 'Pressed',
        values: CHECKED,
        set: (value) => [
          { part: 'Toggle', props: { defaultPressed: value === 'true' } },
        ],
      },
    ],
    states: CONTROL_STATES,
  },
  {
    name: 'Input',
    markup: x('Input', {
      placeholder: 'you@example.com',
      'aria-label': 'Email',
    }),
    states: {
      ...FIELD_STATES,
      filled: { props: { defaultValue: 'ada@example.com' } },
    },
    width: 280,
  },
  {
    name: 'Textarea',
    markup: x('Textarea', {
      placeholder: 'Tell us about your project',
      'aria-label': 'Project',
    }),
    states: {
      ...FIELD_STATES,
      filled: { props: { defaultValue: 'A dashboard for our sales team.' } },
    },
    width: 280,
  },

  // Parts that are their own components.
  {
    name: 'Menu item',
    card: 'DropdownMenu',
    part: 'DropdownMenuItem',
    rootProps: { open: true },
    target: '[data-slot=dropdown-menu-item]',
    booleans: ['inset'],
    states: ITEM_STATES,
    parts: [
      {
        selector: '[data-slot$=-menu-shortcut], [data-slot=menubar-shortcut]',
        name: 'Show shortcut',
        default: true,
      },
    ],
    alsoSlots: ['context-menu-item', 'menubar-item'],
  },
  {
    name: 'Select item',
    card: 'Select',
    part: 'SelectItem',
    rootProps: { open: true },
    target: '[data-slot=select-item]',
    axes: [
      {
        name: 'Selected',
        values: CHECKED,
        set: (value) =>
          value === 'true'
            ? [{ part: 'Select', props: { defaultValue: 'apple' } }]
            : [],
      },
    ],
    // An open Select focuses its first item, which highlights it.
    states: {
      default: { blur: true },
      highlighted: ITEM_STATES.highlighted,
      disabled: { ...DISABLED, blur: true },
    },
    instanceVariant: (element) => ({
      Selected:
        element.attributes['data-state'] === 'checked' ? 'true' : 'false',
      State: stateOf(element),
    }),
  },
  {
    name: 'Command item',
    card: 'Command',
    part: 'CommandItem',
    target: '[data-slot=command-item]',
    states: {
      default: {
        attributes: { 'data-selected': 'false', 'aria-selected': 'false' },
      },
      highlighted: {
        attributes: { 'data-selected': 'true', 'aria-selected': 'true' },
      },
      disabled: {
        props: { disabled: true },
        attributes: { 'data-selected': 'false', 'aria-selected': 'false' },
      },
    },
    alsoSlots: ['combobox-item', 'multi-select-item'],
    instanceVariant: (element) => ({
      State:
        element.attributes['data-disabled'] === 'true'
          ? 'disabled'
          : element.attributes['data-selected'] === 'true'
            ? 'highlighted'
            : 'default',
    }),
  },
  {
    name: 'Tab',
    card: 'Tabs',
    part: 'TabsTrigger',
    target: '[data-slot=tabs-trigger]',
    axes: [
      { name: 'Variant', prop: 'variant', part: 'TabsList' },
      { name: 'Size', prop: 'size', part: 'TabsList' },
      {
        name: 'Selected',
        values: ['true', 'false'],
        set: (value) =>
          value === 'false'
            ? [{ part: 'Tabs', props: { defaultValue: 'password' } }]
            : [],
      },
    ],
    states: CONTROL_STATES,
    instanceVariant: (element, ancestors) => {
      const list = ancestor(ancestors, 'tabs-list');
      return {
        Variant: list?.attributes['data-variant'] ?? 'default',
        Size: list?.attributes['data-size'] ?? 'default',
        Selected:
          element.attributes['data-state'] === 'active' ? 'true' : 'false',
        State: stateOf(element),
      };
    },
  },
  {
    name: 'Accordion item',
    card: 'Accordion',
    part: 'AccordionItem',
    axes: [
      { name: 'Variant', prop: 'variant', part: 'Accordion' },
      { name: 'Orientation', prop: 'orientation', part: 'Accordion' },
      { name: 'Last', values: CHECKED },
      {
        name: 'Open',
        values: CHECKED,
        set: (value, { Last }) =>
          value === 'true'
            ? [
                {
                  part: 'Accordion',
                  props: {
                    defaultValue: Last === 'true' ? 'item-3' : 'item-1',
                  },
                },
              ]
            : [],
      },
    ],
    target: ({ Last }) =>
      `[data-slot=accordion-item]:${Last === 'true' ? 'last-child' : 'first-child'}`,
    states: { default: {}, disabled: DISABLED },
    instanceVariant: (element, ancestors) => ({
      Variant:
        ancestor(ancestors, 'accordion')?.attributes['data-variant'] ??
        'default',
      Orientation:
        ancestor(ancestors, 'accordion')?.attributes['data-orientation'] ??
        'vertical',
      Last: positionOf(element, ancestors) === 'last' ? 'true' : 'false',
      Open: element.attributes['data-state'] === 'open' ? 'true' : 'false',
      State: stateOf(element),
    }),
  },
  {
    name: 'Toggle group item',
    card: 'ToggleGroup',
    part: 'ToggleGroupItem',
    target: ({ Position }) =>
      `[data-slot=toggle-group-item]:${POSITION_SELECTOR[Position ?? 'first']}`,
    axes: [
      { name: 'Variant', prop: 'variant', part: 'ToggleGroup' },
      { name: 'Size', prop: 'size', part: 'ToggleGroup' },
      { name: 'Position', values: ['first', 'middle', 'last'] },
      {
        name: 'On',
        values: ['true', 'false'],
        set: (value, { Position = 'first' }) => {
          const item = ITEM_VALUES[Position] ?? 'left';
          const on =
            value === 'true' ? item : item === 'left' ? 'center' : 'left';
          return [{ part: 'ToggleGroup', props: { defaultValue: on } }];
        },
      },
    ],
    states: {
      ...CONTROL_STATES,
      disabled: { on: 'ToggleGroup', props: { disabled: true } },
    },
    instanceVariant: (element, ancestors) => {
      const group = ancestor(ancestors, 'toggle-group');
      return {
        Variant:
          element.attributes['data-variant'] ??
          group?.attributes['data-variant'] ??
          'default',
        Size:
          element.attributes['data-size'] ??
          group?.attributes['data-size'] ??
          'default',
        Position: positionOf(element, ancestors),
        On: element.attributes['data-state'] === 'on' ? 'true' : 'false',
        State: stateOf(element),
      };
    },
  },
  {
    name: 'Radio',
    card: 'RadioGroup',
    part: 'RadioGroupItem',
    target: '[data-slot=radio-group-item]',
    axes: [
      {
        name: 'Checked',
        values: CHECKED,
        set: (value) => [
          {
            part: 'RadioGroup',
            props: {
              defaultValue: value === 'true' ? 'default' : 'comfortable',
            },
          },
        ],
      },
    ],
    states: CONTROL_STATES,
    instanceVariant: (element) => ({
      Checked:
        element.attributes['data-state'] === 'checked' ? 'true' : 'false',
      State: stateOf(element),
    }),
  },
  {
    name: 'Breadcrumb link',
    card: 'Breadcrumb',
    part: 'BreadcrumbLink',
    target: '[data-slot=breadcrumb-link]',
    states: LINK_STATES,
  },
  {
    name: 'Pagination link',
    card: 'Pagination',
    part: 'PaginationLink',
    target: '[data-slot=pagination-link]',
    exclude: ['target'],
    booleans: ['isActive'],
    states: LINK_STATES,
    instanceVariant: (element) => ({
      Size: element.attributes['data-size'] ?? 'icon',
      Active:
        element.attributes['data-active'] === 'true' ||
        element.attributes['aria-current'] !== undefined
          ? 'true'
          : 'false',
      State: 'default',
    }),
  },
  {
    name: 'Sidebar menu button',
    card: 'Sidebar',
    markup: SIDEBAR,
    part: 'SidebarMenuButton',
    target: '[data-slot=sidebar-content] [data-slot=sidebar-menu-button]',
    booleans: ['isActive'],
    states: CONTROL_STATES,
    width: 280,
  },
  {
    name: 'Navigation menu link',
    card: 'NavigationMenu',
    part: 'NavigationMenuLink',
    open: { press: '[data-slot=navigation-menu-trigger]', key: 'Enter' },
    target:
      '[data-slot=navigation-menu-content] [data-slot=navigation-menu-link]',
    exclude: ['target'],
    booleans: ['active'],
    states: LINK_STATES,
    width: 640,
  },
  {
    name: 'Table row',
    card: 'Table',
    part: 'Table',
    axes: [
      { name: 'Type', values: ['body', 'header'] },
      { name: 'Last', values: CHECKED },
      { name: 'Variant', prop: 'variant', part: 'Table' },
      { name: 'Density', prop: 'density', part: 'Table' },
    ],
    target: ({ Type, Last }) =>
      `[data-slot=table-${Type}] [data-slot=table-row]:${Last === 'true' ? 'last-child' : 'first-child'}`,
    width: 560,
    instanceVariant: (_element, ancestors) => {
      const table = ancestor(ancestors, 'table');
      return {
        Type: ancestor(ancestors, 'table-header') ? 'header' : 'body',
        Last: positionOf(_element, ancestors) === 'last' ? 'true' : 'false',
        Variant: table?.attributes['data-variant'] ?? 'default',
        Density: table?.attributes['data-density'] ?? 'default',
      };
    },
  },

  // Everything else.
  {
    name: 'Alert',
    markup: ALERT,
    width: 480,
    parts: [
      { selector: '[data-slot=alert-icon]', name: 'Show icon', default: true },
      {
        selector: '[data-slot=alert-description]',
        name: 'Description',
        default: true,
      },
      { selector: '[data-slot=alert-actions]', name: 'Actions', default: true },
    ],
  },
  {
    name: 'Card',
    markup: CARD,
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
  },
  { name: 'Accordion' },
  { name: 'AspectRatio' },
  { name: 'Attachment' },
  { name: 'Breadcrumb' },
  { name: 'Bubble', exclude: ['side'] },
  { name: 'ButtonGroup' },
  { name: 'Carousel' },
  chart('BarChart', { booleans: ['stacked'] }),
  chart('AreaChart', { booleans: ['stacked'] }),
  chart('LineChart', { booleans: ['dots'] }),
  chart('PieChart', {
    markup: x('PieChart', {
      data: PIE_DATA,
      'name-key': 'browser',
      'value-key': 'visitors',
    }),
    booleans: ['donut', 'labels'],
  }),
  { name: 'ChoiceCard' },
  { name: 'ChoiceRow' },
  { name: 'CodeBlock' },
  { name: 'Collapsible', rootProps: { open: true } },
  {
    name: 'Combobox',
    target: '[data-slot=combobox-trigger]',
    part: 'Combobox',
    axes: [],
  },
  {
    name: 'Combobox content',
    card: 'Combobox',
    part: 'Combobox',
    rootProps: { open: true },
    target: '[data-slot=combobox-content]',
    axes: [],
  },
  { name: 'Command', axes: [] },
  {
    name: 'ContextMenu',
    open: { click: '[data-slot=context-menu-trigger]', button: 'right' },
    target: '[data-slot=context-menu-content]',
    axes: [],
  },
  {
    name: 'DatePicker',
    target: '[data-slot=date-picker], [data-slot=calendar]',
    axes: [],
  },
  { name: 'DescriptionList' },
  {
    name: 'Dialog',
    rootProps: { open: true },
    target: '[data-slot=dialog-content]',
    axes: [],
  },
  {
    name: 'AlertDialog',
    rootProps: { open: true },
    target: '[data-slot=alert-dialog-content]',
    axes: [],
  },
  {
    name: 'Drawer',
    rootProps: { open: true },
    target: '[data-slot=drawer-content]',
    axes: [{ name: 'Direction', prop: 'direction' }],
  },
  {
    name: 'Sheet',
    rootProps: { open: true },
    part: 'SheetContent',
    target: '[data-slot=sheet-content]',
    axes: [{ name: 'Side', prop: 'side' }],
  },
  {
    name: 'DropdownMenu',
    rootProps: { open: true },
    target: '[data-slot=dropdown-menu-content]',
    axes: [],
  },
  { name: 'EmptyState', booleans: ['bordered'] },
  { name: 'Field' },
  { name: 'FilterBuilder', width: 560 },
  { name: 'FilterChip' },
  { name: 'FilterCondition', width: 560 },
  {
    name: 'HoverCard',
    rootProps: { open: true },
    target: '[data-slot=hover-card-content]',
    axes: [],
  },
  {
    name: 'Popover',
    rootProps: { open: true },
    target: '[data-slot=popover-content]',
    axes: [],
  },
  {
    name: 'Tooltip',
    rootProps: { open: true },
    part: 'TooltipContent',
    target: '[data-slot=tooltip-content]',
    axes: [{ name: 'Side', prop: 'side' }],
  },
  { name: 'InputGroup' },
  { name: 'InputOTP', exclude: ['textAlign', 'pushPasswordManagerStrategy'] },
  { name: 'Item' },
  { name: 'Menubar', axes: [] },
  { name: 'Message' },
  { name: 'MessageScroller', width: 480 },
  { name: 'MultiSelect', target: '[data-slot=multi-select-trigger]', axes: [] },
  {
    name: 'MultiSelect content',
    card: 'MultiSelect',
    open: { click: '[data-slot=multi-select-trigger]' },
    target: '[data-slot=multi-select-content]',
    axes: [],
  },
  { name: 'NativeSelect', states: FIELD_STATES },
  {
    name: 'NavigationMenu',
    open: { press: '[data-slot=navigation-menu-trigger]', key: 'Enter' },
    axes: [],
    width: 640,
  },
  { name: 'PageHeader', width: 720 },
  { name: 'Pagination' },
  { name: 'RadioGroup' },
  {
    name: 'Resizable',
    part: 'ResizablePanelGroup',
    target: '[data-slot=resizable-panel-group]',
  },
  { name: 'ScrollArea' },
  {
    name: 'Select',
    part: 'SelectTrigger',
    target: '[data-slot=select-trigger]',
    states: FIELD_STATES,
  },
  {
    name: 'Select content',
    card: 'Select',
    part: 'Select',
    rootProps: { open: true },
    target: '[data-slot=select-content]',
    axes: [],
  },
  {
    name: 'Sidebar',
    markup: SIDEBAR,
    axes: [
      { name: 'Variant', prop: 'variant' },
      { name: 'Side', prop: 'side' },
    ],
    width: 280,
  },
  { name: 'Slider', booleans: ['inverted'] },
  { name: 'Table', booleans: ['striped'], width: 560 },
  { name: 'Tabs' },
  {
    name: 'Toast',
    markup: x('Toast', {
      title: 'Changes saved',
      description: 'Your profile is up to date.',
    }),
    booleans: ['closeButton', 'richColors'],
  },
  { name: 'ToggleGroup' },
  { name: 'Toolbar' },
];

/** Cards that draw no component of their own: Show and Hide only toggle visibility, Cover is the Claude Design cover, Icon is the icon set, and Sonner's toast is Toast. */
export const SKIPPED_CARDS: readonly string[] = [
  'Show',
  'Hide',
  'Cover',
  'Icon',
  'Sonner',
];
