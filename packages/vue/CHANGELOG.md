# @nxds/vue

## 0.12.0

### Minor Changes

- 19e119b: Adds `iconOnly` to Button, and removes the Button sizes `icon-sm`, `icon` and `icon-lg`. `size` now sets only the height: `sm` (32px), `default` (40px) or `lg` (48px). An `iconOnly` button is square at that height and shows only its start icon. Its text stays in the DOM as the name screen readers read, visually hidden.

  ```tsx
  // Before
  <Button size="icon-sm" aria-label="Download">
    <IconDownload />
  </Button>

  // After
  <Button size="sm" iconOnly startIcon={<IconDownload />}>
    Download
  </Button>
  ```

  In Vue, pass the icon in the `#start-icon` slot:

  ```vue
  <Button size="sm" icon-only>
    <template #start-icon><IconDownload /></template>
    Download
  </Button>
  ```

  - In React, an `iconOnly` button must have string `children` and a `startIcon`, and can't take `asChild`. A missing name is a type error.
  - An `iconOnly` button in a `ButtonGroup` now takes the group's `size`. Before, it kept text padding or ignored the group.
  - A screen-size switch is one prop: `iconOnly={isNarrow}`.
  - `buttonVariants` takes `iconOnly` as a boolean variant.
  - ToolbarButton, ToolbarToggleItem and ToolbarTool take `startIcon` and `iconOnly` with the same rules.
  - InputGroupButton drops its `icon-xs` and `icon-sm` sizes for `iconOnly` at `xs` or `sm`.
  - PaginationLink takes `size` for its height and stays square.
  - PaginationPrevious and PaginationNext take `iconOnly` in place of `size="icon"`. They show only the chevron in a square, and the label stays as hidden text.
  - DatePicker day buttons render a native `<button>` with Button's styles and `data-slot="date-picker-day-button"`.
  - FilterConditionRemove takes its name as `children` text, visually hidden, in place of `aria-label`.

- 19e119b: Icons keep their size at every density, and follow the UI scale. Components that sized icons with spacing steps now use the `size-icon-glyph-*` utilities: 12px where `size-3` was, 14px where `size-3.5` was and 16px where `size-4` was (sizes at the Default scale). A RadioGroup dot is 6px smaller than the default icon (10px at Default), and a menu radio dot is 8px smaller (8px at Default). The InputOTP separator is a fixed 4px. Menu and Select item indicators use a wrapper the size of the default icon. Default density looks the same. In other densities, icons stop growing and shrinking. The `nx-class-conventions` lint rule now reports an icon that takes its size from a spacing step or a `--nx-spacing-*` variable. It checks `svg` selectors such as `[&_svg]:size-4`, and `Icon*` or `*Icon` elements such as `<IconX className="nx:size-4" />`. It checks story files too.
- 19e119b: Stroked icons draw a line that grows with the icon in every component, whatever their `strokeWidth`. The line is 0.5px plus the icon size ÷ 16: 1.25px at 12px, 1.5px at 16px and 2px at 24px. Lucide, Tabler Icons and HugeIcons draw strokes. Phosphor and Remix Icon draw filled shapes, so they keep their own line. Set `--nx-icon-stroke-base` and `--nx-icon-stroke-ratio` to change the line.

  | Package                        | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
  | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `@nxds/core`, `@nxds/tailwind` | Add the `--nx-icon-stroke-base` (0.5px) and `--nx-icon-stroke-ratio` (0.0625) tokens and the `icon-stroke` utility. The utility sets `stroke-width` and `vector-effect: non-scaling-stroke` on an `<svg>` it sits on or contains, and on every shape inside that `<svg>`. The line is the base plus `--nx-icon-size` times the ratio. Each `size-icon-glyph-*` utility sets `--nx-icon-size`, and an icon without it draws the line for a default icon.                                                                                                     |
  | `@nxds/react`, `@nxds/vue`     | Every part that draws an icon has `nx:icon-stroke`, such as Button, Toggle, menu items, Select, InputGroup addons, Badge, Alert, Tabs triggers, Sidebar menu buttons and Spinner. Icons use the named `size-icon-glyph-*` sizes, so they stay the same size at every density. The Resizable grip and the chart tooltip icon are now 12px. Tabs triggers draw an icon you don't size at the default icon size. To change one part's line, set the tokens in its class, such as `nx:[--nx-icon-stroke-base:1px]`. A `stroke-*` class doesn't change the line. |
  | `@nxds/claude-design`          | `tokens.json` and `tokens.css` export `--nx-icon-stroke-base` and `--nx-icon-stroke-ratio`, so a canvas can change them.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
  | `@nxds/eslint-plugin`          | `nx-class-conventions` reports a class list that sizes its `svg` children without `nx:icon-stroke`, or with a plain `size-*`, `h-*` or `w-*` class such as `[&_svg]:size-4`. A plain size passes when the same selector sets `--nx-icon-size`.                                                                                                                                                                                                                                                                                                              |

