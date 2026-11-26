/** @jsx h */
// What each Figma component is. By default a component renders its card's
// example in examples.tsx, its variant properties are the string-literal props
// of its part in the app's own types, and it is captured from the element
// whose `data-slot` matches its part. An entry here only says what differs: a
// part captured on its own, an overlay to open, the states to capture, or
// markup when the example doesn't show the component well. Every component
// Figma gets has an entry, and a card without one isn't drawn.
import { h, icon, type Markup, type Part } from './markup.ts';
import type { ElementFacts, Override } from './page.ts';
import * as Nxds from './parts.ts';
import type { GridSpec } from './spec.ts';

/** A part in parts.ts, such as `Button`, so a mistyped one fails the typecheck. */
export type PartName = keyof typeof Nxds;

/** Props a recipe sets on a part. */
interface PartOverride extends Override {
  part: PartName;
}

export interface StateSpec {
  /** Props on the recipe's part, or on `on`. */
  props?: Record<string, unknown>;
  /** The part `props` go on, when it isn't the recipe's part. */
  on?: PartName;
  /** Pseudo-classes forced on the captured element. */
  pseudo?: readonly string[];
  /** Attributes set on the captured element after it mounts. */
  attributes?: Record<string, string>;
  /** Moves focus off whatever an overlay focused when it opened. */
  blur?: boolean;
}

export interface Axis {
  name: string;
  /** The prop it sets, on `part` (default: the recipe's part). Its values come from the prop's type unless `values` lists them. */
  prop?: string;
  part?: PartName;
  values?: readonly string[];
  /** What each value sets, for a property no single prop sets, such as which tab is selected. `values` holds every property's value for the variant. */
  set?: (value: string, values: Record<string, string>) => PartOverride[];
}

export const kebab = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();

/** The card a component belongs to: its name up to a slash, such as `Tabs` for `Tabs/Tab`. */
export const cardOf = (name: string) => name.split('/')[0] ?? name;

export interface Size {
  width: number;
  height: number;
}

export interface Recipe {
  /** The Figma component's name. A part of a card's component is `<Card>/<Part>`, such as `Dialog/Header`, and renders that card's example. */
  name: string;
  /** What it renders, in place of its card's example. */
  markup?: Markup | ((values: Record<string, string>) => Markup);
  /** The part whose props become variant properties and take each state's props. */
  part: PartName;
  /** The part whose props become the default variant properties, and that axes without a `part` set: a part's whole, so the part takes the whole's properties and keeps only those that change its look. Default: `part`. */
  axesFrom?: PartName;
  /** The variant properties. Default: every string-literal prop of `part`, plus `booleans`. */
  axes?: readonly Axis[];
  /** Boolean props of `part` that become variant properties. */
  booleans?: readonly string[];
  /** Props of `part` left out of the default variant properties. */
  exclude?: readonly string[];
  states?: Readonly<Record<string, StateSpec>>;
  /** Combinations the code can't produce, such as an active Previous link, left out. */
  skip?: (values: Record<string, string>) => boolean;
  /** How Figma lays out the variants. Default: State in rows, Size in columns, the rest in blocks. */
  grid?: GridSpec;
  /** Props on the example's outermost part, such as `open` on an overlay's root. */
  rootProps?: Record<string, unknown>;
  /** A real click on the first element `click` matches, or a key pressed on `press`, that opens it. */
  open?:
    | { click: string; button?: 'left' | 'right' }
    | { press: string; key: string };
  /** The element captured. Default: `[data-slot=<kebab part>]`, else the first part in the container. */
  target?: string | ((values: Record<string, string>) => string);
  /** The container's width. Default 400. */
  width?: number;
  /** Recorded as a whole screen this size: the page body, with an open overlay's layers over it. */
  screen?: Size;
  /** The browser window's size, when it isn't `screen`'s or the default 1400×1000, such as a sheet's parts at its screen's size. */
  viewport?: Size;
  /** Takes focus off what an open overlay focused, as after a click, in every state. */
  blur?: boolean;
  /** Props on `part` that add the optional parts that start hidden, so their layers exist to toggle. */
  full?: (values: Record<string, string>) => Record<string, unknown>;
  /** Optional parts, by selector. Each becomes a boolean property. */
  parts?: readonly { selector: string; name: string; default: boolean }[];
  /** Text property names by the `data-slot` of the element holding the text, when its name isn't right, such as a loading label that is still the Label. */
  textNames?: Readonly<Record<string, string>>;
  /** Its root renders `children`, which Figma gets as a slot named Content that designers fill. */
  slot?: boolean;
  /** Other components' slots this component also draws, such as `context-menu-item` for DropdownMenu/Item. */
  alsoSlots?: readonly string[];
  /** An instance's variant, from its element and the elements around it, when attributes alone don't say. */
  instanceVariant?(
    element: ElementFacts,
    ancestors: readonly ElementFacts[]
  ): Record<string, string>;
}

const CHECKED = ['false', 'true'] as const;

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
/** The value of the ToggleGroup example's item at each position. */
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

const CHART_DATA = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 173, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 264, mobile: 140 },
];
const PIE_DATA = [
  { browser: 'Chrome', visitors: 275 },
  { browser: 'Safari', visitors: 200 },
  { browser: 'Firefox', visitors: 187 },
  { browser: 'Edge', visitors: 173 },
];

