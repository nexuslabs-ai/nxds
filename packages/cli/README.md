# nxds-cli

Set up nxds in a React app, then copy in components and blocks that become your
own files.

```bash
npx nxds-cli@latest init
npx nxds-cli@latest add button
```

`init` sets up a Next.js App Router app or a Vite + React app that uses
TypeScript and React 18.3 or 19. It copies the token CSS and the appearance
provider into your app, wires them into your layout and installs `@nxds/core`.
`add` copies a component, the components it uses and the packages it needs.

The CLI needs Node 20.19 or later. For a Vue app, follow
[Install by hand](https://nxds.dev/getting-started/install#install-by-hand).

## Commands

| Command                | What it does                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `init`                 | Sets up the token CSS, the provider and the layout wiring. Theme flags set a theme |
| `add <items...>`       | Adds components or blocks, and everything they need                                |
| `update`               | Moves every installed item to the latest release and merges it into files you edit |
| `diff [items...]`      | Compares your nxds files with the latest release                                   |
| `list`                 | Lists components and blocks. `--kind component` or `--kind block` narrows the list |
| `search <term...>`     | Finds items by name or description                                                 |
| `view <item>`          | Shows an item's files, packages and docs link                                      |
| `info`                 | Shows what the CLI detects in this app                                             |
| `doctor`               | Checks that nxds is wired up correctly, and says how to fix each problem           |
| `export claude-design` | Writes nxds as a Claude Design System folder                                       |

Run `npx nxds-cli@latest <command> --help` for one command's options.

## Set your theme

```bash
npx nxds-cli@latest init --brand-color "#4f46e5" --density compact --font inter --icons lucide
```

Each flag sets one part of the theme. A flag you leave out keeps its value. An
empty flag, such as `--density=`, resets that part to the default.

To build the command, pick a theme in the [Playground](https://nxds.dev/playground)
and open **Use this theme**. [Install](https://nxds.dev/getting-started/install#optional-set-your-theme)
lists every flag and its values.

## Update components

```bash
npx nxds-cli@latest diff
npx nxds-cli@latest update
```

`update` replaces each file you haven't edited. If you edited a file, `update`
merges the release's changes into it. If you and the release changed the same
lines, `update` marks them like a git conflict. Resolve them, then run `update`
again.

## Options

| Option                   | Commands                    | What it does                                                             |
| ------------------------ | --------------------------- | ------------------------------------------------------------------------ |
| `--dry-run`              | `init`, `add`, `update`     | Shows what would change, without changing anything                       |
| `--overwrite`            | `init`, `add`, `update`     | Replaces files that differ from the release's copy                       |
| `--no-install`           | `init`, `add`, `update`     | Skips installing npm packages                                            |
| `--json`                 | All                         | Prints `{ ok, exitCode, data }`, or `{ ok, exitCode, error }` on failure |
| `--cwd <path>`           | All                         | Runs in another folder                                                   |
| `--registry <url\|path>` | All but `info` and `export` | Installs from another registry. `NXDS_REGISTRY_URL` sets it too          |

Behind a proxy, set `HTTPS_PROXY`. The CLI also reads `HTTP_PROXY` and
`NO_PROXY`.

## Exit codes

| Code | Meaning                                                                                 |
| ---- | --------------------------------------------------------------------------------------- |
| `0`  | Done                                                                                    |
| `1`  | Error, such as no network or an invalid release                                         |
| `2`  | Usage error, such as an unknown option or item                                          |
| `3`  | Done, with something left for you: conflicts, kept files, manual steps or failed checks |

Docs: <https://nxds.dev/getting-started/install>
