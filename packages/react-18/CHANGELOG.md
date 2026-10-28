# @nxds/react-18

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
