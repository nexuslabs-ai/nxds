---
'@nxds/claude-design': minor
---

Components keep working when a Design canvas wraps each `x-import`. `bundle.css` reaches every part through the wrappers the canvas adds, so button groups join, avatar groups overlap, striped tables tint and divide their rows, icons stay 16px and a label dims beside a disabled checkbox. `as-child` triggers slot the element inside the wrapper, so a popover opens under its button and the button gets `aria-expanded`. Component source and installed components don't change.
