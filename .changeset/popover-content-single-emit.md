---
'@nxds/vue': patch
---

`PopoverContent` emits each event once. Before, a non-modal popover emitted `closeAutoFocus` and `interactOutside` twice, and a modal popover emitted `closeAutoFocus` and `pointerDownOutside` twice. `ComboboxContent` and `MultiSelectContent` forward these events, so they now emit them once too.
