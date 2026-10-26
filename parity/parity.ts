// What may differ between @nxds/react and @nxds/vue. React is the reference:
// anything not listed here is drift. Every entry must still match something,
// so a fixed difference fails until its entry is deleted.

/** React components Vue doesn't ship yet. */
export const planned = [
  'appearance-settings',
  'attachment',
  'brand-color-field',
  'bubble',
  'chart',
  'color-field',
  'combobox',
  'config-preview',
  'date-picker',
  'filter-builder',
  'filter-chip',
  'filter-condition',
  'message',
  'message-scroller',
  'multi-select',
  'setting-row',
  'sidebar',
  'sonner',
  'theme-quick-control',
  'toolbar',
];

/** Components both packages ship, appearance aside: it has its own contract. */
export const shared = [
  'accordion',
  'alert',
  'alert-dialog',
  'aspect-ratio',
  'avatar',
  'badge',
  'breadcrumb',
  'button',
  'button-group',
  'card',
  'carousel',
  'checkbox',
  'choice-card',
  'choice-row',
  'collapsible',
  'command',
  'context-menu',
  'description-list',
  'dialog',
  'drawer',
  'dropdown-menu',
  'empty-state',
  'field',
  'hide',
  'hover-card',
  'input',
  'input-group',
  'input-otp',
  'item',
  'kbd',
  'label',
  'marker',
  'menubar',
  'native-select',
  'navigation-menu',
  'page-header',
  'pagination',
  'popover',
  'progress',
  'radio-group',
  'resizable',
  'scroll-area',
  'select',
  'separator',
  'sheet',
  'show',
  'skeleton',
  'slider',
  'spinner',
  'switch',
  'table',
  'tabs',
  'textarea',
  'toggle',
  'toggle-group',
  'tooltip',
];

const NATIVE_MODEL_VALUE =
  "v-model value; React's native value prop is inherited from its props type";
const NATIVE_DEFAULT_VALUE =
  "starting value without v-model; React's native defaultValue is inherited from its props type";
const NATIVE_MODEL_UPDATE =
  "v-model update; React's native onChange is inherited from its props type";
const CMDK_PROP =
  "cmdk prop React inherits from cmdk's props type; Vue declares it over Reka's Listbox";
const HOVER_CARD_EVENT =
  "Reka exports no type for HoverCardContent's emits, so Vue declares them; React inherits the same handler from Radix's props type";

/**
 * Props, slots and events only the Vue part declares, as `{Part}.{name}`.
 * React's `ReactNode` props map to kebab-case slots, own `on*` props to own
 * emits, and `asChild` to Reka's inherited `PrimitiveProps`.
 */
