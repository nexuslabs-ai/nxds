---
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/core': minor
---

Add diff lines to CodeBlock, and give code its own syntax colours.

| Package                    | Change                                                                                                                                                                                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nxds/react`, `@nxds/vue` | `CodeBlockLine` takes `diff="added"` or `diff="removed"`. The line gets a green or red tint and a `+` or `−` before the code. The copy button leaves out removed lines. `codeBlockTheme` colours code with the `syntax-*` tokens.                                                        |
| `@nxds/core`               | Add five colour tokens for code: `syntax-keyword`, `syntax-string`, `syntax-function`, `syntax-type` and `syntax-constant`. Each takes the hue of a chart series. The contrast solver keeps them legible on `container`, `container-hover`, `success-subtle` and `error-subtle`.         |
| `@nxds/core`               | The solver reads the chart colours only on `container` and `background` again, so chart colours go back to their values before CodeBlock. It also reads the foreground and muted colours on `success-subtle` and `error-subtle`. Muted text moves by a very small amount in some themes. |