- 19e119b: Controls hold their parts at every stroke and density.
  - The Switch thumb and the Checkbox check stay inside the border at every stroke. At the strong stroke, they are smaller by the extra border width.
  - Checkbox and RadioGroup have a 24 × 24px target around the box. The Switch has a 24px-high target across its track. To give your own small control the same target, add `nx:target-24` and `nx:relative`.
  - Badge, Kbd, SidebarMenuBadge and the InputGroup `xs` button grow with their text, so the text stays inside the border at every UI scale and density.
  - In menus, the text of a check item, an inset item and an inset label starts 8px after the check at every density.
  - The NxdsAppearanceColorField hex input and the NxdsAppearanceSettings font inputs show their text in the code font.

- 19e119b: Add `textSize` to the appearance: `12`, `13`, `14`, `15` or `16`, the label text size in px at the Default UI scale. It makes only the text larger or smaller. Icons, spacing and corners keep their UI scale size.
  - The whole type scale follows `textSize ÷ 14`, on top of the UI scale. The label text is `textSize` × the scale's label size ÷ 14, with the UI scale's own rounding: whole px text, even px line heights, and nothing under 8px. At Larger, the five sizes are 15, 17, 18, 19 and 21px.
  - `TEXT_SIZE_OPTIONS` lists the sizes as `{ value, label }`, such as `{ value: 12, label: '12px' }`. `textSizePx(textSize, uiScale)` returns the label size at a UI scale.
  - The provider and the first-paint script set `data-text-size` on `<html>`, next to `data-ui-scale`. Both attributes go on the same element. The default, `14`, writes no CSS.
  - Code text grows with the text size too. `prefs.codeFontSize` is its size at the Default scale and text size.
  - The token catalogue names `textSize` as a control of the type sizes, the line heights and the code size. `createTokenCatalogue` gives those tokens at the appearance's text size.
  - Button, ButtonGroup text, Input, Select, Toggle and the `sm` InputGroup button take a min-height in place of a fixed height, so larger text cannot overflow them. Their default heights do not change.
  - **Breaking:** `cn()` now lets a later `h-*` or `size-*` remove an earlier `min-h-*`, so `className="nx:h-8"` still sets the height of those controls. `min-h-0` and `min-h-[0px]` stay, so a flex or scroll child can still shrink.
  - The settings screen has a Text size picker. Each option shows its size at the Default UI scale, under the note "The size at the Default UI scale." A preview line shows the size at the current UI scale.
  - The CLI takes `--text-size`. The Storybook toolbars offer the new setting.
  - `nxds-cli export claude-design` takes `--text-size`. A Claude Design system has no `data-text-size` attribute. A system at another text size lists its type sizes, line heights and code size at that size, and its sampler board's height fits it.

