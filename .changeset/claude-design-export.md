---
'nxds-cli': minor
'@nxds/claude-design': minor
'@nxds/react': minor
'@nxds/core': patch
---

Export nxds as a Claude Design System. `npx nxds-cli export claude-design` writes a folder to publish as a Design System artifact in Claude: every token in Light and Dark, every component as a live React 18 bundle, one props interface per part for the canvas controls, and a preview and README per component. The new `@nxds/claude-design` package carries the prebuilt files and releases with `@nxds/react`.

The Toaster follows `data-theme="dark"` as well as the `.dark` class. Charts no longer log a size warning on their first render. Every runtime colour token has a usage description.
