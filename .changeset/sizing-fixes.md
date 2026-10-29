---
'@nxds/core': patch
'@nxds/tailwind': patch
'@nxds/react': patch
'@nxds/vue': patch
---

Controls hold their parts at every stroke and density.

- The Switch thumb and the Checkbox check stay inside the border at every stroke. At the strong stroke, they are smaller by the extra border width.
- Checkbox and Radio have a 24 × 24px target around the 16px box.
- Badge, Kbd and the InputGroup `xs` button grow with their text, so the text stays inside the border at a large UI font size.
- In menus, the text of a check item, an inset item and an inset label starts 8px after the 16px check at every density.
- Code text has its own size token, `--nx-typography-size-code`. The code font size setting writes it, and `typography-code-block` and `typography-code-inline` read it. Text that has only `font-mono` keeps the size of its own text style.