- 19e119b: Add `uiScale` to the appearance: `'small'`, `'default'`, `'large'` or `'larger'`. It makes the whole UI larger or smaller and keeps its proportions.
  - Label text is 12, 14, 16 or 18px, the default icon is 14, 16, 18 or 20px, and a default Button is 36, 40, 44 or 50px at the Default density.
  - Spacing and corners at every density and corner mode scale with it. Lengths are whole px below 16px and even px from 16px, and spacing steps stay in order.
  - Icons are even px at every scale, so an icon centers in an even box such as Kbd. The `xs` icon is 10, 12, 14 or 16px.
  - Page widths (`max-w-*` and the other named widths) and the Sidebar and Toaster widths scale with it. `--nx-ui-scale` holds the factor (0.9, 1, 1.1 or 1.25) for the few other fixed sizes. The collapsed Sidebar rail is now its button plus padding, so the buttons stay inside it and centered at every scale and density, also with `data-density` on the Sidebar. From `md` up, Sidebar props other than `className` go on its root, so the space the Sidebar keeps beside the page is as wide as the rail. The Sidebar no longer sets `--sidebar-width-icon`.
  - The provider sets `data-ui-scale` on `<html>`. Density and corners nest under it.
  - Checkbox, Radio and Switch take their size from the icon tokens, so they follow the UI scale and still ignore density. The MultiSelect option box is the Checkbox size.
  - Every named icon size follows it: `lg` is 22, 24, 28 or 30px and `xl` is 28, 32, 36 or 40px.
  - Code text grows with the label text. `prefs.codeFontSize` is the code size at the Default scale, and 12px code is 10, 14 and 15px at Small, Large and Larger. The `[data-ui-scale]` blocks in `nxds.css` set the code size too, so code scales without the provider.
  - The UI scale never shrinks text below 8px.
  - The close button of Dialog and Sheet keeps a 24px target at every scale.
  - The code size variable is `--nx-typography-code-size`, in its own `code` group. It was `--nx-typography-size-code`.
  - `prefs.uiFontSize` is gone. Use `uiScale`. The CLI flag `--font-size` is replaced by `--ui-scale`. Shuffle keeps the user's UI scale.
  - The token catalogue's `control` is now `controls`, a list. A new `scale` control names `uiScale`, which scales the token. Spacing and radius name their mode and `uiScale`, and the code size names `codeFontSize` and `uiScale`. The catalogue also lists `--nx-ui-scale` in family `ui-scale` and the page widths in family `width`.
  - The settings screen and the Storybook toolbars offer the new mode.
  - `nxds-cli export claude-design` takes `--ui-scale` in place of `--font-size`. A Claude Design system has no `data-ui-scale` attribute. A system at another scale lists every token at that scale and declares its density and corner presets at that scale in `tokens.css`. Its sampler board is wider to match, and its height fits the system's UI scale, density and stroke.
  - `createTokenCatalogue(appearance)` lists each token at the appearance's UI scale, the same values the `[data-ui-scale]` blocks in `nxds.css` hold.

### Patch Changes

- 19e119b: Every Button icon uses the default icon size (`size-icon-glyph-default`, 16px at the Default UI scale) at every Button size and density.
- 19e119b: Switch, Checkbox and Radio keep their size at every density, and follow the UI scale. At the Default scale and the normal stroke, Switch is 20 × 36px with a 16px thumb. The `sm` Switch is 18 × 32px with a 14px thumb. Checkbox and Radio are 16px, with a 14px check and a 10px dot. If they followed the new density scale, they would break. At Tight, the Switch thumb would overflow its track. The default Switch would also be smaller than `sm`. At Tight and Compact, the Checkbox check would go past its border.
- 19e119b: Toggle and ToggleGroup items have the same height as Button at each size: 32px, 40px and 48px at the default density. They follow density like Button. An icon-only or outline toggle is now the same height as a text toggle.
- Updated dependencies [19e119b]
- Updated dependencies [19e119b]
- Updated dependencies [19e119b]
- Updated dependencies [19e119b]
- Updated dependencies [19e119b]
- Updated dependencies [19e119b]
  - @nxds/core@0.14.0
  - @nxds/tailwind@0.4.0

