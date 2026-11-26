# @nxds/figma

`nxds-cli export figma` turns an app's own nxds components into native Figma components, with variables, text styles, shadow styles and an icon set. Private, not published.

## Run it

Build the plugin and the CLI, then run the export in an app. For nxds itself, the app is `examples/figma-app`:

```bash
pnpm --filter @nxds/figma build
pnpm --filter nxds-cli build
cd examples/figma-app
npm ci
npm run nxds:add
npm run figma
```

`npm run nxds:add` brings the app's components up to date with the repo, so Figma gets the current source.

In your own app, run the command in the folder with `nxds.json`, after the app's packages are installed. The app needs Tailwind CSS 4.3 or a later 4.x release, and `@types/react`.

```bash
cd path/to/app
node path/to/nxds/packages/cli/dist/index.js export figma
```

Outside an app, the command stops and says to run it in one.

To rebuild a few components quickly, name them. A card's name also takes its parts, so `Dialog` brings `Dialog/Header` and the rest. The components they hold, such as the Button in a Card, are captured with them.

```bash
node path/to/nxds/packages/cli/dist/index.js export figma --only Button,Badge
```

When it says it's waiting, do this in the Figma desktop app:

1. Open a new design file the first time, and the same file after that.
2. Choose **Plugins > Development > Import plugin from manifest…**, then pick `packages/figma/plugin/manifest.json`. You only do this once.
3. Choose **Plugins > Development > nxds export**.

The first run renames the current page `nxds` for a cover, and adds a page per card and an Icons page. A Figma Starter plan file holds 3 pages, so use a Professional plan.

A later run in the same file updates it:

- Variables, styles and icons are updated in place, so everything bound to them keeps working.
- Each captured component is redrawn inside the component it was built as. Its instances follow, on any page and in files that use the published library.
- A run without `--only` also deletes the pages, components, variables, styles and icons the app no longer has. If a component fails to capture, nothing is deleted. If a component fails to build, no page or component is deleted.

The plugin finds what it made by a hidden tag that names its token or component, so pages you add are left alone. A variable or style someone renamed keeps its bindings, and the run sets its name back. A component it redraws loses edits made by hand. A copy of a component, such as one made with Cmd+D, is yours, and the run leaves it alone.

A run puts each component it builds back on its card's page. Don't cut and paste a component to move it. A pasted component can be a copy, and the run then draws a new one.

The plugin stamps its version on the file. A plugin of another version refuses the file, so run the plugin in a new file.

Then the command exits. It writes these files to `nxds-figma/`, and a later run replaces them:

| File           | What it holds                                                          |
| -------------- | ---------------------------------------------------------------------- |
| `capture.json` | Every variable, style, icon, component and layer, with its token       |
| `unbound.json` | Each value a layer uses that isn't bound to a variable or style        |
| `screenshots/` | A browser screenshot of every variant, with its optional parts hidden  |
| `report.json`  | What the plugin wrote and removed, the fonts it replaced, and failures |

If the folder holds other files, pass `--overwrite` to write beside them. If it holds one of these names that an earlier export didn't write, the export stops instead of replacing it. If a capture fails, the last export's files stay as they were.

If Chromium doesn't start, run `npx playwright@1.64.1 install chromium`.

## What it reads

Figma gets the app's own components, as the team edited them. Nothing else is an input:

| From the app                  | What the export does with it                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| The nxds folder               | Bundles every component with the app's own packages                                           |
| The CSS entry                 | Compiles it with the app's Tailwind, with its fonts and its `nxds-colors.css` when it has one |
| `NxdsAppearanceProvider`      | Wraps every component, with the app's default appearance                                      |
| The components' types         | Reads each part's props, so a new variant or prop becomes a Figma property                    |
| The icon library in nxds.json | Draws nxds's own icons and the ones the recipes use                                           |

Each Figma component is a recipe in `src/recipes.tsx`, written in JSX with the app's component names and real props. Most recipes draw their card's example in `src/examples.tsx`. The page renders the app's own component for each part.

