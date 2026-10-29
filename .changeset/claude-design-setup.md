---
'@nxds/claude-design': minor
'nxds-cli': minor
---

Set up nxds on a Claude Design canvas from one prompt in a Claude chat.

- The export writes `SETUP.md` beside `project/`. It walks Claude through publishing the system, installing it on a canvas, checking it and updating it to a new release. It isn't part of the published system.
- `SETUP.md` ships a sampler artboard that writes every attribute form a canvas reads. Claude builds it to check the install.
- `export claude-design` ends by telling Claude to read `SETUP.md` and follow it. `--json` reports its path in `data.setup`.
