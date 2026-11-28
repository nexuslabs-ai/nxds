# Testing Rules - React Package

> This file contains testing patterns for `@nxds/react` package.
> For core testing philosophy, see: [testing.md](testing.md)

## Core Principle

**Stories are tests.** Every component story serves as:

1. Living documentation in Storybook
2. Interaction tests via play functions
3. Accessibility tests via addon-a11y

## Testing Split

| What                   | Where                                  | Imports From     |
| ---------------------- | -------------------------------------- | ---------------- |
| Components             | `*.stories.tsx`, `*.test.stories.tsx`  | `storybook/test` |
| `cn` merge             | `packages/react/src/lib/utils.test.ts` | `vitest`         |
| Hooks, other utilities | No tests of their own                  | —                |

Hooks and utilities are covered by the stories of the components that use them. The one exception is `cn`, whose nxds-specific merge groups no story can observe. See [testing.md § Scope](testing.md#scope) for the unit tests outside this package.

## File Structure

### Components (Story-First)

```
component-name/                    # kebab-case folder
├── component-name.tsx              # Implementation (kebab-case)
├── ComponentName.stories.tsx       # Stories nxds-cli ships (PascalCase)
└── ComponentName.test.stories.tsx  # Our own tests, when it needs them
```

A component folder has no `index.ts`. Import another component by its file
(`'../button/button'`), never its folder: the docs copy list follows these
imports.

The import decides what a docs page shows. Importing an exported component's
own file (`button/button.tsx`) links that component's page. Importing any other
file from another folder (`button-group/button-group-context.ts`) copies that
file onto the page, and does not link its folder's component.

**No separate `*.test.tsx` files for components.** Tests live in stories.

## Shipped Stories and Test Stories

`nxds-cli init --stories` copies a component's or block's `X.stories.tsx`
into apps, where the app owns it. `X.test.stories.tsx` stays in this repo.

**A test ships if it still passes after an app restyles the component.** It
goes in the test file if it passes only with our classes, our pixel values or
our Storybook setup.

| Ships in `X.stories.tsx`                                 | Stays in `X.test.stories.tsx`                                         |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| Docs examples                                            | Class assertions (`toHaveClass`, class selectors)                     |
| Roles, names, keyboard, focus, callbacks, ARIA, `data-*` | Computed CSS, positions and sizes                                     |
| Sample data, in `x.story-data.ts` beside the component   | `stories/support` helpers, `?raw` imports, public-folder images       |
| Icons from `@phosphor-icons/react/ssr`                   | Any Storybook import but `@storybook/react-vite` and `storybook/test` |

`@nxds/shippable-story` reports a shipped file that breaks this, and the CLI
install check runs every shipped story in four fresh apps.

A shipped story runs in an app's Storybook, on the newest packages our ranges
allow. So it:

- Sets no `title`. Storybook names it from its path.
- Has no unused import or parameter. An app's default tsconfig and ESLint
  reject them.
- Names each Phosphor icon in `EXAMPLE_ICONS`
  (`packages/source-model/src/example-icons.ts`), so the catalog can draw it
  in the app's icon library.
- Brings what it needs: its own viewport in `parameters.viewport.options`,
  not a name from our preview.
- Finds an element by its label or `data-slot` where a dependency picks the
  role, as Radix does for a ToggleGroup.
- Waits for an overlay to close before a role query, since a closing Select
  still hides the page from assistive technology.
- Starts from what is on screen, not from an empty page. An earlier story's
  toast can still be there.

A test story reuses the shipped story it tests:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { Button } from './button';
import buttonMeta, { IconOnlySizes } from './Button.stories';

const meta: Meta<typeof Button> = { ...buttonMeta, title: 'Tests/Button' };
export default meta;
type Story = StoryObj<typeof Button>;

// Named for the story and what it pins: an icon-only button is square.
export const IconOnlySizesSquare: Story = {
  ...IconOnlySizes,
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole('button')) {
      const { width, height } = button.getBoundingClientRect();
      await expect(width).toBe(height);
    }
  },
};
```

A Storybook guide page for a component or block is `X.mdx` beside its
stories, attached with `<Meta of={XStories} />`. A docs page in a test file
can't show stories from another file.

## Story Template with Play Functions

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Component } from './component';

const meta: Meta<typeof Component> = {
  component: Component,
  args: {
    onClick: fn(), // Spy for callbacks
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

// Visual story (no play function needed)
export const Default: Story = {
  args: { children: 'Default' },
};

// Interaction test (with play function)
export const Interactive: Story = {
  args: { children: 'Click me' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByRole('button');

    await userEvent.click(element);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
```

## Required Stories Per Component

