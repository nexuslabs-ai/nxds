---
'@nxds/claude-design': minor
'nxds-cli': minor
---

Set up nxds on a Claude Design canvas from one prompt in a Claude chat.

- The export writes `SETUP.md` beside `project/`. It walks Claude through publishing the system, installing it on a canvas, checking it and updating it to a new release. It isn't part of the published system.
- `SETUP.md` ships a sampler artboard that writes every attribute form a canvas reads. Claude builds it to check the install.
- `export claude-design` writes `SETUP.md` and `coverage.md` beside `project/`, and removes an earlier copy the release doesn't have. `--json` reports their paths in `data.root`.
- `export claude-design` ends by telling Claude to read `SETUP.md` and follow it.