## 0.11.1

### Patch Changes

- Updated dependencies [c004e3a]
  - @nxds/core@0.13.0
  - @nxds/tailwind@0.3.0

## 0.11.0

### Minor Changes

- a333b42: Toolbar gets tools that open panels, and a floating variant.
  - `ToolbarToolGroup`, `ToolbarTool` and `ToolbarToolPanel` add a set of tools. Selecting a tool opens its panel, and selecting it again closes it. Each tool tells assistive technology whether its panel is open.
  - `<Toolbar variant="floating">` is a bar for canvas tools, with more padding, space and shadow.
  - Groups inside a toolbar use the same gap as the toolbar.
  - A vertical separator grows with the height of the row.
  - In `@nxds/vue`, PopoverContent emits `closeAutoFocus`, `interactOutside` and `pointerDownOutside` once per event, as React does. Combobox and MultiSelect pass these events on once too.

### Patch Changes

- a333b42: `Show` and `Hide` pass their parent's `gap` to children that inherit it. A toolbar group inside them keeps the toolbar's gap.

## 0.10.0

### Minor Changes

- b3d79a5: Add three display text styles for hero and page-section titles: `nx:typography-display-large`, `nx:typography-display-medium` and `nx:typography-display-small`.

  | Style            | Size | Line height | Weight   |
  | ---------------- | ---- | ----------- | -------- |
  | `display-large`  | 5xl  | 5xl         | semibold |
  | `display-medium` | 4xl  | 4xl         | semibold |
  | `display-small`  | 3xl  | 3xl         | semibold |

  Each style uses the heading font, `tighter` letter spacing and `text-wrap: balance`. `cn()` in `@nxds/react` and `@nxds/vue` merges them with the other `typography-*` styles.

- b3d79a5: Set up a whole theme in one step: brand color, surface tone, tokens, mode, contrast, self-hosted fonts and the icon library nxds components draw their own icons with. Phosphor is the default icon library, in place of Tabler Icons.

  | Package                    | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
  | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `@nxds/core`               | `ICON_LIBRARY_OPTIONS`, `FONT_OPTIONS`, `shuffleNxdsAppearance` (pass `fonts` to pick from the fonts your app loads) and `shuffleNxdsIconLibrary`. `NxdsAppearancePrefs` gains `headingFont`, which sets `--nx-typography-family-font-heading`. `null`, the default, follows `uiFont`. `NXDS_THEME_FIELDS` lists each theme part as its `init` flag, and `nxdsThemeFlags` and `applyNxdsThemeFlags` turn a theme into flags and back.                                                         |
  | `@nxds/react`, `@nxds/vue` | `lib/icons` draws Phosphor. `lib/icon-libraries/` holds the same icons in Lucide, Tabler Icons, HugeIcons and Remix Icon. InputOTP's separator draws the filled circle at `nx:size-1`. `NxdsAppearanceSettings` gains a Heading font field.                                                                                                                                                                                                                                                   |
  | `nxds-cli`                 | `init` takes a flag for each theme part, such as `--brand-color`, `--density`, `--font` and `--icons`. It writes `nxds-theme.ts`, which `appearance-state.ts` spreads, and records the theme in `nxds.json`. A flag left out keeps its value, and an empty one, such as `--density=`, resets it. A new font replaces the old one's import, and `doctor` lists the old package. Running `init --icons` again switches every installed `lib/icons.ts`, and `add` and `update` keep the library. |

  To keep Tabler Icons, set `"iconLibrary": "tabler"` in `nxds.json` before you run `update`. After `update`, run `npx nxds-cli@latest init --icons tabler` instead.

  `@nxds/claude-design` ships 421 Phosphor icons, with brand logos, in place of 496 Tabler icons. A canvas names an icon as phosphoricons.com does, such as `Nxds.Icon name="magnifying-glass"`. A `-fill` name, such as `check-circle-fill`, draws the filled icon. `Nxds.Icon` takes `weight` in place of `stroke`.

