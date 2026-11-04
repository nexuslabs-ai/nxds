---
'@nxds/core': minor
'@nxds/tailwind': minor
'@nxds/claude-design': minor
'nxds-cli': minor
---

`nxds-cli export claude-design` takes the `init` theme flags, except `--mode` and `--icons`, and exports a system in that theme: its colours, presets, type scale, code size and fonts. Curated fonts load from Google Fonts through tokens.css. The system records its theme in `design-system.json`, so an update with `--index` keeps it. Passed flags change only the parts they name, and an empty one, such as `--density=`, resets it. Default code text in the export is 12px, as in apps.

`createTokenCatalogue` takes the appearance fields it uses: the brand colour, surface tone, contrasts, and UI and code font sizes.

Code text reads `--nx-typography-size-code`, 12px by default. `nx:typography-code-block` and `nx:typography-code-inline` are 12px without the provider too, and the code font size pref sets the variable. `nx:font-mono` sets only the font family, so mono text takes its size from its own text style.