export const vueOnlyApi: Record<string, string> = {
  'Button.disabled':
    'native <button> attribute React inherits from its props type; Vue declares it so the spinner state can read it',
  'Button.type':
    "native <button> attribute React inherits from its props type; Vue declares it to default to 'button'",
  'CarouselNext.disabled':
    'native <button> attribute React inherits from its props type; Vue declares it so a set value overrides the scroll state',
  'CarouselNext.type':
    "native <button> attribute React inherits from its props type; Vue declares it to default to 'button'",
  'CarouselPrevious.disabled':
    'native <button> attribute React inherits from its props type; Vue declares it so a set value overrides the scroll state',
  'CarouselPrevious.type':
    "native <button> attribute React inherits from its props type; Vue declares it to default to 'button'",
  'Command.label': CMDK_PROP,
  'Command.loop': CMDK_PROP,
  'Command.shouldFilter': CMDK_PROP,
  'CommandGroup.forceMount': CMDK_PROP,
  'CommandGroup.heading': CMDK_PROP,
  'CommandInput.modelValue':
    "v-model search text; React's cmdk value prop is inherited from its props type",
  'CommandInput.update:modelValue':
    "v-model update; React's cmdk onValueChange is inherited from its props type",
  'CommandItem.disabled': CMDK_PROP,
  'CommandItem.forceMount': CMDK_PROP,
  'CommandItem.keywords': CMDK_PROP,
  'CommandItem.select':
    "the item's value, as React's cmdk onSelect passes it, inherited from its props type",
  'CommandItem.value': CMDK_PROP,
  'CommandList.label': CMDK_PROP,
  'CommandLoading.label': CMDK_PROP,
  'CommandLoading.progress': CMDK_PROP,
  'CommandSeparator.alwaysRender': CMDK_PROP,
  'HoverCardContent.escapeKeyDown': HOVER_CARD_EVENT,
  'HoverCardContent.focusOutside': HOVER_CARD_EVENT,
  'HoverCardContent.interactOutside': HOVER_CARD_EVENT,
  'HoverCardContent.pointerDownOutside': HOVER_CARD_EVENT,
  'Input.defaultValue': NATIVE_DEFAULT_VALUE,
  'Input.modelValue': NATIVE_MODEL_VALUE,
  'Input.update:modelValue': NATIVE_MODEL_UPDATE,
  'InputGroupButton.disabled':
    'native <button> attribute React inherits from its props type; Vue declares it to pass on to Button',
  'InputGroupButton.type':
    "native <button> attribute React inherits from its props type; Vue declares it to default to 'button'",
  'InputGroupInput.defaultValue': NATIVE_DEFAULT_VALUE,
  'InputGroupInput.modelValue': NATIVE_MODEL_VALUE,
  'InputGroupInput.update:modelValue': NATIVE_MODEL_UPDATE,
  'InputGroupTextarea.defaultValue': NATIVE_DEFAULT_VALUE,
  'InputGroupTextarea.modelValue': NATIVE_MODEL_VALUE,
  'InputGroupTextarea.update:modelValue': NATIVE_MODEL_UPDATE,
  'InputOTP.complete':
    "the code as a string, as React passes it; React's onComplete is inherited from input-otp's props type",
  'InputOTP.defaultValue':
    "starting code without v-model; React's defaultValue is inherited from input-otp's props type",
  'InputOTP.modelValue':
    "v-model code as a string; React's value is inherited from input-otp's props type",
  'InputOTP.update:modelValue':
    "v-model update with the code as a string; React's onChange is inherited from input-otp's props type",
  'NativeSelect.defaultValue': NATIVE_DEFAULT_VALUE,
  'NativeSelect.modelValue': NATIVE_MODEL_VALUE,
  'NativeSelect.update:modelValue': NATIVE_MODEL_UPDATE,
  'Switch.thumb':
    'slot for custom thumb content; React renders the thumb itself with no way to compose it',
  'Textarea.defaultValue': NATIVE_DEFAULT_VALUE,
  'Textarea.modelValue': NATIVE_MODEL_VALUE,
  'Textarea.update:modelValue': NATIVE_MODEL_UPDATE,
  'ToggleGroup.update:modelValue':
    "v-model update narrowed to the string values items take; React's onValueChange is inherited from Radix's props type",
  'ToggleGroupItem.value':
    "string, as Radix types it, so aria-checked matches Reka's pressed state; React inherits value from Radix's props type",
};

const V_MODEL = 'v-model binding, a Vue idiom with no React counterpart';
const REACT_REF =
  "checks a React ref reaches the DOM node, which packages/react-18's forwardRef wrapping must keep; Vue has template refs";

/** Play stories only one framework has, as `{slug}/{Story}`. */
export const behaviourOnlyIn: Record<
  'react' | 'vue',
  Record<string, string>
> = {
  react: {
    'button/RefForwarding': REACT_REF,
    'tabs/ListRef': REACT_REF,
  },
  vue: {
    'accordion/VModel': V_MODEL,
    'checkbox/VModel': V_MODEL,
    'collapsible/VModel': V_MODEL,
    'input/VModel': V_MODEL,
    'input-otp/SlotNaming':
      "each slot is its own <input>, so Vue forwards the field's name and invalid state to it; React's single <input> carries them",
    'input-otp/VModel': V_MODEL,
    'native-select/VModel': V_MODEL,
    'radio-group/VModel': V_MODEL,
    'slider/VModel': V_MODEL,
    'switch/VModel': V_MODEL,
    'textarea/VModel': V_MODEL,
    'toggle-group/VModel': V_MODEL,
    'switch/ThumbSlot': 'the #thumb slot is Vue-only API (see vueOnlyApi)',
    'tabs/IndicatorFollowsActiveTab':
      "pins Reka's horizontal indicator geometry; React's measured indicator is pinned by UnderlineVariant",
  },
};

const PIN_INPUT =
  'React types into one hidden input; Reka gives each slot its own input, so Vue reads the code from the slots';

const AVATAR_IMAGE_LOAD =
  'Radix mounts the image once it loads; Reka mounts it hidden at once, so Vue waits for it to show';

const GRACE_AREA =
  "user-event's unhover leaves the pointer at (0, 0); Reka keeps the content open until a pointer move lands outside its trigger-to-content grace area, so Vue moves the pointer away";

const TABS_INDICATOR =
  "React waits for its measured indicator's opacity and transform; Reka's indicator has neither, so Vue checks only the geometry";

