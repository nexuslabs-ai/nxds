import type { InjectionKey, Ref } from 'vue';

/** What `useSidebar` returns: the open state and the helpers that change it. */
export interface SidebarContextValue {
  state: Readonly<Ref<'expanded' | 'collapsed'>>;
  open: Readonly<Ref<boolean>>;
  setOpen: (value: boolean | ((value: boolean) => boolean)) => void;
  openNarrow: Readonly<Ref<boolean>>;
  setOpenNarrow: (open: boolean) => void;
  isNarrow: Readonly<Ref<boolean>>;
  toggleSidebar: () => void;
}

export const SidebarKey: InjectionKey<SidebarContextValue> = Symbol('sidebar');
