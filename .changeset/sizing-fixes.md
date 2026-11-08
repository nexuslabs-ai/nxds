---
'@nxds/core': minor
'@nxds/tailwind': minor
'@nxds/react': minor
'@nxds/vue': minor
---

Controls hold their parts at every stroke and density.

- The Switch thumb and the Checkbox check stay inside the border at every stroke. At the strong stroke, they are smaller by the extra border width.
- Checkbox and RadioGroup have a 24 × 24px target around the 16px box. The Switch has a 24px-high target across its track. To give your own small control the same target, add `nx:target-24` and `nx:relative`.
- Badge, Kbd, SidebarMenuBadge and the InputGroup `xs` button grow with their text, so the text stays inside the border at a large UI font size.
- In menus, the text of a check item, an inset item and an inset label starts 8px after the 16px check at every density.
- The NxdsAppearanceColorField hex input and the NxdsAppearanceSettings font inputs show their text in the code font.
