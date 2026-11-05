# @nxds/react-18

## 0.0.7

### Patch Changes

- 8e13859: `components/bundle.js` drops from 2,433,281 to 1,635,661 bytes. A canvas takes in a script under 2 MB as soon as the system updates. Over 2 MB, the new components showed only after a reload. The build fails past 1,800,000 bytes.

  The bundle keeps only Phosphor's regular and fill weights. `Nxds.Icon` loses its `weight` prop. Use a `-fill` name, such as `check-circle-fill`, for a filled icon. A canvas that still sets `weight` draws the regular icon and logs a warning, so remove the attribute.

  Data charts list their legend items in `series` order, and PieChart's legend follows its rows. Recharts sorted them alphabetically.

  README.md tells Claude to give every artboard a `mode` tweak of light and dark, and to bind the root's and each overlay content part's `data-theme` to it. A function prop takes a handler from the artboard's script, such as `on-value-change="{{setFilters}}"`.

  The sampler fits its board at the theme's text size. SETUP.md's `canvas.json` entry is 1525px tall at the default. It grows 50px for each px of text above the default, and shrinks 33px for each px below. Its chart fills its card, Today's toggles sit in its content, and the deals table fits without a sideways scroll up to 20px text.

  AspectRatio, Carousel, Combobox, FilterBuilder, FilterCondition, Resizable, ScrollArea, Sonner and Table READMEs show a full canvas example. Each used to show a bare part that rendered nothing, or a note. FilterBuilder shows a JSON mockup and a version bound to the artboard's script state. A static FilterBuilder no longer throws when clicked.

## 0.0.6

### Patch Changes

- Updated dependencies [c004e3a]
  - @nxds/core@0.13.0
  - @nxds/tailwind@0.3.0

## 0.0.5

### Patch Changes

- Updated dependencies [b3d79a5]
- Updated dependencies [b3d79a5]
  - @nxds/core@0.12.0
  - @nxds/tailwind@0.2.0

## 0.0.4

### Patch Changes

- Updated dependencies [e5916e8]
- Updated dependencies [9f564c1]
  - @nxds/core@0.11.0

## 0.0.3

### Patch Changes

- 91d13a1: Add app-shell components to `@nxds/vue` that match their React counterparts.

  | Component | Parts                                                                                                                                                                                                                                                                                                                                                                                                                                          | Notes                                                                                                                                                                                    |
  | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Sidebar   | `SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`, `SidebarInput`, `SidebarHeader`, `SidebarFooter`, `SidebarSeparator`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton` | Read the state with `useSidebar`. Listen for `open-change` on `SidebarProvider`. With `TooltipContent` props as `tooltip`, put the tooltip text in `SidebarMenuButton`'s `#tooltip` slot |
  | Toolbar   | `Toolbar`, `ToolbarButton`, `ToolbarLink`, `ToolbarGroup`, `ToolbarToggleGroup`, `ToolbarToggleItem`, `ToolbarSeparator`                                                                                                                                                                                                                                                                                                                       | Bind a toggle group's value with `v-model`                                                                                                                                               |

  In `@nxds/react`, `SidebarProvider` is controlled only when you pass `open`. It now calls `onOpenChange` in both modes, so passing `onOpenChange` alone no longer stops the sidebar from toggling.

  Closing the narrow-viewport sidebar drawer returns focus to the control that opened it. The first Escape closes the drawer, because a `SidebarMenuButton` tooltip no longer opens unless the sidebar is collapsed to its icon rail.

## 0.0.2

### Patch Changes

- Updated dependencies [bfd0509]
  - @nxds/core@0.10.0

## 0.0.1

### Patch Changes

- Updated dependencies [5daa687]
  - @nxds/core@0.9.1
