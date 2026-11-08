import * as React from 'react';

import { CANVAS_WRAPPER_CLASS } from './canvas-names.ts';

type WrapperProps = { className?: unknown; children?: React.ReactNode };

// JSX's rule for text: whitespace that touches a line break goes, and the
// lines left join with a space. Text that is all indentation becomes "". A
// space between two elements on one line stays.
function jsxText(text: string) {
  const lines = text.split(/\r\n|\n|\r/);
  if (lines.length === 1) return text;
  return lines
    .map((line, index) => {
      const start = index === 0 ? line : line.replace(/^[ \t]+/, '');
      return index === lines.length - 1 ? start : start.replace(/[ \t]+$/, '');
    })
    .filter((line) => line !== '')
    .join(' ');
}

/** x-import content as JSX reads it: a canvas passes it as an array, even for one child, and keeps the indentation around and inside text. */
export function withoutIndentation(children: React.ReactNode): React.ReactNode {
  if (!Array.isArray(children)) return children;
  const content = children
    .map((child) => (typeof child === 'string' ? jsxText(child) : child))
    .filter((child) => child !== '');
  if (content.length === 0) return undefined;
  return content.length === 1 ? content[0] : content;
}

/** Whether `node` is the wrapper a canvas mounts one x-import in. */
export function isCanvasWrapper(
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

/**
 * `children` with each canvas wrapper replaced by the element inside it, for
 * a part that reads its children's types. Recharts finds a chart's Cells and
 * draws its series inside an `<svg>`, where a wrapper `<div>` hides them.
 */
export function unwrapped(children: React.ReactNode): React.ReactNode {
  const content = withoutIndentation(children);
  // The element keeps its wrapper's key, so siblings stay distinct.
  const unwrap = (child: React.ReactNode, key: React.Key): React.ReactNode => {
    if (!isCanvasWrapper(child)) return child;
    const inner = unwrap(
      withoutIndentation(child.props.children),
      child.key ?? key
    );
    return React.isValidElement(inner)
      ? React.cloneElement(inner, { key: child.key ?? key })
      : inner;
  };
  return Array.isArray(content)
    ? content.map((child, index) => unwrap(child, index))
    : unwrap(content, 0);
}
