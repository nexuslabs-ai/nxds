# @nxds/claude-design

nxds as a Claude Design System: tokens, a live React 18 component bundle, prop types and previews.

Export the files with `nxds-cli`:

```bash
npx nxds-cli@latest export claude-design
```

Theme it with the `init` theme flags, except `--mode` and `--icons`:

```bash
npx nxds-cli@latest export claude-design --brand-color "#e11d48" --corners round
```

The command writes a `nxds-design-system/` folder. Its `SETUP.md` walks Claude through publishing `project/` as a Design System artifact, installing it on a canvas and checking it.

| File                                        | What it holds                                                                                      |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `project/tokens.json`, `project/tokens.css` | The tokens the components read, in Light and Dark, at the default appearance or the export's theme |
| `project/components/bundle.js`              | Every component as `window.Nxds`, for React 18.3.1 globals                                         |
| `project/components/bundle.css`             | The component styles                                                                               |
| `project/components/index.d.ts`             | One `<Name>Props` interface per component part                                                     |
| `project/components/<Name>/`                | A preview card and a README per component                                                          |
| `coverage.md`                               | The props the canvas can't set, and why                                                            |
| `SETUP.md`                                  | The setup guide for this release                                                                   |
| `nxds-sampler.dc.html`                      | The sampler artboard, a sales dashboard that checks the install                                    |
| `theme.js`                                  | What `nxds-cli` runs to write a themed export. The export doesn't copy it out.                     |

Docs: <https://nxds.dev>
