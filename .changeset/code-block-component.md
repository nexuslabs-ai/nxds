---
'@nxds/react': minor
'@nxds/vue': minor
---

Add CodeBlock, a surface for code with line numbers, marked lines and a copy button.

| Part                  | What it does                                                                         |
| --------------------- | ------------------------------------------------------------------------------------ |
| `CodeBlock`           | The surface. Use `variant="flush"` inside a Card                                     |
| `CodeBlockContent`    | The scroll region. Long lines scroll sideways, and a `nx:max-h-*` class scrolls down |
| `CodeBlockLine`       | One line. `number` shows it in the gutter, `highlighted` and `status` mark it        |
| `CodeBlockCopyButton` | Copies the code and tells screen readers the result                                  |

CodeBlock does not highlight code. Highlight with Shiki and the `codeBlockTheme` it ships, then put each line's tokens in a `CodeBlockLine`.
