# @nxds/react

## 0.12.0

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

## 0.11.0

### Minor Changes

- 990918e: Add BarChart, LineChart, AreaChart and PieChart, which plot rows of data without composing Recharts parts.

  | Part        | What it does                                                                                 |
  | ----------- | -------------------------------------------------------------------------------------------- |
  | `BarChart`  | Bars per category. `orientation="horizontal"` runs them left to right, `stacked` stacks them |
  | `LineChart` | A line per series. `curve` sets how it joins points, `dots` marks each one                   |
  | `AreaChart` | An area per series. `stacked` stacks them, `fill="gradient"` fades each toward the axis      |
  | `PieChart`  | A slice per row, from `nameKey` and `valueKey`. `donut` cuts out the middle                  |

  Give a chart its rows in `data`, the category key in `xKey` and the keys to plot in `series`. Each series takes the next chart colour and its key as a label, and `config` overrides either. Every chart has `legend`, `tooltip` and, except PieChart, `grid` and axis toggles.

## 0.10.0

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

- e5916e8: Fix `require` for `@nxds/react` and its subpaths. The CommonJS entry files end in `.cjs`, so Node and the Next.js config loader read them as CommonJS.
- e5916e8: Fix the `@nxds/react` types for TypeScript projects that use `moduleResolution: "node16"` or `"nodenext"`. Each entry's types are now one file, and `require` gets its own `.d.cts` file.
- Updated dependencies [e5916e8]
- Updated dependencies [9f564c1]
  - @nxds/core@0.11.0

## 0.9.0

## 0.8.1

### Patch Changes

- f629fb8: Fix `ChartContainer` axis tick text colour. Recharts 3.8 renders tick text outside `.recharts-cartesian-axis-tick`, so ticks kept the Recharts grey and proportional digits. Tick text now uses `muted-foreground` and tabular numbers.
- 91d13a1: Add app-shell components to `@nxds/vue` that match their React counterparts.

  | Component | Parts                                                                                                                                                                                                                                                                                                                                                                                                                                          | Notes                                                                                                                                                                                    |
  | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Sidebar   | `SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`, `SidebarInput`, `SidebarHeader`, `SidebarFooter`, `SidebarSeparator`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton` | Read the state with `useSidebar`. Listen for `open-change` on `SidebarProvider`. With `TooltipContent` props as `tooltip`, put the tooltip text in `SidebarMenuButton`'s `#tooltip` slot |
  | Toolbar   | `Toolbar`, `ToolbarButton`, `ToolbarLink`, `ToolbarGroup`, `ToolbarToggleGroup`, `ToolbarToggleItem`, `ToolbarSeparator`                                                                                                                                                                                                                                                                                                                       | Bind a toggle group's value with `v-model`                                                                                                                                               |

  In `@nxds/react`, `SidebarProvider` is controlled only when you pass `open`. It now calls `onOpenChange` in both modes, so passing `onOpenChange` alone no longer stops the sidebar from toggling.

  Closing the narrow-viewport sidebar drawer returns focus to the control that opened it. The first Escape closes the drawer, because a `SidebarMenuButton` tooltip no longer opens unless the sidebar is collapsed to its icon rail.

## 0.8.0

### Minor Changes

- bfd0509: Every token the Claude Design System exports is a variable the components read. Changing a token on a canvas now changes the components, including shadows and text styles. `tokens.json` drops the palette steps, alpha scales and state colours no component reads. It keeps the full spacing and radius scales and the chart series for laying out artboards, marked "For authors". The type scale is a new `typeScale` family, and each text style class reads it the way the `nx:typography-*` utilities do.

  On a Design canvas, `data-density`, `data-radius`, `data-borderwidth` and `data-shadow` work again. `tokens.css` declares its values in the `theme` layer, so these presets and the appearance provider's runtime theme override them. The system README names the files a canvas artboard loads and their order.

  Shadows are one variable per elevation step. Each `data-shadow` preset declares `--nx-shadow-sm` and its siblings directly, and `nx:shadow-*` reads them. The `--nx-shadow-*-layer-*` variables are gone. In the token catalogue, shadow styles carry a variant per elevation preset and theme, and the layer primitives are no longer tokens.

  `ToggleGroup` applies a half-step `spacing`, such as `0.5`, instead of dropping the gap. Its `spacing` takes only spacing-scale steps, typed by the new `SpacingStep` export from `@nxds/core`.