/** Paired play stories whose steps differ by design, as `{slug}/{Story}`. */
export const behaviourDifferences: Record<string, string> = {
  'avatar/CroppedImage': AVATAR_IMAGE_LOAD,
  'avatar/WithDataAttributes': AVATAR_IMAGE_LOAD,
  'hover-card/OpenCloseInteraction': GRACE_AREA,
  'input-otp/KeyboardInteraction': PIN_INPUT,
  'input-otp/Paste': PIN_INPUT,
  'tabs/DisabledTabInteraction': TABS_INDICATOR,
  'tabs/UnderlineVariant': TABS_INDICATOR,
  'tabs/VerticalIndicatorFollowsActiveTab': TABS_INDICATOR,
  'tooltip/GroupedInProvider': GRACE_AREA,
  'tooltip/HoverInteraction': GRACE_AREA,
  'tooltip/WithDataAttributes': GRACE_AREA,
  'toggle-group/ControlledDisabledTransition':
    "clearing a single selection emits '' from Radix and undefined from Reka",
};

/** Parts whose rendered element differs by design, by `data-slot`; the rendered check skips them. */
export const renderedDifferences: Record<string, string> = {
  'avatar-image':
    'Radix mounts the <img> only once it loads; Reka mounts it at once as role="img", hidden until it loads',
  'input-otp':
    "input-otp puts data-slot on its hidden <input>; Vue's root is Reka's PinInputRoot <div>",
  'input-otp-slot':
    "React's slot is a <div> that shows the character; Vue's slot is Reka's PinInputInput <input>",
  'tabs-indicator':
    "Radix has no indicator, so React measures the active tab and moves a span; Vue renders Reka's TabsIndicator, which reads Reka's CSS variables",
};

const SPLITTER_ID =
  'Reka copies its generated id into its own data attribute; react-resizable-panels sets none';
const SPLITTER_TEST_ID =
  'react-resizable-panels copies its generated id into data-testid; Reka sets none';
const SPLITTER_STATE_RRP =
  'react-resizable-panels marks its part with its own data attribute; Reka marks it with its own instead';
const SPLITTER_RANGE =
  "react-resizable-panels and Reka work out a handle's range differently once a group holds more than two panels";
const SPLITTER_STATE_REKA =
  "Reka's splitter bookkeeping attribute; react-resizable-panels marks the part with its own instead";

const ORIENTATION_ON_ITEMS =
  "Radix's roving focus repeats the menu's orientation on each item; Reka doesn't";

/**
 * Attributes of a part that differ by design, as `{data-slot} {attribute}`,
 * with `name` for the accessible name; the rendered check compares the rest.
 */
export const renderedAttributeDifferences: Record<string, string> = {
  'context-menu-checkbox-item data-orientation': ORIENTATION_ON_ITEMS,
  'context-menu-item data-orientation': ORIENTATION_ON_ITEMS,
  'context-menu-radio-item data-orientation': ORIENTATION_ON_ITEMS,
  'context-menu-sub-trigger data-orientation': ORIENTATION_ON_ITEMS,
  'dropdown-menu-checkbox-item data-orientation': ORIENTATION_ON_ITEMS,
  'dropdown-menu-item data-orientation': ORIENTATION_ON_ITEMS,
  'dropdown-menu-radio-item data-orientation': ORIENTATION_ON_ITEMS,
  'dropdown-menu-sub-trigger data-orientation': ORIENTATION_ON_ITEMS,
  'menubar-checkbox-item data-orientation': ORIENTATION_ON_ITEMS,
  'menubar-item data-orientation': ORIENTATION_ON_ITEMS,
  'menubar-radio-item data-orientation': ORIENTATION_ON_ITEMS,
  'menubar-sub-trigger data-orientation': ORIENTATION_ON_ITEMS,
  'menubar-trigger data-value':
    'Reka gives each menubar menu a generated value; Radix sets none',
  'navigation-menu-content data-state':
    'Reka marks a flyout open inside the shared viewport; Radix sets its state only on a flyout under its own trigger',
  'resizable-handle aria-valuemax': SPLITTER_RANGE,
  'resizable-handle aria-valuemin': SPLITTER_RANGE,
  'resizable-handle data-orientation': SPLITTER_STATE_REKA,
  'resizable-handle data-panel-group-id': SPLITTER_ID,
  'resizable-handle data-panel-resize-handle-enabled': SPLITTER_STATE_REKA,
  'resizable-handle data-panel-resize-handle-id': SPLITTER_ID,
  'resizable-handle data-resize-handle': SPLITTER_STATE_REKA,
  'resizable-handle data-resize-handle-state': SPLITTER_STATE_REKA,
  'resizable-handle data-separator': SPLITTER_STATE_RRP,
  'resizable-handle data-state': SPLITTER_STATE_REKA,
  'resizable-handle data-testid': SPLITTER_TEST_ID,
  'resizable-panel data-panel':
    'react-resizable-panels sets data-panel to "true"; Reka sets it empty',
  'resizable-panel data-panel-group-id': SPLITTER_ID,
  'resizable-panel data-panel-id': SPLITTER_ID,
  'resizable-panel data-panel-size': SPLITTER_STATE_REKA,
  'resizable-panel data-testid': SPLITTER_TEST_ID,
  'resizable-panel-group data-group': SPLITTER_STATE_RRP,
  'resizable-panel-group data-orientation': SPLITTER_STATE_REKA,
  'resizable-panel-group data-panel-group-id': SPLITTER_ID,
  'resizable-panel-group data-panel-group': SPLITTER_STATE_REKA,
  'resizable-panel-group data-testid': SPLITTER_TEST_ID,
  'popover-content name':
    "Reka names the popover's dialog after its trigger with aria-labelledby; Radix leaves it unnamed",
};