const chart = (Chart: Part<PartName>, axes: Partial<Recipe>): Recipe => ({
  name: `Chart/${Chart.part.replace(/Chart$/, '')}`,
  part: Chart.part,
  markup: (
    <Chart data={CHART_DATA} xKey="month" series={['desktop', 'mobile']} />
  ),
  exclude: ['indicator'],
  width: 480,
  ...axes,
});

/** The desktop reference size, for a modal overlay's whole. */
const DESKTOP = { width: 1280, height: 800 };
/** Room for a trigger and the menu or panel it opens. */
const FLOATING = { width: 480, height: 400 };

/** The example's overlay, open, with nothing focused. */
const OPEN: Partial<Recipe> = { rootProps: { open: true }, blur: true };

const MENUBAR_OPEN: Partial<Recipe> = {
  open: { click: '[data-slot=menubar-trigger]' },
};
const MULTI_SELECT_OPEN: Partial<Recipe> = {
  open: { click: '[data-slot=multi-select-trigger]' },
};
const NAV_OPEN: Partial<Recipe> = {
  open: { press: '[data-slot=navigation-menu-trigger]', key: 'Enter' },
};

/** A part of a card's example as its own component, `<Card>/<Name>`, captured from `[data-slot=<kebab part>]` unless `extra` says otherwise. */
const partOf = (
  card: string,
  name: string,
  part: PartName,
  extra: Partial<Recipe> = {}
): Recipe => ({ name: `${card}/${name}`, part, axes: [], ...extra });

/** A trigger in the open example, open or closed, such as a menubar's. */
const triggerOf = (
  card: string,
  part: PartName,
  slot: string,
  opener: Partial<Recipe>
) =>
  partOf(card, 'Trigger', part, {
    ...opener,
    axes: [{ name: 'Open', values: CHECKED }],
    target: ({ Open }) =>
      `[data-slot=${slot}][data-state=${Open === 'true' ? 'open' : 'closed'}]`,
  });

/** A part whose root renders `children`: Figma gets a slot designers fill. */
const SLOT: Partial<Recipe> = { slot: true };

/** A part of an open sheet or drawer, at its screen's size, for each side it opens from. */
const PANEL: Partial<Recipe> = { ...OPEN, viewport: DESKTOP };
const DIRECTION: Axis = {
  name: 'Direction',
  prop: 'direction',
  part: 'Drawer',
};
const SIDE: Axis = { name: 'Side', prop: 'side', part: 'SheetContent' };
const panelPart = (
  card: string,
  axis: Axis,
  name: string,
  part: PartName,
  extra: Partial<Recipe> = {}
) => partOf(card, name, part, { ...PANEL, axes: [axis], ...extra });

/**
 * A part of `whole`'s example as its own component, `<Card>/<Name>`. It
 * renders what the whole renders, takes the whole's variant properties and
 * optional parts, and keeps the properties that change how it looks.
 */
const partIn = (
  whole: Recipe,
  name: string,
  part: PartName,
  extra: Partial<Recipe> = {}
): Recipe => {
  const states = whole.states
    ? Object.fromEntries(
        Object.entries(whole.states).map(([state, spec]) => [
          state,
          spec.props ? { ...spec, on: spec.on ?? whole.part } : spec,
        ])
      )
    : undefined;
  return {
    name: `${cardOf(whole.name)}/${name}`,
    part,
    axesFrom: whole.part,
    target: `[data-slot=${kebab(part)}]`,
    markup: whole.markup,
    axes: whole.axes,
    booleans: whole.booleans,
    exclude: whole.exclude,
    states,
    rootProps: whole.rootProps,
    open: whole.open,
    width: whole.width,
    parts: whole.parts,
    ...extra,
  };
};

/** A card's whole example with its overlay open, recorded as a screen. */
const opened = (
  card: PartName,
  screen: Recipe['screen'],
  extra: Partial<Recipe> = {}
): Recipe => ({
  name: card,
  part: card,
  target: 'body',
  screen,
  axes: [],
  ...OPEN,
  ...extra,
});

