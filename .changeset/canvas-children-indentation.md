---
'@nxds/claude-design': patch
---

Components read their content on a Design canvas the way they do in an app.

- An `as-child` Button slots its one element, so `<a>` inside it renders as a link styled as a button, not a button around a link.
- AvatarGroup's `max` counts avatars, not the indentation between them.
- Searching a MultiSelect, Combobox or Command list filters its items by their text, and no longer throws.
- The FilterBuilder and Sidebar READMEs say what each needs, in place of an example that throws.