### Patch Changes

- Updated dependencies [b3d79a5]
- Updated dependencies [b3d79a5]
  - @nxds/core@0.12.0
  - @nxds/tailwind@0.2.0

## 0.9.0

### Minor Changes

- e5916e8: Add CodeBlock, a surface for code with line numbers, marked lines and a copy button.

  | Part                  | What it does                                                                                                                           |
  | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
  | `CodeBlock`           | The surface. Use `variant="flush"` inside a Card                                                                                       |
  | `CodeBlockContent`    | The scroll region. Long lines scroll sideways, and a `nx:max-h-*` class scrolls down. `language` sets the `language-*` class on `code` |
  | `CodeBlockLine`       | One line. `number` shows it in the gutter, `highlighted` and `status` mark it                                                          |
  | `CodeBlockCopyButton` | Copies the code and tells screen readers the result                                                                                    |

  CodeBlock does not highlight code. Highlight with Shiki and the `codeBlockTheme` it ships, then put each line's tokens in a `CodeBlockLine`. In server code, such as a React Server Component, import the theme from `@nxds/react/code-block-theme`.

  In `@nxds/core`, the contrast solver also reads the chart colours on `container-hover`, the surface of a highlighted line. Where a chart colour was too faint on it, the colour gets a little darker in light mode or a little lighter in dark mode.

- 9f564c1: Add diff lines to CodeBlock, and give code its own syntax colours.

  | Package                    | Change                                                                                                                                                                                                                                                                                   |
  | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `@nxds/react`, `@nxds/vue` | `CodeBlockLine` takes `diff="added"` or `diff="removed"`. The line gets a green or red tint and a `+` or `−` before the code. The copy button leaves out removed lines. `codeBlockTheme` colours code with the `syntax-*` tokens.                                                        |
  | `@nxds/core`               | Add five colour tokens for code: `syntax-keyword`, `syntax-string`, `syntax-function`, `syntax-type` and `syntax-constant`. Each takes the hue of a chart series. The contrast solver keeps them legible on `container`, `container-hover`, `success-subtle` and `error-subtle`.         |
  | `@nxds/core`               | The solver reads the chart colours only on `container` and `background` again, so chart colours go back to their values before CodeBlock. It also reads the foreground and muted colours on `success-subtle` and `error-subtle`. Muted text moves by a very small amount in some themes. |

### Patch Changes

- e5916e8: Fix `require('@nxds/vue')`. The CommonJS entry file ends in `.cjs`, so Node reads it as CommonJS and `require` gets every export.
- e5916e8: Fix the `@nxds/vue` types for TypeScript projects that use `moduleResolution: "node16"` or `"nodenext"`. The types are now one file, and `require` gets its own `index.d.cts`. Drawer's types come from `vaul-vue` and are included, so `require` no longer types Drawer as `any`.
- Updated dependencies [e5916e8]
- Updated dependencies [9f564c1]
  - @nxds/core@0.11.0

## 0.8.0

### Minor Changes

- 91d13a1: Add app-shell components to `@nxds/vue` that match their React counterparts.

  | Component | Parts                                                                                                                                                                                                                                                                                                                                                                                                                                          | Notes                                                                                                                                                                                    |
  | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Sidebar   | `SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`, `SidebarInput`, `SidebarHeader`, `SidebarFooter`, `SidebarSeparator`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton` | Read the state with `useSidebar`. Listen for `open-change` on `SidebarProvider`. With `TooltipContent` props as `tooltip`, put the tooltip text in `SidebarMenuButton`'s `#tooltip` slot |
  | Toolbar   | `Toolbar`, `ToolbarButton`, `ToolbarLink`, `ToolbarGroup`, `ToolbarToggleGroup`, `ToolbarToggleItem`, `ToolbarSeparator`                                                                                                                                                                                                                                                                                                                       | Bind a toggle group's value with `v-model`                                                                                                                                               |

  In `@nxds/react`, `SidebarProvider` is controlled only when you pass `open`. It now calls `onOpenChange` in both modes, so passing `onOpenChange` alone no longer stops the sidebar from toggling.

  Closing the narrow-viewport sidebar drawer returns focus to the control that opened it. The first Escape closes the drawer, because a `SidebarMenuButton` tooltip no longer opens unless the sidebar is collapsed to its icon rail.