Each token in the families under [What it builds](#what-it-builds) becomes a variable, sorted into a collection by its name. A colour that references another nxds token, such as `var(--nx-color-blue-600)`, becomes a Figma alias of that variable. Any other value, such as `color-mix()` or the app's own variable, is exported as the colour it resolves to.

The command lists what Figma doesn't get:

- Components whose recipe draws a part the app didn't add
- The app's components that no recipe draws, such as one the team added
- Icons the recipes use that the app's icon library doesn't have

## What it builds

| In Figma             | From                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Variables            | Semantic colours, spacing, radius, border width, icon sizes, container widths and typography. A palette colour only when a component binds it or a colour references it                                                                                                                                                                                                                                                                                                           |
| Text styles          | Each `typography-*` utility the app's CSS defines, bound to the typography variables it declares                                                                                                                                                                                                                                                                                                                                                                                  |
| Shadow styles        | Each shadow token                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Icons page           | nxds's own icons and the ones the recipes use, one component each, from the app's icon library                                                                                                                                                                                                                                                                                                                                                                                    |
| A page per card      | The card's recipes, open when it's an overlay, in every variant and state. Variants sit in a labelled grid: states in rows, sizes in columns, the rest in blocks                                                                                                                                                                                                                                                                                                                  |
| A component per part | Parts named `<Card>/<Part>`, such as `Card/Footer`, `Select/Trigger` and `Sheet/Content`, on their card's page. The components hold them as instances. A modal overlay's whole, such as Dialog or Sheet, is a 1280×800 screen with its Overlay and Content over the page. A menu, popover or select is a 480×400 screen with its trigger and the open panel. A part takes its whole's variant properties and keeps those that change how it looks, such as `Alert/Icon`'s Variant |
| Restyled instances   | A component its holder restyles, such as a Button in a ButtonGroup, is an instance with its fill, border and corners overridden                                                                                                                                                                                                                                                                                                                                                   |
| Slots                | A part that renders `children`, such as `Card/Content`, `Dialog/Body` or `Popover/Content`, holds them in a slot named Content. Its instances fill the slot with their own content, so a Carousel item holding a Card is a `Carousel/Item` instance with a `Card` instance in its slot. To leave a part out, delete it from the slot                                                                                                                                              |

## Add a component

A new nxds component reaches Figma once it has a recipe:

1. Add the card's example to `EXAMPLES` in `src/examples.tsx`, written as an app uses the component.
2. Add each part the example draws to `src/parts.ts`.
3. Add an entry to `RECIPES` in `src/recipes.tsx`. `{ name: 'Kbd', part: 'Kbd' }` draws the example. The other fields say what differs: parts on their own, an overlay to open, states, axes.
4. Run `npm run nxds:add` in `examples/figma-app`, then the smoke test.

A component folder Figma gets nothing for, such as Show, goes in `NOT_DRAWN` with the reason.

## Check it

```bash
cd examples/figma-app
npm ci
cd ../..
pnpm --filter @nxds/figma smoke
```

The smoke test checks `examples/figma-app` has every `@nxds/react` component and captures each one. Then it checks the bindings, sizing, icons, nested instances, properties, variables and the local link. Then it copies the app to `packages/figma/.fixture`, adds its own colours file, a Button variant and a component of its own, removes Kbd and Drawer, and checks Figma gets the edits. Pass a folder to keep its output: `pnpm --filter @nxds/figma smoke ../../nxds-figma-smoke`.

## Source

| File                      | Job                                                                               |
| ------------------------- | --------------------------------------------------------------------------------- |
| `src/recipes.tsx`         | Each Figma component: what it draws, its parts, overlays to open, states and axes |
| `src/examples.tsx`        | Each card's example, in JSX with real props                                       |
| `src/parts.ts`            | Every part a recipe draws, so a mistyped one fails the typecheck                  |
| `src/markup.ts`           | The JSX factory recipes are written in                                            |
| `src/app.ts`              | Bundles an app's components and compiles its CSS entry                            |
| `src/props.ts`            | Reads each part's props from the app's own types                                  |
| `src/page.ts`             | Runs in the page: mounts a variant, records it, reads tokens, draws the icon set  |
| `src/convert.ts`          | Turns a recording into auto layout, sizing, bindings, icons and instances         |
| `src/tokens.ts`           | Turns the page's tokens into variables, text styles and shadow styles             |
| `src/capture.ts`          | Drives headless Chromium through every component and variant                      |
| `src/link.ts`             | Serves the capture on `localhost:7357` and takes the report                       |
| `src/spec.ts`             | The capture and report formats, shared with the plugin                            |
| `scripts/register-tsx.ts` | Lets the smoke test load the `.tsx` recipes                                       |
| `plugin/src/code.ts`      | Builds what the capture says in Figma                                             |
| `plugin/src/ui.ts`        | Fetches the capture and posts the report                                          |
