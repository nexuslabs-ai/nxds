---
'@nxds/react': minor
'@nxds/vue': minor
---

Toolbar gets tools that open panels, and a floating variant.

- `ToolbarToolGroup`, `ToolbarTool` and `ToolbarToolPanel` add a set of tools. Selecting a tool opens its panel, and selecting it again closes it. Each tool tells assistive technology whether its panel is open.
- `<Toolbar variant="floating">` is a bar for canvas tools, with more padding, space and shadow.
- Groups inside a toolbar use the same gap as the toolbar.
- A vertical separator grows with the height of the row.
- In `@nxds/vue`, PopoverContent emits `closeAutoFocus`, `interactOutside` and `pointerDownOutside` once per event, as React does. Combobox and MultiSelect pass these events on once too.
