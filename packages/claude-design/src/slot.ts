// bundle.js resolves every `@radix-ui/react-slot` import, Radix's own and
// nxds's, to this module. A Design canvas puts each component it mounts inside
// `<div data-dc-tpl style="display: contents">`, so an `asChild` trigger's
// child is that wrapper and not the button. This Slot keeps the wrappers in
// place and slots the element inside them, so the button gets the trigger's
// ref, handlers and state.
import * as React from 'react';

import * as RadixSlot from '@radix-ui/react-slot';

const CANVAS_WRAPPER = 'data-dc-tpl';

type WrapperProps = { children?: React.ReactNode };

function isCanvasWrapper(
  node: React.ReactNode
): node is React.ReactElement<WrapperProps> {
  if (!React.isValidElement<WrapperProps>(node)) return false;
  if (typeof node.type !== 'string' || !(CANVAS_WRAPPER in node.props)) {
    return false;
  }
  const child = node.props.children;
  return React.isValidElement(child) && child.type !== React.Fragment;
}

// `render` applied to the element inside every canvas wrapper around `children`.
function inWrappers(
  children: React.ReactNode,
  render: (child: React.ReactNode) => React.ReactElement
): React.ReactElement {
  if (!isCanvasWrapper(children)) return render(children);
  return React.cloneElement(
    children,
    undefined,
    inWrappers(children.props.children, render)
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
