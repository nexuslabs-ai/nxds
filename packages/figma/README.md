# @nxds/figma

`nxds-cli export figma` turns every nxds component into native Figma components, with variables, text styles, shadow styles and an icon set. Private, not published.

## Run it

Build the plugin and the CLI from the repo root:

```bash
pnpm --filter @nxds/figma build
pnpm --filter nxds-cli build
node packages/cli/dist/index.js export figma
```

The command takes the same theme flags as `export claude-design`, such as `--brand-color '#e11d48'`. Without `--font`, text is set in Inter, because Figma can't draw the system UI font.

When it says it's waiting, do this in the Figma desktop app:

1. Open a new design file.
2. Choose **Plugins > Development > Import plugin from manifest…**, then pick `packages/figma/plugin/manifest.json`. You only do this once.
3. Choose **Plugins > Development > nxds export**.

The plugin adds an Icons page and builds the components on the current page, then the command exits. It writes these files to `nxds-figma/`:

| File           | What it holds                                                         |
| -------------- | --------------------------------------------------------------------- |
| `capture.json` | Every variable, style, icon, component and layer, with its token      |
| `screenshots/` | A browser screenshot of every variant, with its optional parts hidden |
| `report.json`  | What the plugin created, unbound values, replaced fonts and failures  |

If Chromium doesn't start, run `npx playwright@1.64.1 install chromium`.

## What it builds

| In Figma             | From                                                                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Variables            | Semantic colours, spacing, radius, border width, icon sizes, container widths and typography. A palette colour only when a component binds it |
| Text styles          | Each `typography-*` class, bound to the typography variables it declares                                                                      |
| Shadow styles        | Each shadow token                                                                                                                             |
| Icons page           | Every Phosphor icon the release ships, regular and fill, one component each                                                                   |
| A component per card | The card's README example, open when it's an overlay, in every variant and state                                                              |
| A component per part | Repeated parts, such as Menu item, Tab and Table row, which the components hold as instances                                                  |

## Check it

```bash
pnpm --filter @nxds/core build
pnpm --filter @nxds/claude-design build
pnpm --filter @nxds/figma smoke
```

The smoke test captures every component from the built release, then checks the bindings, sizing, icons, nested instances, properties, variables and the local link. Pass a folder to keep its output: `pnpm --filter @nxds/figma smoke ../../nxds-figma-smoke`.

## Source

| File                 | Job                                                                       |
| -------------------- | ------------------------------------------------------------------------- |
| `src/recipes.ts`     | What differs from the defaults: parts, overlays to open, states, markup   |
| `src/props.ts`       | Reads each part's props from the release's `index.d.ts`                   |
| `src/page.ts`        | Runs in the page: mounts a variant, records it, draws the icon set        |
| `src/convert.ts`     | Turns a recording into auto layout, sizing, bindings, icons and instances |
| `src/tokens.ts`      | Turns tokens.json into variables, text styles and shadow styles           |
| `src/capture.ts`     | Drives headless Chromium through every component and variant              |
| `src/link.ts`        | Serves the capture on `localhost:7357` and takes the report               |
| `src/spec.ts`        | The capture and report formats, shared with the plugin                    |
| `plugin/src/code.ts` | Builds what the capture says in Figma                                     |
| `plugin/src/ui.ts`   | Fetches the capture and posts the report                                  |
