---
'@nxds/eslint-plugin': minor
---

`nx-class-conventions` takes a `skip` option: the checks to turn off for the files a config entry matches. The rule no longer skips checks for files under an `apps/docs/` folder, so list them in `skip` there instead. Avatar's and Chart's raw typography exceptions match in any file, so the copies `nxds-cli add` writes lint clean.

The `canonical-spacing-steps` rule and `nxdsSpacingTokenConfig` are removed. They checked the nxds repo's own spacing token files, which apps don't have. The package no longer depends on `jsonc-eslint-parser`.
