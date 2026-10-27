---
name: nxds-adopt
description: 'Add or swap one nxds component in an app that already uses MUI, shadcn/ui, Chakra UI, Mantine, Ant Design, Bootstrap or plain Tailwind. Use with the nxds skill when the project has an nxds.json, or the user asks for nxds, and the app imports one of those libraries.'
---

# nxds-adopt

nxds components work next to the UI library an app already has. This skill
adds or swaps one nxds component at a time and leaves the rest of the app on
its library.

Follow the `nxds` skill for every `nxds-cli` step and every `nx:` class rule.
This skill only adds what changes next to another library.

## Limits

- Change only the component the user names. Never sweep a screen, a folder or
  the whole app.
- Never remove the old library, its provider, its theme, its CSS or its
  package.
- Leave the library's own component files as they are, such as
  `components/ui` in a shadcn/ui app. Change the screen that uses them.
- If the user asks for a component that the library's docs page lists under
  "What stays", say so, and keep it on the library.

## Find the library

Read `package.json` and the app's CSS, and pick the first row that matches:

| Library    | Detect                                                                                        | Docs page                                   |
| ---------- | --------------------------------------------------------------------------------------------- | ------------------------------------------- |
| MUI        | `@mui/material`                                                                               | https://nxds.dev/integrations/mui.md        |
| Chakra UI  | `@chakra-ui/react`                                                                            | https://nxds.dev/integrations/chakra.md     |
| Mantine    | `@mantine/core`                                                                               | https://nxds.dev/integrations/mantine.md    |
| Ant Design | `antd`                                                                                        | https://nxds.dev/integrations/ant-design.md |
| Bootstrap  | `bootstrap` or `react-bootstrap`                                                              | https://nxds.dev/integrations/bootstrap.md  |
| shadcn/ui  | `components.json` at the app root                                                             | https://nxds.dev/integrations/shadcn.md     |
| Tailwind   | An `@import` of `tailwindcss` in the app's own CSS, not the nxds entry, and none of the above | https://nxds.dev/integrations/tailwind.md   |

Read that page before you change anything. Its "Where nxds fits" table maps
each library component to its nxds parts.

## Check the setup once

Before the first component, check these against the docs page, and fix what is
missing:

1. The library's CSS sits in a cascade layer below the nxds utilities, if the
   page says it needs one.
2. `app/nxds.css` has no Tailwind Preflight when the library brings its own
   reset.
3. The nxds provider wraps the library's provider, and a component makes the
   library follow the nxds mode. The toggle calls only nxds `setState`.
4. The `--nx-z-index-*` values sit above the library's overlays.

Tell the user which of these you changed.

## Add or swap one component

1. Run `npx nxds-cli@latest view <item> --json` for its files, packages and
   docs URL, then `add` it.
2. Read the installed source under the `nxds.json` `dir` for the real props.
   Don't carry a prop over from the library because the name looks the same.
3. Rewrite only that call site, using the docs page's table and the renames
   below.
4. Run the app's lint and `npx nxds-cli@latest doctor`.
5. Report the props you renamed, and which components stay on the library.

## Renames to watch

nxds handlers take the new value, not an event or a details object:
`onValueChange(value)`, `onCheckedChange(checked)`, `onOpenChange(open)`.

| Library    | Renames                                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MUI        | Button `contained`, `outlined`, `text` → `default`, `outline`, `ghost`. `TextField` → `Field` parts. Dialog `onClose` → `onOpenChange`. `Snackbar` → `toast()`     |
| shadcn/ui  | Badge `destructive` → `error`, `outline` → `fill="outline"`. `Form*` → `Field*`. `Calendar` → `DatePicker`. `Empty*` → `EmptyState*`. Rewrite classes per the page |
| Chakra UI  | Handlers get the value, not `details`. `Field.Root invalid` → `data-invalid` and `aria-invalid`. Select `collection` → `SelectItem` children. No `colorPalette`    |
| Mantine    | `opened` and `onClose` → `open` and `onOpenChange`. Select `data` → `SelectItem` children. `color` → `variant`                                                     |
| Ant Design | Data props (`items`, `options`, `columns`) → one child part per item. Button `type` → `variant`, `danger` → `variant="destructive"`. `Form.Item` → `Field` parts   |
| Bootstrap  | Classes → components. `.is-invalid` → `data-invalid` and `aria-invalid`. No `data-bs-toggle`: a `Trigger` part opens overlays                                      |
| Tailwind   | A class string → `variant` and `size`. Headless UI `onChange` → `onValueChange` or `onCheckedChange`. Drop `dark:` classes on nxds parts                           |
