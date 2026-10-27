'use client';

import * as React from 'react';

import { useComposedRefs } from '@radix-ui/react-compose-refs';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { buttonVariants } from '../button/button';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  type PopoverContentProps,
} from '../popover/popover';
import { TooltipProvider } from '../tooltip/tooltip';
import { TooltipGroupContext } from '../tooltip/tooltip-group';

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

type ToolbarVariant = 'default' | 'floating';

const toolbarVariants = cva(
  'nx:group/toolbar nx:flex nx:w-fit nx:max-w-full nx:min-w-0 nx:flex-wrap nx:items-center nx:border-default nx:border-border-default nx:bg-container nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
  {
    variants: {
      variant: {
        default: 'nx:gap-0.5 nx:rounded-lg nx:p-0.5 nx:shadow-sm',
        floating: 'nx:gap-2 nx:rounded-2xl nx:p-2 nx:shadow-lg',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

const toolbarGroupLayout =
  'nx:flex nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-[inherit] nx:group-data-[orientation=vertical]/toolbar:flex-col nx:group-data-[orientation=vertical]/toolbar:items-stretch';

interface ToolbarProps extends React.ComponentProps<
  typeof ToolbarPrimitive.Root
> {
  /** Floating lifts the toolbar above the content it sits over, like a canvas. */
  variant?: ToolbarVariant;
}

/**
 * Label the toolbar with aria-label or aria-labelledby. Controls wrap in DOM
 * order. Its tooltips form one group, so moving across the buttons skips the
 * open delay. Inside a `TooltipProvider` it joins that group instead.
 */
const Toolbar = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ToolbarProps>
>(function Toolbar(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'default',
    ...props
  }: React.PropsWithoutRef<ToolbarProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const inGroup = React.useContext(TooltipGroupContext);
  const root = (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      data-variant={variant}
      className={cn(toolbarVariants({ variant }), className)}
      {...props}
    />
  );
  if (inGroup) return root;

  return <TooltipProvider>{root}</TooltipProvider>;
});

type ToolbarButtonProps = React.ComponentProps<typeof ToolbarPrimitive.Button> &
  VariantProps<typeof buttonVariants>;

const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<ToolbarButtonProps>
>(function ToolbarButton(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'ghost',
    size = 'sm',
    ...props
  }: React.PropsWithoutRef<ToolbarButtonProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});

type ToolbarLinkProps = React.ComponentProps<typeof ToolbarPrimitive.Link> &
  VariantProps<typeof buttonVariants>;

const ToolbarLink = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithoutRef<ToolbarLinkProps>
>(function ToolbarLink(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'ghost',
    size = 'sm',
    ...props
  }: React.PropsWithoutRef<ToolbarLinkProps> & {
    ref?: React.ForwardedRef<HTMLAnchorElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});

const ToolbarGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function ToolbarGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      role="group"
      data-slot="toolbar-group"
      className={cn(toolbarGroupLayout, className)}
      {...props}
    />
  );
});

type ToolbarToggleGroupProps = React.ComponentProps<
  typeof ToolbarPrimitive.ToggleGroup
>;

const ToolbarToggleGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ToolbarToggleGroupProps>
>(function ToolbarToggleGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ToolbarToggleGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ToolbarPrimitive.ToggleGroup
      data-slot="toolbar-toggle-group"
      role={props.type === 'single' ? 'radiogroup' : 'group'}
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-[inherit] nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
        className
      )}
      {...props}
    />
  );
});

type ToolbarToggleItemProps = React.ComponentProps<
  typeof ToolbarPrimitive.ToggleItem
> &
  Pick<VariantProps<typeof buttonVariants>, 'size'>;

const ToolbarToggleItem = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<ToolbarToggleItemProps>
>(function ToolbarToggleItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    size = 'sm',
    ...props
  }: React.PropsWithoutRef<ToolbarToggleItemProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ToolbarPrimitive.ToggleItem
      data-slot="toolbar-toggle-item"
      data-size={size}
      className={cn(
        buttonVariants({ variant: 'ghost', size }),
        'nx:data-[state=on]:bg-primary-subtle nx:data-[state=on]:text-primary-subtle-foreground nx:data-[state=on]:hover:bg-primary-subtle-hover nx:data-[state=on]:active:bg-primary-subtle-active',
        className
      )}
      {...props}
    />
  );
});

