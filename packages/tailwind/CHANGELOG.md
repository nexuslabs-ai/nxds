# @nxds/tailwind

## 0.2.0

### Minor Changes

- b3d79a5: Add three display text styles for hero and page-section titles: `nx:typography-display-large`, `nx:typography-display-medium` and `nx:typography-display-small`.

  | Style            | Size | Line height | Weight   |
  | ---------------- | ---- | ----------- | -------- |
  | `display-large`  | 5xl  | 5xl         | semibold |
  | `display-medium` | 4xl  | 4xl         | semibold |
  | `display-small`  | 3xl  | 3xl         | semibold |

  Each style uses the heading font, `tighter` letter spacing and `text-wrap: balance`. `cn()` in `@nxds/react` and `@nxds/vue` merges them with the other `typography-*` styles.

## 0.1.0

### Minor Changes

- a4d4a57: White light canvas with calibrated surface support tiers, contrast-responsive dark nav/sidebar surfaces, regenerated Tailwind theme output, and component surface adoption for field-like controls.

  Breaking (`@nexus_ds/react`): the `Form` react-hook-form wrapper is removed and `react-hook-form` is dropped as a peer dependency. Consumers own their react-hook-form binding directly against the library-agnostic `Field` primitive.

- 410076a: Bake the token engine floor into generated Tailwind CSS semantic color fallbacks. Runtime `--nx-color-*` overrides still win, while the committed fallback literals now come from the reviewed engine matrix instead of semantic color JSON.
- 748e08c: Adjudicate semantic color token values for the token engine by aligning runtime producers with the reviewed semantic JSON values for chart series 2, warning fills, default focus, black-brand primary states, and foreground ink tiers. Set the default dark structural contrast to `0` and refresh the reviewed engine snapshot matrix.
