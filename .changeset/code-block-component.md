---
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/core': minor
---

Add CodeBlock, a surface for code with line numbers, marked lines and a copy button.

| Part                  | What it does                                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `CodeBlock`           | The surface. Use `variant="flush"` inside a Card                                                                                       |
| `CodeBlockContent`    | The scroll region. Long lines scroll sideways, and a `nx:max-h-*` class scrolls down. `language` sets the `language-*` class on `code` |
| `CodeBlockLine`       | One line. `number` shows it in the gutter, `highlighted` and `status` mark it                                                          |
| `CodeBlockCopyButton` | Copies the code and tells screen readers the result                                                                                    |

CodeBlock does not highlight code. Highlight with Shiki and the `codeBlockTheme` it ships, then put each line's tokens in a `CodeBlockLine`. In server code, such as a React Server Component, import the theme from `@nxds/react/code-block-theme`.

In `@nxds/core`, the contrast solver also reads the chart colours on `container-hover`, the surface of a highlighted line. Where a chart colour was too faint on it, the colour gets a little darker in light mode or a little lighter in dark mode.
