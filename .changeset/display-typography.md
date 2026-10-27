---
'@nxds/core': minor
'@nxds/tailwind': minor
'@nxds/react': minor
'@nxds/vue': minor
---

Add three display text styles for hero and page-section titles: `nx:typography-display-large`, `nx:typography-display-medium` and `nx:typography-display-small`.

| Style            | Size | Line height | Weight   |
| ---------------- | ---- | ----------- | -------- |
| `display-large`  | 5xl  | 5xl         | semibold |
| `display-medium` | 4xl  | 4xl         | semibold |
| `display-small`  | 3xl  | 3xl         | semibold |

Each style uses the heading font, `tighter` letter spacing and `text-wrap: balance`. `cn()` in `@nxds/react` and `@nxds/vue` merges them with the other `typography-*` styles.
