---
'@nxds/claude-design': patch
---

Fix what a fresh chat hit when it followed `SETUP.md` word for word on claude.ai.

- `SETUP.md` tells Claude to publish `components/index.d.ts` as `text/plain`. An Artifact publish refused it before.
- The sampler comes as two blocks: link lines for the artboard's `<head>`, and markup for inside its `<x-dc>`. The artboard file is `nxds-sampler.html`.
- README.md's "On a Design canvas" section names `components/index.d.ts`, so a canvas install copies it and every prop gets a control.
- The version checks read `meta.version` in `tokens.json`, which holds the release.
- `bundle.css` sets `box-sizing: border-box` the way Preflight does, so a full-width component no longer grows past its container on a canvas.
- Icon props show as a text field in the props panel, and the READMEs say so.
