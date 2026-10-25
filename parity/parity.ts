// What may differ between @nxds/react and @nxds/vue. React is the reference:
// anything not listed here is drift. Every entry must still match something,
// so a fixed difference fails until its entry is deleted.

/** React components Vue doesn't ship yet. */
export const planned = [
  'accordion',
  'appearance-settings',
  'attachment',
  'avatar',
  'brand-color-field',
  'breadcrumb',
  'bubble',
  'carousel',
  'chart',
  'collapsible',
  'color-field',
  'combobox',
  'command',
  'config-preview',
  'date-picker',
  'description-list',
  'drawer',
  'empty-state',
  'filter-builder',
  'filter-chip',
  'filter-condition',
  'item',
  'marker',
  'message',
  'message-scroller',
  'multi-select',
  'navigation-menu',
  'page-header',
  'pagination',
  'resizable',
  'scroll-area',
  'setting-row',
  'sidebar',
  'sonner',
  'table',
  'theme-quick-control',
  'toolbar',
];

/** Components both packages ship, appearance aside: it has its own contract. */
export const shared = [
  'alert',
  'alert-dialog',
  'aspect-ratio',
  'badge',
  'button',
  'button-group',
  'card',
  'checkbox',
  'choice-card',
  'choice-row',
  'context-menu',
  'dialog',
  'dropdown-menu',
  'field',
  'hide',
  'hover-card',
  'input',
  'input-group',
  'input-otp',
  'kbd',
  'label',
  'menubar',
  'native-select',
  'popover',
  'progress',
  'radio-group',
  'select',
  'separator',
  'sheet',
  'show',
  'skeleton',
  'slider',
  'spinner',
  'switch',
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
  'Input.defaultValue': NATIVE_DEFAULT_VALUE,
  'Input.modelValue': NATIVE_MODEL_VALUE,
  'InputGroupButton.disabled':
    'native <button> attribute React inherits from its props type; Vue declares it to pass on to Button',
  'InputGroupButton.type':
    "native <button> attribute React inherits from its props type; Vue declares it to default to 'button'",
  'InputGroupInput.defaultValue': NATIVE_DEFAULT_VALUE,
  'InputGroupInput.modelValue': NATIVE_MODEL_VALUE,
  'InputGroupTextarea.defaultValue': NATIVE_DEFAULT_VALUE,
  'InputGroupTextarea.modelValue': NATIVE_MODEL_VALUE,
  'InputOTP.defaultValue':
    "starting code without v-model; React's defaultValue is inherited from input-otp's props type",
  'InputOTP.modelValue':
    "v-model code as a string; React's value is inherited from input-otp's props type",
  'NativeSelect.defaultValue': NATIVE_DEFAULT_VALUE,
  'NativeSelect.modelValue': NATIVE_MODEL_VALUE,
  'Switch.thumb':
    'slot for custom thumb content; React renders the thumb itself with no way to compose it',
  'Textarea.defaultValue': NATIVE_DEFAULT_VALUE,
  'Textarea.modelValue': NATIVE_MODEL_VALUE,
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
    'checkbox/VModel': V_MODEL,
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

const GRACE_AREA =
  "user-event's unhover leaves the pointer at (0, 0); Reka keeps the content open until a pointer move lands outside its trigger-to-content grace area, so Vue moves the pointer away";

const TABS_INDICATOR =
  "React waits for its measured indicator's opacity and transform; Reka's indicator has neither, so Vue checks only the geometry";

/** Paired play stories whose steps differ by design, as `{slug}/{Story}`. */
export const behaviourDifferences: Record<string, string> = {
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
  'input-otp':
    "input-otp puts data-slot on its hidden <input>; Vue's root is Reka's PinInputRoot <div>",
  'input-otp-slot':
    "React's slot is a <div> that shows the character; Vue's slot is Reka's PinInputInput <input>",
  'tabs-indicator':
    "Radix has no indicator, so React measures the active tab and moves a span; Vue renders Reka's TabsIndicator, which reads Reka's CSS variables",
};

/** Parts whose accessible name differs by design, by `data-slot`; the rendered check compares the rest of them. */
export const renderedNameDifferences: Record<string, string> = {
  'popover-content':
    "Reka names the popover's dialog after its trigger with aria-labelledby; Radix leaves it unnamed",
};

/** Top-level values a Vue recipe file declares that React has no twin for, as `{file}#{name}`. */
export const vueOnlyDeclarations: Record<string, string> = {
  'alert-dialog/index.ts#AlertDialogLayoutKey':
    'Vue injection key the content provides to its header and footer; React passes the same layout through context',
  'input-otp/index.ts#InputOTPKey':
    "Vue injection key the root provides so each slot's <input> takes the field's name; React's single <input> carries it",
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
