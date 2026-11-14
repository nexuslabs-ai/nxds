# nxds-cli

## 0.8.0

### Minor Changes

- 19e119b: Add `uiScale` to the appearance: `'small'`, `'default'`, `'large'` or `'larger'`. It makes the whole UI larger or smaller and keeps its proportions.
  - Label text is 12, 14, 16 or 18px, the default icon is 14, 16, 18 or 20px, and a default Button is 36, 40, 44 or 50px at the Default density.
  - Spacing and corners at every density and corner mode scale with it. Lengths are whole px below 16px and even px from 16px, and spacing steps stay in order.
  - Icons are even px at every scale, so an icon centers in an even box such as Kbd. The `xs` icon is 10, 12, 14 or 16px.
  - Page widths (`max-w-*` and the other named widths) and the Sidebar and Toaster widths scale with it. `--nx-ui-scale` holds the factor (0.9, 1, 1.1 or 1.25) for the few other fixed sizes. The collapsed Sidebar rail is now its button plus padding, so the buttons stay inside it and centered at every scale and density, also with `data-density` on the Sidebar. From `md` up, Sidebar props other than `className` go on its root, so the space the Sidebar keeps beside the page is as wide as the rail. The Sidebar no longer sets `--sidebar-width-icon`.
  - The provider sets `data-ui-scale` on `<html>`. Density and corners nest under it.
  - Checkbox, Radio and Switch take their size from the icon tokens, so they follow the UI scale and still ignore density. The MultiSelect option box is the Checkbox size.
  - Every named icon size follows it: `lg` is 22, 24, 28 or 30px and `xl` is 28, 32, 36 or 40px.
  - Code text grows with the label text. `prefs.codeFontSize` is the code size at the Default scale, and 12px code is 10, 14 and 15px at Small, Large and Larger. The `[data-ui-scale]` blocks in `nxds.css` set the code size too, so code scales without the provider.
  - The UI scale never shrinks text below 8px.
  - The close button of Dialog and Sheet keeps a 24px target at every scale.
  - The code size variable is `--nx-typography-code-size`, in its own `code` group. It was `--nx-typography-size-code`.
  - `prefs.uiFontSize` is gone. Use `uiScale`. The CLI flag `--font-size` is replaced by `--ui-scale`. Shuffle keeps the user's UI scale.
  - The token catalogue's `control` is now `controls`, a list. A new `scale` control names `uiScale`, which scales the token. Spacing and radius name their mode and `uiScale`, and the code size names `codeFontSize` and `uiScale`. The catalogue also lists `--nx-ui-scale` in family `ui-scale` and the page widths in family `width`.
  - The settings screen and the Storybook toolbars offer the new mode.
  - `nxds-cli export claude-design` takes `--ui-scale` in place of `--font-size`. A Claude Design system has no `data-ui-scale` attribute. A system at another scale lists every token at that scale and declares its density and corner presets at that scale in `tokens.css`. Its sampler board is wider to match, and its height fits the system's UI scale, density and stroke.
  - `createTokenCatalogue(appearance)` lists each token at the appearance's UI scale, the same values the `[data-ui-scale]` blocks in `nxds.css` hold.

## 0.7.0

### Minor Changes

- c004e3a: `nxds-cli export claude-design` takes the `init` theme flags, except `--mode` and `--icons`, and exports a system in that theme: its colours, presets, type scale, code size and fonts. Curated fonts load from Google Fonts through tokens.css. The system records its theme in `design-system.json`, so an update with `--index` keeps it. Passed flags change only the parts they name, and an empty one, such as `--density=`, resets it. Default code text in the export is 12px, as in apps.

  `createTokenCatalogue` takes the appearance fields it uses: the brand colour, surface tone, contrasts, and UI and code font sizes.

  Code text reads `--nx-typography-size-code`, 12px by default. `nx:typography-code-block` and `nx:typography-code-inline` are 12px without the provider too, and the code font size pref sets the variable. `nx:font-mono` sets only the font family, so mono text takes its size from its own text style.

## 0.6.1

### Patch Changes

- 822919d: The sampler is now a sales dashboard shipped as `nxds-sampler.dc.html` beside `SETUP.md`, so it shows as an artboard on a Claude Design canvas. Claude puts the file on the canvas unchanged and adds its `canvas.json` entry. Switch its `mode` tweak to `dark` to check the dark theme. `Label`, `ChoiceRow` and `ChoiceCard` now list `htmlFor`, so a canvas can link a label to its control. A release's `files.json` now lists the files beside `project/` with their hashes too, and `nxds-cli` copies only what it lists. When a release drops a root file you edited, `nxds-cli` keeps it, lists it in the `--json` output's `data.kept`, and exits 3.

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
