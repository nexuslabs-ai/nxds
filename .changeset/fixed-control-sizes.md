---
'@nxds/react': patch
'@nxds/vue': patch
---

Switch, Checkbox and Radio keep their size at every density, and follow the UI scale. At the Default scale and the normal stroke, Switch is 20 × 36px with a 16px thumb. The `sm` Switch is 18 × 32px with a 14px thumb. Checkbox and Radio are 16px, with a 14px check and a 10px dot. If they followed the new density scale, they would break. At Tight, the Switch thumb would overflow its track. The default Switch would also be smaller than `sm`. At Tight and Compact, the Checkbox check would go past its border.
