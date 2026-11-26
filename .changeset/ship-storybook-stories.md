---
'nxds-cli': minor
'@nxds/react': minor
'@nxds/eslint-plugin': minor
---

`nxds-cli init --stories` installs each component's and block's Storybook stories with it. The app owns the story files: `add` copies a story beside its component with the components and packages the story uses, `update` merges a release's changes into a story you edited, and `diff` and `doctor` track stories while the switch is on. A package only a story imports is a dev dependency. `init --no-stories` leaves the files, stops tracking them and says how many it left.

Each story carries its interaction and accessibility checks: roles, names, keyboard, focus, callbacks, ARIA states and data attributes. A story imports its icons from the app's icon library and its types from the app's own Storybook framework package.

`init --stories` needs Storybook 10 or later on `@storybook/react-vite` or `@storybook/nextjs-vite`. It copies `storybook.tsx` into the nxds folder and adds its appearance provider, appearance toolbar and accessibility settings to `.storybook/preview`. It also lists the nxds folder in `.storybook/main`, and adds Tailwind's Vite plugin there for a Next.js app whose own build runs Tailwind where Storybook can't see it. A preview or main it can't extend is a step it lists for you. In an app that sets its own colors, the preview's stories don't derive colors either. An app with `.storybook` that has turned stories neither on nor off gets a one-line hint.

`@nxds/react`'s release catalog carries the stories, so a release is about 450 KB gzipped, up from 220 KB.

`@nxds/eslint-plugin` has a new rule, `shippable-story`, for nxds's own source. It reports what would only pass in nxds's own Storybook in a story file that ships: class assertions, computed CSS and measurements, class selectors, test helpers, bundler query imports, other Storybook imports, other icon packages, absolute asset paths and a meta `title`.
