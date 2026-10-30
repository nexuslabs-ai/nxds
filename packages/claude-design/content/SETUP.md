# Set up nxds {{version}} on a Claude Design canvas

This guide came with nxds {{version}}. Do the steps in order, and check each one before you go on.

The export wrote `nxds-design-system/`:

| Path           | What it is                                     | Publish it                 |
| -------------- | ---------------------------------------------- | -------------------------- |
| `project/`     | The design system, {{files}} files             | Yes, every file, unchanged |
| `SETUP.md`     | This guide                                     | No                         |
| `coverage.md`  | The props a canvas can't set, and why          | No                         |
| `removed.json` | Files an update drops. Only with `--existing`. | No                         |

If the person gave you a link to an nxds system they already have, go to [Update to a new release](#update-to-a-new-release).

## 1. Publish the system

Publish a new Design System artifact from `nxds-design-system/project/`. Send every file at its path under `project/`, such as `project/tokens.css`. Don't add, change or skip a file.

Send {{textPlainFiles}} with the content type `text/plain`. The artifact doesn't serve that file's extension, so the publish is refused without that content type. Every other file's type comes from its extension.

Check: the artifact has {{files}} files under `project/`, its title is nxds, and `project/tokens.json` has `meta.version` {{version}}. Give the person its link. They need it to install nxds on another canvas, and to update it.

If the publish is refused for a reason this step doesn't name, show the person the error and stop. Don't edit or rename a file to make it pass.

## 2. Create a canvas and install nxds

Create a Design canvas. Install the system on it from the link in step 1.

Check that the canvas has these files:

{{canvasFiles}}

Check that `ds/nxds/tokens.json` has `meta.version` {{version}}. Read the version there, not in `canvas.json`.

If `index.d.ts` is missing, copy `project/components/index.d.ts` from the system to `ds/nxds/components/index.d.ts`, unchanged. Without it, no prop has a control.

## 3. Read the canvas rules

Read `nxds-design-system/project/README.md`. Its "On a Design canvas" and "Canvas rules" sections say how to link the system, mount a component and write each prop. Follow them on every artboard.

## 4. Build the sampler

Add an artboard titled `nxds sampler`, in a file named `nxds-sampler.html` at the canvas root. Keep the `support.js` line, the `<x-dc>` element and the `data-dc-script` block the canvas writes for a new artboard.

Paste these lines in `<head>`, right after the `support.js` line:

```html
{{links}}
```

Paste this markup inside `<x-dc>`, unchanged:

```html
{{sampler}}
```

## 5. Check the sampler

- The console shows no `[nxds]` warning and no error. If you can't read the console, ask the person to open it and tell you what it shows.
- Every section renders: the buttons, the badge and icon, the form card, the date range, the alert, the bar chart and the dark strip.
- The `Create project` button's `variant` shows as a dropdown, and `disabled` as a toggle. If you can't see the props panel, ask the person to select the button and check it.

When every check passes, tell the person nxds is ready, and give them the system link. Then wait for their design request.

## Update to a new release

1. From the person's system artifact, save `project/design-system.json` as `current-index.json`. Save its file paths as a JSON array in `current-files.json`.
2. Export again:

   ```bash
   npx nxds-cli@latest export claude-design --overwrite --index current-index.json --existing current-files.json
   ```

3. Read the new `nxds-design-system/SETUP.md`. It belongs to the new release.
4. Publish `nxds-design-system/project/` to the same artifact link, every file. Send {{textPlainFiles}} with the content type `text/plain`, as in step 1. Remove each path that `nxds-design-system/removed.json` lists.
5. Check: the artifact has the new release's file count under `project/`, none of the removed paths, and `project/tokens.json` has `meta.version` {{version}}.
6. Install the system again on each canvas that uses nxds, then run the checks in step 2 on it. A canvas keeps its old copy until you do.
7. On one canvas, run the checks in step 5 on the sampler.

## When something looks wrong

| You see                                  | Do this                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| Components render unstyled               | Check the three link lines and their order.                                              |
| Nothing renders and the console is empty | The markup is outside `<x-dc>`, or the artboard has no `data-dc-script` block.           |
| `Nxds is not defined`                    | `bundle.js` isn't linked, or its path is wrong.                                          |
| A `[nxds]` warning                       | The attribute doesn't fit its prop. Write it in the form the warning and README.md give. |
| A prop has no control                    | `ds/nxds/components/index.d.ts` is missing. Copy it as step 2 says.                      |
| A canvas shows an older version          | Install the system again on that canvas.                                                 |
| The export can't reach npm               | Show the person the output and stop.                                                     |

Never edit a file under `project/` or `ds/nxds/` to fix a problem, and never edit the System page. If a check still fails, tell the person which check, what you saw and the nxds version. They can report it at https://github.com/nexuslabs-ai/nxds/issues.
