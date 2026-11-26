---
'@nxds/react': patch
---

A control that shows its value now holds that text in its accessible name. Speech input finds the control by what it shows, and axe's `label-content-name-mismatch` rule passes.

- DatePicker names a day with a plain number, such as "Tuesday, January 7, 2025", in place of "7th". With `renderDayContent`, the name is the date and then the content.
- MultiSelectTrigger with an `aria-label` is named by that label and then the values it shows.
- FilterChip's `aria-label` ends with the chip's text, such as "Remove filter: Status: Active".
- The filter blocks name an operator trigger with its operator, such as "Change Created operator: is between". FilterBuilder names its values button with the values it shows.
