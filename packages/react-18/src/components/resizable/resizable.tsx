import * as React from 'react';
import * as ResizablePrimitive from 'react-resizable-panels';

import { useComposedRefs } from '@radix-ui/react-compose-refs';

import { IconGripVertical } from '../../lib/icons';
import { cn } from '../../lib/utils';

interface ResizablePanelGroupProps extends Omit<
  ResizablePrimitive.GroupProps,
  'orientation' | 'onLayoutChange' | 'onLayoutChanged' | 'defaultLayout'
> {
  /**
   * The axis the panels split along.
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Called with each panel's size, as a percentage, while the layout changes.
   */
  onLayoutChange?: (layout: number[]) => void;
}

/**
 * Holds a set of resizable panels. `orientation` sets the split axis.
 * Install the optional peer dependency `react-resizable-panels` in your app.
 */
function ResizablePanelGroup({
  className,
  orientation = 'horizontal',
  onLayoutChange,
  elementRef,
  ...props
}: ResizablePanelGroupProps) {
  const groupRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(elementRef, groupRef);

  // The layout is keyed by panel id, and object keys don't keep panel order.
  function handleLayoutChange(layout: ResizablePrimitive.Layout) {
    const panels = Array.from(
      groupRef.current?.querySelectorAll(':scope > [data-panel]') ?? []
    );
    onLayoutChange?.(panels.flatMap((panel) => layout[panel.id] ?? []));
  }

  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={className}
      orientation={orientation}
      elementRef={composedRef}
      onLayoutChange={onLayoutChange && handleLayoutChange}
      {...props}
    />
  );
}

interface ResizablePanelProps extends Omit<
  ResizablePrimitive.PanelProps,
  'defaultSize' | 'minSize' | 'maxSize' | 'collapsedSize'
> {
  /**
   * Starting size, in `sizeUnit`.
   */
  defaultSize?: number;
  /**
   * Smallest size, in `sizeUnit`.
   */
  minSize?: number;
  /**
   * Largest size, in `sizeUnit`.
   */
  maxSize?: number;
  /**
   * Size when collapsed, in `sizeUnit`.
   */
  collapsedSize?: number;
  /**
   * Unit for every size prop: a percentage of the group, or pixels.
   */
  sizeUnit?: '%' | 'px';
}

/**
 * One panel inside a `ResizablePanelGroup`.
 */
function ResizablePanel({
  defaultSize,
  minSize = 0,
  maxSize,
  collapsedSize,
  sizeUnit = '%',
  ...props
}: ResizablePanelProps) {
  // react-resizable-panels reads a bare number as pixels, so every size carries its unit.
  const withUnit = (size: number | undefined) =>
    size === undefined ? undefined : `${size}${sizeUnit}`;

  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      defaultSize={withUnit(defaultSize)}
      minSize={withUnit(minSize)}
      maxSize={withUnit(maxSize)}
      collapsedSize={withUnit(collapsedSize)}
      {...props}
    />
  );
}

/**
 * Divider between two panels, resized by drag or keyboard. Give each handle an
 * `aria-label`.
 */
function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  /**
   * Shows a grip in the centre of the handle.
   */
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        'nx:relative nx:flex nx:w-px nx:items-center nx:justify-center nx:bg-border-default nx:icon-stroke',
        'nx:after:absolute nx:after:inset-y-0 nx:after:left-1/2 nx:after:w-1 nx:after:-translate-x-1/2',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        'nx:aria-[orientation=horizontal]:h-px nx:aria-[orientation=horizontal]:w-full nx:aria-[orientation=horizontal]:after:left-0 nx:aria-[orientation=horizontal]:after:h-1 nx:aria-[orientation=horizontal]:after:w-full nx:aria-[orientation=horizontal]:after:translate-x-0 nx:aria-[orientation=horizontal]:after:-translate-y-1/2',
        'nx:aria-[orientation=horizontal]:[&>div]:rotate-90',
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="nx:z-10 nx:flex nx:h-4 nx:w-3 nx:items-center nx:justify-center nx:rounded-sm nx:border-default nx:border-border-default nx:bg-border-default">
          <IconGripVertical className="nx:size-2.5 nx:[--nx-icon-size:var(--nx-spacing-2_5)]" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
