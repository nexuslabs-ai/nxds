---
'@nxds/claude-design': minor
'@nxds/core': minor
'@nxds/react': minor
'@nxds/vue': minor
'nxds-cli': minor
---

Set up a whole theme in one step: brand color, surface tone, tokens, mode, contrast, self-hosted fonts and the icon library nxds components draw their own icons with. Phosphor is the default icon library, in place of Tabler Icons.

| Package                    | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nxds/core`               | `ICON_LIBRARY_OPTIONS`, `FONT_OPTIONS`, `shuffleNxdsAppearance` (pass `fonts` to pick from the fonts your app loads) and `shuffleNxdsIconLibrary`. `NxdsAppearancePrefs` gains `headingFont`, which sets `--nx-typography-family-font-heading`. `null`, the default, follows `uiFont`. `NXDS_THEME_FIELDS` lists each theme part as its `init` flag, and `nxdsThemeFlags` and `applyNxdsThemeFlags` turn a theme into flags and back.                                                         |
| `@nxds/react`, `@nxds/vue` | `lib/icons` draws Phosphor. `lib/icon-libraries/` holds the same icons in Lucide, Tabler Icons, HugeIcons and Remix Icon. InputOTP's separator draws the filled circle at `nx:size-1`. `NxdsAppearanceSettings` gains a Heading font field.                                                                                                                                                                                                                                                   |
| `nxds-cli`                 | `init` takes a flag for each theme part, such as `--brand-color`, `--density`, `--font` and `--icons`. It writes `nxds-theme.ts`, which `appearance-state.ts` spreads, and records the theme in `nxds.json`. A flag left out keeps its value, and an empty one, such as `--density=`, resets it. A new font replaces the old one's import, and `doctor` lists the old package. Running `init --icons` again switches every installed `lib/icons.ts`, and `add` and `update` keep the library. |

To keep Tabler Icons, set `"iconLibrary": "tabler"` in `nxds.json` before you run `update`. After `update`, run `npx nxds-cli@latest init --icons tabler` instead.

`@nxds/claude-design` ships 421 Phosphor icons, with brand logos, in place of 496 Tabler icons. A canvas names an icon as phosphoricons.com does, such as `Nxds.Icon name="magnifying-glass"`. A `-fill` name, such as `check-circle-fill`, draws the filled icon. `Nxds.Icon` takes `weight` in place of `stroke`.