## 0.7.0

### Minor Changes

- 4181e9b: Add chat components that match their React counterparts.

  | Component       | Parts                                                                                                                                                                               | Notes                                                                                                   |
  | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
  | Attachment      | `Attachment`, `AttachmentMedia`, `AttachmentContent`, `AttachmentTitle`, `AttachmentDescription`, `AttachmentActions`, `AttachmentProgress`, `AttachmentTrigger`, `AttachmentGroup` | Put a badge after the file name in `AttachmentTitle`'s `#trailing` slot                                 |
  | Bubble          | `Bubble`, `BubbleGroup`, `BubbleContent`, `BubbleReactions`                                                                                                                         |                                                                                                         |
  | Message         | `Message`, `MessageGroup`, `MessageAvatar`, `MessageContent`, `MessageHeader`, `MessageFooter`                                                                                      |                                                                                                         |
  | MessageScroller | `MessageScrollerProvider`, `MessageScroller`, `MessageScrollerViewport`, `MessageScrollerContent`, `MessageScrollerItem`, `MessageScrollerButton`                                   | Read the scroll state with `useMessageScroller`, or from `MessageScrollerProvider`'s default slot props |
  | Sonner          | `Toaster`, `toast`, `useSonner`                                                                                                                                                     | Install `vue-sonner` in your app to use it                                                              |

### Patch Changes

- Updated dependencies [bfd0509]
  - @nxds/core@0.10.0

## 0.6.0

### Minor Changes

- be76459: Add command and filter components that match their React counterparts.

  | Component       | Parts                                                                                                                                                             | Notes                                                                                                |
  | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
  | Command         | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandLoading`, `CommandGroup`, `CommandSeparator`, `CommandItem`, `CommandShortcut` | Bind the search with `v-model` on `CommandInput`. `select` passes the item's value                   |
  | Combobox        | `Combobox`, `ComboboxTrigger`, `ComboboxContent`, `ComboboxInput`, `ComboboxList`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxSeparator`, `ComboboxItem`          | Binds the open state with `v-model:open`                                                             |
  | MultiSelect     | `MultiSelect`, `MultiSelectTrigger`, `MultiSelectValue`, `MultiSelectContent`, `MultiSelectItem`, `MultiSelectGroup`, `MultiSelectSeparator`                      | Emits `values-change` with the selected values                                                       |
  | FilterChip      | `FilterChip`                                                                                                                                                      |                                                                                                      |
  | FilterCondition | `FilterCondition`, `FilterConditionField`, `FilterConditionSegment`, `FilterConditionRemove`                                                                      |                                                                                                      |
  | FilterBuilder   | `FilterBuilder`                                                                                                                                                   | Emits `value-change` with the new tree. `getFilterErrors` validates it                               |
  | DatePicker      | `DatePicker`, `DatePickerDayButton`                                                                                                                               | Set `mode` to `single`, `multiple` or `range`. Install `@internationalized/date` for its date values |

## 0.5.0

### Minor Changes

