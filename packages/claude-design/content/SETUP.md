# Set up nxds {{version}} on a Claude Design canvas

This guide came with nxds {{version}}. Do the steps in order, and check each one before you go on.

The export wrote `nxds-design-system/`:

| Path                   | What it is                                     | Publish it                 |
| ---------------------- | ---------------------------------------------- | -------------------------- |
| `project/`             | The design system, {{files}} files             | Yes, every file, unchanged |
| `SETUP.md`             | This guide                                     | No                         |
| `coverage.md`          | The props a canvas can't set, and why          | No                         |
| `nxds-sampler.dc.html` | The sampler artboard, for step 4               | To the canvas, in step 4   |
| `removed.json`         | Files an update drops. Only with `--existing`. | No                         |

If the person gave you a link to an nxds system they already have, go to [Update to a new release](#update-to-a-new-release).

## 1. Publish the system

Publish a new Design System artifact from `nxds-design-system/project/`. Send every file at its path under `project/`, such as `project/tokens.css`. Don't add, change or skip a file.

Send {{textPlainFiles}} with the content type `text/plain`. Without that content type, the artifact refuses the publish. Every other file's type comes from its extension.

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

## 4. Add the sampler

The export wrote `nxds-design-system/nxds-sampler.dc.html`. It's a sales dashboard built from nxds, and it checks the install. Put it on the canvas exactly as it is. Don't retype, reformat or rename it, and don't add link lines or a script block to it. It has them.

1. Publish the file to the canvas at the path `nxds-sampler.dc.html`, at the canvas root:
   - If the Artifact tool takes `files` as a map, map `nxds-sampler.dc.html` to the local file `nxds-design-system/nxds-sampler.dc.html`.
   - If it takes a list of absolute paths, copy the file unchanged into the canvas's own folder first: `cp nxds-design-system/nxds-sampler.dc.html /mnt/user-data/outputs/artifacts/<canvas id>/nxds-sampler.dc.html`. Then publish that path.
2. Add this entry to `boards` in the canvas's `canvas.json`. If `boards` already has an entry whose `path` is `nxds-sampler.dc.html`, replace that entry. Keep every other entry and key as it is.

   ```json
   {{boardEntry}}
   ```

Check: read `nxds-sampler.dc.html` back from the canvas. It matches the export's copy exactly. An artboard titled `nxds sampler` shows on the canvas.

## 5. Check the sampler

If you can't see the canvas, read its console or open its panels, ask the person to check that item and tell you what they see.

- The console shows no `[nxds]` warning and no error. The one exception is a React `validateDOMNesting` warning about the deals table. The canvas's own wrappers around its rows and cells cause it.
- Every section renders: the sidebar, the header with search, the `Sales overview` page header with its actions, the four metric cards, the `Closed won` bar chart, `Pipeline by stage`, the `Open deals` table and the `Today` tasks.
- Nothing is cut off at the bottom of the artboard, and nothing spills past its card.
- Click `This quarter`. A calendar opens on October to December 2026 with the whole quarter selected. Press Escape to close it.
- In the Tweaks panel, set `mode` to `dark`. The whole dashboard switches to the dark theme, with no light patch left, and the console stays clean. Set it back to `light`.
- Select the `New deal` button. In the props panel, `variant` shows as a dropdown and `disabled` as a toggle.

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
7. On one canvas, put the new release's `nxds-sampler.dc.html` on it as step 4 says, replacing the old one. Then run the checks in step 5.

## When something looks wrong

| You see                                  | Do this                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| No sampler artboard shows                | The file name doesn't end `.dc.html`, or `canvas.json` has no `boards` entry for it.     |
| Components render unstyled               | Check the three link lines and their order.                                              |
| Nothing renders and the console is empty | The file was changed. Publish the export's copy again, as step 4 says.                   |
| `Nxds is not defined`                    | `bundle.js` isn't linked, or its path is wrong.                                          |
| A `[nxds]` warning                       | The attribute doesn't fit its prop. Write it in the form the warning and README.md give. |
| A prop has no control                    | `ds/nxds/components/index.d.ts` is missing. Copy it as step 2 says.                      |
| A canvas shows an older version          | Install the system again on that canvas.                                                 |
| The export can't reach npm               | Show the person the output and stop.                                                     |

Never edit a file under `project/` or `ds/nxds/` to fix a problem, and never edit the System page. If a check still fails, tell the person which check, what you saw and the nxds version. They can report it at https://github.com/nexuslabs-ai/nxds/issues.
