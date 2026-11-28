# @nxds/eslint-plugin

ESLint rules that keep copied nxds components following nxds conventions.

```bash
npm install -D @nxds/eslint-plugin
```

```js
// eslint.config.mjs
import { nxdsComponentConfig } from '@nxds/eslint-plugin/config';

const eslintConfig = [
  // ...your existing config
  {
    files: ['components/**/*.tsx'],
    ...nxdsComponentConfig(),
  },
];

export default eslintConfig;
```

The rules need a TypeScript parser. `create-next-app` sets one up through
`next/core-web-vitals`. If your config has none, install `typescript-eslint` and
add `languageOptions: { parser: tseslint.parser }` to the entry.

## Rules

| Rule                             | In `nxdsComponentConfig` | Reports                                                           |
| -------------------------------- | ------------------------ | ----------------------------------------------------------------- |
| `nx-class-conventions`           | Yes                      | `nx:` classes that break nxds token and styling conventions       |
| `no-render-prop-types`           | Yes                      | Props that inject what a component renders, instead of `children` |
| `no-multi-statement-jsx-handler` | Yes                      | Long inline JSX handlers that should be named functions           |
| `no-jsdoc-data-tags`             | No                       | `@default` and `@example` JSDoc tags                              |
| `no-react-19-only`               | No                       | React 19-only APIs in code that must also run on React 18         |
| `shippable-story`                | No                       | What only passes in nxds's own Storybook, in a story that ships   |

To turn on a rule the config leaves off, add it for the same files:

```js
// eslint.config.mjs
import { nxdsComponentConfig } from '@nxds/eslint-plugin/config';

const eslintConfig = [
  {
    files: ['components/**/*.tsx'],
    ...nxdsComponentConfig(),
  },
  {
    files: ['components/**/*.tsx'],
    rules: { '@nxds/no-react-19-only': 'error' },
  },
];

export default eslintConfig;
```

### nx-class-conventions

`nx-class-conventions` reads every class string, and reports:

| Check                  | Problem                    | Example                                                  | Write instead                                                                |
| ---------------------- | -------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `prefixOrder`          | Prefix after a modifier    | `hover:nx:bg-…`                                          | `nx:hover:bg-…`                                                              |
| `bannedAccent`         | The removed `accent` token | `nx:bg-accent`                                           | `nx:bg-background-hover` or `nx:bg-container-hover`                          |
| `incompletePath`       | A token without its role   | `nx:bg-primary`                                          | `nx:bg-primary-background`                                                   |
| `rawPrimitive`         | A raw palette color        | `nx:bg-blue-500`                                         | A semantic token, such as `nx:bg-primary-background`                         |
| `rawFontSize`          | A raw font size            | `nx:text-sm`                                             | A composite, such as `nx:typography-body-default`                            |
| `rawFontWeight`        | A raw font weight          | `nx:font-medium`                                         | A composite, such as `nx:typography-label-default`                           |
| `rawLineHeight`        | A raw line height          | `nx:leading-none`                                        | A composite, such as `nx:typography-body-default`                            |
| `rawLetterSpacing`     | A raw letter spacing       | `nx:tracking-wide`                                       | A composite, such as `nx:typography-label-caps`                              |
| `densityIconSize`      | An icon sized from spacing | `nx:[&_svg]:size-4`                                      | `nx:[&_svg]:size-icon-glyph-default`                                         |
| `plainIconSize`        | A plain icon size          | `nx:[&_svg]:size-[20px]` alone                           | A `size-icon-glyph-*` class, or `nx:[&_svg]:[--nx-icon-size:20px]` beside it |
| `unstrokedIcon`        | An unstroked icon size     | `nx:[&_svg]:size-icon-glyph-sm` alone                    | Add `nx:icon-stroke` to the same class list                                  |
| `ringFadingTransition` | A focus ring that fades in | `nx:transition-colors` with `nx:focus-visible:outline-2` | `nx:transition-control`, or `nx:transition-field` on a field                 |

The icon and focus ring checks read a whole class list: one `cva`, `cn`, `clsx`
or `cx` call, or one `[…].join(' ')`. Two variants of one key share that list,
so a ring in one variant and `nx:transition-colors` in another still report.

To turn checks off for some files, list them in `skip`:

```js
// eslint.config.mjs
import { nxdsComponentConfig } from '@nxds/eslint-plugin/config';

const eslintConfig = [
  {
    files: ['components/**/*.tsx'],
    ...nxdsComponentConfig(),
  },
  {
    files: ['components/style-guide/**/*.tsx'],
    rules: {
      '@nxds/nx-class-conventions': [
        'error',
        { skip: ['rawFontWeight', 'rawLineHeight'] },
      ],
    },
  },
];

export default eslintConfig;
```