- 222a488: Add layout and data-display components that match their React counterparts.

  | Component       | Parts                                                                                                                                                                  | Notes                                                            |
  | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
  | Accordion       | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`                                                                                                   | Binds the open items with `v-model`                              |
  | Collapsible     | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`                                                                                                              | Binds the open state with `v-model:open`                         |
  | Avatar          | `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarStatus`, `AvatarGroup`                                                                                               | An Avatar in an AvatarGroup takes the group's `size` and `shape` |
  | Breadcrumb      | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`, `BreadcrumbMenuTrigger`             |                                                                  |
  | Item            | `Item`, `ItemGroup`, `ItemSeparator`, `ItemMedia`, `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`, `ItemHeader`, `ItemFooter`                            |                                                                  |
  | EmptyState      | `EmptyState`, `EmptyStateHeader`, `EmptyStateMedia`, `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateContent`                                                   |                                                                  |
  | DescriptionList | `DescriptionList`, `DescriptionListItem`, `DescriptionListTerm`, `DescriptionListDescription`                                                                          |                                                                  |
  | Marker          | `Marker`, `MarkerIcon`, `MarkerContent`                                                                                                                                |                                                                  |
  | Pagination      | `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`                                    |                                                                  |
  | PageHeader      | `PageHeader`, `PageHeaderContent`, `PageHeaderMeta`, `PageHeaderTitleRow`, `PageHeaderTitle`, `PageHeaderDescription`, `PageHeaderActions`                             |                                                                  |
  | ScrollArea      | `ScrollArea`, `ScrollBar`                                                                                                                                              |                                                                  |
  | Resizable       | `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`                                                                                                             |                                                                  |
  | Table           | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableRowHeader`, `TableCaption`, `TableSelectionHead`, `TableSelectionCell` |                                                                  |
  | Carousel        | `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`                                                                                      | Install `embla-carousel-vue` in your app to use it               |

### Patch Changes

- Updated dependencies [5daa687]
  - @nxds/core@0.9.1

## 0.4.0

### Minor Changes

