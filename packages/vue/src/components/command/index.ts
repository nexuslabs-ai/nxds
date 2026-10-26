import { type ComputedRef, inject, type InjectionKey, type Ref } from 'vue';

export { default as Command, type CommandProps } from './Command.vue';
export {
  default as CommandDialog,
  type CommandDialogProps,
} from './CommandDialog.vue';
export {
  default as CommandEmpty,
  type CommandEmptyProps,
} from './CommandEmpty.vue';
export {
  default as CommandGroup,
  type CommandGroupProps,
} from './CommandGroup.vue';
export {
  default as CommandInput,
  type CommandInputProps,
} from './CommandInput.vue';
export {
  default as CommandItem,
  type CommandItemProps,
} from './CommandItem.vue';
export {
  default as CommandList,
  type CommandListProps,
} from './CommandList.vue';
export {
  default as CommandLoading,
  type CommandLoadingProps,
} from './CommandLoading.vue';
export {
  default as CommandSeparator,
  type CommandSeparatorProps,
} from './CommandSeparator.vue';
export {
  default as CommandShortcut,
  type CommandShortcutProps,
} from './CommandShortcut.vue';

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
  forceMount: boolean;
}> = Symbol('command-group');
