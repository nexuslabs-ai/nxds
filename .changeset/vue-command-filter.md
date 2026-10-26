---
'@nxds/vue': minor
---

Add command and filter components that match their React counterparts.

| Component       | Parts                                                                                                                                                             | Notes                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Command         | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandLoading`, `CommandGroup`, `CommandSeparator`, `CommandItem`, `CommandShortcut` | Bind the search with `v-model` on `CommandInput`. `select` passes the item's value        |
| Combobox        | `Combobox`, `ComboboxTrigger`, `ComboboxContent`, `ComboboxInput`, `ComboboxList`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxSeparator`, `ComboboxItem`          | Binds the open state with `v-model:open`                                                  |
| MultiSelect     | `MultiSelect`, `MultiSelectTrigger`, `MultiSelectValue`, `MultiSelectContent`, `MultiSelectItem`, `MultiSelectGroup`, `MultiSelectSeparator`                      | Emits `values-change` with the selected values                                            |
| FilterChip      | `FilterChip`                                                                                                                                                      |                                                                                           |
| FilterCondition | `FilterCondition`, `FilterConditionField`, `FilterConditionSegment`, `FilterConditionRemove`                                                                      |                                                                                           |
| FilterBuilder   | `FilterBuilder`                                                                                                                                                   | Emits `value-change` with the new tree. `getFilterErrors` validates it                    |
| DatePicker      | `DatePicker`, `DatePickerDayButton`                                                                                                                               | Set `mode` to `single`, `multiple` or `range`. Dates are `@internationalized/date` values |
