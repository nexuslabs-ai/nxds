---
'@nxds/claude-design': minor
'@nxds/react': minor
'@nxds/react-18': patch
---

`components/bundle.js` drops from 2,433,281 to 1,635,661 bytes. A canvas takes in a script under 2 MB as soon as the system updates. Over 2 MB, the new components showed only after a reload. The build fails past 1,800,000 bytes.

The bundle keeps only Phosphor's regular and fill weights. `Nxds.Icon` loses its `weight` prop. Use a `-fill` name, such as `check-circle-fill`, for a filled icon. A canvas that still sets `weight` draws the regular icon and logs a warning, so remove the attribute.

Data charts list their legend items in `series` order, and PieChart's legend follows its rows. Recharts sorted them alphabetically.

README.md tells Claude to give every artboard a `mode` tweak of light and dark, and to bind the root's and each overlay content part's `data-theme` to it. A function prop takes a handler from the artboard's script, such as `on-value-change="{{setFilters}}"`.

The sampler fits its board at the theme's text size. SETUP.md's `canvas.json` entry is 1525px tall at the default. It grows 50px for each px of text above the default, and shrinks 33px for each px below. Its chart fills its card, Today's toggles sit in its content, and the deals table fits without a sideways scroll up to 20px text.

AspectRatio, Carousel, Combobox, FilterBuilder, FilterCondition, Resizable, ScrollArea, Sonner and Table READMEs show a full canvas example. Each used to show a bare part that rendered nothing, or a note. FilterBuilder shows a JSON mockup and a version bound to the artboard's script state. A static FilterBuilder no longer throws when clicked.
