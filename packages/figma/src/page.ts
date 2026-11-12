/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
// The functions that run inside the capture page. Playwright sends each one
// to the page as source text, so each is self-contained: no imports and no
// module-level values, only its arguments and the page's globals.
import type * as ReactModule from 'react';

/** A component tree, as nxds's stories pass it: each prop holds its real value. An icon is `{ __icon: name }`. */
export interface PartTree {
  part: string;
  props?: Record<string, unknown>;
  children?: (PartTree | string)[];
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextFacts {
  kind: 'text';
  text: string;
  rect: Rect;
  lines: number;
}

export interface ElementFacts {
  kind: 'element';
  tag: string;
  slot: string | null;
  /** The recipe's boolean property for this element, from `data-figma-part`. */
  part: string | null;
  /** The recipe's text property for this element's own text, from `data-figma-text`. */
  textProperty: string | null;
  /** `data-*`, `disabled` and `aria-invalid`. */
  attributes: Record<string, string>;
  /** The nearest `nx:typography-*` class on it or an ancestor, without `nx:`. */
  typography: string | null;
  rect: Rect;
  /** Computed styles, as getComputedStyle resolves them. */
  style: Record<string, string>;
  /** Computed values from computedStyleMap: `auto`, `100%` or a length, before layout resolves them. */
  declared: Record<string, string>;
  /** The nxds token each property was declared with, by CSS property. */
  tokens: Record<string, string>;
  children: (ElementFacts | TextFacts)[];
  /** An `<svg>`'s markup, with `currentColor` left in. */
  svg?: string;
  /** An `<input>`'s value and placeholder, and the placeholder's colour. */
  input?: { value: string; placeholder: string; placeholderColor: string };
}

export type Kind = 'color' | 'length' | 'shadow';

export interface RecordInput {
  /** Every token to trace, by name without `--`, and the kind of value it holds. */
  tokens: [string, Kind][];
  parts: { selector: string; name: string }[];
  texts: { selector: string; name: string }[];
}

export interface Recorded {
  tree: ElementFacts;
  /** The root's `scale`, which the recording leaves out. */
  rootScale: string;
}

interface PageGlobals {
  React: typeof ReactModule;
  ReactDOM: {
    createRoot(container: Element): {
      render(node: ReactModule.ReactNode): void;
      unmount(): void;
    };
    flushSync(callback: () => void): void;
  };
  Nxds: Record<string, unknown>;
  __figmaMount(tree: PartTree, width: number | null): void;
  __figmaUnmount(): void;
}

/**
 * Defines `__figmaMount(tree, width)` and `__figmaUnmount()`. A mount renders
 * the tree into a fresh `[data-capture-root]` wrapper with 8px of room around
 * it for focus rings: `width` px wide for a component that fills its
 * container, or as wide as the component otherwise.
 */
export function installHelpers() {
  const page = window as unknown as PageGlobals;
  const { React, ReactDOM, Nxds } = page;
  const component = (name: string) =>
    name
      .split('.')
      .reduce<unknown>(
        (scope, key) => (scope as Record<string, unknown> | undefined)?.[key],
        Nxds
      ) as ReactModule.ElementType | undefined;
  const revive = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(revive);
    if (!value || typeof value !== 'object') return value;
    if ('__icon' in value) {
      return React.createElement(Nxds['Icon'] as ReactModule.ElementType, {
        name: value.__icon,
      });
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, revive(item)])
    );
  };
  const element = (
    tree: PartTree | string,
    key?: number
  ): ReactModule.ReactNode => {
    if (typeof tree === 'string') return tree;
    // A lowercase part is a plain element, such as the `p` inside CardContent.
    const type = /^[a-z]/.test(tree.part) ? tree.part : component(tree.part);
    if (!type) throw new Error(`The release has no Nxds.${tree.part}.`);
    return React.createElement(
      type,
      { ...(revive(tree.props ?? {}) as object), key },
      ...(tree.children ?? []).map((child, index) => element(child, index))
    );
  };
  let root: ReturnType<PageGlobals['ReactDOM']['createRoot']> | null = null;
  page.__figmaUnmount = () => {
    root?.unmount();
    root = null;
    document.body.replaceChildren();
  };
  page.__figmaMount = (tree, width) => {
    page.__figmaUnmount();
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-capture-root', '');
    wrapper.style.cssText =
      width === null
        ? 'display: inline-flex; align-items: flex-start; padding: 8px'
        : `display: flex; flex-direction: column; width: ${width + 16}px; padding: 8px`;
    document.body.append(wrapper);
    const mounted = ReactDOM.createRoot(wrapper);
    root = mounted;
    ReactDOM.flushSync(() => mounted.render(element(tree)));
  };
}

