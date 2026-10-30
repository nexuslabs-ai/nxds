# nxds docs

The nxds documentation site. Article routes live in `app/(docs)`; the
full-height workspaces live in `app/(workspace)` and share the docs header but
not the article chrome.

## Run and validate

From the repository root:

- `pnpm --filter @nxds/docs dev`
- `pnpm --filter @nxds/docs typecheck`
- `pnpm --filter @nxds/docs build`
- `pnpm --filter @nxds/docs audit:csp` — after a production build.

## Playground

`/playground` is a playground for the docs appearance. The controls sit in a side
panel on wide screens and in a sheet below `lg`. The canvas renders a small
product scene built from public nxds components.

- **One appearance.** Controls write to the docs appearance provider in the root
  layout. That provider is the only store: it persists under
  `nxds-docs-appearance`, and every page, including `/playground`, renders with it.
  The example scene renders inline under that same appearance. Its overlays
  portal into the docs document, so they look the same as the canvas.
- **Icons.** The icon library lives outside the appearance, in
  `app/_lib/icon-library.ts`, since an app picks it when it installs nxds.
- **Shuffle, Undo and Reset.** `useDocsTheme` (`app/_lib/docs-theme.ts`) keeps
  one history of up to 100 undo steps for every theme control: the theme panel
  on docs pages, the playground and the token lab. Each edit, shuffle or reset
  records the previous values of only what it changed, and Undo writes those
  back, so changes made elsewhere (such as the top-nav light/dark toggle)
  survive an Undo. The history is per visit and is not persisted.
- **Export.** "Use this theme", in the theme panel and the playground, shows the
  `nxds-cli init` command that sets up the theme, with a flag for each part
  that differs from nxds's default. Below it, for apps without the CLI,
  `nxds-appearance.ts` holds the appearance state to pass as `defaultState`,
  `theme.css` the derived light and dark themes, and `preferences.css` the font
  and motion preferences.
