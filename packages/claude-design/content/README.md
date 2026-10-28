nxds is a calm, dense product UI system: neutral surfaces, one brand colour, and state carried by tokens rather than decoration. Build every screen from the `Nxds` components and the tokens below.

## Content fundamentals

- Write in plain, direct sentences. Address the reader as "you".
- Use sentence case for every label, title, button and menu item: "Save changes", not "Save Changes".
- Name the action on a button with a verb: "Create project", "Delete", "Invite people".
- Keep labels short. Put explanation in a description or helper text, never in the label.
- Write errors as what happened and what to do: "Enter an email address."
- No emoji in product copy, and no exclamation marks.

## Colour

nxds is neutral-first. Surfaces are near-white in Light and near-black in Dark. Colour marks meaning, not decoration.

| Surface               | Fill                      | Text on it                      |
| --------------------- | ------------------------- | ------------------------------- |
| Page                  | `nx-color-background`     | `nx-color-foreground`           |
| Card, panel           | `nx-color-container`      | `nx-color-container-foreground` |
| Menu, popover, dialog | `nx-color-popover`        | `nx-color-popover-foreground`   |
| Sidebar               | `nx-color-nav-background` | `nx-color-nav-foreground`       |
| Quiet well            | `nx-color-muted`          | `nx-color-muted-foreground`     |

- Use `nx-color-primary-background` with `nx-color-primary-foreground` for the one main action in a view. Use `secondary` for the actions beside it.
- Show state with its family: `success`, `warning`, `error` and `information`. Use the solid `-background` fill for strong emphasis, and `-subtle` with `-subtle-foreground` for alerts, badges and banners.
- Pair every fill with the foreground its usage note names. Don't put `nx-color-muted-foreground` on a coloured fill.
- Hover and press use their own tokens, such as `nx-color-background-hover` and `nx-color-background-active`. Never fade a colour with opacity.
- Separate regions with `nx-color-border-default`. Use `nx-color-border-hairline` between rows.
- Show focus with `nx-color-focus-default`, and `nx-color-focus-error` on an invalid control.
- Plot chart series with `nx-color-chart-categorical-1` to `nx-color-chart-categorical-5`, in order.

Status is never colour alone. Every alert, badge and toast carries a word or an icon too.

## Type

nxds sets text in the system UI face and code in the system monospace face.

| Use                         | Style                                             |
| --------------------------- | ------------------------------------------------- |
| Page title                  | `typography-heading-large`                        |
| Section title               | `typography-heading-medium`                       |
| Card title                  | `typography-heading-small`                        |
| Body copy                   | `typography-body-default`                         |
| Secondary copy, table cells | `typography-body-small`                           |
| Form labels                 | `typography-label-default`                        |
| Overlines, small caps       | `typography-label-caps`                           |
| Code                        | `typography-code-block`, `typography-code-inline` |

Body copy is 14px. Keep one heading level per region, and step down one size at a time.

## Spacing and layout

- Space with the 4px scale: `nx-spacing-1` is 4px, `nx-spacing-2` 8px, `nx-spacing-4` 16px, `nx-spacing-6` 24px.
- Pad cards and panels with `nx-container-p`. Gap their contents with `nx-container-gap`.
- Separate page sections with `nx-layout-section-gap`, and stack form rows with `nx-layout-stack-gap`.
- Lay out screens with flex or grid gaps from the scale. Don't hard-code pixel values.

## Shape and elevation

- Round controls, inputs and cards with `nx-radius-md`. Buttons use `nx-radius-base`. Pills and avatars use `nx-radius-full`.
- Draw every border at `nx-borderwidth-default`, and a selected or focused edge at `nx-borderwidth-thick`.
- Prefer borders to shadows. Cards sit at `nx-shadow-sm`. Popovers, menus, dialogs and sheets lift with `nx-shadow-lg` on a frosted `nx-color-popover-alpha` surface. Flat content takes no shadow.
- Stack layers with the z-index tokens: `nx-z-index-sticky`, `nx-z-index-modal`, `nx-z-index-popover`, `nx-z-index-toast`.

## Motion