- 5d0711d: Add overlay components that match their React counterparts.

  | Component      | Parts                                                                                                                                                                                                                                                                                                                                                   | Notes                                                               |
  | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
  | Popover        | `Popover`, `PopoverTrigger`, `PopoverAnchor`, `PopoverContent`                                                                                                                                                                                                                                                                                          |                                                                     |
  | Tooltip        | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`                                                                                                                                                                                                                                                                                        | A Tooltip works on its own and joins a `TooltipProvider` above it   |
  | HoverCard      | `HoverCard`, `HoverCardTrigger`, `HoverCardContent`                                                                                                                                                                                                                                                                                                     |                                                                     |
  | DropdownMenu   | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuGroup`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`, `DropdownMenuPortal` | Checkbox items and radio groups bind with `v-model`                 |
  | ContextMenu    | The same parts as DropdownMenu, named `ContextMenu*`                                                                                                                                                                                                                                                                                                    | Opens on right-click                                                |
  | Menubar        | The same parts as DropdownMenu, named `Menubar*`, plus `Menubar` and `MenubarMenu`                                                                                                                                                                                                                                                                      |                                                                     |
  | AlertDialog    | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogBody`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogOverlay`, `AlertDialogPortal`                                                                                               | `variant="center"` centers the header and stacks full-width actions |
  | Sheet          | `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetBody`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetOverlay`, `SheetPortal`                                                                                                                                                                                       | `side` picks the edge it slides from                                |
  | Select         | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectGroup`, `SelectLabel`, `SelectItem`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`                                                                                                                                                                              | Binds the value with `v-model`                                      |
  | NavigationMenu | `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport`                                                                                                                                                               | Set `:viewport="false"` to open each flyout under its own trigger   |
  | Drawer         | `Drawer`, `DrawerTrigger`, `DrawerClose`, `DrawerContent`, `DrawerHeader`, `DrawerBody`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerOverlay`, `DrawerPortal`                                                                                                                                                                            | Install `vaul-vue` in your app to use it                            |

  The component styles now import `tw-animate-css`, which NavigationMenu uses for its flyout motion. Install it in your app and import it after the token CSS.

## 0.3.0

### Minor Changes

- 407ff12: Add form composites that match their React counterparts.

  | Component   | Parts                                                                                                                                                                      | Notes                                                               |
  | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
  | ButtonGroup | `ButtonGroup`, `ButtonGroupText`, `ButtonGroupSeparator`                                                                                                                   | `size` reaches every Button and ButtonGroupText in the group        |
  | Field       | `Field`, `FieldSet`, `FieldLegend`, `FieldGroup`, `FieldContent`, `FieldLabel`, `FieldTitle`, `FieldDescription`, `FieldSeparator`, `FieldError`, `FieldRequiredIndicator` | Pass `errors` to FieldError, or put the message in its slot         |
  | ChoiceRow   | `ChoiceRow`, `ChoiceRowContent`, `ChoiceRowTitle`, `ChoiceRowDescription`                                                                                                  | Set `for` to the nested control's `id`                              |
  | ChoiceCard  | `ChoiceCard`, `ChoiceCardContent`, `ChoiceCardTitle`, `ChoiceCardDescription`                                                                                              | Set `for` to the nested control's `id`                              |
  | InputGroup  | `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText`, `InputGroupInput`, `InputGroupTextarea`                                                             | InputGroupInput and InputGroupTextarea bind with `v-model`          |
  | ToggleGroup | `ToggleGroup`, `ToggleGroupItem`                                                                                                                                           | Binds with `v-model`; a `type="single"` group's items are radios    |
  | Slider      | `Slider`                                                                                                                                                                   | Binds the values with `v-model`; one thumb per value                |
  | InputOTP    | `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`                                                                                                           | Built on Reka PinInput; binds one character per slot with `v-model` |

  A `Button` without its own `size` now takes the size of the `ButtonGroup` around it, even when another element wraps it.

## 0.2.0

### Minor Changes

- 575bf96: Add 14 form and display components that match their React counterparts.

  | Component    | Parts                                                        | Notes                                                               |
  | ------------ | ------------------------------------------------------------ | ------------------------------------------------------------------- |
  | Label        | `Label`                                                      | Set `for` to the control's `id`                                     |
  | Input        | `Input`                                                      | Binds with `v-model`, or starts from `default-value`                |
  | Textarea     | `Textarea`                                                   | Binds with `v-model`, or starts from `default-value`                |
  | NativeSelect | `NativeSelect`, `NativeSelectOption`, `NativeSelectOptGroup` | Binds with `v-model`, or starts from `default-value`                |
  | Checkbox     | `Checkbox`                                                   | Set `model-value="indeterminate"` for a partly selected set         |
  | RadioGroup   | `RadioGroup`, `RadioGroupItem`                               | Binds with `v-model`                                                |
  | Toggle       | `Toggle`                                                     | Binds the pressed state with `v-model`                              |
  | Separator    | `Separator`                                                  | Decorative unless `:decorative="false"`                             |
  | Kbd          | `Kbd`, `KbdGroup`                                            |                                                                     |
  | Skeleton     | `Skeleton`                                                   |                                                                     |
  | Progress     | `Progress`                                                   | Leave out `model-value` for an indeterminate bar                    |
  | AspectRatio  | `AspectRatio`                                                |                                                                     |
  | Show / Hide  | `Show`, `Hide`                                               | Set one of `above`, `below`, `container-above` or `container-below` |

## 0.1.0

### Minor Changes

- 8c047f2: Vue components now match their React counterparts, and parity tests keep them matched.

  | Component  | Change                                                                                                       |
  | ---------- | ------------------------------------------------------------------------------------------------------------ |
  | Dialog     | Exports `DialogOverlay` and `DialogPortal`. `DialogContent` takes `#title`, `#description` and `#body` slots |
  | Appearance | `createNxdsAppearance` takes `state` and `onStateChange` to control the appearance yourself                  |
  | Button     | `loading` defaults to `false`. With `as-child`, a child that is not one element keeps the native button      |
  | TabsList   | `variant` and `size` list their options, and the vertical layout follows `data-orientation`                  |

## 0.0.1

### Patch Changes

- Updated dependencies [afc7bd7]
  - @nxds/core@0.9.0
