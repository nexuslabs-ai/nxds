---
'@nxds/vue': minor
---

Add layout and data-display components that match their React counterparts.

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
| Resizable       | `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`                                                                                                             | Set `direction` on the group                                     |
| Table           | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableRowHeader`, `TableCaption`, `TableSelectionHead`, `TableSelectionCell` |                                                                  |
| Carousel        | `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`                                                                                      | Install `embla-carousel-vue` in your app to use it               |