Motion answers input and then gets out of the way. Popovers, menus and routine state changes take `nx-motion-duration-default` (200ms), small fades and indicators `nx-motion-duration-fast` (150ms), and pressed states `nx-motion-duration-faster` (100ms). Elements ease in on `nx-motion-ease-enter`. Nothing bounces.

## Iconography

- nxds uses Tabler icons, outline style, at 16px beside text. They are `Nxds.Icons.IconName`, such as `Nxds.Icons.IconPlus`.
- An icon takes the colour of its text. Don't tint icons on their own.
- An icon-only button needs an `aria-label`.
- No emoji as icons.

## Using the components

- Mount components from `Nxds`, such as `Nxds.Button` and `Nxds.DialogContent`. Each component's card lists its parts and props.
- Compose a component from its parts, as its README shows: `Nxds.Card` holds `Nxds.CardHeader`, `Nxds.CardTitle` and `Nxds.CardContent`.
- Overlays (`Dialog`, `Popover`, `DropdownMenu`, `Select`, `Tooltip`) open from a trigger part, such as `Nxds.DialogTrigger`.
- Wrap a sidebar layout in `Nxds.SidebarProvider`, and mount `Nxds.Toaster` once to show toasts.
- Draw charts with `Nxds.ChartContainer` around `Nxds.Recharts` parts.

## Themes

The system has a Light and a Dark theme. Set `data-theme="dark"` on `<html>` to switch, or add the `dark` class the way nxds apps do. Both switch every token and component.

## Appearance

This system shows the default nxds appearance: a near-black brand colour on zinc surfaces, default density, subtle corners, quiet shadows and normal strokes.

Set an attribute on any element to change density, corners, elevation or stroke for everything inside it:

<!-- appearance-presets -->

Brand colour, surface tone and contrast are app-wide settings in nxds apps. They have no attribute.

## On a Design canvas

Install these files with the system under `project/ds/<folder>/`. Link them in each artboard right after the `support.js` line, in this order:

1. `tokens.css`: every token value, both themes and the text style classes. The components read their variables from it.
2. `components/bundle.css`: the component styles and the appearance presets. It sets a token only inside a preset attribute.
3. `components/bundle.js`: the components, as `window.Nxds`. The artboard supplies React 18, so skip `react` and `react-dom`.

```html
<link rel="stylesheet" href="ds/<folder>/tokens.css" />
<link rel="stylesheet" href="ds/<folder>/components/bundle.css" />
<script src="ds/<folder>/components/bundle.js"></script>
```

Add one `../` in front of each path for each folder the artboard is in.

The System page is read-only for this system. An edit there recompiles tokens.css without the theme layer, the font variables and the text style rules, so presets, fonts and text styles stop applying. Change the token in nxds and export again.

- Switch to dark with `data-theme="dark"` or the `dark` class on the artboard's root.
- Set a `data-density`, `data-radius`, `data-borderwidth` or `data-shadow` attribute from Appearance on any element to change everything inside it.
- Override a token by setting its variable on an element, such as `style="--nx-radius-md: 8px"`. Components inside that element follow.
- Read `components/<Name>/README.md` before you mount a component. It lists the component's parts and props.

## Canvas rules

- Mount a component with `<x-import component-from-global-scope="Nxds.Button">`. Attributes set props, kebab-case to camelCase, and element content becomes `children`.
- An attribute holds text only. A prop that takes an element, a function or an object has no attribute.
- Lay out artboards with the spacing tokens, not raw pixel values.
- Mount each part as its own `x-import`, the way a component's README shows. The canvas puts each one in a wrapper, and the parts keep their layout, borders and icon sizes through it. An `as-child` trigger opens its overlay from the element inside the wrapper.
- Style a component through its props, not with a `style` on its `x-import`. A styled `x-import` turns the canvas's wrapper into a box that sits between the parts.
- A Carousel can't scroll on a canvas. It measures its slides, and the wrapper around each `Nxds.CarouselItem` has no size.
- Give a `Nxds.DialogContent` either a `title` or a `Nxds.DialogHeader`, not both. With both, the dialog shows two headers.
