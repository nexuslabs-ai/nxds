---
'@nxds/core': minor
'@nxds/tailwind': minor
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/claude-design': minor
---

Corner modes are named by their pixel value: `0`, `2`, `4`, `6`, `8`, `10`, `12`, `14` and `16` (`data-radius="12"`, `corners: '12'`). The default is `4`.

- **Breaking:** the old names `square`, `subtle`, `smooth`, `round` and `extra-round` are removed. Use `0`, `4`, `8`, `12` and `16`. A stored appearance with an old name opens at `4`.
- Each mode's sizes are its value times a fixed ratio, rounded to whole pixels: `sm` 0.75, `md` 1, `lg` 1.25, `xl` 1.5, `2xl` 2, `3xl` 3, `4xl` 4. This changes the default mode's sizes: `sm` 2→3, `lg` 6→5, `xl` 8→6, `2xl` 12→8, `3xl` 20→12, `4xl` 28→16. `md` does not change.
- The UI scale multiplies each mode's exact steps (its value times the ratio) and rounds once. At Large, the `12` mode's `md` is 13px.
- The snapshot version is 12, so a stored snapshot from before this change is derived again.
- The settings screen, the Storybook toolbars, `nxds-cli init --corners` and `nxds-cli export claude-design --corners` take the nine modes.
