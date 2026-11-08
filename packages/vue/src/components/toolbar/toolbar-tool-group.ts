import { inject, type InjectionKey, type Ref } from 'vue';

/** The state a ToolbarToolGroup shares with its tools and panels. */
export interface ToolbarToolGroupContext {
  value: Readonly<Ref<string>>;
  open: Readonly<Ref<boolean>>;
  panelId: string;
  panels: ReadonlySet<string>;
  activeTool: Readonly<Ref<HTMLElement | null>>;
  setActiveTool: (tool: HTMLElement | null) => void;
  registerPanel: (value: string) => () => void;
  select: (value: string) => void;
  /** Returns true when the panel opened because the user switched to its tool. */
  consumeSwitch: (value: string) => boolean;
  handlePanelClose: () => void;
  isInGroup: (target: Node) => boolean;
  handlePressOutside: () => void;
}

export const ToolbarToolGroupKey: InjectionKey<ToolbarToolGroupContext> =
  Symbol('toolbar-tool-group');

export function injectToolbarToolGroup() {
  const context = inject(ToolbarToolGroupKey, null);
  if (!context)
    throw new Error(
      'ToolbarTool and ToolbarToolPanel must be inside ToolbarToolGroup.'
    );
  return context;
}
