---
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/core': minor
---

Add diff lines to CodeBlock, and keep syntax colours legible on them.

| Package                    | Change                                                                                                                                                                                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nxds/react`, `@nxds/vue` | `CodeBlockLine` takes `diff="added"` or `diff="removed"`. The line gets a green or red tint and a `+` or `−` before the code. The copy button leaves out removed lines.                                                                                          |
| `@nxds/core`               | The contrast solver also reads the chart, foreground and muted colours on `success-subtle` and `error-subtle`. Chart colours get darker in light mode and a little lighter in dark mode, in most themes. Muted text moves by a very small amount in some themes. |