/** Top-level values a Vue recipe file declares that React has no twin for, as `{file}#{name}`. */
export const vueOnlyDeclarations: Record<string, string> = {
  'avatar/index.ts#AvatarGroupKey':
    'Vue injection key the group provides to its avatars; React passes the same size and shape through context',
  'alert-dialog/index.ts#AlertDialogLayoutKey':
    'Vue injection key the content provides to its header and footer; React passes the same layout through context',
  'carousel/index.ts#CarouselKey':
    'Vue injection key the carousel provides to its parts; React passes the same state through context',
  'carousel/index.ts#injectCarousel':
    "reads CarouselKey and throws outside a Carousel, as React's context hook does",
  'command/index.ts#CommandKey':
    'Vue injection key the command provides to its parts; cmdk keeps the same search state in its React context',
  'command/index.ts#injectCommand':
    "reads CommandKey and throws outside a Command, as cmdk's context hook does",
  'command/index.ts#CommandGroupKey':
    'Vue injection key a group provides to its items; cmdk passes the same group through context',
  'input-otp/index.ts#InputOTPKey':
    "Vue injection key the root provides so each slot's <input> takes the field's name; React's single <input> carries it",
  'table/index.ts#TableKey':
    'Vue injection key the table provides to its rows and cells; React passes the same state through context',
  'table/index.ts#tableContextDefaults':
    "what a cell outside a Table injects; React's context default holds the same values",
  'tabs/index.ts#TabsListKey':
    'Vue injection key the list provides to its triggers; React passes the same state through context',
  'toggle-group/index.ts#ToggleGroupKey':
    'Vue injection key the group provides to its items; React passes the same state through context',
};

/** Files Vue copies from React byte for byte, as `[react, vue]` repo paths. */
export const copies: [react: string, vue: string][] = [
  ['packages/react/src/lib/utils.ts', 'packages/vue/src/lib/utils.ts'],
  ['packages/react/src/lib/motion.ts', 'packages/vue/src/lib/motion.ts'],
  [
    'packages/react/src/lib/field-size.ts',
    'packages/vue/src/lib/field-size.ts',
  ],
  [
    'packages/react/src/lib/responsive-visibility.ts',
    'packages/vue/src/lib/responsive-visibility.ts',
  ],
  [
    'packages/react/src/components/progress/progress.css',
    'packages/vue/src/components/progress/progress.css',
  ],
  [
    'packages/react/src/stories/support/autofill-pairing.ts',
    'packages/vue/src/stories/support/autofill-pairing.ts',
  ],
  [
    'packages/react/src/stories/support/story-height-test-utils.ts',
    'packages/vue/src/stories/support/story-height-test-utils.ts',
  ],
  [
    'packages/react/src/components/avatar/avatar-fixtures.ts',
    'packages/vue/src/stories/support/avatar-fixtures.ts',
  ],
  [
    'packages/react/src/stories/support/overlay-motion-test-utils.ts',
    'packages/vue/src/stories/support/overlay-motion-test-utils.ts',
  ],
];

/** Dependencies both packages declare, as `[react, vue]` names, which must take the same range. */
export const dependencies: [react: string, vue: string][] = [
  ['@nxds/core', '@nxds/core'],
  ['@nxds/tailwind', '@nxds/tailwind'],
  ['@tabler/icons-react', '@tabler/icons-vue'],
  ['class-variance-authority', 'class-variance-authority'],
  ['clsx', 'clsx'],
  ['tailwind-merge', 'tailwind-merge'],
];
