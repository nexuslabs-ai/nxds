# figma-app

The app `nxds-cli export figma` runs in to export nxds itself. It has every nxds
component, Phosphor icons and the default theme with Inter, and no screens.

The export draws an app's own components with the app's own CSS, so this app
is what Figma gets as nxds. A team exporting its own app gets its app the same
way.

| Path | What it is |
| ---- | ---------- |
| `src/components/nxds/` | Every nxds component, installed from this repository by `npm run nxds:add`. Committed |
| `src/components/nxds/tailwind/` | The nxds token CSS |
| `src/nxds.css` | The CSS entry: the token CSS, `tw-animate-css`, Inter and the Progress keyframes |
| `src/appearance-state.ts` | The default appearance the provider starts from |
| `nxds.json` | The `nxds` CLI config: every nxds component |

## Export it

```bash
cd examples/figma-app
npm ci
npm run nxds:add
npm run figma
```

`npm run nxds:add` brings the components up to date with this repository, so
Figma gets the current source. `npm run figma` runs the repository's built
`nxds-cli`, so build it first with `pnpm --filter nxds-cli build`. Then follow
the steps it prints to run the plugin in Figma.

`pnpm --filter @nxds/figma smoke` captures this app and checks the result.
