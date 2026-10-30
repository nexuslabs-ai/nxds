# nxds-cli

## 0.6.0

### Minor Changes

- 6da5b6b: Set up nxds on a Claude Design canvas from one prompt in a Claude chat.
  - The export writes `SETUP.md` beside `project/`. It walks Claude through publishing the system, installing it on a canvas, checking it and updating it to a new release. It isn't part of the published system.
  - `SETUP.md` ships a sampler artboard that writes every attribute form a canvas reads. Claude builds it to check the install.
  - `export claude-design` writes `SETUP.md` and `coverage.md` beside `project/`, and removes an earlier copy the release doesn't have. `--json` reports their paths in `data.root`.
  - `export claude-design` ends by telling Claude to read `SETUP.md` and follow it.

## 0.5.0

### Minor Changes

- b3d79a5: Set up a whole theme in one step: brand color, surface tone, tokens, mode, contrast, self-hosted fonts and the icon library nxds components draw their own icons with. Phosphor is the default icon library, in place of Tabler Icons.

  | Package                    | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
  | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `@nxds/core`               | `ICON_LIBRARY_OPTIONS`, `FONT_OPTIONS`, `shuffleNxdsAppearance` (pass `fonts` to pick from the fonts your app loads) and `shuffleNxdsIconLibrary`. `NxdsAppearancePrefs` gains `headingFont`, which sets `--nx-typography-family-font-heading`. `null`, the default, follows `uiFont`. `NXDS_THEME_FIELDS` lists each theme part as its `init` flag, and `nxdsThemeFlags` and `applyNxdsThemeFlags` turn a theme into flags and back.                                                         |
  | `@nxds/react`, `@nxds/vue` | `lib/icons` draws Phosphor. `lib/icon-libraries/` holds the same icons in Lucide, Tabler Icons, HugeIcons and Remix Icon. InputOTP's separator draws the filled circle at `nx:size-1`. `NxdsAppearanceSettings` gains a Heading font field.                                                                                                                                                                                                                                                   |
  | `nxds-cli`                 | `init` takes a flag for each theme part, such as `--brand-color`, `--density`, `--font` and `--icons`. It writes `nxds-theme.ts`, which `appearance-state.ts` spreads, and records the theme in `nxds.json`. A flag left out keeps its value, and an empty one, such as `--density=`, resets it. A new font replaces the old one's import, and `doctor` lists the old package. Running `init --icons` again switches every installed `lib/icons.ts`, and `add` and `update` keep the library. |

  To keep Tabler Icons, set `"iconLibrary": "tabler"` in `nxds.json` before you run `update`. After `update`, run `npx nxds-cli@latest init --icons tabler` instead.

  `@nxds/claude-design` ships 421 Phosphor icons, with brand logos, in place of 496 Tabler icons. A canvas names an icon as phosphoricons.com does, such as `Nxds.Icon name="magnifying-glass"`. A `-fill` name, such as `check-circle-fill`, draws the filled icon. `Nxds.Icon` takes `weight` in place of `stroke`.

## 0.4.1

### Patch Changes

- 6b515ae: `nxds-cli export` prints registry and tarball URLs without their user name, password or query string. It refuses an `--npm-registry` URL that is not http or https, or that has a user name, password, query or fragment. nxds-cli sends no registry login. For a private registry, unpack the tarball from `npm pack @nxds/claude-design` and pass its `package` folder with `--source`.
- d00b904: `nxds-cli` refuses a `--registry` or `NXDS_REGISTRY_URL` URL that has a user name, password, query or fragment, so its errors can't print a registry token. nxds-cli sends no registry login. For a private registry, download its `latest.json` and `<version>.json` files to a folder, and pass the folder with `--registry`.

## 0.4.0

### Minor Changes

- 5daa687: Export nxds as a Claude Design System. `npx nxds-cli export claude-design` writes a folder to publish as a Design System artifact in Claude: every token in Light and Dark, every component as a live React 18 bundle, one props interface per part for the canvas controls, and a preview and README per component. The new `@nxds/claude-design` package carries the prebuilt files and releases with `@nxds/react`.

  The Toaster follows `data-theme="dark"` as well as the `.dark` class. Charts no longer log a size warning on their first render. Every runtime colour token has a usage description.

## 0.3.0

### Minor Changes

- 7370faf: Add React 18 support. `nxds-cli` reads the React your app uses and installs files for it: React 18.3 apps get components that take `ref` through `forwardRef`, and React 19 apps get the same files as before.

  | Command  | On React 18                                                                                        |
  | -------- | -------------------------------------------------------------------------------------------------- |
  | `init`   | Records `"react": 18` in `nxds.json` and installs the React 18 files                               |
  | `add`    | Installs the React 18 files, and stops if the app's React changed since `init`                     |
  | `update` | Switches the files to React 19 after you upgrade React, merging nxds's changes into your edits     |
  | `diff`   | Compares your files with the React 18 files                                                        |
  | `doctor` | Checks that the files match the app's React, and that `react-dom` and `@types/react` match `react` |

  The chart now installs `react-is` at your React's major, which recharts needs to read fragments in a chart.

## 0.2.0

### Minor Changes

- 046ec45: Harden the CLI:
  - The command is `nxds-cli`, matching the package name. A global install no longer adds an `nxds` command.
  - `update` merges a release's changes into files you edited. Where you and the release changed the same lines, it writes conflict markers and exits `3`. `doctor` flags markers left in the nxds folder.
  - Line endings and trailing whitespace no longer count as edits, so a CRLF checkout or a formatter no longer stops `update` from replacing files.
  - Exit codes: `0` done, `1` error, `2` usage error, `3` done with something left to do. `--json` output adds `exitCode`.
  - Each command takes only its own options, and `<command> --help` shows them. An unknown option fails with exit code `2`.
  - Registry fetches time out after 30 seconds and honour `HTTPS_PROXY`, `HTTP_PROXY` and `NO_PROXY`. `NXDS_REGISTRY_URL` sets the registry when `--registry` isn't passed.
  - An invalid release or `nxds.json` names each field that's wrong.

## 0.1.0

### Minor Changes

- a87db64: New package: the `nxds` CLI installs nxds into an app.
  - `npx nxds-cli@latest init` sets up a Next.js App Router or Vite + React app: the
    token CSS, the appearance provider, the `cn` helper and their packages, and
    the layout wiring. It installs Tailwind 4 and adds the `@/` alias when the
    app has neither.
  - `npx nxds-cli@latest add <item...>` adds components and blocks with every item and
    package they need.
  - `update`, `diff`, `doctor`, `list`, `search`, `view` and `info` keep the
    install current and checkable.

  Every command takes `--json` and `--dry-run` and never prompts, so AI agents
  can run it. `--json` prints `{ ok, data }`, or `{ ok, error }` on failure.

  The CLI fetches each release from https://nxds.dev/r, so a new component
  release needs no new CLI. `nxds.json` records the app's nxds version: `add`
  installs from it, and `update` replaces only the files that still match it, so
  your edits are never overwritten without `--overwrite`.
