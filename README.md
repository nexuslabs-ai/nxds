<div align="center">

<a href="https://nxds.dev">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/docs/public/brand/nx-icon-dark.svg">
    <img src="apps/docs/public/brand/nx-icon-light.svg" alt="nxds logo" width="88" height="88">
  </picture>
</a>

# Your design system starts here.

**nxds** is a theme engine and design system. Set one appearance object, and every component follows your brand, density and corners.

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

## Get started

```bash
npx nxds-cli@latest init
npx nxds-cli@latest add button
```

The CLI copies each component into your app, so the code is yours to edit. For Vue, follow the [install guide](https://nxds.dev/getting-started/install#install-by-hand).

## Customize every detail.

Change one setting. See your system respond.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/readme-themes-dark.png">
  <img src=".github/assets/readme-themes-light.png" alt="The same create-project card in three themes. Dense: black, Geist, small UI scale, compact spacing. Friendly: indigo, Figtree, comfortable spacing, extra-round corners. Editorial: amber, Lora with Playfair Display headings, large UI scale, relaxed spacing, square corners.">
</picture>

Every theme passes contrast checks in CI, in light and dark. **[Open Playground →](https://nxds.dev/playground)**

## Your next component shouldn't change the rest.

nxds components bring their own styles, so you add what you need and keep the look you built.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/readme-coexist-dark.png">
  <img src=".github/assets/readme-coexist-light.png" alt="Two copies of a shadcn/ui app. Adding a react-bootstrap Dropdown changes the app's buttons through global rules. Adding the nxds Select leaves the app unchanged.">
</picture>

Works next to MUI, shadcn/ui, Chakra UI, Mantine, Ant Design, Bootstrap and Tailwind. **[Explore integrations →](https://nxds.dev/integrations/overview)**

## One foundation. Many frameworks.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/readme-frameworks-dark.png">
  <img src=".github/assets/readme-frameworks-light.png" alt="Design tokens feed nxds core. Brand color, surfaces and contrast feed the theme engine. Typography, spacing, radius, borders, shadows and motion feed the appearance engine. Both produce a shared theme for React, Vue, and the planned Svelte, Angular and React Native.">
</picture>

**[Explore the engine →](https://nxds.dev/foundations/tokens)**

## Stories are the tests.

The example you explore is the example we check.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/readme-stories-dark.png">
  <img src=".github/assets/readme-stories-light.png" alt="A Switch example next to its Storybook story. Five checks, from starts off to reports false, have passed.">
</picture>

**[Open Storybook →](https://storybook.nxds.dev)**

## For designers

Pick a theme in the Playground, then select **Use in Claude Design**. Claude builds your own nxds Design System on a canvas, with live components in your theme.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/readme-playground-dark.png">
  <img src=".github/assets/readme-playground-light.png" alt="The nxds Playground with an indigo theme. The appearance panel sets brand color, mode, surface tone, contrast, UI scale, text size and density, and the examples follow it.">
</picture>

**[Set up Claude Design →](https://nxds.dev/getting-started/claude-design)**

## For AI agents

Give your agent the nxds skills:

```bash
# Claude Code
/plugin marketplace add nexuslabs-ai/nxds
/plugin install nxds@nxds

# Cursor, Codex, Gemini CLI and other agents
npx skills add nexuslabs-ai/nxds --skill nxds nxds-adopt
```

Every docs page is also Markdown, listed in [llms.txt](https://nxds.dev/llms.txt). **[Read the AI agents guide →](https://nxds.dev/getting-started/ai-agents)**

## Packages

| Package                                         | What it does                                        |
| ----------------------------------------------- | --------------------------------------------------- |
| [`nxds-cli`](packages/cli)                      | Copies nxds into your app and updates it            |
| [`@nxds/core`](packages/core)                   | The theme engine                                    |
| [`@nxds/eslint-plugin`](packages/eslint-plugin) | Lint rules for nxds conventions                     |
| [`@nxds/claude-design`](packages/claude-design) | nxds as a Claude Design System                      |
| [`plugins/nxds`](plugins/nxds)                  | The nxds skills for Claude Code and other AI agents |

## Community

Ask questions, suggest ideas and share what you built in [GitHub Discussions](https://github.com/nexuslabs-ai/nxds/discussions). Chat on [Discord](https://discord.gg/PTT5JFyhHw). Report bugs in [GitHub issues](https://github.com/nexuslabs-ai/nxds/issues). Follow [@nxdsdev on X](https://x.com/nxdsdev) for news.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) to set up the repo and run the tests.

## License

[MIT](LICENSE) © Nexus Labs
