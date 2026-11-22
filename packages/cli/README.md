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

`init` needs Tailwind CSS 4. If your app doesn't have Tailwind yet, `init`
installs it.

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

## Docs

- **[Set your theme](https://nxds.dev/getting-started/install#optional-set-your-theme)**: every `init` theme flag and its values.
- **[Update components](https://nxds.dev/getting-started/install#update-components)**: how `update` merges a release into files you edited.
- **[Options](https://nxds.dev/getting-started/install#options)**: the options every command takes, proxy settings and exit codes.
