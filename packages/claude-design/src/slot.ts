// bundle.js resolves every `@radix-ui/react-slot` import, Radix's own and
// nxds's, to this module. A Design canvas puts each component it mounts inside
// `<div class="sc-host-x" style="display: contents">`, so an `asChild`
// trigger's child is that wrapper and not the button. This Slot keeps the
// wrappers in place and slots the element inside them, so the button gets the
// trigger's ref, handlers and state.
import * as React from 'react';

import * as RadixSlot from '@radix-ui/react-slot';

import { CANVAS_WRAPPER_CLASS } from './canvas-wrapper.ts';

type WrapperProps = { className?: unknown; children?: React.ReactNode };

// A canvas passes x-import content as an array, even for one child, and keeps
// the indentation between tags as strings.
function withoutIndentation(children: React.ReactNode): React.ReactNode {
  if (!Array.isArray(children)) return children;
  const content = children.filter(
    (child) => typeof child !== 'string' || child.trim() !== ''
  );
  return content.length === 1 ? content[0] : content;
}

function isCanvasWrapper(
  node: React.ReactNode
): node is React.ReactElement<WrapperProps> {
  if (!React.isValidElement<WrapperProps>(node)) return false;
  const { className, children } = node.props;
  if (typeof node.type !== 'string' || typeof className !== 'string') {
    return false;
  }
  if (!className.split(/\s+/).includes(CANVAS_WRAPPER_CLASS)) return false;
  const child = withoutIndentation(children);
  return React.isValidElement(child) && child.type !== React.Fragment;
}

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