| Story Type              | Purpose                   | Play Function? |
| ----------------------- | ------------------------- | -------------- |
| Default                 | Default state             | Optional       |
| Each variant            | Visual documentation      | No             |
| Each size               | Visual documentation      | No             |
| Disabled                | Disabled state behavior   | Yes            |
| ClickInteraction        | Click handler works       | Yes            |
| KeyboardInteraction     | A11y keyboard support     | Yes            |
| WithDataAttributes      | Verify data-\* attrs      | Yes            |
| asChild (if applicable) | Composition works         | Yes            |
| Edge cases              | Empty, long content, etc. | Yes            |
| AllVariants ★           | Visual grid reference     | No             |

★ The canonical showcase name is `AllVariants`; per-component exceptions (e.g. Avatar uses `AllSizes`) are noted in the component's stories. The matrix is canonical by story **purpose**, not by literal name — a component whose idiom reads better as `OpenCloseInteraction` or `ExpandInteraction` satisfies the click-interaction row, and a pattern with nothing to disable (a modal frame) has no Disabled row to fill.

## Docs Stories

A component's docs page is generated from its stories tagged `docs` — there is no separate demo file. `pnpm --filter @nxds/docs generate:demos` turns each one into the copy-pasteable code the page shows, and fails with a fix for anything it can't convert.

- Tag with `tags: ['docs']`. The first tagged story is the page's preview; the rest are its examples, in file order. Reorder exports to change the order; don't rename them.
- Every exported component needs at least one docs story.
- Write it as code a reader would paste: real product copy, no test captions or prop names as text, no `!` assertions, no fixtures or `stories/support` helpers in the render.
- Args reach the code only through JSX props, children and `{...args}`; the generator writes their values in and drops `fn()` spies.
- A decorator is shown only if it is a plain `(Story) => <…><Story /></…>` wrapper.
- It shares a page with the component's other docs stories: overlays start closed, literal ids stay unique across them (prefer `React.useId`), and nothing global is mounted twice.

## Play Function Patterns

### Click Testing

```tsx
play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await userEvent.click(button);
  await expect(args.onClick).toHaveBeenCalledTimes(1);
};
```

### Keyboard Testing

```tsx
play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const element = canvas.getByRole('button');

  await userEvent.tab();
  await expect(element).toHaveFocus();

  await userEvent.keyboard('{Enter}');
  await expect(args.onClick).toHaveBeenCalledTimes(1);
};
```

### Disabled State Testing

```tsx
play: async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await expect(button).toBeDisabled();
  await userEvent.click(button);
  await expect(args.onClick).not.toHaveBeenCalled();
};
```

### Data Attributes Testing

```tsx
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await expect(button).toHaveAttribute('data-slot', 'button');
  await expect(button).toHaveAttribute('data-variant', 'secondary');
};
```

### A11y Attribute Testing

```tsx
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');

  await expect(button).toHaveAccessibleName('Close dialog');
};
```

## Imports Reference

```tsx
import { expect, fn, userEvent, within } from 'storybook/test';
```

**Note:** In Storybook 10, use `storybook/test` (not `@storybook/test`).

## Accessibility Testing

A11y is automatic. Every story is checked against axe-core rules via `addon-a11y` and violations fail the test — keyboard nav, ARIA semantics, focus management, role/landmark structure. No separate a11y assertions needed.

**Color contrast is APCA-gated, not axe-gated.** Axe-core's `color-contrast` rules are disabled in `preview.tsx` because they enforce WCAG 2.x ratios that don't match nxds's APCA tier model. Contrast is verified at the runtime token layer by `pnpm audit:contrast`.

## Running Tests

```bash
# Run all tests (unit + storybook)
pnpm test

# Run only storybook tests (components)
pnpm test:storybook

# Run only unit tests (core engine, cn merge, ESLint rules, parity, CLI)
pnpm test:unit

# Watch mode for storybook
pnpm test:storybook:watch

# Interactive UI
pnpm test:storybook:ui
```

## Common Mistakes

| Don't                                           | Do                                     |
| ----------------------------------------------- | -------------------------------------- |
| Create `component.test.tsx`                     | Add play functions to stories          |
| Import from `@testing-library/react` in stories | Use `storybook/test`                   |
| Add manual `axe()` assertions                   | Let addon-a11y handle it               |
| Skip keyboard interaction tests                 | Every interactive component needs them |
| Write a `use-hook.test.ts` for a hook           | Cover it through a component's stories |
| Import from `@storybook/test`                   | Use `storybook/test` (Storybook 10)    |
| Import types from `@storybook/react`            | Use `@storybook/react-vite`            |
| Assert a class or a size in `X.stories.tsx`     | Put it in `X.test.stories.tsx`         |

## Do Not

- Create separate `*.test.tsx` files for components
- Use `@testing-library/react` directly in stories
- Skip keyboard accessibility tests
- Commit `skip` or `only` in story files
- Add retries for flaky component tests