type ToolbarToolGroupContextValue = {
  value: string;
  open: boolean;
  panelId: string;
  panels: ReadonlySet<string>;
  activeTool: HTMLButtonElement | null;
  setActiveTool: (tool: HTMLButtonElement | null) => void;
  registerPanel: (value: string) => () => void;
  select: (value: string) => void;
  /** Returns true when focus should stay on the tool that was just chosen. */
  handlePanelOpen: () => boolean;
  handlePanelClose: () => void;
  isInGroup: (target: Node) => boolean;
  handlePressOutside: () => void;
};

const ToolbarToolGroupContext =
  React.createContext<ToolbarToolGroupContextValue | null>(null);

function useToolbarToolGroup() {
  const context = React.useContext(ToolbarToolGroupContext);
  if (!context)
    throw new Error(
      'ToolbarTool and ToolbarToolPanel must be inside ToolbarToolGroup.'
    );
  return context;
}

interface ToolbarToolGroupProps extends Omit<
  React.ComponentProps<'div'>,
  'defaultValue'
> {
  /** The selected tool. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Whether the selected tool's panel is open. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * One selected tool at a time. Selecting a tool opens its ToolbarToolPanel.
 * Selecting it again closes it. Label the group with aria-label.
 */
const ToolbarToolGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ToolbarToolGroupProps>
>(function ToolbarToolGroup(propsWithoutRef, forwardedRef) {
  const {
    value: valueProp,
    defaultValue = '',
    onValueChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    className,
    children,
    ref,
    ...props
  }: React.PropsWithoutRef<ToolbarToolGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const group = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, group);
  const activeToolRef = React.useRef<HTMLButtonElement | null>(null);
  const switching = React.useRef(false);
  const restoreFocus = React.useRef(true);
  const panelId = React.useId();
  const [localValue, setLocalValue] = React.useState(defaultValue);
  const [localOpen, setLocalOpen] = React.useState(defaultOpen);
  const [panels, setPanels] = React.useState<ReadonlySet<string>>(
    () => new Set()
  );
  const [activeTool, setActiveToolState] =
    React.useState<HTMLButtonElement | null>(null);
  const value = valueProp ?? localValue;
  const open =
    (openProp ?? localOpen) && panels.has(value) && activeTool !== null;

  const setActiveTool = React.useCallback((tool: HTMLButtonElement | null) => {
    activeToolRef.current = tool;
    setActiveToolState(tool);
  }, []);

  const registerPanel = React.useCallback((panel: string) => {
    setPanels((current) => new Set(current).add(panel));
    return () =>
      setPanels((current) => {
        const next = new Set(current);
        next.delete(panel);
        return next;
      });
  }, []);

  function setOpen(next: boolean) {
    if (openProp === undefined) setLocalOpen(next);
    onOpenChange?.(next);
  }

  function select(next: string) {
    const nextOpen = panels.has(next) && (next !== value || !open);
    switching.current = open && nextOpen;
    if (next !== value) {
      if (valueProp === undefined) setLocalValue(next);
      onValueChange?.(next);
    }
    if (nextOpen !== open) setOpen(nextOpen);
  }

  function handlePanelOpen() {
    restoreFocus.current = true;
    const keepFocusOnTool = switching.current;
    switching.current = false;
    return keepFocusOnTool;
  }

  function handlePanelClose() {
    const tool = activeToolRef.current;
    if (!restoreFocus.current || !tool) return;
    // Focus falls to the body only when it was inside the closed panel.
    if (tool.ownerDocument.activeElement !== tool.ownerDocument.body) return;
    tool.focus({ preventScroll: true });
  }

  function isInGroup(target: Node) {
    return group.current?.contains(target) ?? false;
  }

  function handlePressOutside() {
    restoreFocus.current = false;
  }

  const context = {
    value,
    open,
    panelId,
    panels,
    activeTool,
    setActiveTool,
    registerPanel,
    select,
    handlePanelOpen,
    handlePanelClose,
    isInGroup,
    handlePressOutside,
  };

  return (
    <ToolbarToolGroupContext.Provider value={context}>
      <Popover open={open} onOpenChange={setOpen}>
        <div
          role="group"
          data-slot="toolbar-tool-group"
          ref={composedRef}
          className={cn(toolbarGroupLayout, className)}
          {...props}
        >
          {children}
        </div>
        <PopoverAnchor
          virtualRef={activeToolRef as React.RefObject<HTMLButtonElement>}
        />
      </Popover>
    </ToolbarToolGroupContext.Provider>
  );
});

type ToolbarToolProps = Omit<
  React.ComponentProps<typeof ToolbarPrimitive.Button>,
  'value'
> &
  Pick<VariantProps<typeof buttonVariants>, 'size'> & {
    /** Matches the tool's ToolbarToolPanel, if it has one. */
    value: string;
  };

