---
'@nxds/core': patch
'@nxds/react': patch
'@nxds/vue': patch
---

Boxes hold their text at every density and UI font size.

- Badge and Kbd use a minimum height instead of a fixed one, so they grow when their text needs more room. Before, at Tight and Compact density with a 15 or 16px UI font, the text was up to 3px taller than the box. At Tight with the default font, a Badge is now 22px, because its 20px line and its border did not fit in 20px.
- Line heights round to even pixels, so a box that grows with its text keeps an even height. At the default 14px UI font, nothing changes.
- Checkbox and Radio take the default icon size (14, 16 or 18px for a 12 to 16px UI font), with the small icon as the check. They still ignore density. Both have an invisible 24 × 24px target.
