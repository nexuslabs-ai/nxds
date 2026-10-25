---
'@nxds/core': minor
'@nxds/react': patch
'@nxds/vue': patch
---

Corner modes are named by their pixel value: `0`, `2`, `4`, `6`, `8`, `10`, `12`, `14` and `16` (`data-radius="12"`, `corners: '12'`). The default is `4`. The old names `square`, `subtle`, `smooth`, `round` and `extra-round` are removed; use `0`, `4`, `8`, `12` and `16`.

Each mode's sizes are its value times a fixed ratio, rounded to whole pixels: `sm` 0.75, `md` 1, `lg` 1.25, `xl` 1.5, `2xl` 2, `3xl` 3, `4xl` 4. This changes the default mode's sizes: `sm` 2→3, `lg` 6→5, `xl` 8→6, `2xl` 12→8, `3xl` 20→12, `4xl` 28→16 (`md` is unchanged). The Appearance options list the nine modes.
