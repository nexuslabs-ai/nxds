# Contributing to nxds design system

Project overview lives in [`README.md`](README.md). This is the day-to-day handbook — how to set up, run the dev servers, test, and ship.

**Everything routes through `make`.** Run `make help` for the full list. Prefer the `make` targets over raw `pnpm` / `turbo`: they wrap the flags everyone should be using (turbo filters, the docs-MCP lifecycle, the pre-push gate) so the workflow stays consistent across the team.

## Your first contribution

1. Fork the repo, clone your fork and run `make setup`.
2. Run `make dev`. Storybook opens at http://localhost:6006.
3. Pick an issue labelled [good first issue](https://github.com/nexuslabs-ai/nxds/labels/good%20first%20issue). Comment on it, and wait for a maintainer to assign you before you start.
4. Make your change. To run one story file's tests, pass its path: `pnpm exec vitest run --project=storybook packages/react/src/components/button/Button.stories.tsx`.
5. Run `make verify`, then open a pull request. The template asks what changed, which issue it closes and how you tested it.

## AI tools

AI tools are welcome. nxds ships skills for them. You're responsible for everything you submit, so read it, run it and be ready to explain it in review.

- A person stands behind every PR, issue and comment. Don't let an agent open or post anything on its own.
- For a `good first issue`, comment first and wait to be assigned. We close PRs for issues assigned to someone else.
- We close PRs, issues and security reports that look generated and unchecked, without a review. If it keeps happening, we block the account.

## Prerequisites

- **Node** ≥ 22.18 (see `.nvmrc`)
- **pnpm** — pinned via `packageManager` in `package.json` (`pnpm@10.12.1`)
- **Docker Desktop** — optional, for the docs-MCP server only

## Setup

```bash
make setup        # install all workspace deps + the Playwright browser (for story tests)
```

That's the whole first-time setup. It also wires the Husky pre-commit hook, which formats and `nx:`-lints your staged files on every commit.

## Workspace layout

| Path                     | Purpose                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `packages/core`          | `@nxds/core`: the theme engine, its DTCG tokens and the token CSS emitters                      |
| `packages/tailwind`      | The generated Tailwind theme with the `nx:` prefix (copied into apps, not published)            |
| `packages/react`         | React components on Radix UI. The reference for every component                                 |
| `packages/react-18`      | The React components for React 18, generated from `packages/react`. Never edit by hand          |
| `packages/vue`           | Vue components on Reka UI, held to `packages/react` by the parity tests                         |
| `packages/cli`           | `nxds-cli`, which copies nxds into an app and updates it                                        |
| `packages/catalog`       | The install catalog the docs and `nxds-cli` read, built from the React and Vue sources          |
| `packages/source-model`  | Reads the components, props and stories for the docs generators, the catalog and parity tests   |
| `packages/eslint-plugin` | `@nxds/eslint-plugin`: the rules that enforce nxds conventions                                  |
| `packages/claude-design` | nxds as a Claude Design System, built on every release                                          |
| `apps/docs`              | The docs site at [nxds.dev](https://nxds.dev) (Next.js)                                         |
| `plugins/nxds`           | The nxds skills for Claude Code and other AI agents                                             |
| `parity`                 | The tests that hold each Vue component to its React reference                                   |
| `examples`               | Standalone apps that adopt nxds through the CLI. See [`examples/README.md`](examples/README.md) |
| `docs-mcp`               | The docs-MCP server image (see [AI Documentation MCP](#ai-documentation-mcp-nxds-docs-mcp))     |

## Day-to-day

Pick the surface you're working on — each is one `make` command that turbo orchestrates (parallel servers, prefixed logs, one Ctrl-C stops all):

| Command             | Brings up                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `make dev`          | **Storybook** — the component catalog + interaction tests. The 90% surface.                 |
| `make dev-vue`      | the **`@nxds/vue`** Storybook, on port 6007                                                 |
| `make docs`         | the docs site **+ live `@nxds/react`**                                                      |
| `make docs-preview` | the **production** docs build on port 4321, with each page's `.md` and the Copy page button |
| `make dev-all`      | everything: docs + storybook + all package watchers                                         |

> **The docs site's generated inputs come from the turbo graph**, not from its package scripts, and none of them are committed: `apps/docs/turbo.json` puts `generate:manifest` (the page manifest and its loader map), `generate:demos` (the docs code generated from every story tagged `docs`, under `__generated__/`), `@nxds/catalog#generate:catalog` (the install catalog the docs and the `nxds` CLI share) and `generate:props` (the per-component props JSON that `PropsTable` reads) ahead of both `build` and `dev`, and the two the TypeScript graph imports — `generate:manifest` and `generate:demos` — ahead of `typecheck`. `make build`, `make docs` and `make typecheck` get them. `PropsTable` reads the props JSON on each request, so after changing a component's props or JSDoc during `make docs`, rerun `pnpm --filter @nxds/docs generate:props` and reload — no restart. A bare `pnpm --filter @nxds/docs dev` runs only the docs-story watcher: on a clean checkout there is no page manifest, demo index or install catalog, so start the docs with `make docs`.

If you use Claude Code or Codex, run **`make up`** so the docs-MCP is available to them (see [AI Documentation MCP](#ai-documentation-mcp-nxds-docs-mcp)).

## Before you push

```bash
make verify       # the full gate: lint + react-18 sync + format check + typecheck + tests + token/a11y/browser audits
```

`make verify` is what CI gates on, run locally. For the fast inner loop:

- `make lint` — ESLint (cheap; run it constantly)
- `make typecheck` — `tsc` across the packages
- `pnpm test:unit` — just the unit tests (core engine, `cn` merge, ESLint rules, parity, CLI)
- `pnpm test:storybook:ui` — the interactive debugger when a story's `play` function fails

The pre-commit hook already formats and `nx:`-lints staged files, so you rarely format by hand (`pnpm format` does a full-tree pass if you want one).

## Make targets

`make help` prints these with descriptions. The full set:

| Group        | Targets                                                     |
| ------------ | ----------------------------------------------------------- |
| **Setup**    | `setup` · `fresh` (clean + install + build) · `clean`       |
| **Dev**      | `dev` · `dev-vue` · `docs` · `dev-all`                      |
| **Build**    | `build` · `tokens` (regenerate token CSS from `@nxds/core`) |
| **Quality**  | `lint` · `typecheck` · `audit` · `verify`                   |
| **Docs MCP** | `up` · `down` · `serve` · `publish`                         |

Anything not wrapped is still a plain pnpm script (`pnpm test`, `pnpm test:storybook:ui`, the per-package `audit:*`).

---

## Testing

A single story file (`*.stories.tsx` in `@nxds/react`, `*.stories.ts` in
`@nxds/vue`) does four jobs: autodocs renders it as visual
documentation, `argTypes` makes it an interactive playground, its `play`
function runs as a behaviour test in real Chromium, and addon-a11y runs
axe-core against it with `test: 'error'` so any violation fails.

You don't write a separate `*.test.tsx` for a component. That's not a stylistic
preference — the `unit` project's `include` list in `vitest.config.ts` is one
glob per non-story row of [`.claude/rules/testing.md`](.claude/rules/testing.md)
§ Scope, and a component test file matches none of them.

Outside stories, five kinds of unit test exist, all under the `unit` project
(jsdom): the core engine's behaviour (`packages/core/src/lib`), the nxds `cn`
merge (`packages/react/src/lib/utils.test.ts`), the ESLint plugin's rules
(`packages/eslint-plugin/__tests__`), and cross-framework parity (`parity/`,
see [`cross-stack-parity.md`](.claude/rules/cross-stack-parity.md)), and `nxds-cli`
run against a throwaway app (`packages/cli/__tests__`). Apps, repo scripts and hooks have no
tests of their own, and nothing uses snapshots.

The spec lives in the rules, not here — what earns a test and what is
deliberately out of scope in
[`testing.md`](.claude/rules/testing.md), and the stories a component ships plus
the play-function patterns in
[`testing-react.md`](.claude/rules/testing-react.md). Read those before adding
coverage; this section is orientation only.

### Running tests

`make verify` runs the whole suite (plus lint / typecheck / audits). To run or debug tests directly:

| Command                  | What it does                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `pnpm test`              | every vitest project — `unit` (jsdom) + `storybook` + `storybook-vue` + `parity` (Chromium) |
| `pnpm test:unit`         | unit only — core engine, `cn` merge, ESLint rules, parity                                   |
| `pnpm test:storybook`    | every React and Vue story's play function, and rendered parity, in a real browser           |
| `pnpm test:storybook:ui` | **debugger** — Vitest's interactive UI when a play function fails                           |

The first storybook-project run launches Storybook in the background — the cold start takes a few extra seconds.

---

## Add a component or block

Build it in React first. The Vue port is its own issue, picked up later.

A **block** composes existing components into a ready-made piece of UI, such as a sign-in form. It adds no tokens and no behaviour of its own. A **component** is a new building block with its own API, styling and behaviour.

### Add a block

Create `packages/react/src/blocks/{family}/{slug}/` with three files. [`inline-edit`](packages/react/src/blocks/editing/inline-edit) is the one to copy.

| File                 | Holds                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------- |
| `{slug}.tsx`         | The block                                                                             |
| `{slug}-example.tsx` | One realistic use of the block, with its state. This is the code the docs page shows. |
| `{Slug}.stories.tsx` | A `Default` story tagged `docs` that renders the example, plus interaction stories    |

The docs page at `nxds.dev/blocks/{slug}` is generated from the folder. Blocks have no Vue twin yet, so the parity tests skip them. For a Storybook guide page, add `{Slug}.mdx` beside the stories, as [`InlineEdit.mdx`](packages/react/src/blocks/editing/inline-edit/InlineEdit.mdx) does.

### Add a component

1. Find the closest shipped component and copy its shape: [`switch.tsx`](packages/react/src/components/switch/switch.tsx) for a form control, [`dialog.tsx`](packages/react/src/components/dialog/dialog.tsx) for an overlay, [`select.tsx`](packages/react/src/components/select/select.tsx) for a list, [`button.tsx`](packages/react/src/components/button/button.tsx) for variants and sizes.
2. Create `packages/react/src/components/{name}/{name}.tsx` and `{Name}.stories.tsx`. A component folder has no `index.ts`.
3. Export it from `packages/react/src/index.ts`.
4. Add its slug to `planned` in [`parity/parity.ts`](parity/parity.ts), so the parity tests expect Vue to follow.
5. Tag at least one story `docs`. The component's page at `nxds.dev/components/{name}` is generated from those stories.

Style it with semantic tokens and the `nx:` prefix, and put `data-slot` on every element. To port a shadcn/ui component, map its classes with [`shadcn-divergences.md`](.claude/rules/shadcn-divergences.md). `pnpm lint` catches most mistakes.

### Before you open the PR

1. Run `pnpm --filter @nxds/react-18 generate` and commit what it writes. CI fails if `packages/react-18` doesn't match.
2. Run `pnpm changeset` and pick `@nxds/react` with a `minor` bump.
3. Run `make verify`.

The stories a component ships are listed in [`testing-react.md`](.claude/rules/testing-react.md). Read it before you write the stories. `nxds-cli` copies `{Name}.stories.tsx` into apps, so a check that passes only with our classes or sizes goes in `{Name}.test.stories.tsx`.

## Change a token

Edit the token's source in `packages/core`, then run `make tokens`. It regenerates `packages/core/src/lib/token-scales.generated.ts` and the CSS in `packages/tailwind`.

| Token                                                  | Source                                                                                                                                                                  |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color                                                  | The engine derives it: `packages/core/src/lib/derive-theme.ts` and `surface-ladder.ts`. The palettes it starts from are in `packages/core/tokens/primitives/color.json` |
| Spacing                                                | `packages/core/tokens/semantic/spacing-{density}.json`, one file of px steps and roles per density                                                                      |
| Breakpoints, z-index                                   | `packages/core/tokens/semantic/`                                                                                                                                        |
| Radius, shadow, border width, motion, typography, icon | The DTCG files in `packages/core/tokens/primitives/`                                                                                                                    |
| Typography and shadow composites                       | `packages/core/tokens/styles/typography.json` and `shadows.json`                                                                                                        |
| UI scale factors                                       | `packages/core/src/token-source/ui-scale.ts`                                                                                                                            |

A new or renamed token file needs an import in `packages/core/src/catalogue/token-files.ts`. `pnpm test:unit` fails until that list matches the files on disk.

A spacing value outside the canonical step set fails the pre-commit hook and CI. If a density file needs a new step, run `pnpm --filter @nxds/core refresh:canonical-set` and commit the `canonical-step-set.json` it writes.

---

## AI Documentation MCP (nxds-docs-mcp)

A local documentation server keeps Claude Code and Codex on the exact library versions used here (React 19, Tailwind v4, Storybook 10, Vitest 4, Radix, recharts 3, TanStack Form, …) instead of stale training data. It ships as a pre-indexed Docker image, so there's nothing to scrape locally.

### Teammates — use it

Requires Docker. One command brings it up:

```bash
make up           # pull the published image + run it at http://localhost:6282
```

`.mcp.json` connects Claude Code and `.codex/config.toml` connects Codex automatically — no further setup. Stop it with `make down`. After a maintainer publishes an update, rerun `make up`.

> The image is public (read-only), so `make up` pulls it anonymously — no auth needed. Registry login (`pnpm docs:login`, with the bot credentials) is only for maintainers **publishing** an update; see below.

### Maintainers — update it

`make publish` pushes the image as `nexuslabs-ai-bot`. Add that account to `gh` once: run `gh auth login --scopes write:packages` with the bot's credentials (ask a maintainer), then `gh auth switch --user <your-account>` so your own account stays active.

```bash
make serve        # local docs-mcp server + web dashboard at :6282 for indexing
# add/refresh libraries via the dashboard or the scrape_docs tool, then:
make publish      # login → export DB → build image → push to GHCR
```

The index DB ships **inside** the image, never in git — the live index is the source of truth, and `list_libraries` shows what's in it.

### Lifecycle reference

| make           | wraps                                                 | role                               |
| -------------- | ----------------------------------------------------- | ---------------------------------- |
| `make up`      | `docs:pull` + `docs:start`                            | teammate — run the published index |
| `make down`    | `docs:stop`                                           | teammate — stop it                 |
| `make serve`   | `docs:serve`                                          | maintainer — local indexing server |
| `make publish` | `docs:login` + `docs:publish` (export → build → push) | maintainer — ship an update        |

The rule that mandates querying it lives in [`.claude/rules/docs-mcp.md`](.claude/rules/docs-mcp.md).

## Browser MCP (chrome-devtools)

`.mcp.json` and `.codex/config.toml` start `chrome-devtools-mcp`, which launches Google Chrome stable. If you don't have Chrome, or want another Chromium browser, point the server at it in its own config file. On macOS, for Brave:

```json
{
  "executablePath": "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
}
```

| OS            | Config file                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| macOS / Linux | `$XDG_CONFIG_HOME/cd4a/config.json`, else `~/.config/cd4a/config.json`      |
| Windows       | `%LOCALAPPDATA%\Google\cd4a\config.json`, else `~/.config/cd4a/config.json` |

The file applies in every MCP client, so you don't edit the repo config. A user-level `chrome-devtools` entry in Claude Code or Codex doesn't work, because the project config wins. Make the file and its folder read-only to agents. An agent that edits the file controls the browser, its flags and the URLs it may open.

---

## Releasing

Releases are driven by [changesets](https://github.com/changesets/changesets) and the [`Release`](.github/workflows/release.yml) workflow. Four packages publish to npm; everything else is either internal or copy/own.

| Package               | Published? | Why                                                                      |
| --------------------- | ---------- | ------------------------------------------------------------------------ |
| `@nxds/core`          | **npm**    | Framework-agnostic runtime engine; copied component code imports it      |
| `@nxds/eslint-plugin` | **npm**    | Lint guardrails consumers install and use                                |
| `nxds-cli`            | **npm**    | The `nxds` CLI that installs nxds into an app from the nxds.dev registry |
| `@nxds/claude-design` | **npm**    | The prebuilt Claude Design System that `nxds-cli export` downloads       |
| `@nxds/tailwind`      | copy/own   | Generated token CSS — consumers regenerate with their own token choices  |
| `@nxds/react`         | copy/own   | Components are copied and owned; delivered by the `nxds` CLI             |
| `@nxds/catalog`       | private    | Builds the install catalog and commits one per `@nxds/react` release     |
| `@nxds/docs`          | private    | App                                                                      |
| `@nxds/source-model`  | private    | Reads component sources for the docs generators and the parity tests     |

Everything lives under the `@nxds` scope — the published packages on npm and the ESLint plugin's **rule namespace** (rules are referenced as `@nxds/*`, e.g. `@nxds/no-render-prop-types`). The rule namespace is a flat-config key the plugin registers, independent of the npm package name; it is kept in lockstep with the scope so the repo reads consistently.

### Publishing setup (trusted publishing — no token)

The packages authenticate to npm with **trusted publishing** (OIDC): GitHub Actions mints a short-lived credential at publish time, so there is **no `NPM_TOKEN` secret** in the repo. A new package is bootstrapped once, by hand:

1. Publish it manually with `npm publish` from the branch that introduces it. Trusted publishing can't be configured until a package exists on npm.
2. Register a **trusted publisher** on npmjs.com (_Settings → Trusted Publisher → GitHub Actions_) pointing at `nexuslabs-ai/nxds`, the `release.yml` workflow and the `npm` environment.
3. Lock the package to OIDC: _Settings → Publishing access → Require two-factor authentication and disallow tokens_. Then revoke the token used for the manual publish.

The release workflow also needs a repo secret, **`RELEASE_TOKEN`**. It is a fine-grained PAT from `nexuslabs-ai-bot` with **contents: read/write** and **pull requests: read/write** on this repo. It authenticates the "Version Packages" PR. The default `GITHUB_TOKEN` can't be used here: PRs it opens don't fire `pull_request`, so the required `CI Status` check would never run on the version PR and it couldn't merge. Rotate the PAT before it expires.

The workflow grants `id-token: write` for the OIDC exchange, upgrades npm to a trusted-publishing-capable version (≥ 11.5.1) on the `.nvmrc` Node, and uses `RELEASE_TOKEN` for the release PR and tags. There is **no npm token** — publish auth is OIDC. Provenance attestations are emitted automatically.

The release job runs in the **`npm`** environment, whose only deployment branch is `main`. Each package's trusted publisher names that environment, so no other branch can publish.

### Day-to-day: adding a changeset

Any PR that changes `@nxds/core`, `@nxds/eslint-plugin`, `nxds-cli` or what `@nxds/react` installs includes a changeset describing the bump. `@nxds/claude-design` is fixed to `@nxds/react`: they always release together, at the same version. An `@nxds/react` bump is what gives apps a new release to `nxds update` to:

```bash
pnpm changeset        # pick packages + semver bump, write a summary
```

Commit the generated `.changeset/*.md` file with your PR. Until 1.0, use `minor` for a new feature or a breaking change, and `patch` for a fix. Never pick `major`: it releases 1.0.

### Cutting a release

The `Release` workflow runs on every push to `main`:

1. **Collect** — with unreleased changesets present, it opens/updates a **"Version Packages"** PR that bumps versions and writes `CHANGELOG.md`s. `pnpm version-packages` also commits `packages/catalog/releases/<version>.json` for a new `@nxds/react` version. The docs site serves it at `nxds.dev/r/<version>.json` and as `nxds.dev/r/latest.json`, which is what the `nxds` CLI installs. A release catalog never changes once committed.
2. **Publish** — when you merge that PR (changesets consumed), the next run builds the packages and runs `changeset publish`, pushing `@nxds/core`, `@nxds/eslint-plugin`, `@nxds/claude-design` and `nxds-cli` to npm with provenance. `@nxds/claude-design` publishes its built `dist/` folder, which its build validates against the Design System format. Private packages are skipped automatically.

`@nxds/core` and `@nxds/eslint-plugin` were bootstrapped at `0.7.2` and `0.4.0` by the manual publish, so those two versions carry no provenance. Provenance starts with the first release the workflow publishes. Verify any release with a fresh external install:

```bash
npm install @nxds/core @nxds/eslint-plugin
```

To version locally without publishing (e.g. to preview the bump): `pnpm version-packages`.

---

## Authoritative specs

This handbook is the on-ramp. The canonical conventions live in [`.claude/rules/`](.claude/rules/) — there is no root `CLAUDE.md`. When this doc and a rule file disagree, the rule file wins.

- [`testing-react.md`](.claude/rules/testing-react.md) — testing patterns and required stories
- [`github.md`](.claude/rules/github.md) — branch naming, PR title/body conventions, posting reviews