### Patch Changes

- Updated dependencies [bfd0509]
  - @nxds/core@0.10.0

## 0.7.0

### Minor Changes

- be76459: A range `DatePicker` shades the days from the start to the hovered or focused day while the range is half-picked. Remove any `preview` modifier and the `onDayMouseEnter` wiring that set it. `FilterBuilder` declares `aria-label`, which defaults to `Filters`.

## 0.6.0

### Minor Changes

- 5daa687: Export nxds as a Claude Design System. `npx nxds-cli export claude-design` writes a folder to publish as a Design System artifact in Claude: every token in Light and Dark, every component as a live React 18 bundle, one props interface per part for the canvas controls, and a preview and README per component. The new `@nxds/claude-design` package carries the prebuilt files and releases with `@nxds/react`.

  The Toaster follows `data-theme="dark"` as well as the `.dark` class. Charts no longer log a size warning on their first render. Every runtime colour token has a usage description.

### Patch Changes

- Updated dependencies [5daa687]
  - @nxds/core@0.9.1

## 0.5.0

### Minor Changes

- 7370faf: Add React 18 support. `nxds-cli` reads the React your app uses and installs files for it: React 18.3 apps get components that take `ref` through `forwardRef`, and React 19 apps get the same files as before.

  | Command  | On React 18                                                                                        |
  | -------- | -------------------------------------------------------------------------------------------------- |
  | `init`   | Records `"react": 18` in `nxds.json` and installs the React 18 files                               |
  | `add`    | Installs the React 18 files, and stops if the app's React changed since `init`                     |
  | `update` | Switches the files to React 19 after you upgrade React, merging nxds's changes into your edits     |
  | `diff`   | Compares your files with the React 18 files                                                        |
  | `doctor` | Checks that the files match the app's React, and that `react-dom` and `@types/react` match `react` |

  The chart now installs `react-is` at your React's major, which recharts needs to read fragments in a chart.

### Patch Changes

- 7370faf: Fix `MultiSelectValue` overflow when you pass a `ref`. Your `ref` replaced the one that watches chip overflow, so chips stopped collapsing into the `+N` badge. Both refs now attach.

## 0.4.6

### Patch Changes

- a87db64: Copied components now pass the default lint and type settings of a fresh
  create-next-app or Vite app:
  - Props declared as empty interfaces are type aliases now.
  - `Show` and `Hide` no longer import an unused `React`.
  - Components no longer carry `eslint-disable` comments for rules a host app may
    not have.
  - `NxdsAppearanceProvider`, `Carousel` and `useIsNarrow` read the browser
    through `useSyncExternalStore` instead of setting state in an effect, so they
    pass the React Hooks lint rules a new Next.js app turns on.

## 0.4.5

### Patch Changes

- Updated dependencies [afc7bd7]
  - @nxds/core@0.9.0

## 0.4.4

### Patch Changes

- Updated dependencies [e743cb7]
  - @nxds/core@0.8.0

## 0.4.3

### Patch Changes

- Updated dependencies [1d2c04a]
  - @nexus_ds/core@0.7.2

## 0.4.2

### Patch Changes

- Updated dependencies [fefb8c8]
  - @nexus_ds/core@0.7.1

## 0.4.1

### Patch Changes

- Updated dependencies [8d8ecd0]
  - @nexus_ds/core@0.7.0

## 0.4.0

### Minor Changes

- b1aaad5: Breaking for copied source: component folders have no `index.ts`. Import each
  component by its file.

  | Before                                         | After                                                                                 |
  | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
  | `import { Button } from '@/components/button'` | `import { Button } from '@/components/button/button'`                                 |
  | Each component page lists every file to copy   | It links the components to install first, then lists only the files those don't bring |

  `@nexus_ds/react` exports the same names. `@/components/appearance/provider`
  keeps its `index.ts`.

