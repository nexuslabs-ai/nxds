# @nxds/claude-design

nxds as a Claude Design System: tokens, a live React 18 component bundle, prop types and previews.

Export the files with `nxds-cli`:

```bash
npx nxds-cli@latest export claude-design
```

The command writes a `nxds-design-system/project/` folder. Publish that folder as a Design System artifact in Claude, unchanged.

| File                                        | What it holds                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `project/tokens.json`, `project/tokens.css` | The tokens the components read, at the default appearance, in Light and Dark |
| `project/components/bundle.js`              | Every component as `window.Nxds`, for React 18.3.1 globals                   |
| `project/components/bundle.css`             | The component styles                                                         |
| `project/components/index.d.ts`             | One `<Name>Props` interface per component part                               |
| `project/components/<Name>/`                | A preview card and a README per component                                    |
| `coverage.md`                               | The props the canvas can't set, and why                                      |

Docs: <https://nxds.dev>
