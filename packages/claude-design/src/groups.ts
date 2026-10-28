/** Component folders the export leaves out: the editors need the appearance provider. */
export const EXCLUDED_SLUGS: ReadonlySet<string> = new Set(['appearance']);

/** The part a card's canvas example mounts, where no part shares the card's name. */
export const ROOT_PARTS: Readonly<Record<string, string>> = {
  Chart: 'BarChart',
  Resizable: 'ResizablePanelGroup',
  Sonner: 'Toaster',
};

// The card groups on the system page, in display order. The bundle header
// lists components in this order too. Every exported component folder needs a
// place here; the build fails on one that has none.
export const GROUPS: readonly (readonly [string, readonly string[]])[] = [
  ['Actions', ['Button', 'ButtonGroup', 'Toggle', 'ToggleGroup', 'Toolbar']],
  [
    'Forms',
    [
      'Field',
      'Label',
      'Input',
      'InputGroup',
      'InputOTP',
      'Textarea',
      'Checkbox',
      'RadioGroup',
      'Switch',
      'Slider',
      'Select',
      'NativeSelect',
      'Combobox',
      'MultiSelect',
      'DatePicker',
      'ChoiceCard',
      'ChoiceRow',
    ],
  ],
  [
    'Overlays',
    [
      'Dialog',
      'AlertDialog',
      'Sheet',
      'Drawer',
      'Popover',
      'HoverCard',
      'Tooltip',
      'DropdownMenu',
      'ContextMenu',
      'Menubar',
      'Command',
    ],
  ],
  [
    'Navigation',
    [
      'Sidebar',
      'PageHeader',
      'Breadcrumb',
      'Tabs',
      'NavigationMenu',
      'Pagination',
    ],
  ],
  [
    'Data display',
    [
      'Table',
      'Chart',
      'Card',
      'DescriptionList',
      'Item',
      'Avatar',
      'Badge',
      'Kbd',
      'CodeBlock',
      'Marker',
      'Accordion',
      'Collapsible',
      'Carousel',
    ],
  ],
  [
    'Feedback',
    ['Alert', 'Sonner', 'Progress', 'Spinner', 'Skeleton', 'EmptyState'],
  ],
  ['Messaging', ['Message', 'MessageScroller', 'Bubble', 'Attachment']],
  ['Filtering', ['FilterBuilder', 'FilterCondition', 'FilterChip']],
  [
    'Layout',
    ['Separator', 'ScrollArea', 'Resizable', 'AspectRatio', 'Show', 'Hide'],
  ],
];