`skip` takes names from the Check column. Put the entry after the
`nxdsComponentConfig` entry, so its options win.

### no-render-prop-types

`no-render-prop-types` reports a prop typed as a render callback
(`(...) => ReactNode`) or a component reference (`ComponentType`, `FC`,
`ElementType`). Props named `on*` pass. Use `children`, a named `ReactNode`
prop, or one component per mode.

If a third-party API needs the shape, add a `@thirdPartyShape` tag with a
reason to the prop's JSDoc:

```tsx
// components/chart.tsx
import type { ReactNode } from 'react';

type ChartTooltipProps = {
  /** @thirdPartyShape Recharts calls this with the hovered point. */
  formatter?: (value: number) => ReactNode;
};
```

### no-multi-statement-jsx-handler

`no-multi-statement-jsx-handler` reports an inline JSX handler with three or
more statements, or one that passes a callback object. Move it to a named
function above the `return`. Handlers with one or two statements stay inline.

### no-jsdoc-data-tags

`no-jsdoc-data-tags` reports `@default` and `@example` in JSDoc blocks. Set a
default in code, and show usage in a story.

### no-react-19-only

`no-react-19-only` reports React 19-only APIs, for code that must also run on
React 18:

| Pattern                                                                                                   | Use instead                                             |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `use`, `useActionState`, `useOptimistic`, `useEffectEvent`, `Activity`, `captureOwnerStack` from `react`  | An API React 18.3 has                                   |
| `useFormStatus`, `requestFormReset`, `preload*`, `preinit*`, `preconnect`, `prefetchDNS` from `react-dom` | An API React 18.3 has                                   |
| `<SomeContext value={…}>`                                                                                 | `<SomeContext.Provider value={…}>`                      |
| A ref callback that returns a cleanup                                                                     | The node in state, with setup and teardown in an effect |
| `useDeferredValue(value, initialValue)`                                                                   | One argument                                            |
| A function passed to `action` or `formAction`                                                             | `onSubmit` or `onClick`                                 |
| `<title>` outside an `<svg>`, `<meta>`, `<link>`, `<style precedence>`                                    | Metadata the app's framework renders                    |

### shippable-story

`shippable-story` is for nxds's own source. The CLI copies a component's
`*.stories.*` file into an app, so that file holds only what still passes after
the app restyles the component. The rule reports everything else, which belongs
in the `*.test.stories.*` file beside it:

| Pattern                                                                                   | Use instead                                     |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `toHaveClass`, a read of `classList` or `className`, or of the `class` attribute          | A role, name, state or data attribute assertion |
| `getComputedStyle`, `toHaveStyle`, `getBoundingClientRect`, `offset*` and `client*` sizes | The test stories file                           |
| A class in a `querySelector`, `closest` or `matches` selector, `getElementsByClassName`   | A role, label, text, `data-slot` or test id     |
| An import from `stories/support`, or one with a query such as `?raw`                      | The test stories file                           |
| A Storybook import other than `storybookImports`                                          | The test stories file                           |
| An icon package other than `iconImports`                                                  | The icons the catalog rewrites per icon library |
| A `src` that starts with `/`                                                              | Story data                                      |
| A `title` in the meta                                                                     | No title: Storybook names a story from its path |

| Option             | Default                                       |
| ------------------ | --------------------------------------------- |
| `storybookImports` | `['@storybook/react-vite', 'storybook/test']` |
| `iconImports`      | `['@phosphor-icons/react/ssr']`               |

## Catch unknown classes

`nxdsTailwindClassesConfig` reports a class your nxds stylesheet doesn't build,
such as a bare utility or a typo. It runs `eslint-plugin-better-tailwindcss`, so
install that first:

```bash
npm install -D eslint-plugin-better-tailwindcss
```

```js
// eslint.config.mjs
import { nxdsTailwindClassesConfig } from '@nxds/eslint-plugin/tailwind';
import path from 'node:path';

const eslintConfig = [
  nxdsTailwindClassesConfig({
    files: ['components/**/*.tsx'],
    entryPoint: path.resolve(import.meta.dirname, 'app/globals.css'),
  }),
];

export default eslintConfig;
```

`entryPoint` is the CSS file that imports nxds. It must be an absolute path,
because tools such as `next build` run ESLint from their own folder.

Docs: <https://nxds.dev/getting-started/install#optional-add-lint-rules>
