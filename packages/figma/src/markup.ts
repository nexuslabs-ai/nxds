// The JSX recipes.tsx and examples.tsx are written in. A tag such as
// <Nxds.Button> names a part the app's nxds exports, and the capture page
// renders the app's own component for it. An element is plain data, so it
// reaches the page as written, with its props as real values: numbers,
// arrays, objects and dates.
import type { MarkupElement, MarkupNode } from './page.ts';

/** A part of the app's nxds, such as `Button`, as a JSX tag. */
export interface Part<Name extends string = string> {
  (props: Record<string, unknown>): MarkupElement;
  /** The name the app exports it under. */
  readonly part: Name;
}

export function part<Name extends string>(name: Name): Part<Name> {
  const tag = (): MarkupElement => {
    throw new Error(`${name} is drawn by the capture page, not called.`);
  };
  return Object.assign(tag, { part: name });
}

/** One element, or several side by side. */
export type Markup = MarkupElement | readonly MarkupElement[];

type Child =
  | MarkupNode
  | number
  | boolean
  | null
  | undefined
  | readonly Child[];

function flatten(children: readonly Child[]): MarkupNode[] {
  return children.flatMap((child): MarkupNode[] => {
    if (child === null || child === undefined || typeof child === 'boolean')
      return [];
    if (typeof child === 'number') return [String(child)];
    if (Array.isArray(child)) return flatten(child);
    return [child as MarkupNode];
  });
}

/** The JSX factory: an HTML element for a string tag, a part for a `Part`. */
export function h(
  type: string | Part,
  props: Record<string, unknown> | null,
  ...children: Child[]
): MarkupElement {
  return {
    tag: typeof type === 'string' ? type : type.part,
    part: typeof type === 'string' ? null : type.part,
    props: props ?? {},
    children: flatten(children),
  };
}

export declare namespace h {
  namespace JSX {
    type Element = MarkupElement;
    interface IntrinsicElements {
      [tag: string]: Record<string, unknown>;
    }
  }
}

/** An icon from the app's icon library, by its nxds name, for a prop such as Button's `startIcon`. */
export const icon = (name: string) => ({ __icon: name });

/** A handler a prop needs, such as `onValueChange`, which does nothing. */
export const handler = { __handler: true } as const;