/**
 * Records the mounted component: every element's box, computed styles and
 * declared sizes, every text run and SVG, then which nxds token each style
 * was declared with. For that second pass it sets every token on the wrapper
 * to a stand-in no real value uses, reads the styles again, and decodes the
 * stand-ins that come out. Two tokens with the same value get different
 * stand-ins, so a binding never comes from matching values.
 */
export function recordVariant(input: RecordInput): Recorded {
  const STYLE = [
    'display',
    'position',
    'flex-direction',
    'flex-wrap',
    'flex-grow',
    'justify-content',
    'align-items',
    'align-self',
    'justify-self',
    'row-gap',
    'column-gap',
    'grid-template-columns',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
    'background-color',
    'color',
    'opacity',
    'box-shadow',
    'overflow-x',
    'transform',
    'translate',
    'outline-style',
    'outline-width',
    'outline-color',
    'outline-offset',
    'visibility',
    'clip-path',
    'font-family',
    'font-size',
    'font-weight',
    'line-height',
    'letter-spacing',
    'text-transform',
    'text-decoration-line',
    'text-align',
    'white-space',
  ];
  const DECLARED = [
    'width',
    'height',
    'min-width',
    'min-height',
    'grid-template-columns',
  ];
  const COLOR_PROBES = [
    'background-color',
    'color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
  ];
  const LENGTH_PROBES = [
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'row-gap',
    'column-gap',
    'width',
    'height',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
    'outline-width',
    'outline-offset',
  ];

  const wrapper = document.querySelector<HTMLElement>('[data-capture-root]');
  const root = wrapper?.firstElementChild;
  if (!wrapper || !(root instanceof Element)) {
    throw new Error('Nothing is mounted to record.');
  }
  for (const { selector, name } of input.parts) {
    for (const el of wrapper.querySelectorAll(selector)) {
      el.setAttribute('data-figma-part', name);
    }
  }
  for (const { selector, name } of input.texts) {
    for (const el of wrapper.querySelectorAll(selector)) {
      el.setAttribute('data-figma-text', name);
    }
  }

  // Pressed shrinks the root with `scale`. Figma can't scale a variant, so
  // the layout is read at full size.
  const rootScale = getComputedStyle(root).scale;
  (root as HTMLElement).style.setProperty('scale', 'none', 'important');
  const origin = root.getBoundingClientRect();
  const relative = (rect: DOMRect): Rect => ({
    x: rect.left - origin.left,
    y: rect.top - origin.top,
    width: rect.width,
    height: rect.height,
  });
  const typographyOf = (el: Element) => {
    for (
      let at: Element | null = el;
      at && at !== wrapper;
      at = at.parentElement
    ) {
      for (const name of at.classList) {
        const match = /^nx:(typography-[a-z0-9-]+)$/.exec(name);
        if (match?.[1]) return match[1];
      }
    }
    return null;
  };
  const attributesOf = (el: Element) => {
    const found: Record<string, string> = {};
    for (const { name, value } of el.attributes) {
      if (
        name.startsWith('data-') ||
        name === 'disabled' ||
        name === 'aria-invalid'
      ) {
        found[name] = value;
      }
    }
    return found;
  };
  const svgMarkup = (svg: SVGSVGElement, rect: DOMRect) => {
    const copy = svg.cloneNode(true) as SVGSVGElement;
    copy.setAttribute('width', String(rect.width));
    copy.setAttribute('height', String(rect.height));
    for (const node of [copy, ...copy.querySelectorAll('*')]) {
      node.removeAttribute('class');
      node.removeAttribute('style');
    }
    return copy.outerHTML;
  };

  const recorded: [Element, ElementFacts][] = [];
  const walk = (el: Element): ElementFacts => {
    const computed = getComputedStyle(el);
    const map = el.computedStyleMap();
    const style: Record<string, string> = {};
    for (const property of STYLE)
      style[property] = computed.getPropertyValue(property);
    const declared: Record<string, string> = {};
    for (const property of DECLARED)
      declared[property] = String(map.get(property) ?? '');
    const box = el.getBoundingClientRect();
    const facts: ElementFacts = {
      kind: 'element',
      tag: el.tagName.toLowerCase(),
      slot: el.getAttribute('data-slot'),
      part: el.getAttribute('data-figma-part'),
      textProperty: el.getAttribute('data-figma-text'),
      attributes: attributesOf(el),
      typography: typographyOf(el),
      rect: relative(box),
      style,
      declared,
      tokens: {},
      children: [],
    };
    recorded.push([el, facts]);
    if (el instanceof SVGSVGElement) {
      facts.svg = svgMarkup(el, box);
      return facts;
    }
    if (el instanceof HTMLInputElement) {
      facts.input = {
        value: el.value,
        placeholder: el.placeholder,
        placeholderColor: getComputedStyle(el, '::placeholder').color,
      };
    }
    for (const node of el.childNodes) {
      if (node instanceof Element) {
        facts.children.push(walk(node));
        continue;
      }
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim())
        continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const lines = new Set(
        [...range.getClientRects()].map((rect) => Math.round(rect.top))
      );
      facts.children.push({
        kind: 'text',
        text: node.textContent,
        rect: relative(range.getBoundingClientRect()),
        lines: lines.size,
      });
    }
    return facts;
  };
  const tree = walk(root);

  const standIn = (kind: Kind, index: number) => {
    if (kind === 'color') return `rgb(1, ${index >> 8}, ${index & 255})`;
    if (kind === 'shadow') return `0px 0px 0px ${10000 + index}px rgb(1, 0, 0)`;
    return `${10000 + index}px`;
  };
  input.tokens.forEach(([name, kind], index) =>
    wrapper.style.setProperty(`--${name}`, standIn(kind, index))
  );
  const tokenAt = (index: number) => input.tokens[index]?.[0];
  const colorToken = (value: string) => {
    const match = /^rgb\(1, (\d+), (\d+)\)$/.exec(value);
    return match
      ? tokenAt((Number(match[1]) << 8) + Number(match[2]))
      : undefined;
  };
  const lengthToken = (value: string) => {
    const match = /^(1\d{4})px$/.exec(value.trim());
    return match ? tokenAt(Number(match[1]) - 10000) : undefined;
  };
  for (const [el, facts] of recorded) {
    const computed = getComputedStyle(el);
    const map = el.computedStyleMap();
    const set = (property: string, token: string | undefined) => {
      if (token !== undefined) facts.tokens[property] = token;
    };
    for (const property of COLOR_PROBES) {
      set(property, colorToken(computed.getPropertyValue(property)));
    }
    for (const property of LENGTH_PROBES) {
      set(property, lengthToken(String(map.get(property) ?? '')));
    }
    const [x = '', y = ''] = String(map.get('translate') ?? '').split(' ');
    set('translate-x', lengthToken(x));
    set('translate-y', lengthToken(y));
    const shadow = /\b(1\d{4})px\b/.exec(computed.boxShadow);
    if (shadow) set('box-shadow', tokenAt(Number(shadow[1]) - 10000));
    if (facts.input) {
      set(
        'placeholder-color',
        colorToken(getComputedStyle(el, '::placeholder').color)
      );
    }
  }
  for (const [name] of input.tokens) wrapper.style.removeProperty(`--${name}`);
  (root as HTMLElement).style.removeProperty('scale');
  return { tree, rootScale };
}
