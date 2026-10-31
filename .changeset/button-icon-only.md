---
'@nxds/react': minor
'@nxds/vue': minor
---

Adds `iconOnly` to Button, and removes the Button sizes `icon-sm`, `icon` and `icon-lg`. `size` now sets only the height: `sm` (32px), `default` (40px) or `lg` (48px). An `iconOnly` button is square at that height and shows only its start icon. Its text stays in the DOM as the name screen readers read, visually hidden.

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
- ToolbarButton and ToolbarToggleItem take `startIcon` and `iconOnly` with the same rules.
- InputGroupButton drops its `icon-xs` and `icon-sm` sizes for `iconOnly` at `xs` or `sm`.
- PaginationLink takes `size` for its height and stays square.
- DatePicker day buttons render a native `<button>` with Button's styles and `data-slot="date-picker-day-button"`.
- FilterConditionRemove takes its name as `children` text, visually hidden, in place of `aria-label`.