## 0.3.0

### Minor Changes

- e4d7013: Breaking: Nexus CSS now emits only `nx:` utilities and `--nx-*` variables, so
  it leaves the host app's own styles alone.

  | Before                                                                        | After                                                                                                                                                                      |
  | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `nexus.css` imports Tailwind with Preflight                                   | Imports Tailwind's theme and utilities only. A new app imports `tailwindcss/preflight.css` itself                                                                          |
  | Global `*` border colour, `body` colour and background                        | Removed. Components set their own border colours; put `nx:bg-background nx:text-foreground nx:typography-body-default` on `<body>`                                         |
  | 107 unprefixed `--color-*` aliases on `:root`                                 | Removed. Use `--nx-color-*`                                                                                                                                                |
  | `:root` / `:root:not(.dark)` `color-scheme`                                   | Only `.dark { color-scheme: dark }`                                                                                                                                        |
  | Provider sets `:root { font-size }`                                           | Removed. Nexus type sizes are `--nx-typography-size-*` variables                                                                                                           |
  | Provider sets `code, pre { font-size }` and always sets `html` font smoothing | The code size reaches only Nexus classes. `fontSmoothing` defaults to `false`. Smoothing, pointer cursors and reduce motion apply page-wide only when turned on            |
  | Provider and first-paint script write an inline `color-scheme` and a meta tag | Removed, along with `colorScheme` and `metaColorScheme` on `NexusFirstPaintResolution`                                                                                     |
  | `TooltipProvider` required                                                    | Optional. Each `Tooltip` works on its own and joins a `TooltipProvider` group when inside one                                                                              |
  | `toast` and `Toaster` share sonner's default toaster                          | Use the `nexus` toaster id, so a host Toaster never shows Nexus toasts. `dismiss()`, `getToasts()` and `useSonner` cover only Nexus toasts; `Toaster` no longer takes `id` |
  | Keyframes `overlay-presence-exit`, `progress-indeterminate`                   | `nx-overlay-presence-exit`, `nx-progress-indeterminate`                                                                                                                    |

  Components that render native elements now reset those elements' browser
  defaults themselves, and Dialog and AlertDialog centre without a transform.

### Patch Changes

- Updated dependencies [e4d7013]
  - @nexus_ds/core@0.6.0

## 0.2.1

### Patch Changes

- Updated dependencies [bf903a4]
  - @nexus_ds/core@0.5.1

## 0.2.0

### Minor Changes

- e54ef4b: Add `BRAND_COLOR_PRESETS` and `findBrandColorPreset` to `@nexus_ds/core`, seeded from the authored palettes, and a reusable preset/custom color field in Appearance settings. Preserve saved brand colors and the existing theme derivation. Keep controls usable in narrow layouts and make native color-picker keyboard focus visible.
- ea9a2e5: Add the `Marker` primitive for inline annotations and labelled dividers.

  `Marker` renders a low-emphasis annotation row — an optional `MarkerIcon` plus
  `MarkerContent` — for lists, feeds, and message streams. `variant="separator"`
  centres the label between two rules; `variant="border"` rests the row above a
  bottom rule. The label stays real text in reading order, so it is announced
  where it appears; use `Separator` for a purely decorative rule with no label.

  `asChild` composes the row onto different semantics — a heading for a labelled
  section, or a link / button for an actionable row.

