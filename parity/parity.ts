// What may differ between @nxds/react and @nxds/vue. React is the reference:
// anything not listed here is drift. Every entry must still match something,
// so a fixed difference fails until its entry is deleted.

/** React components Vue doesn't ship yet. */
export const planned = [
  'appearance-settings',
  'brand-color-field',
  'chart',
  'color-field',
  'config-preview',
  'setting-row',
  'sidebar',
  'theme-quick-control',
  'toolbar',
];

/** Components both packages ship, appearance aside: it has its own contract. */
export const shared = [
  'accordion',
  'alert',
  'alert-dialog',
  'aspect-ratio',
  'attachment',
  'avatar',
  'badge',
  'breadcrumb',
  'bubble',
  'button',
  'button-group',
  'card',
  'carousel',
  'checkbox',
  'choice-card',
  'choice-row',
  'collapsible',
  'combobox',
  'command',
  'context-menu',
  'date-picker',
  'description-list',
  'dialog',
  'drawer',
  'dropdown-menu',
  'empty-state',
  'field',
  'filter-builder',
  'filter-chip',
  'filter-condition',
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
  'message',
  'message-scroller',
  'multi-select',
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
  'sonner',
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
const DAY_PICKER_PROP =
  "react-day-picker prop React inherits from its props type; Vue declares it over Reka's Calendar and RangeCalendar";
const HOVER_CARD_EVENT =
  "Reka exports no type for HoverCardContent's emits, so Vue declares them; React inherits the same handler from Radix's props type";

const REKA_SLOT_PROP =
  "Reka root's slot prop, which the Vue part passes on to its default slot; Radix's part passes its children nothing";
const SCROLL_SLOT_PROP =
  "useMessageScroller's state as a slot prop, so a template beside the scroller reads it without a child component; React calls the hook in a child";

/**
 * Props, slots and events only the Vue part declares, as `{Part}.{name}`,
 * and props its default slot passes, as `{Part}.default.{name}`.
 * React's `ReactNode` props map to kebab-case slots, own `on*` props to own
 * emits, and `asChild` to Reka's inherited `PrimitiveProps`.
 */
export const vueOnlyApi: Record<string, string> = {
  'Accordion.default.modelValue': REKA_SLOT_PROP,
  'AccordionItem.default.open': REKA_SLOT_PROP,
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
  'Collapsible.default.open': REKA_SLOT_PROP,
  'ComboboxTrigger.disabled':
    'native <button> attribute React inherits from its props type; Vue declares it to pass on to Button',
  'ComboboxTrigger.type':
    "native <button> attribute React inherits from its props type; Vue declares it to default to 'button'",
  'ComboboxGroup.forceMount': CMDK_PROP,
  'ComboboxGroup.heading': CMDK_PROP,
  'ComboboxInput.modelValue':
    "v-model search text; React's cmdk value prop is inherited from its props type",
  'ComboboxInput.update:modelValue':
    "v-model update; React's cmdk onValueChange is inherited from its props type",
  'ComboboxItem.disabled': CMDK_PROP,
  'ComboboxItem.forceMount': CMDK_PROP,
  'ComboboxItem.keywords': CMDK_PROP,
  'ComboboxItem.select':
    "the item's value, as React's cmdk onSelect passes it, inherited from its props type",
  'ComboboxItem.value': CMDK_PROP,
  'ComboboxList.label': CMDK_PROP,
  'ComboboxSeparator.alwaysRender': CMDK_PROP,
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
  'DatePicker.captionLayout': DAY_PICKER_PROP,
  'DatePicker.defaultValue': DAY_PICKER_PROP,
  'DatePicker.footer': DAY_PICKER_PROP,
  'DatePicker.mode': DAY_PICKER_PROP,
  'DatePicker.modelValue':
    "v-model date, dates or range; React's selected is inherited from react-day-picker's props type",
  'DatePicker.showOutsideDays': DAY_PICKER_PROP,
  'DatePicker.today': DAY_PICKER_PROP,
  'DatePicker.update:modelValue':
    "v-model update; React's onSelect is inherited from react-day-picker's props type",
  'DatePicker.update:placeholder':
    "v-model:placeholder update for the shown month; React's onMonthChange is inherited from react-day-picker's props type",
  'DatePickerDayButton.modifiers':
    "the day's state; React's modifiers prop is inherited from react-day-picker's DayButton props type",
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
  'MessageScrollerButton.disabled':
    'native <button> attribute React inherits from its props type; Vue declares it to pass on to Button',
  'MessageScrollerButton.type':
    "native <button> attribute React inherits from its props type; Vue declares it to default to 'button'",
  'MessageScrollerProvider.default.isAtEnd': SCROLL_SLOT_PROP,
  'MessageScrollerProvider.default.isAtStart': SCROLL_SLOT_PROP,
  'MessageScrollerProvider.default.isScrollable': SCROLL_SLOT_PROP,
  'MessageScrollerProvider.default.scrollToEnd': SCROLL_SLOT_PROP,
  'MessageScrollerProvider.default.scrollToStart': SCROLL_SLOT_PROP,
  'MultiSelectGroup.forceMount': CMDK_PROP,
  'MultiSelectGroup.heading': CMDK_PROP,
  'MultiSelectItem.disabled': CMDK_PROP,
  'MultiSelectItem.forceMount': CMDK_PROP,
  'MultiSelectItem.keywords': CMDK_PROP,
  'MultiSelectSeparator.alwaysRender': CMDK_PROP,
  'NativeSelect.defaultValue': NATIVE_DEFAULT_VALUE,
  'NativeSelect.modelValue': NATIVE_MODEL_VALUE,
  'NativeSelect.update:modelValue': NATIVE_MODEL_UPDATE,
  'ResizablePanel.default.collapse': REKA_SLOT_PROP,
  'ResizablePanel.default.expand': REKA_SLOT_PROP,
  'ResizablePanel.default.isCollapsed': REKA_SLOT_PROP,
  'ResizablePanel.default.isExpanded': REKA_SLOT_PROP,
  'ResizablePanel.default.resize': REKA_SLOT_PROP,
  'ResizablePanelGroup.default.layout': REKA_SLOT_PROP,
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

/**
 * Packages, or a scope of them, whose props a Vue part takes from a twin: the
 * DOM attributes React's types declare, Radix's from Reka, Vaul's from
 * vaul-vue, and Sonner's from vue-sonner.
 */
export const twinPackages = ['@radix-ui', '@types/react', 'sonner', 'vaul'];

/**
 * Packages whose components Vue rebuilds over Reka rather than inheriting a
 * twin's props. The props check can't see the props React inherits from them.
 */
export const rebuiltPackages = [
  'cmdk',
  'input-otp',
  'react-day-picker',
  'react-resizable-panels',
];

const CMDK_AS_CHILD =
  "cmdk's Radix Primitive asChild; the Vue part renders its own element over Reka's Listbox";
const CMDK_GROUP_VALUE =
  'cmdk ranks a group by its value; Vue keeps groups in the order they are written (see command/SearchRanking)';
const CMDK_SEARCH = 'Vue binds the search text with v-model as modelValue';
const CMDK_HIGHLIGHT =
  "cmdk's controlled highlighted item; Reka's Listbox keeps the highlight itself";
const DAY_PICKER_NATIVE =
  'native attribute react-day-picker redeclares; Vue passes it to the root as a fallthrough attribute';
const DAY_PICKER_BOUNDS =
  'Reka bounds navigation and picking with minValue and maxValue';
const DAY_PICKER_PARTS =
  "react-day-picker's per-part styling and rendering hooks; the Vue picker renders and styles its own parts";
const DAY_PICKER_DAY_EVENT =
  "Reka's day cells take no listeners from the root; listen on the #day-content slot's content";
const DAY_PICKER_DATE_LIB =
  'date-fns option; Reka dates are @internationalized/date values, which carry their own calendar and time zone';
const DAY_PICKER_NOT_PORTED =
  "react-day-picker option with no twin in Reka's Calendar, so the Vue picker doesn't take it";
const OTP_HIDDEN_INPUT =
  "input-otp's tuning for its one hidden <input>; Reka gives each slot its own input";
const OTP_CODE = 'Vue binds the code with v-model as modelValue';
const RESIZABLE_REF =
  'React ref to the DOM node or imperative API; Vue reaches both through a template ref';
const RESIZABLE_DISABLED =
  "Reka's Splitter disables a handle, not a panel or group; set disabled on ResizableHandle";
const RESIZABLE_NOT_PORTED =
  "react-resizable-panels option with no twin in Reka's Splitter, so the Vue part doesn't take it";

/**
 * Props a React part inherits from a rebuilt package that the Vue part has no
 * prop, slot or emit of the same name for, as `{Part}.{prop}`.
 */
export const reactOnlyInheritedProps: Record<string, string> = {
  'ComboboxEmpty.asChild': CMDK_AS_CHILD,
  'ComboboxGroup.asChild': CMDK_AS_CHILD,
  'ComboboxGroup.value': CMDK_GROUP_VALUE,
  'ComboboxInput.asChild': CMDK_AS_CHILD,
  'ComboboxInput.onValueChange': CMDK_SEARCH,
  'ComboboxInput.value': CMDK_SEARCH,
  'ComboboxItem.asChild': CMDK_AS_CHILD,
  'ComboboxList.asChild': CMDK_AS_CHILD,
  'ComboboxSeparator.asChild': CMDK_AS_CHILD,
  'Command.asChild': CMDK_AS_CHILD,
  'Command.defaultValue': CMDK_HIGHLIGHT,
  'Command.disablePointerSelection':
    "Vue always highlights the hovered item, through Reka's highlightOnHover",
  'Command.filter':
    "Vue scores items with cmdk's own commandScore; set shouldFilter to false to filter them yourself",
  'Command.onValueChange': CMDK_HIGHLIGHT,
  'Command.value': CMDK_HIGHLIGHT,
  'Command.vimBindings': "Reka's Listbox has no Ctrl+J/K/N/P bindings",
  'CommandEmpty.asChild': CMDK_AS_CHILD,
  'CommandGroup.asChild': CMDK_AS_CHILD,
  'CommandGroup.value': CMDK_GROUP_VALUE,
  'CommandInput.asChild': CMDK_AS_CHILD,
  'CommandInput.onValueChange': CMDK_SEARCH,
  'CommandInput.value': CMDK_SEARCH,
  'CommandItem.asChild': CMDK_AS_CHILD,
  'CommandList.asChild': CMDK_AS_CHILD,
  'CommandLoading.asChild': CMDK_AS_CHILD,
  'CommandSeparator.asChild': CMDK_AS_CHILD,
  'DatePicker.animate': DAY_PICKER_NOT_PORTED,
  'DatePicker.aria-label': DAY_PICKER_NATIVE,
  'DatePicker.aria-labelledby': DAY_PICKER_NATIVE,
  'DatePicker.autoFocus': 'Reka takes it as initialFocus',
  'DatePicker.broadcastCalendar': DAY_PICKER_DATE_LIB,
  'DatePicker.classNames': DAY_PICKER_PARTS,
  'DatePicker.components': DAY_PICKER_PARTS,
  'DatePicker.dateLib': DAY_PICKER_DATE_LIB,
  'DatePicker.defaultMonth':
    'Reka takes the starting month as defaultPlaceholder',
  'DatePicker.disableNavigation': DAY_PICKER_NOT_PORTED,
  'DatePicker.endMonth': DAY_PICKER_BOUNDS,
  'DatePicker.firstWeekContainsDate': DAY_PICKER_DATE_LIB,
  'DatePicker.formatters': DAY_PICKER_PARTS,
  'DatePicker.fromDate': DAY_PICKER_BOUNDS,
  'DatePicker.fromMonth': DAY_PICKER_BOUNDS,
  'DatePicker.fromYear': DAY_PICKER_BOUNDS,
  'DatePicker.hidden': DAY_PICKER_NOT_PORTED,
  'DatePicker.hideNavigation': DAY_PICKER_NOT_PORTED,
  'DatePicker.hideWeekdays': DAY_PICKER_NOT_PORTED,
  'DatePicker.id': DAY_PICKER_NATIVE,
  'DatePicker.ISOWeek': 'Vue starts the week on Monday with weekStartsOn: 1',
  'DatePicker.labels': DAY_PICKER_PARTS,
  'DatePicker.lang': DAY_PICKER_NATIVE,
  'DatePicker.max': DAY_PICKER_NOT_PORTED,
  'DatePicker.min': DAY_PICKER_NOT_PORTED,
  'DatePicker.modifiers':
    "Reka marks days with isDateDisabled and isDateUnavailable, and the #day-content slot reads each day's state",
  'DatePicker.modifiersClassNames': DAY_PICKER_PARTS,
  'DatePicker.modifiersStyles': DAY_PICKER_PARTS,
  'DatePicker.month':
    "Vue binds the shown month with v-model:placeholder, Reka's name for it",
  'DatePicker.navLayout': DAY_PICKER_NOT_PORTED,
  'DatePicker.nonce': DAY_PICKER_NOT_PORTED,
  'DatePicker.noonSafe': DAY_PICKER_DATE_LIB,
  'DatePicker.numerals': DAY_PICKER_DATE_LIB,
  'DatePicker.onDayBlur': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayClick': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayFocus': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayKeyDown': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayKeyPress': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayKeyUp': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayMouseEnter': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayMouseLeave': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayPointerEnter': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayPointerLeave': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayTouchCancel': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayTouchEnd': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayTouchMove': DAY_PICKER_DAY_EVENT,
  'DatePicker.onDayTouchStart': DAY_PICKER_DAY_EVENT,
  'DatePicker.onMonthChange':
    "Vue binds the shown month with v-model:placeholder, Reka's name for it",
  'DatePicker.onNextClick': DAY_PICKER_NOT_PORTED,
  'DatePicker.onPrevClick': DAY_PICKER_NOT_PORTED,
  'DatePicker.onSelect':
    'Vue binds the date, dates or range with v-model as modelValue',
  'DatePicker.onWeekNumberClick': DAY_PICKER_NOT_PORTED,
  'DatePicker.required': 'Reka takes it as preventDeselect',
  'DatePicker.resetOnSelect': DAY_PICKER_NOT_PORTED,
  'DatePicker.reverseMonths': DAY_PICKER_NOT_PORTED,
  'DatePicker.reverseYears': DAY_PICKER_NOT_PORTED,
  'DatePicker.role': DAY_PICKER_NATIVE,
  'DatePicker.selected':
    'Vue binds the date, dates or range with v-model as modelValue',
  'DatePicker.showWeekNumber': DAY_PICKER_NOT_PORTED,
  'DatePicker.startMonth': DAY_PICKER_BOUNDS,
  'DatePicker.styles': DAY_PICKER_PARTS,
  'DatePicker.timeZone': DAY_PICKER_DATE_LIB,
  'DatePicker.title': DAY_PICKER_NATIVE,
  'DatePicker.toDate': DAY_PICKER_BOUNDS,
  'DatePicker.toMonth': DAY_PICKER_BOUNDS,
  'DatePicker.toYear': DAY_PICKER_BOUNDS,
  'DatePicker.useAdditionalDayOfYearTokens': DAY_PICKER_DATE_LIB,
  'DatePicker.useAdditionalWeekYearTokens': DAY_PICKER_DATE_LIB,
  'InputOTP.containerClassName':
    "input-otp's wrapper around its hidden <input>; the Vue root has no wrapper and takes class",
  'InputOTP.maxLength':
    'the number of InputOTPSlot parts sets the code length, as Reka counts its inputs',
  'InputOTP.noScriptCSSFallback': OTP_HIDDEN_INPUT,
  'InputOTP.onChange': OTP_CODE,
  'InputOTP.pasteTransformer':
    "Reka's PinInput has no hook to rewrite pasted text",
  'InputOTP.pushPasswordManagerStrategy': OTP_HIDDEN_INPUT,
  'InputOTP.textAlign': OTP_HIDDEN_INPUT,
  'InputOTP.value': OTP_CODE,
  'MultiSelectGroup.asChild': CMDK_AS_CHILD,
  'MultiSelectGroup.value': CMDK_GROUP_VALUE,
  'MultiSelectItem.asChild': CMDK_AS_CHILD,
  'MultiSelectSeparator.asChild': CMDK_AS_CHILD,
  'ResizableHandle.disableDoubleClick':
    "Reka's handle has no double-click reset to turn off",
  'ResizableHandle.elementRef': RESIZABLE_REF,
  'ResizablePanel.disabled': RESIZABLE_DISABLED,
  'ResizablePanel.elementRef': RESIZABLE_REF,
  'ResizablePanel.groupResizeBehavior': RESIZABLE_NOT_PORTED,
  'ResizablePanel.panelRef': RESIZABLE_REF,
  'ResizablePanelGroup.disableCursor': RESIZABLE_NOT_PORTED,
  'ResizablePanelGroup.disabled': RESIZABLE_DISABLED,
  'ResizablePanelGroup.elementRef': RESIZABLE_REF,
  'ResizablePanelGroup.groupRef': RESIZABLE_REF,
  'ResizablePanelGroup.resizeTargetMinimumSize':
    "Reka sizes a handle's hit area with hitAreaMargins on ResizableHandle",
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
  'command/SearchRanking':
    'cmdk sorts the matches by score; Vue keeps them in the order they are written, since sorting would move DOM nodes Vue owns, so Enter runs another item',
  'date-picker/Accessibility':
    "react-day-picker labels a day 'Today, Wednesday, January 15th, 2025, selected'; Reka labels it 'Wednesday, January 15, 2025' and marks selection with aria-selected on the cell, so Vue checks those",
  'avatar/WithDataAttributes': AVATAR_IMAGE_LOAD,
  'bubble/WithTooltip': GRACE_AREA,
  'hover-card/OpenCloseInteraction': GRACE_AREA,
  'input-otp/KeyboardInteraction': PIN_INPUT,
  'input-otp/Paste': PIN_INPUT,
  'message/WithActions': GRACE_AREA,
  'tabs/DisabledTabInteraction': TABS_INDICATOR,
  'tabs/UnderlineVariant': TABS_INDICATOR,
  'tabs/VerticalIndicatorFollowsActiveTab': TABS_INDICATOR,
  'tooltip/GroupedInProvider': GRACE_AREA,
  'tooltip/HoverInteraction': GRACE_AREA,
  'tooltip/WithDataAttributes': GRACE_AREA,
  'toggle-group/ControlledDisabledTransition':
    "clearing a single selection emits '' from Radix and undefined from Reka",
};

/** Parts whose `data-slot` doesn't start with their component's slug, as `{data-slot}: slug`. */
export const slotOwners: Record<string, string> = {
  toaster: 'sonner',
};

/** Parts whose rendered element differs by design, by `data-slot`; the rendered check skips them. */
export const renderedDifferences: Record<string, string> = {
  'avatar-image':
    'Radix mounts the <img> only once it loads; Reka mounts it at once as role="img", hidden until it loads',
  'date-picker':
    "react-day-picker adds its rdp-* classes to the root; Reka names the root and adds a hidden live label, 'Event Date, January 2025'",
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

const GROUP_VALUE =
  'cmdk sets data-value to the string "undefined" on a group without a heading; Vue leaves it off';
const POPOVER_NAME =
  "Reka names the popover's dialog after its trigger with aria-labelledby, over the aria-label React's name comes from";

const ORIENTATION_ON_ITEMS =
  "Radix's roving focus repeats the menu's orientation on each item; Reka doesn't";

/**
 * Attributes of a part that differ by design, as `{data-slot} {attribute}`,
 * with `name` for the accessible name; the rendered check compares the rest.
 */
export const renderedAttributeDifferences: Record<string, string> = {
  'combobox-content name': POPOVER_NAME,
  'combobox-group data-value': GROUP_VALUE,
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
  'multi-select-content name': POPOVER_NAME,
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
  'date-picker/index.ts#DatePickerKey':
    'Vue injection key the picker provides to its days and captions; React passes the same options through context and react-day-picker props',
  'date-picker/index.ts#injectDatePicker':
    "reads DatePickerKey and throws outside a DatePicker, as React's context hook does",
  'input-otp/index.ts#InputOTPKey':
    "Vue injection key the root provides so each slot's <input> takes the field's name; React's single <input> carries it",
  'multi-select/index.ts#MultiSelectKey':
    'Vue injection key the root provides to its parts; React passes the same selection through context',
  'multi-select/index.ts#injectMultiSelect':
    "reads MultiSelectKey and throws outside a MultiSelect, as React's context hook does",
  'table/index.ts#TableKey':
    'Vue injection key the table provides to its rows and cells; React passes the same state through context',
  'table/index.ts#tableContextDefaults':
    "what a cell outside a Table injects; React's context default holds the same values",
  'tabs/index.ts#TabsListKey':
    'Vue injection key the list provides to its triggers; React passes the same state through context',
  'toggle-group/index.ts#ToggleGroupKey':
    'Vue injection key the group provides to its items; React passes the same state through context',
};

/** Top-level values a Vue recipe file declares under React's name with a body only its framework can write, as `{file}#{name}`. */
export const frameworkDeclarations: Record<string, string> = {
  'message-scroller/index.ts#useMessageScroller':
    "injects the provider's state; React's hook reads its context",
  'sonner/index.ts#useNxdsToasts':
    "filters vue-sonner's active toasts in a computed; React's hook filters sonner's useSonner list",
};

/** Files Vue copies from React byte for byte, as `[react, vue]` repo paths. */
export const copies: [react: string, vue: string][] = [
  ['packages/react/src/lib/utils.ts', 'packages/vue/src/lib/utils.ts'],
  ['packages/react/src/lib/motion.ts', 'packages/vue/src/lib/motion.ts'],
  [
    'packages/react/src/lib/filter-model.ts',
    'packages/vue/src/lib/filter-model.ts',
  ],
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
    'packages/react/src/stories/support/motion-test-utils.ts',
    'packages/vue/src/stories/support/motion-test-utils.ts',
  ],
  [
    'packages/react/src/stories/support/overlay-motion-test-utils.ts',
    'packages/vue/src/stories/support/overlay-motion-test-utils.ts',
  ],
];

/** Dependencies both packages declare, as `[react, vue]` names, which must take the same range. */
export const dependencies: [react: string, vue: string][] = [
  ['@hugeicons/core-free-icons', '@hugeicons/core-free-icons'],
  ['@nxds/core', '@nxds/core'],
  ['@nxds/tailwind', '@nxds/tailwind'],
  ['@remixicon/react', '@remixicon/vue'],
  ['@tabler/icons-react', '@tabler/icons-vue'],
  ['lucide-react', '@lucide/vue'],
  ['class-variance-authority', 'class-variance-authority'],
  ['clsx', 'clsx'],
  ['tailwind-merge', 'tailwind-merge'],
];
