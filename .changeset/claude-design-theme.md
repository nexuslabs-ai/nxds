---
'@nxds/core': minor
'@nxds/claude-design': minor
'nxds-cli': minor
---

`nxds-cli export claude-design` takes the `init` theme flags, except `--mode` and `--icons`, and exports a system in that theme: its colours, presets, type scale, code size and fonts. Curated fonts load from Google Fonts through tokens.css. The system records its theme in `design-system.json`, so an update with `--index` keeps it. Passed flags change only the parts they name, and an empty one, such as `--density=`, resets it. Default code text in the export is 12px, as in apps.

`createTokenCatalogue` takes an appearance. Colours and type sizes follow it.
