---
'@nxds/react': patch
'@nxds/vue': patch
---

Switch, Checkbox and Radio keep their size at every density. Switch is 20 × 36px with a 16px thumb, and `sm` stays 18 × 32px with a 14px thumb. Checkbox and Radio are 16px with a 14px check and a 10px dot. Before, they followed density, so at Tight the Switch thumb was taller than its track and the default Switch was smaller than `sm`, and at Tight and Compact the check mark went past the Checkbox border.
