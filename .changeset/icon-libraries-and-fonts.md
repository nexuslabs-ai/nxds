---
'@nxds/claude-design': minor
'@nxds/core': minor
'@nxds/react': minor
'@nxds/vue': minor
'nxds-cli': minor
---

Pick the icon library nxds components draw their own icons with, and start from a self-hosted font. Phosphor is the default icon library, in place of Tabler Icons.

| Package                    | Change                                                                                                                                                                                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nxds/core`               | `ICON_LIBRARY_OPTIONS`, `FONT_OPTIONS`, `findFontOption`, `shuffleNxdsAppearance` (pass `fonts` to pick from the fonts your app loads) and `shuffleNxdsIconLibrary`. `NxdsAppearancePrefs` gains `headingFont`, which sets `--nx-typography-family-font-heading`. `null`, the default, follows `uiFont`. |
| `@nxds/react`, `@nxds/vue` | `lib/icons` draws Phosphor. `lib/icon-libraries/` holds the same icons in Lucide, Tabler Icons, HugeIcons and Remix Icon. InputOTP's separator draws the filled circle at `nx:size-1`. `NxdsAppearanceSettings` gains a Heading font field.                                                              |
| `nxds-cli`                 | `init --icons <library>`, `--font <font>`, `--heading-font <font>` and `--code-font <font>`. `nxds.json` records the icon library, and `add` and `update` keep it. Fonts are set up once by `init`. Running `init --icons` again switches every installed `lib/icons.ts`.                                |

To keep Tabler Icons, set `"iconLibrary": "tabler"` in `nxds.json` before you run `update`. After `update`, run `npx nxds-cli@latest init --icons tabler` instead.

`@nxds/claude-design` ships 421 Phosphor icons, with brand logos, in place of 496 Tabler icons. A canvas names an icon as phosphoricons.com does, such as `Nxds.Icon name="magnifying-glass"`. A `-fill` name, such as `check-circle-fill`, draws the filled icon. `Nxds.Icon` takes `weight` in place of `stroke`.
