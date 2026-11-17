<div align="center">

<a href="https://nxds.dev">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/docs/public/brand/nx-icon-dark.svg">
    <img src="apps/docs/public/brand/nx-icon-light.svg" alt="nxds logo" width="88" height="88">
  </picture>
</a>

# nxds

Set one appearance object. Every component follows your brand, density and corners.

[![@nxds/core on npm](https://img.shields.io/npm/v/@nxds/core?label=%40nxds%2Fcore)](https://www.npmjs.com/package/@nxds/core)
[![nxds-cli on npm](https://img.shields.io/npm/v/nxds-cli?label=nxds-cli)](https://www.npmjs.com/package/nxds-cli)
[![CI](https://github.com/nexuslabs-ai/nxds/actions/workflows/ci.yml/badge.svg)](https://github.com/nexuslabs-ai/nxds/actions/workflows/ci.yml)
[![MIT license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Discord](https://img.shields.io/badge/chat-Discord-5865F2?logo=discord&logoColor=white)](https://discord.gg/PTT5JFyhHw)

[Docs](https://nxds.dev/getting-started/introduction) · [Components](https://nxds.dev/components) · [Playground](https://nxds.dev/playground) · [Storybook](https://storybook.nxds.dev) · [Changelog](https://nxds.dev/changelog)

</div>

<br>

<a href="https://nxds.dev">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/readme-hero-dark.png">
    <img src=".github/assets/readme-hero-light.png" alt="nxds components in a project dashboard: a create-project form, a workspace activity chart, team access roles, a design review comment and a project checklist">
  </picture>
</a>

## Why nxds

- **One appearance object.** Brand color, UI scale, density, corners, shadows and type are fields on one object. Change a field and every component follows.
- **Contrast is checked.** Every text and background pair has a minimum contrast score in light and dark. CI fails the build when a pair drops below it.
- **You own the code.** The CLI copies each component's source into your app. Edit it like any other file, and `update` merges each release into your edits.
- **Fits next to your app.** nxds CSS defines only `nx:` classes and `--nx-*` variables, so your app's own styles stay as they are. [Integrations](https://nxds.dev/integrations/overview) shows nxds next to shadcn/ui, MUI and five other libraries.
- **React and Vue.** Each Vue component matches its React reference, and parity tests fail when one drifts. React apps run on React 18.3 or 19.
- **Stories are the tests.** Every docs example is a Storybook story, and every story runs an accessibility check in CI.
- **Ready for AI agents.** The CLI prints JSON, every docs page is available as Markdown, and the nxds skills teach your agent the conventions.

## Get started

Set up your app, then add a component:

```bash
npx nxds-cli@latest init
npx nxds-cli@latest add button
```

`init` sets up a Next.js App Router or Vite app on React 18.3 or 19. For a Vue app, follow [Install by hand](https://nxds.dev/getting-started/install#install-by-hand).

Your theme is one object in `appearance-state.ts`:

```ts
export const defaultAppearance = {
  ...nxdsTheme,
  brandColor: '#4f46e5',
  density: 'compact',
  corners: 'round',
} satisfies NxdsAppearanceState;
```

To pick a theme by eye, set it in the [Playground](https://nxds.dev/playground) and copy its `init` command. [Install](https://nxds.dev/getting-started/install) covers updates, React 18 and every option.

To give Claude Code the nxds skills, run:

```bash
/plugin marketplace add nexuslabs-ai/nxds
/plugin install nxds@nxds
```

[AI agents](https://nxds.dev/getting-started/ai-agents) covers Cursor, Codex and other agents. [Claude Design](https://nxds.dev/getting-started/claude-design) sets up nxds on a Design canvas.

## Packages

| Package                                         | What it does                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| [`nxds-cli`](packages/cli)                      | Copies nxds components and setup into your app, and updates them |
| [`@nxds/core`](packages/core)                   | The theme engine. Turns one appearance object into every token   |
| [`@nxds/eslint-plugin`](packages/eslint-plugin) | ESLint rules that enforce nxds conventions in copied components  |
| [`@nxds/claude-design`](packages/claude-design) | nxds as a Claude Design System, built on every release           |
| [`plugins/nxds`](plugins/nxds)                  | The nxds skills for Claude Code and other AI agents              |

The components live in [`packages/react`](packages/react) and [`packages/vue`](packages/vue). The CLI copies them from there, so they are not installed from npm.

## Examples

Each app in [`examples/`](examples) adopts nxds the way a real team would:

| Example                                     | The team                                              |
| ------------------------------------------- | ----------------------------------------------------- |
| [`nxds-app`](examples/nxds-app)             | Starts a new Next.js app on nxds                      |
| [`shadcn-app`](examples/shadcn-app)         | Has a Next.js app built with shadcn/ui                |
| [`shadcn-package`](examples/shadcn-package) | Has its own shadcn-based design-system package        |
| [`mui-app`](examples/mui-app)               | Has a Vite app built with Material UI and no Tailwind |
| [`react18-app`](examples/react18-app)       | Has a Vite app on React 18.3                          |

## Community

- [Discord](https://discord.gg/PTT5JFyhHw) for questions and feedback
- [X](https://x.com/nxdsdev) for releases and news
- [GitHub issues](https://github.com/nexuslabs-ai/nxds/issues) for bugs and feature requests

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) to set up the repo, run Storybook and test your change before you open a pull request.

## License

[MIT](LICENSE) © Nexus Labs
