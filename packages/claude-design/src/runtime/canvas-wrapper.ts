import * as React from 'react';

/**
 * The class on the `display: contents` div a Design canvas mounts each
 * x-import in. Every element in an artboard has `data-dc-tpl`; only this
 * wrapper has the class.
 */
export const CANVAS_WRAPPER_CLASS = 'sc-host-x';

/** The attribute a canvas writes for a prop: kebab-case, `aria-*` and `data-*` as written. */
export function kebab(name: string) {
  if (/^(?:aria|data)-/.test(name)) return name;
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

type WrapperProps = { className?: unknown; children?: React.ReactNode };

/** x-import content without its indentation: a canvas passes it as an array, even for one child, and keeps the space between tags as strings. */
export function withoutIndentation(children: React.ReactNode): React.ReactNode {
  if (!Array.isArray(children)) return children;
  const content = children.filter(
    (child) => typeof child !== 'string' || child.trim() !== ''
  );
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
