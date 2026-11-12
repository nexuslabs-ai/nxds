# @nxds/figma

Proof of concept: `nxds-cli export figma` turns six nxds components into native Figma components, with variables, text styles and shadow styles. Private, not published.

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

The plugin builds everything on the current page, then the command exits. It writes these files to `nxds-figma/`:

| File           | What it holds                                                         |
| -------------- | --------------------------------------------------------------------- |
| `capture.json` | Every variable, style, component and layer, with the token each uses  |
| `screenshots/` | A browser screenshot of every variant, with its optional parts hidden |
| `report.json`  | What the plugin created, unbound values, replaced fonts and failures  |

If Chromium doesn't start, run `npx playwright@1.64.1 install chromium`.

## Check it

```bash
pnpm --filter @nxds/core build
pnpm --filter @nxds/claude-design build
pnpm --filter @nxds/figma smoke
```

The smoke test captures every variant from the built release, then checks the counts, bindings, sizing, instances, properties and the local link. Pass a folder to keep its output: `pnpm --filter @nxds/figma smoke ../../nxds-figma-smoke`.

## Source

| File                 | Job                                                                  |
| -------------------- | -------------------------------------------------------------------- |
| `src/recipes.ts`     | Each component's variant properties, states, optional parts and text |
| `src/page.ts`        | Runs in the page: mounts a variant and records it                    |
| `src/convert.ts`     | Turns a recording into auto layout, sizing and bindings              |
| `src/tokens.ts`      | Turns tokens.json into variables, text styles and shadow styles      |
| `src/capture.ts`     | Drives headless Chromium through every variant                       |
| `src/link.ts`        | Serves the capture on `localhost:7357` and takes the report          |
| `src/spec.ts`        | The capture and report formats, shared with the plugin               |
| `plugin/src/code.ts` | Builds what the capture says in Figma                                |
| `plugin/src/ui.ts`   | Fetches the capture and posts the report                             |
