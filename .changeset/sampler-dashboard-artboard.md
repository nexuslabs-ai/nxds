---
'@nxds/claude-design': patch
'nxds-cli': patch
---

The sampler is now a sales dashboard shipped as `nxds-sampler.dc.html` beside `SETUP.md`, so it shows as an artboard on a Claude Design canvas. Claude puts the file on the canvas unchanged and adds its `canvas.json` entry. Switch its `mode` tweak to `dark` to check the dark theme. `Label`, `ChoiceRow` and `ChoiceCard` now list `htmlFor`, so a canvas can link a label to its control. A release's `files.json` now lists the files beside `project/` with their hashes too, and `nxds-cli` copies only what it lists. When a release drops a root file you edited, `nxds-cli` keeps it, lists it in the `--json` output's `data.kept`, and exits 3.