/** A pressable tool. It reports whether its panel is open. */
const ToolbarTool = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<ToolbarToolProps>
>(function ToolbarTool(propsWithoutRef, forwardedRef) {
  const {
    value,
    size = 'sm',
    className,
    onClick,
    ref,
    ...props
  }: React.PropsWithoutRef<ToolbarToolProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  const tools = useToolbarToolGroup();
  const button = React.useRef<HTMLButtonElement>(null);
  const composedRef = useComposedRefs(ref, button);
  const id = React.useId();
  const selected = value === tools.value;
  const hasPanel = tools.panels.has(value);
  const expanded = selected && tools.open;
  const { setActiveTool } = tools;

  useIsomorphicLayoutEffect(() => {
    if (!selected) return;
    setActiveTool(button.current);
    return () => setActiveTool(null);
  }, [selected, setActiveTool]);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) tools.select(value);
  }

  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-tool"
      data-size={size}
      id={id}
      className={cn(
        buttonVariants({ variant: 'ghost', size }),
        'nx:data-[state=on]:bg-primary-background nx:data-[state=on]:text-primary-foreground nx:data-[state=on]:hover:bg-primary-background-hover nx:data-[state=on]:active:bg-primary-background-active',
        className
      )}
      {...props}
      ref={composedRef}
      data-state={selected ? 'on' : 'off'}
      aria-pressed={selected}
      aria-haspopup={hasPanel ? 'dialog' : undefined}
      aria-expanded={hasPanel ? expanded : undefined}
      aria-controls={expanded ? tools.panelId : props['aria-controls']}
      onClick={handleClick}
    />
  );
});

interface ToolbarToolPanelProps extends PopoverContentProps {
  /** The ToolbarTool this panel belongs to. */
  value: string;
}

/**
 * Controls for one tool, shown while that tool is selected and open. Named by
 * its tool unless it gets its own aria-label. Escape returns focus to the tool.
 */
const ToolbarToolPanel = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ToolbarToolPanelProps>
>(function ToolbarToolPanel(propsWithoutRef, forwardedRef) {
  const {
    value,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onInteractOutside,
    ...props
  }: React.PropsWithoutRef<ToolbarToolPanelProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const tools = useToolbarToolGroup();
  const { registerPanel } = tools;

  useIsomorphicLayoutEffect(() => registerPanel(value), [registerPanel, value]);

  if (value !== tools.value) return null;

  function handleOpenAutoFocus(event: Event) {
    onOpenAutoFocus?.(event);
    // Switching tools keeps focus on the tool that was just chosen.
    if (tools.handlePanelOpen()) event.preventDefault();
  }

  function handleCloseAutoFocus(event: Event) {
    onCloseAutoFocus?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    tools.handlePanelClose();
  }

  const handleInteractOutside: NonNullable<
    ToolbarToolPanelProps['onInteractOutside']
  > = (event) => {
    onInteractOutside?.(event);
    if (event.defaultPrevented) return;
    // Tools handle their own clicks, so the panel can stay open while switching.
    if (tools.isInGroup(event.target as Node)) event.preventDefault();
    else tools.handlePressOutside();
  };

  return (
    <PopoverContent
      data-slot="toolbar-tool-panel"
      id={tools.panelId}
      aria-labelledby={props['aria-label'] ? undefined : tools.activeTool?.id}
      onOpenAutoFocus={handleOpenAutoFocus}
      onCloseAutoFocus={handleCloseAutoFocus}
      onInteractOutside={handleInteractOutside}
      {...props}
    />
  );
});

const ToolbarSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<typeof ToolbarPrimitive.Separator>>
>(function ToolbarSeparator(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<
    React.ComponentProps<typeof ToolbarPrimitive.Separator>
  > & { ref?: React.ForwardedRef<HTMLDivElement> } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        'nx:shrink-0 nx:bg-border-default nx:data-[orientation=vertical]:my-1.5 nx:data-[orientation=vertical]:w-px nx:data-[orientation=vertical]:self-stretch nx:data-[orientation=horizontal]:h-px nx:data-[orientation=horizontal]:w-full',
        className
      )}
      {...props}
    />
  );
});

export {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarTool,
  ToolbarToolGroup,
  ToolbarToolPanel,
};
export type {
  ToolbarButtonProps,
  ToolbarLinkProps,
  ToolbarProps,
  ToolbarToggleGroupProps,
  ToolbarToggleItemProps,
  ToolbarToolGroupProps,
  ToolbarToolPanelProps,
  ToolbarToolProps,
};
