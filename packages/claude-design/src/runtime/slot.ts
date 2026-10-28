// bundle.js resolves every `@radix-ui/react-slot` import, Radix's own and
// nxds's, to this module. A Design canvas puts each component it mounts inside
// `<div class="sc-host-x" style="display: contents">`, so an `asChild`
// trigger's child is that wrapper and not the button. This Slot keeps the
// wrappers in place and slots the element inside them, so the button gets the
// trigger's ref, handlers and state.
import * as React from 'react';

import * as RadixSlot from '@radix-ui/react-slot';

import { isCanvasWrapper, withoutIndentation } from './canvas-wrapper.ts';

// `render` applied to the element inside every canvas wrapper around `children`.
function inWrappers(
  children: React.ReactNode,
  render: (child: React.ReactNode) => React.ReactElement
): React.ReactElement {
  const child = withoutIndentation(children);
  if (!isCanvasWrapper(child)) return render(child);
  return React.cloneElement(
    child,
    undefined,
    inWrappers(child.props.children, render)
  );
}

export function createSlot(ownerName: string) {
  const Base = RadixSlot.createSlot(ownerName);
  const Slot = React.forwardRef<HTMLElement, RadixSlot.SlotProps>(function Slot(
    { children, ...props },
    ref
  ) {
    return inWrappers(children, (child) =>
      React.createElement(Base, { ...props, ref }, child)
    );
  });
  Slot.displayName = `${ownerName}.Slot`;
  return Slot;
}

export const Slot = createSlot('Slot');
export { Slot as Root };

export {
  createSlottable,
  type SlotProps,
  Slottable,
} from '@radix-ui/react-slot';
