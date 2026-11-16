---
'nxds-cli': minor
---

Add `init --own-colors`, for an app that sets every color itself.

- It writes `nxds-colors.css` beside the nxds CSS entry, with every nxds color in light and dark at the value your theme gives it, and imports it from the entry. The file is yours from then on: a later `init` or `update` leaves it alone.
- It turns color derivation off: `deriveColors={false}` on `NxdsAppearanceProvider` and `NxdsAppearanceScript`, and `{ deriveColors: false }` in a Vite app's `nxds.vite.ts`. It edits an app that is already set up, and lists a step for anything it cannot find, such as a provider in a file of its own.
- `doctor` gains a `colors` check. It fails when the entry imports `nxds-colors.css` and the provider or the theme script still derives colors, which would override yours.
- A release from before own colors refuses the flag and names `update`.