const SIDEBAR = (
  <Nxds.SidebarProvider>
    <Nxds.Sidebar collapsible="none">
      <Nxds.SidebarHeader>
        <Nxds.SidebarMenu>
          <Nxds.SidebarMenuItem>
            <Nxds.SidebarMenuButton size="lg">Acme Inc</Nxds.SidebarMenuButton>
          </Nxds.SidebarMenuItem>
        </Nxds.SidebarMenu>
      </Nxds.SidebarHeader>
      <Nxds.SidebarContent>
        <Nxds.SidebarGroup>
          <Nxds.SidebarGroupLabel>Platform</Nxds.SidebarGroupLabel>
          <Nxds.SidebarGroupContent>
            <Nxds.SidebarMenu>
              <Nxds.SidebarMenuItem>
                <Nxds.SidebarMenuButton>
                  <Nxds.Icon name="house" />
                  Home
                </Nxds.SidebarMenuButton>
              </Nxds.SidebarMenuItem>
              <Nxds.SidebarMenuItem>
                <Nxds.SidebarMenuButton>
                  <Nxds.Icon name="tray" />
                  Inbox
                </Nxds.SidebarMenuButton>
                <Nxds.SidebarMenuBadge>24</Nxds.SidebarMenuBadge>
              </Nxds.SidebarMenuItem>
              <Nxds.SidebarMenuItem>
                <Nxds.SidebarMenuButton>
                  <Nxds.Icon name="gear" />
                  Settings
                </Nxds.SidebarMenuButton>
              </Nxds.SidebarMenuItem>
            </Nxds.SidebarMenu>
          </Nxds.SidebarGroupContent>
        </Nxds.SidebarGroup>
      </Nxds.SidebarContent>
      <Nxds.SidebarFooter>
        <Nxds.SidebarMenu>
          <Nxds.SidebarMenuItem>
            <Nxds.SidebarMenuButton>
              <Nxds.Icon name="user" />
              Ada Lovelace
            </Nxds.SidebarMenuButton>
          </Nxds.SidebarMenuItem>
        </Nxds.SidebarMenu>
      </Nxds.SidebarFooter>
    </Nxds.Sidebar>
  </Nxds.SidebarProvider>
);

const ALERT = ({ Layout }: Record<string, string>) => {
  const title = <Nxds.AlertTitle>Your trial ends in 3 days</Nxds.AlertTitle>;
  const description = (
    <Nxds.AlertDescription>
      Upgrade to keep your projects and team seats.
    </Nxds.AlertDescription>
  );
  const alertIcon = (
    <Nxds.AlertIcon>
      <Nxds.Icon name="info" />
    </Nxds.AlertIcon>
  );
  const upgrade = <Nxds.Button variant="outline">Upgrade</Nxds.Button>;
  if (Layout === 'inline') {
    return (
      <Nxds.Alert>
        {alertIcon}
        <Nxds.AlertContent>
          {title}
          {description}
        </Nxds.AlertContent>
        <Nxds.AlertActions>
          {upgrade}
          <Nxds.AlertClose />
        </Nxds.AlertActions>
      </Nxds.Alert>
    );
  }
  return (
    <Nxds.Alert>
      {alertIcon}
      {title}
      {description}
      <Nxds.AlertActions>{upgrade}</Nxds.AlertActions>
    </Nxds.Alert>
  );
};

const CARD = (
  <Nxds.Card>
    <Nxds.CardHeader>
      <Nxds.CardTitle>Team plan</Nxds.CardTitle>
      <Nxds.CardDescription>
        Billed monthly. Cancel anytime.
      </Nxds.CardDescription>
      <Nxds.CardAction>
        <Nxds.Button size="sm" variant="outline">
          Edit
        </Nxds.Button>
      </Nxds.CardAction>
    </Nxds.CardHeader>
    <Nxds.CardContent>
      <p className="nx:m-0 nx:typography-body-default">
        8 of 10 seats used. Invite two more people before your next bill.
      </p>
    </Nxds.CardContent>
    <Nxds.CardFooter>
      <Nxds.Button variant="outline">Cancel</Nxds.Button>
      <Nxds.Button>Upgrade</Nxds.Button>
    </Nxds.CardFooter>
  </Nxds.Card>
);

/** The part each kind of pagination link is drawn by. */
const PAGINATION_PARTS: Record<string, PartName> = {
  page: 'PaginationLink',
  previous: 'PaginationPrevious',
  next: 'PaginationNext',
};

/** A sidebar holding one menu button, with or without its icon. */
const MENU_BUTTON = (withIcon: boolean) => (
  <Nxds.SidebarProvider>
    <Nxds.Sidebar collapsible="none">
      <Nxds.SidebarContent>
        <Nxds.SidebarMenu>
          <Nxds.SidebarMenuItem>
            <Nxds.SidebarMenuButton>
              {withIcon && <Nxds.Icon name="house" />}
              Home
            </Nxds.SidebarMenuButton>
          </Nxds.SidebarMenuItem>
        </Nxds.SidebarMenu>
      </Nxds.SidebarContent>
    </Nxds.Sidebar>
  </Nxds.SidebarProvider>
);

// Wholes whose parts are their own components, each part taking the whole's variant properties.
const AVATAR: Recipe = {
  name: 'Avatar',
  part: 'Avatar',
  markup: (
    <Nxds.Avatar>
      <Nxds.AvatarFallback>AL</Nxds.AvatarFallback>
    </Nxds.Avatar>
  ),
  booleans: ['ring'],
};
const MARKER: Recipe = { name: 'Marker', part: 'Marker' };
const ACCORDION_ITEM_TARGET = ({ Last }: Record<string, string>) =>
  `[data-slot=accordion-item]:${Last === 'true' ? 'last-child' : 'first-child'}`;
