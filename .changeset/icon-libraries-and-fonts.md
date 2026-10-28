---
'@nxds/claude-design': minor
'@nxds/core': minor
'@nxds/react': minor
'@nxds/vue': minor
'nxds-cli': minor
---

Pick the icon library nxds components draw their own icons with, and start from a self-hosted font. Phosphor is the default icon library, in place of Tabler Icons.

| Package                    | Change                                                                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nxds/core`               | `ICON_LIBRARY_OPTIONS`, `FONT_OPTIONS`, `findFontOption` and `shuffleNxdsAppearance`. `NxdsAppearancePrefs` gains `headingFont`, which sets `--nx-typography-family-font-heading`. `null`, the default, follows `uiFont`.                   |
| `@nxds/react`, `@nxds/vue` | `lib/icons` draws Phosphor. `lib/icon-libraries/` holds the same icons in Lucide, Tabler Icons, HugeIcons and Remix Icon. InputOTP's separator draws the filled circle at `nx:size-1`. `NxdsAppearanceSettings` gains a Heading font field. |
| `nxds-cli`                 | `init --icons <library>`, `--font <font>` and `--heading-font <font>`. `nxds.json` records them, and `add` and `update` keep them. Running `init --icons` again switches every installed `lib/icons.ts`.                                    |

To keep Tabler Icons, set `"iconLibrary": "tabler"` in `nxds.json` before you run `update`. After `update`, run `npx nxds-cli@latest init --icons tabler` instead.

`@nxds/claude-design` gives Claude Design Phosphor icons as `Nxds.Icons`, such as `Nxds.Icons.PlusIcon`, in place of Tabler's `Nxds.Icons.IconPlus`. Pass `weight="fill"` for a filled icon.
