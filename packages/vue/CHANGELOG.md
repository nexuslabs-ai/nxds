# @nxds/vue

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
