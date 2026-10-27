import {
  type ComputedRef,
  type HTMLAttributes,
  inject,
  type InjectionKey,
  type Ref,
} from 'vue';

export { default as Command, type CommandProps } from './Command.vue';
export {
  default as CommandDialog,
  type CommandDialogProps,
} from './CommandDialog.vue';
export {
  default as CommandEmpty,
  type CommandEmptyProps,
} from './CommandEmpty.vue';
export { default as CommandGroup } from './CommandGroup.vue';
export { default as CommandInput } from './CommandInput.vue';
export { default as CommandItem } from './CommandItem.vue';
export { default as CommandList } from './CommandList.vue';
export {
  default as CommandLoading,
  type CommandLoadingProps,
} from './CommandLoading.vue';
export { default as CommandSeparator } from './CommandSeparator.vue';
export {
  default as CommandShortcut,
  type CommandShortcutProps,
} from './CommandShortcut.vue';

export interface CommandGroupProps {
  /** Heading shown above the group's items. Screen readers read it as the group's name. */
  heading?: string;
  /** Shows the group whatever the search. */
  forceMount?: boolean;
  class?: HTMLAttributes['class'];
}

export interface CommandInputProps {
  /** The search text. Bind it with `v-model` to read or set the search. */
  modelValue?: string;
  class?: HTMLAttributes['class'];
}

export interface CommandItemProps {
  /** What the search matches and `select` passes. Defaults to the item's text. */
  value?: string;
  /** More words the search matches, such as synonyms. */
  keywords?: string[];
  /** Shows the item dimmed and skips it in keyboard navigation. */
  disabled?: boolean;
  /** Shows the item whatever the search. */
  forceMount?: boolean;
  class?: HTMLAttributes['class'];
}

export interface CommandListProps {
  /** Accessible name for the list. */
  label?: string;
  class?: HTMLAttributes['class'];
}

export interface CommandSeparatorProps {
  /** Keeps the separator while a search is active. */
  alwaysRender?: boolean;
  class?: HTMLAttributes['class'];
}

/** What the search matches an item by. */
export interface CommandItemEntry {
  value: string;
  keywords: string[];
  group: string | undefined;
}

export const CommandKey: InjectionKey<{
  label: Ref<string | undefined>;
  search: Ref<string>;
  inputId: string;
  labelId: string;
  listId: string;
  /** How many items match the search, or every item while nothing filters. */
  count: ComputedRef<number>;
  /** Adds an item to the search and returns a function that removes it. */
  registerItem: (
    id: string,
    entry: ComputedRef<CommandItemEntry>
  ) => () => void;
  isItemShown: (id: string) => boolean;
  isGroupShown: (id: string) => boolean;
}> = Symbol('command');

/** The search state the Command provides to its parts. */
export function injectCommand() {
  const command = inject(CommandKey);
  if (!command) {
    throw new Error('Command parts must be used within a <Command />');
  }
  return command;
}

export const CommandGroupKey: InjectionKey<{
  id: string;
  forceMount: Ref<boolean>;
}> = Symbol('command-group');