- a5176e3: Breaking: rename border-active to border-focus, four normal status borders to
  `{status}-border`, and border-primary / border-primary-active to primary-border /
  primary-border-active, preserving their light/dark values and contrast
  relationships. Update runtime variables and consumer utilities together; there
  are no old-name aliases.

  | Before                  | After                   |
  | ----------------------- | ----------------------- |
  | `border-active`         | `border-focus`          |
  | `border-error`          | `error-border`          |
  | `border-information`    | `information-border`    |
  | `border-success`        | `success-border`        |
  | `border-warning`        | `warning-border`        |
  | `border-primary`        | `primary-border`        |
  | `border-primary-active` | `primary-border-active` |

  The map applies to `--nx-color-*` variables, `--color-*` theme aliases and
  utilities (`nx:border-border-error` → `nx:border-error-border`).
  `nx:border-color-active` becomes `nx:border-color-focus`; the other
  `nx:border-color-*` aliases keep their names.

  CSS snapshots advance to version 7 to invalidate obsolete names. State-only
  cookies remain version 6 and retain preferences; server-rendered consumers should
  pass the cookie-derived snapshot to the bootstrap for the saved first paint.

### Patch Changes

- 3ed37ed: Add the `shadow-md` tier to the emitted Tailwind theme; its primitives already
  existed in every shadow mode, so `nx:shadow-md` now renders instead of emitting
  nothing. Emit `--default-transition-duration` and
  `--default-transition-timing-function` from `--nx-motion-duration-default` and
  `--nx-motion-ease-enter`, and point `transition-control` / `transition-field` at
  them: every `nx:transition-*` utility now shares one default (200ms, enter
  easing) instead of Tailwind's 150ms, and the two ring-safe transitions are no
  longer instant without an explicit `duration-*` class.

  `@nexus_ds/eslint-plugin`: `nx-class-conventions` drops its `deadTypography`
  check. Its replacement is the new `nexusTailwindClassesConfig({ files,
entryPoint })` helper in the new `@nexus_ds/eslint-plugin/tailwind` subpath, which wires
  `eslint-plugin-better-tailwindcss`'s `no-unknown-classes` (an optional peer
  dependency, needed only for that subpath) against your stylesheet: it reports any class that emits no CSS,
  including a missing `nx:` prefix.

  `@nexus_ds/react`: NavigationMenu content now slides 1.5rem on enter and exit;
  it previously computed its offset from an undefined `--spacing` and did not
  slide. Its transform origin is now `top` (was the invalid `top-center`).

- Updated dependencies [7aa577c]
- Updated dependencies [15c901b]
- Updated dependencies [e54ef4b]
- Updated dependencies [416a7a0]
- Updated dependencies [5a3ea89]
- Updated dependencies [716c029]
- Updated dependencies [3ed37ed]
- Updated dependencies [48f0bc6]
- Updated dependencies [a4fde03]
- Updated dependencies [a5176e3]
- Updated dependencies [8f9cbfa]
- Updated dependencies [2b3f20c]
- Updated dependencies [48cec83]
  - @nexus_ds/core@0.5.0

## 0.1.1

### Patch Changes

- Updated dependencies [1d27496]
  - @nexus_ds/core@0.4.0

## 0.1.0

### Minor Changes

- a4d4a57: White light canvas with calibrated surface support tiers, contrast-responsive dark nav/sidebar surfaces, regenerated Tailwind theme output, and component surface adoption for field-like controls.

  Breaking (`@nexus_ds/react`): the `Form` react-hook-form wrapper is removed and `react-hook-form` is dropped as a peer dependency. Consumers own their react-hook-form binding directly against the library-agnostic `Field` primitive.

- 958c764: Split the appearance `contrast` control into independent `lightContrast` and `darkContrast` scalars. Theme derivation applies each mode's contrast to that mode's tokens only, so the dark theme can be tuned without moving the light theme. Snapshot version bumped to 4; stale snapshots reset to `60/60` defaults (pre-production, no migration).

### Patch Changes

- Updated dependencies [249ef8e]
- Updated dependencies [a4d4a57]
- Updated dependencies [958c764]
- Updated dependencies [410076a]
- Updated dependencies [1d55de3]
- Updated dependencies [748e08c]
  - @nexus_ds/core@0.3.0
  - @nexus_ds/tailwind@0.1.0

## 0.0.3

### Patch Changes

- Updated dependencies [58c79bc]
  - @nexus_ds/core@0.2.0

## 0.0.2

### Patch Changes

- Updated dependencies [c455b16]
  - @nexus_ds/core@0.1.0