const ACCORDION_ITEM: Recipe = {
  name: 'Accordion/Item',
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
  target: ACCORDION_ITEM_TARGET,
  states: { default: {}, disabled: DISABLED },
  instanceVariant: (element, ancestors) => ({
    Variant:
      ancestor(ancestors, 'accordion')?.attributes['data-variant'] ?? 'default',
    Orientation:
      ancestor(ancestors, 'accordion')?.attributes['data-orientation'] ??
      'vertical',
    Last: positionOf(element, ancestors) === 'last' ? 'true' : 'false',
    Open: element.attributes['data-state'] === 'open' ? 'true' : 'false',
    State: stateOf(element),
  }),
};
/** A part inside an accordion item: its variant is its item's. */
const accordionPart = (
  name: string,
  part: PartName,
  extra: Partial<Recipe> = {}
): Recipe =>
  partIn(ACCORDION_ITEM, name, part, {
    ...extra,
    target: (values) =>
      `${ACCORDION_ITEM_TARGET(values)} [data-slot=${kebab(part)}]`,
    instanceVariant: (element, ancestors) => {
      const index = ancestors
        .map(({ slot }) => slot)
        .lastIndexOf('accordion-item');
      const item = ancestors[index];
      return item
        ? (ACCORDION_ITEM.instanceVariant?.(item, ancestors.slice(0, index)) ??
            {})
        : {};
    },
  });
const TABS: Recipe = { name: 'Tabs', part: 'Tabs' };
const TABLE: Recipe = {
  name: 'Table',
  part: 'Table',
  booleans: ['striped'],
  width: 560,
};
const SIDEBAR_WHOLE: Recipe = {
  name: 'Sidebar',
  part: 'Sidebar',
  markup: SIDEBAR,
  axes: [
    { name: 'Variant', prop: 'variant' },
    { name: 'Side', prop: 'side' },
  ],
  width: 280,
};
const ALERT_WHOLE: Recipe = {
  name: 'Alert',
  part: 'Alert',
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
};
const CARD_WHOLE: Recipe = {
  name: 'Card',
  part: 'Card',
  markup: CARD,
  width: 360,
  slot: true,
  parts: [
    {
      selector: '[data-slot=card-description]',
      name: 'Description',
      default: true,
    },
    { selector: '[data-slot=card-action]', name: 'Action', default: true },
  ],
};
const ATTACHMENT: Recipe = { name: 'Attachment', part: 'Attachment' };
const BUBBLE: Recipe = { name: 'Bubble', part: 'Bubble', exclude: ['side'] };
const CAROUSEL: Recipe = { name: 'Carousel', part: 'Carousel' };
const CHOICE_CARD: Recipe = { name: 'ChoiceCard', part: 'ChoiceCard' };
const CODE_BLOCK: Recipe = { name: 'CodeBlock', part: 'CodeBlock' };
const INPUT_GROUP: Recipe = { name: 'InputGroup', part: 'InputGroup' };
const ITEM: Recipe = { name: 'Item', part: 'Item' };
const MESSAGE: Recipe = { name: 'Message', part: 'Message' };
const RESIZABLE: Recipe = {
  name: 'Resizable',
  part: 'ResizablePanelGroup',
  target: '[data-slot=resizable-panel-group]',
};
const TOOLBAR: Recipe = { name: 'Toolbar', part: 'Toolbar' };
const EMPTY_STATE: Recipe = {
  name: 'EmptyState',
  part: 'EmptyState',
  booleans: ['bordered'],
  slot: true,
};
const FIELD: Recipe = { name: 'Field', part: 'Field' };

/** In capture order: a component comes after every component it holds an instance of. */
export const RECIPES: readonly Recipe[] = [
  // Components that others hold.
  {
    name: 'Button',
    part: 'Button',
    markup: <Nxds.Button>Button</Nxds.Button>,
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
    grid: {
      blocks: ['Variant'],
      rows: ['State'],
      columns: ['Size', 'Icon only'],
    },
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
    part: 'Badge',
    markup: <Nxds.Badge>Badge</Nxds.Badge>,
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
  { name: 'Kbd', part: 'Kbd' },
  {
    name: 'Label',
    part: 'Label',
    markup: <Nxds.Label>Email address</Nxds.Label>,
  },
  { name: 'Separator', part: 'Separator' },
  { name: 'Spinner', part: 'Spinner' },
  { name: 'Skeleton', part: 'Skeleton' },
  { name: 'Progress', part: 'Progress' },
  partIn(MARKER, 'Content', 'MarkerContent'),
  MARKER,
  partIn(AVATAR, 'Fallback', 'AvatarFallback'),
  AVATAR,
  {
    name: 'Checkbox',
    part: 'Checkbox',
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
    part: 'Switch',
    markup: <Nxds.Switch aria-label="Notifications" />,
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
    part: 'Toggle',
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
    part: 'Input',
    markup: <Nxds.Input placeholder="you@example.com" aria-label="Email" />,
    states: {
      ...FIELD_STATES,
      filled: { props: { defaultValue: 'ada@example.com' } },
    },
    width: 280,
  },
  {
    name: 'Textarea',
    part: 'Textarea',
    markup: (
      <Nxds.Textarea
        placeholder="Tell us about your project"
        aria-label="Project"
      />
    ),
    states: {
      ...FIELD_STATES,
      filled: { props: { defaultValue: 'A dashboard for our sales team.' } },
    },
    width: 280,
  },

  // Parts that are their own components.
  {
    name: 'DropdownMenu/Item',
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
    name: 'Select/Item',
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
    name: 'Command/Item',
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
    name: 'Tabs/Tab',
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
  partIn(TABS, 'List', 'TabsList'),
  partIn(TABS, 'Content', 'TabsContent', SLOT),
  accordionPart('Trigger', 'AccordionTrigger'),
  accordionPart('Content', 'AccordionContent', SLOT),
  ACCORDION_ITEM,
  {
    name: 'ToggleGroup/Item',
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
    name: 'RadioGroup/Item',
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
    name: 'Breadcrumb/Link',
    part: 'BreadcrumbLink',
    target: '[data-slot=breadcrumb-link]',
    states: LINK_STATES,
  },
  {
    name: 'Pagination/Link',
    part: 'PaginationLink',
    axes: [
      { name: 'Kind', values: ['page', 'previous', 'next'] },
      {
        name: 'Size',
        values: ['default', 'sm', 'lg'],
        set: (value, { Kind = 'page' }) => [
          {
            part: PAGINATION_PARTS[Kind] ?? 'PaginationLink',
            props: { size: value },
          },
        ],
      },
      {
        name: 'Active',
        values: CHECKED,
        set: (value) => [
          { part: 'PaginationLink', props: { isActive: value === 'true' } },
        ],
      },
      {
        name: 'Icon only',
        values: CHECKED,
        set: (value, { Kind = 'page' }) => [
          {
            part: PAGINATION_PARTS[Kind] ?? 'PaginationLink',
            props: { iconOnly: value === 'true' },
          },
        ],
      },
    ],
    skip: ({ Kind, Active, 'Icon only': iconOnly }) =>
      Kind === 'page' ? iconOnly === 'true' : Active === 'true',
    target: ({ Kind }) =>
      Kind === 'page'
        ? '[data-slot=pagination-item]:nth-child(2) [data-slot=pagination-link]'
        : `[aria-label="Go to ${Kind} page"]`,
    states: LINK_STATES,
    instanceVariant: (element) => {
      const label = element.attributes['aria-label'] ?? '';
      const kind = /previous/.test(label)
        ? 'previous'
        : /next/.test(label)
          ? 'next'
          : 'page';
      return {
        Kind: kind,
        Size: element.attributes['data-size'] ?? 'default',
        Active:
          element.attributes['data-active'] === 'true' ||
          element.attributes['aria-current'] !== undefined
            ? 'true'
            : 'false',
        'Icon only':
          element.attributes['data-icon-only'] !== undefined ? 'true' : 'false',
        State: 'default',
      };
    },
  },
  {
    name: 'Sidebar/Menu button',
    markup: ({ Icon }) => MENU_BUTTON(Icon === 'true'),
    part: 'SidebarMenuButton',
    axes: [
      { name: 'Variant', prop: 'variant' },
      { name: 'Size', prop: 'size' },
      {
        name: 'Active',
        values: CHECKED,
        set: (value) => [
          { part: 'SidebarMenuButton', props: { isActive: value === 'true' } },
        ],
      },
      { name: 'Icon', values: ['true', 'false'] },
    ],
    states: CONTROL_STATES,
    width: 280,
  },
  partIn(SIDEBAR_WHOLE, 'Menu badge', 'SidebarMenuBadge'),
  partIn(SIDEBAR_WHOLE, 'Group label', 'SidebarGroupLabel'),
  partIn(SIDEBAR_WHOLE, 'Header', 'SidebarHeader', SLOT),
  partIn(SIDEBAR_WHOLE, 'Group', 'SidebarGroup', SLOT),
  partIn(SIDEBAR_WHOLE, 'Content', 'SidebarContent', SLOT),
  partIn(SIDEBAR_WHOLE, 'Footer', 'SidebarFooter', SLOT),
  {
    name: 'NavigationMenu/Link',
    part: 'NavigationMenuLink',
    open: { press: '[data-slot=navigation-menu-trigger]', key: 'Enter' },
    target:
      '[data-slot=navigation-menu-content] [data-slot=navigation-menu-link]',
    exclude: ['target'],
    booleans: ['active'],
    states: LINK_STATES,
    width: 640,
  },
  partIn(TABLE, 'Head', 'TableHead'),
  partIn(TABLE, 'Cell', 'TableCell'),
  partIn(TABLE, 'Row', 'TableRow', {
    axes: [
      { name: 'Type', values: ['body', 'header'] },
      { name: 'Position', values: ['first', 'middle', 'last'] },
      { name: 'Variant', prop: 'variant', part: 'Table' },
      { name: 'Density', prop: 'density', part: 'Table' },
      {
        name: 'Striped',
        values: CHECKED,
        set: (value) => [
          { part: 'Table', props: { striped: value === 'true' } },
        ],
      },
    ],
    target: ({ Type, Position }) =>
      `[data-slot=table-${Type}] [data-slot=table-row]:${POSITION_SELECTOR[Position ?? 'first']}`,
    instanceVariant: (element, ancestors) => {
      const table = ancestor(ancestors, 'table');
      return {
        Type: ancestor(ancestors, 'table-header') ? 'header' : 'body',
        Position: positionOf(element, ancestors),
        Variant: table?.attributes['data-variant'] ?? 'default',
        Density: table?.attributes['data-density'] ?? 'default',
      };
    },
  }),
  partIn(TABLE, 'Header', 'TableHeader', SLOT),
  partIn(TABLE, 'Body', 'TableBody', SLOT),

  // Everything else.
  partIn(ALERT_WHOLE, 'Icon', 'AlertIcon'),
  partIn(ALERT_WHOLE, 'Title', 'AlertTitle'),
  partIn(ALERT_WHOLE, 'Description', 'AlertDescription'),
  partIn(ALERT_WHOLE, 'Content', 'AlertContent'),
  partIn(ALERT_WHOLE, 'Close', 'AlertClose'),
  partIn(ALERT_WHOLE, 'Actions', 'AlertActions', SLOT),
  ALERT_WHOLE,
  partIn(CARD_WHOLE, 'Title', 'CardTitle'),
  partIn(CARD_WHOLE, 'Description', 'CardDescription'),
  partIn(CARD_WHOLE, 'Action', 'CardAction'),
  partIn(CARD_WHOLE, 'Header', 'CardHeader'),
  partIn(CARD_WHOLE, 'Content', 'CardContent', SLOT),
  partIn(CARD_WHOLE, 'Footer', 'CardFooter', SLOT),
  CARD_WHOLE,
  { name: 'Accordion', part: 'Accordion' },
  { name: 'AspectRatio', part: 'AspectRatio' },
  partIn(ATTACHMENT, 'Media', 'AttachmentMedia'),
  partIn(ATTACHMENT, 'Title', 'AttachmentTitle'),
  partIn(ATTACHMENT, 'Description', 'AttachmentDescription'),
  partIn(ATTACHMENT, 'Content', 'AttachmentContent'),
  partIn(ATTACHMENT, 'Actions', 'AttachmentActions', SLOT),
  ATTACHMENT,
  partOf('Breadcrumb', 'Separator', 'BreadcrumbSeparator'),
  partOf('Breadcrumb', 'Page', 'BreadcrumbPage'),
  { name: 'Breadcrumb', part: 'Breadcrumb' },
  partIn(BUBBLE, 'Content', 'BubbleContent', SLOT),
  BUBBLE,
  { name: 'ButtonGroup', part: 'ButtonGroup' },
  partIn(CAROUSEL, 'Item', 'CarouselItem', SLOT),
  partIn(CAROUSEL, 'Content', 'CarouselContent', SLOT),
  partIn(CAROUSEL, 'Previous', 'CarouselPrevious'),
  partIn(CAROUSEL, 'Next', 'CarouselNext'),
  CAROUSEL,
  chart(Nxds.BarChart, { booleans: ['stacked'] }),
  chart(Nxds.AreaChart, { booleans: ['stacked'] }),
  chart(Nxds.LineChart, { booleans: ['dots'] }),
  chart(Nxds.PieChart, {
    markup: (
      <Nxds.PieChart data={PIE_DATA} nameKey="browser" valueKey="visitors" />
    ),
    booleans: ['donut', 'labels'],
  }),
  partIn(CHOICE_CARD, 'Title', 'ChoiceCardTitle'),
  partIn(CHOICE_CARD, 'Description', 'ChoiceCardDescription'),
  partIn(CHOICE_CARD, 'Content', 'ChoiceCardContent'),
  CHOICE_CARD,
  partOf('ChoiceRow', 'Title', 'ChoiceRowTitle'),
  { name: 'ChoiceRow', part: 'ChoiceRow' },
  partIn(CODE_BLOCK, 'Line', 'CodeBlockLine'),
  partIn(CODE_BLOCK, 'Content', 'CodeBlockContent'),
  partIn(CODE_BLOCK, 'Copy button', 'CodeBlockCopyButton'),
  CODE_BLOCK,
  partOf('Collapsible', 'Content', 'CollapsibleContent', {
    rootProps: { open: true },
    ...SLOT,
  }),
  { name: 'Collapsible', part: 'Collapsible', rootProps: { open: true } },
  partOf('Command', 'Input', 'CommandInput'),
  { name: 'Command', part: 'Command', axes: [], slot: true },
  partOf('Combobox', 'Trigger', 'ComboboxTrigger'),
  partOf('Combobox', 'Input', 'ComboboxInput', OPEN),
  partOf('Combobox', 'Content', 'ComboboxContent', { ...OPEN, ...SLOT }),
  opened('Combobox', FLOATING),
  partOf('ContextMenu', 'Content', 'ContextMenuContent', {
    ...SLOT,
    open: { click: '[data-slot=context-menu-trigger]', button: 'right' },
  }),
  {
    name: 'ContextMenu',
    part: 'ContextMenu',
    open: { click: '[data-slot=context-menu-trigger]', button: 'right' },
    target: 'body',
    screen: FLOATING,
    axes: [],
  },
  {
    name: 'DatePicker',
    part: 'DatePicker',
    target: '[data-slot=date-picker], [data-slot=calendar]',
    axes: [],
  },
  partOf('DescriptionList', 'Term', 'DescriptionListTerm'),
  partOf('DescriptionList', 'Description', 'DescriptionListDescription'),
  partOf('DescriptionList', 'Item', 'DescriptionListItem'),
  { name: 'DescriptionList', part: 'DescriptionList' },
  // An overlay's parts, each captured from the open example before what holds it.
  partOf('Dialog', 'Title', 'DialogTitle', OPEN),
  partOf('Dialog', 'Description', 'DialogDescription', OPEN),
  partOf('Dialog', 'Close', 'DialogContent', {
    ...OPEN,
    target: '[data-slot=dialog-close-button]',
  }),
  partOf('Dialog', 'Header', 'DialogHeader', OPEN),
  partOf('Dialog', 'Body', 'DialogBody', { ...OPEN, ...SLOT }),
  partOf('Dialog', 'Footer', 'DialogFooter', { ...OPEN, ...SLOT }),
  partOf('Dialog', 'Trigger', 'DialogTrigger', {
    ...OPEN,
    target: '[aria-haspopup=dialog]',
  }),
  partOf('Dialog', 'Overlay', 'DialogOverlay', { ...OPEN, screen: DESKTOP }),
  partOf('Dialog', 'Content', 'DialogContent', { ...OPEN, ...SLOT }),
  opened('Dialog', DESKTOP),
  partOf('AlertDialog', 'Title', 'AlertDialogTitle', OPEN),
  partOf('AlertDialog', 'Description', 'AlertDialogDescription', OPEN),
  partOf('AlertDialog', 'Header', 'AlertDialogHeader', OPEN),
  partOf('AlertDialog', 'Footer', 'AlertDialogFooter', { ...OPEN, ...SLOT }),
  partOf('AlertDialog', 'Overlay', 'AlertDialogOverlay', {
    ...OPEN,
    screen: DESKTOP,
  }),
  partOf('AlertDialog', 'Content', 'AlertDialogContent', { ...OPEN, ...SLOT }),
  opened('AlertDialog', DESKTOP),
  panelPart('Drawer', DIRECTION, 'Title', 'DrawerTitle'),
  panelPart('Drawer', DIRECTION, 'Description', 'DrawerDescription'),
  panelPart('Drawer', DIRECTION, 'Header', 'DrawerHeader'),
  panelPart('Drawer', DIRECTION, 'Body', 'DrawerBody', SLOT),
  panelPart('Drawer', DIRECTION, 'Footer', 'DrawerFooter', SLOT),
  partOf('Drawer', 'Overlay', 'DrawerOverlay', { ...OPEN, screen: DESKTOP }),
  partOf('Drawer', 'Content', 'Drawer', {
    ...PANEL,
    ...SLOT,
    target: '[data-slot=drawer-content]',
    axes: [DIRECTION],
  }),
  opened('Drawer', DESKTOP, { axes: [DIRECTION] }),
  panelPart('Sheet', SIDE, 'Title', 'SheetTitle'),
  panelPart('Sheet', SIDE, 'Description', 'SheetDescription'),
  panelPart('Sheet', SIDE, 'Header', 'SheetHeader'),
  panelPart('Sheet', SIDE, 'Body', 'SheetBody', SLOT),
  panelPart('Sheet', SIDE, 'Footer', 'SheetFooter', SLOT),
  partOf('Sheet', 'Overlay', 'SheetOverlay', { ...OPEN, screen: DESKTOP }),
  panelPart('Sheet', SIDE, 'Content', 'SheetContent', SLOT),
  opened('Sheet', DESKTOP, { axes: [SIDE] }),
  partOf('DropdownMenu', 'Label', 'DropdownMenuLabel', OPEN),
  partOf('DropdownMenu', 'Separator', 'DropdownMenuSeparator', OPEN),
  partOf('DropdownMenu', 'Content', 'DropdownMenuContent', {
    ...OPEN,
    ...SLOT,
  }),
  opened('DropdownMenu', FLOATING),
  partIn(EMPTY_STATE, 'Media', 'EmptyStateMedia'),
  partIn(EMPTY_STATE, 'Title', 'EmptyStateTitle'),
  partIn(EMPTY_STATE, 'Description', 'EmptyStateDescription'),
  partIn(EMPTY_STATE, 'Header', 'EmptyStateHeader'),
  partIn(EMPTY_STATE, 'Content', 'EmptyStateContent', SLOT),
  EMPTY_STATE,
  partIn(FIELD, 'Label', 'FieldLabel'),
  partIn(FIELD, 'Description', 'FieldDescription'),
  FIELD,
  { name: 'FilterBuilder', part: 'FilterBuilder', width: 560 },
  { name: 'FilterChip', part: 'FilterChip' },
  partOf('FilterCondition', 'Field', 'FilterConditionField', { width: 560 }),
  partOf('FilterCondition', 'Segment', 'FilterConditionSegment', {
    width: 560,
  }),
  partOf('FilterCondition', 'Remove', 'FilterConditionRemove', {
    width: 560,
  }),
  { name: 'FilterCondition', part: 'FilterCondition', width: 560 },
  partOf('HoverCard', 'Content', 'HoverCardContent', { ...OPEN, ...SLOT }),
  opened('HoverCard', FLOATING),
  partOf('Popover', 'Content', 'PopoverContent', { ...OPEN, ...SLOT }),
  opened('Popover', FLOATING),
  partOf('Tooltip', 'Content', 'TooltipContent', {
    ...OPEN,
    axes: [{ name: 'Side', prop: 'side' }],
  }),
  opened('Tooltip', FLOATING),
  partIn(INPUT_GROUP, 'Addon', 'InputGroupAddon'),
  partIn(INPUT_GROUP, 'Input', 'InputGroupInput', {
    target: '[data-slot=input-group-control]',
  }),
  INPUT_GROUP,
  partOf('InputOTP', 'Slot', 'InputOTPSlot', {
    axes: [{ name: 'Position', values: ['first', 'middle', 'last'] }],
    target: ({ Position }) =>
      `[data-slot=input-otp-slot]:${POSITION_SELECTOR[Position ?? 'first']}`,
  }),
  partOf('InputOTP', 'Separator', 'InputOTPSeparator', {
    target: '[data-slot=input-otp-separator]',
  }),
  partOf('InputOTP', 'Group', 'InputOTPGroup', {
    target: '[data-slot=input-otp-group]',
  }),
  {
    name: 'InputOTP',
    part: 'InputOTP',
    exclude: ['textAlign', 'pushPasswordManagerStrategy'],
  },
  partIn(ITEM, 'Media', 'ItemMedia'),
  partIn(ITEM, 'Title', 'ItemTitle'),
  partIn(ITEM, 'Description', 'ItemDescription'),
  partIn(ITEM, 'Content', 'ItemContent'),
  partIn(ITEM, 'Actions', 'ItemActions', SLOT),
  ITEM,
  triggerOf('Menubar', 'MenubarTrigger', 'menubar-trigger', MENUBAR_OPEN),
  partOf('Menubar', 'Separator', 'MenubarSeparator', MENUBAR_OPEN),
  partOf('Menubar', 'Content', 'MenubarContent', { ...MENUBAR_OPEN, ...SLOT }),
  {
    name: 'Menubar',
    part: 'Menubar',
    target: 'body',
    screen: FLOATING,
    axes: [],
    ...MENUBAR_OPEN,
  },
  partIn(MESSAGE, 'Avatar', 'MessageAvatar'),
  partIn(MESSAGE, 'Header', 'MessageHeader'),
  partIn(MESSAGE, 'Footer', 'MessageFooter', SLOT),
  partIn(MESSAGE, 'Content', 'MessageContent', SLOT),
  MESSAGE,
  { name: 'MessageScroller', part: 'MessageScroller', width: 480 },
  partOf('MultiSelect', 'Trigger', 'MultiSelectTrigger'),
  partOf('MultiSelect', 'Content', 'MultiSelectContent', {
    ...MULTI_SELECT_OPEN,
    ...SLOT,
  }),
  {
    name: 'MultiSelect',
    part: 'MultiSelect',
    target: 'body',
    screen: FLOATING,
    axes: [],
    ...MULTI_SELECT_OPEN,
  },
  { name: 'NativeSelect', part: 'NativeSelect', states: FIELD_STATES },
  triggerOf(
    'NavigationMenu',
    'NavigationMenuTrigger',
    'navigation-menu-trigger',
    NAV_OPEN
  ),
  partOf('NavigationMenu', 'Content', 'NavigationMenuContent', {
    ...NAV_OPEN,
    ...SLOT,
  }),
  { name: 'NavigationMenu', part: 'NavigationMenu', axes: [], ...NAV_OPEN },
  partOf('PageHeader', 'Title', 'PageHeaderTitle', { width: 720 }),
  partOf('PageHeader', 'Description', 'PageHeaderDescription', {
    width: 720,
  }),
  partOf('PageHeader', 'Content', 'PageHeaderContent', {
    width: 720,
    ...SLOT,
  }),
  { name: 'PageHeader', part: 'PageHeader', width: 720 },
  partOf('Pagination', 'Ellipsis', 'PaginationEllipsis'),
  { name: 'Pagination', part: 'Pagination' },
  { name: 'RadioGroup', part: 'RadioGroup' },
  partIn(RESIZABLE, 'Handle', 'ResizableHandle'),
  partIn(RESIZABLE, 'Panel', 'ResizablePanel', SLOT),
  RESIZABLE,
  { name: 'ScrollArea', part: 'ScrollArea' },
  {
    name: 'Select/Trigger',
    part: 'SelectTrigger',
    states: FIELD_STATES,
  },
  partOf('Select', 'Content', 'SelectContent', { ...OPEN, ...SLOT }),
  opened('Select', FLOATING),
  SIDEBAR_WHOLE,
  { name: 'Slider', part: 'Slider', booleans: ['inverted'] },
  TABLE,
  TABS,
  {
    name: 'Toast',
    part: 'Toast',
    markup: (
      <Nxds.Toast
        title="Changes saved"
        description="Your profile is up to date."
      />
    ),
    booleans: ['closeButton', 'richColors'],
  },
  { name: 'ToggleGroup', part: 'ToggleGroup' },
  partIn(TOOLBAR, 'Button', 'ToolbarButton'),
  partIn(TOOLBAR, 'Separator', 'ToolbarSeparator'),
  TOOLBAR,
];

/** Component folders Figma gets no component of their own for, and why, so the export doesn't list them as missing a recipe. */
export const NOT_DRAWN: Readonly<Record<string, string>> = {
  show: 'Show only toggles visibility.',
  hide: 'Hide only toggles visibility.',
  sonner: "Sonner's toast is the Toast recipe.",
};
