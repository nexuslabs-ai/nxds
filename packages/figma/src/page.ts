/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
// The functions that run inside the capture page. Playwright sends each one
// to the page as source text, so each is self-contained: no imports and no
// module-level values, only its arguments and the page's globals.
import type * as ReactModule from 'react';

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
  /** The element's class attribute. */
  classes: string;
  /** `data-*`, `disabled`, `aria-invalid` and `aria-selected`. */
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
  /** An `<svg>`'s markup, with each shape's computed colours written in. */
  svg?: string;
  /** Each colour an `<svg>`'s shapes draw with that came from a token. */
  svgColors?: { color: string; token: string }[];
  /** An `<input>`'s, `<textarea>`'s or `<select>`'s value and placeholder, and the placeholder's colour. */
  input?: { value: string; placeholder: string; placeholderColor: string };
}

export type Kind = 'color' | 'length' | 'shadow' | 'font-size';

/** Props set on the first element of a part, such as `{ part: 'Button', props: { size: 'sm' } }`. */
export interface Override {
  part: string;
  props: Record<string, unknown>;
}

/** An element of canvas markup, with its attributes as props. */
export interface MarkupElement {
  /** The HTML tag, or the component's path in Nxds for an `<x-import>`, such as `Button`. */
  tag: string;
  /** The part an `<x-import>` draws, or null for an HTML element. */
  part: string | null;
  /** The attributes by prop name: strings, until an app's conversion types a part's. */
  props: Record<string, unknown>;
  children: MarkupNode[];
}

export type MarkupNode = MarkupElement | string;

export interface MountInput {
  /** Parsed canvas markup, from `parseMarkup`. */
  nodes: MarkupNode[];
  overrides: Override[];
  /** The container's width. Block-level components fill it. */
  width: number;
}

export interface RecordInput {
  /** The element to record, anywhere in the document, since overlays render in a portal. */
  target: string;
  /** Every token to trace, by name without `--`, and the kind of value it holds. */
  tokens: [string, Kind][];
  /** Elements that carry a boolean property, by selector. */
  parts: { selector: string; name: string }[];
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
  __figmaMount(input: MountInput): void;
  __figmaUnmount(): void;
}

/**
 * Canvas markup, such as `<x-import component-from-global-scope="Nxds.Button">`,
 * as a tree. Each attribute is named as its prop, and its value stays the
 * string a canvas passes, which the release's bundle converts. Text keeps
 * one space for each run of whitespace.
 */
export function parseMarkup(markup: string): MarkupNode[] {
  const NAMES: Record<string, string> = {
    class: 'className',
    for: 'htmlFor',
    tabindex: 'tabIndex',
    colspan: 'colSpan',
    rowspan: 'rowSpan',
    viewbox: 'viewBox',
  };
  const camel = (name: string) =>
    /^(?:aria|data)-/.test(name)
      ? name
      : name.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
  const styleObject = (text: string) =>
    Object.fromEntries(
      text
        .split(';')
        .map((declaration) => declaration.split(':').map((side) => side.trim()))
        .filter(([name, value]) => name && value)
        .map(([name = '', value]) => [
          name.startsWith('--') ? name : camel(name),
          value,
        ])
    );
  const parse = (node: ChildNode): MarkupNode | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
      return text === '' ? null : text;
    }
    if (!(node instanceof Element)) return null;
    const children = [...node.childNodes]
      .map(parse)
      .filter((child) => child !== null);
    const tag = node.tagName.toLowerCase();
    const props: Record<string, unknown> = {};
    if (tag === 'x-import') {
      const part = (
        node.getAttribute('component-from-global-scope') ?? ''
      ).replace(/^Nxds\./, '');
      for (const attribute of node.attributes) {
        if (attribute.name === 'component-from-global-scope') continue;
        props[camel(attribute.name)] = attribute.value;
      }
      return { tag: part, part, props, children };
    }
    for (const attribute of node.attributes) {
      const name = NAMES[attribute.name] ?? attribute.name;
      props[name] =
        name === 'style' ? styleObject(attribute.value) : attribute.value;
    }
    return { tag, part: null, props, children };
  };
  const template = document.createElement('template');
  template.innerHTML = markup.trim();
  return [...template.content.childNodes]
    .map(parse)
    .filter((node) => node !== null);
}

/** The parts, such as `Button` or `Chart.Bar`, that the page's `Nxds` doesn't have. */
export function missingParts(parts: string[]) {
  const { Nxds } = window as unknown as PageGlobals;
  return parts.filter(
    (part) =>
      part
        .split('.')
        .reduce<unknown>(
          (scope, key) => (scope as Record<string, unknown> | undefined)?.[key],
          Nxds
        ) === undefined
  );
}

/**
 * Defines `__figmaMount(input)` and `__figmaUnmount()`. A mount renders parsed
 * canvas markup into a fresh `[data-capture-root]` container, `width` px wide
 * with 8px of room around it, and sets each override's props on the first
 * element of its part. `{ __icon: name }` draws that icon and
 * `{ __handler: true }` is a function that does nothing.
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
    if (!value || typeof value !== 'object' || value instanceof Date) {
      return value;
    }
    if ('__icon' in value) {
      return React.createElement(Nxds['Icon'] as ReactModule.ElementType, {
        name: value.__icon,
      });
    }
    if ('__handler' in value) return () => undefined;
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, revive(item)])
    );
  };
  let root: ReturnType<PageGlobals['ReactDOM']['createRoot']> | null = null;
  page.__figmaUnmount = () => {
    root?.unmount();
    root = null;
    document.body.replaceChildren();
  };
  page.__figmaMount = ({ nodes, overrides, width }) => {
    page.__figmaUnmount();
    const pending = new Map(
      overrides.map((override) => [override.part, override.props])
    );
    const render = (node: MarkupNode, key: number): ReactModule.ReactNode => {
      if (typeof node === 'string') return node;
      const children = node.children.map(render);
      const props: Record<string, unknown> = {
        key,
        ...(revive(node.props) as Record<string, unknown>),
      };
      let type: ReactModule.ElementType =
        node.tag as keyof ReactModule.JSX.IntrinsicElements;
      if (node.part !== null) {
        const found = component(node.part);
        if (!found) throw new Error(`The page has no Nxds.${node.part}.`);
        type = found;
        const extra = pending.get(node.part);
        if (extra) {
          Object.assign(props, revive(extra));
          pending.delete(node.part);
        }
      }
      // A void element such as <input> throws on any `children` prop.
      return children.length > 0
        ? React.createElement(type, props, ...children)
        : React.createElement(type, props);
    };
    const elements = nodes.map(render);
    if (pending.size > 0) {
      throw new Error(
        `The markup has no ${[...pending.keys()].join(', ')} to set props on.`
      );
    }
    // An app's bundle hands over its appearance provider, so each mount gets the app's colours, density and corners.
    const app = Nxds['__figma'] as
      | {
          Provider: ReactModule.ElementType;
          defaultState: unknown;
          deriveColors: boolean;
        }
      | undefined;
    const tree = React.createElement(React.Fragment, null, ...elements);
    const content = app
      ? React.createElement(
          app.Provider,
          {
            defaultState: app.defaultState,
            deriveColors: app.deriveColors,
            storageKey: 'nxds-figma-capture',
          },
          tree
        )
      : tree;
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-capture-root', '');
    wrapper.style.cssText = `display: flow-root; width: ${width + 16}px; padding: 8px`;
    document.body.append(wrapper);
    const mounted = ReactDOM.createRoot(wrapper);
    root = mounted;
    ReactDOM.flushSync(() => mounted.render(content));
  };
}

/** Waits for fonts, then until the page looks the same two frames running, up to four seconds. */
export async function settle() {
  await document.fonts.ready;
  const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
  const signature = () => {
    const parts: string[] = [String(document.body.innerHTML.length)];
    for (const el of document.body.querySelectorAll('[data-slot]')) {
      const rect = el.getBoundingClientRect();
      parts.push(
        `${Math.round(rect.x)},${Math.round(rect.y)},${Math.round(rect.width)},${Math.round(rect.height)}`
      );
    }
    return parts.join('|');
  };
  let last = signature();
  let stable = 0;
  const started = performance.now();
  while (stable < 2 && performance.now() - started < 4000) {
    await frame();
    const next = signature();
    stable = next === last ? stable + 1 : 0;
    last = next;
  }
  await document.fonts.ready;
}

/**
 * The icon set: each icon `Nxds.Icon` names, at 24px, and the filled weight
 * of each through its Phosphor component in `Nxds.Icons`, named `<name>-fill`.
 */
export function recordIcons(names: string[]) {
  const page = window as unknown as PageGlobals;
  const { React, ReactDOM, Nxds } = page;
  const phosphor = (Nxds['Icons'] ?? {}) as Record<
    string,
    ReactModule.ElementType
  >;
  const pascal = (name: string) =>
    `${name.replace(/(^|-)([a-z0-9])/g, (_, __, char: string) => char.toUpperCase())}Icon`;
  const wanted = new Map<string, ReactModule.ReactElement>();
  for (const name of names) {
    wanted.set(
      name,
      React.createElement(Nxds['Icon'] as ReactModule.ElementType, {
        name,
        size: 24,
      })
    );
    const component = phosphor[pascal(name)];
    if (
      !name.endsWith('-fill') &&
      component &&
      !names.includes(`${name}-fill`)
    ) {
      wanted.set(
        `${name}-fill`,
        React.createElement(component, { size: 24, weight: 'fill' })
      );
    }
  }
  const host = document.createElement('div');
  document.body.append(host);
  const root = ReactDOM.createRoot(host);
  ReactDOM.flushSync(() =>
    root.render(
      React.createElement(
        React.Fragment,
        null,
        ...[...wanted].map(([name, icon]) =>
          React.createElement('span', { key: name, 'data-icon': name }, icon)
        )
      )
    )
  );
  const icons = [...host.querySelectorAll<HTMLElement>('[data-icon]')].flatMap(
    (span) => {
      const svg = span.querySelector('svg');
      if (!svg) return [];
      const copy = svg.cloneNode(true) as SVGSVGElement;
      for (const node of [copy, ...copy.querySelectorAll('*')]) {
        node.removeAttribute('class');
        node.removeAttribute('style');
        node.removeAttribute('aria-hidden');
      }
      return [{ name: span.dataset['icon'] ?? '', svg: copy.outerHTML }];
    }
  );
  root.unmount();
  host.remove();
  return icons.sort((a, b) => a.name.localeCompare(b.name));
}

/** How a token's value is read: as a colour, a length, a shadow, or a bare number such as a font weight. */
export type ValueKind = 'color' | 'length' | 'shadow' | 'number';

/** A token's value as the page resolves it, in light and in dark, and the token it references in each, if it's declared as one. */
export interface TokenValue {
  light?: string;
  dark?: string;
  lightAlias?: string;
  darkAlias?: string;
}

/**
 * Every token's value as the page resolves it, in light on the root and in
 * dark inside a `.dark` element, whatever declared it: tokens.css, an app's
 * own colours file or a preset. A probe element reads it through a property,
 * so the browser computes `color-mix()`, `var()` and `rem` the way it would
 * for a component.
 *
 * Then which token each one is declared as a reference to, such as
 * `var(--nx-color-blue-600)`: every other token gets a unique stand-in, and
 * if a token's own value comes out as one, its declaration names that token.
 */
export function readTokenValues(probes: [string, ValueKind][]) {
  const html = document.documentElement;
  const dark = document.createElement('div');
  dark.className = 'dark';
  dark.setAttribute('data-theme', 'dark');
  const lightProbe = document.createElement('div');
  const darkProbe = document.createElement('div');
  dark.append(darkProbe);
  document.body.append(lightProbe, dark);
  const PROPERTY: Record<ValueKind, string> = {
    color: 'color',
    length: 'margin-left',
    shadow: 'box-shadow',
    number: '',
  };
  const read = (probe: HTMLElement, name: string, kind: ValueKind) => {
    const raw = getComputedStyle(probe).getPropertyValue(`--${name}`).trim();
    if (raw === '') return undefined;
    const property = PROPERTY[kind];
    if (!property) return raw;
    probe.style.setProperty(property, `var(--${name})`);
    const value =
      kind === 'length'
        ? String(probe.computedStyleMap().get(property) ?? '')
        : getComputedStyle(probe).getPropertyValue(property);
    probe.style.removeProperty(property);
    return value;
  };
  const values: Record<string, TokenValue> = {};
  for (const [name, kind] of probes) {
    values[name] = {
      light: read(lightProbe, name, kind),
      dark: read(darkProbe, name, kind),
    };
  }

  const standIn = (index: number) => `figma-reference-${index}`;
  const byStandIn = new Map(
    probes.map(([name], index) => [standIn(index), name])
  );
  const setAll = () =>
    probes.forEach(([name], index) => {
      html.style.setProperty(`--${name}`, standIn(index));
      dark.style.setProperty(`--${name}`, standIn(index));
    });
  setAll();
  probes.forEach(([name], index) => {
    html.style.removeProperty(`--${name}`);
    dark.style.removeProperty(`--${name}`);
    const entry = values[name] ?? {};
    const lightAlias = byStandIn.get(
      getComputedStyle(html).getPropertyValue(`--${name}`).trim()
    );
    const darkAlias = byStandIn.get(
      getComputedStyle(dark).getPropertyValue(`--${name}`).trim()
    );
    if (lightAlias) entry.lightAlias = lightAlias;
    if (darkAlias) entry.darkAlias = darkAlias;
    html.style.setProperty(`--${name}`, standIn(index));
    dark.style.setProperty(`--${name}`, standIn(index));
  });
  for (const [name] of probes) html.style.removeProperty(`--${name}`);
  lightProbe.remove();
  dark.remove();
  return values;
}

/** The token each `nx:typography-*` class declares for its size, line height and letter spacing, by class. */
export function readTypography() {
  const found: Record<string, Record<string, string>> = {};
  const visit = (rules: CSSRuleList) => {
    for (const rule of rules) {
      if ('cssRules' in rule && !(rule instanceof CSSStyleRule)) {
        visit((rule as CSSGroupingRule).cssRules);
        continue;
      }
      if (!(rule instanceof CSSStyleRule)) continue;
      const match = /^\.nx\\:(typography-[a-z0-9-]+)$/.exec(rule.selectorText);
      if (!match?.[1]) continue;
      const tokens: Record<string, string> = {};
      for (const property of ['font-size', 'line-height', 'letter-spacing']) {
        const variable = /^var\(--([\w-]+)\)$/.exec(
          rule.style.getPropertyValue(property).trim()
        );
        if (variable?.[1]) tokens[property] = variable[1];
      }
      found[match[1]] = tokens;
    }
  };
  for (const sheet of document.styleSheets) visit(sheet.cssRules);
  return found;
}

/**
 * Records the target element: every element's box, computed styles and
 * declared sizes, every text run and SVG, then which nxds token each style
 * was declared with. For that second pass it sets every token on the page's
 * root element to a stand-in no real value uses, reads the styles again, and
 * decodes the stand-ins that come out. Two tokens with the same value get
 * different stand-ins, so a binding never comes from matching values.
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
    'min-width',
    'min-height',
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
    'line-height',
    'letter-spacing',
  ];
  const SVG_SHAPES =
    'path, rect, circle, ellipse, line, polyline, polygon, text';

  const root = document.querySelector(input.target);
  if (!(root instanceof Element))
    throw new Error(`Nothing matches ${input.target}.`);
  for (const { selector, name } of input.parts) {
    for (const el of document.querySelectorAll(selector))
      el.setAttribute('data-figma-part', name);
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
    for (let at: Element | null = el; at; at = at.parentElement) {
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
        [
          'disabled',
          'role',
          'aria-invalid',
          'aria-selected',
          'aria-checked',
          'aria-current',
        ].includes(name)
      ) {
        found[name] = value;
      }
    }
    return found;
  };
  // Each shape's computed paint, written in, so the markup draws without the page's CSS.
  const svgMarkup = (svg: SVGSVGElement, rect: DOMRect) => {
    const copy = svg.cloneNode(true) as SVGSVGElement;
    copy.setAttribute('width', String(rect.width));
    copy.setAttribute('height', String(rect.height));
    const sources = [svg, ...svg.querySelectorAll(SVG_SHAPES)];
    const targets = [copy, ...copy.querySelectorAll(SVG_SHAPES)];
    targets.forEach((node, index) => {
      const source = sources[index];
      if (!source) return;
      const computed = getComputedStyle(source);
      for (const property of [
        'fill',
        'stroke',
        'stroke-width',
        'opacity',
        'fill-opacity',
        'stroke-opacity',
      ]) {
        node.setAttribute(property, computed.getPropertyValue(property));
      }
      if (node.tagName.toLowerCase() === 'text') {
        node.setAttribute('font-family', computed.fontFamily);
        node.setAttribute('font-size', computed.fontSize);
        node.setAttribute('font-weight', computed.fontWeight);
      }
    });
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
      classes: el.getAttribute('class') ?? '',
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
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      facts.input = {
        value: el.value,
        placeholder: el.placeholder,
        placeholderColor: getComputedStyle(el, '::placeholder').color,
      };
    }
    // A closed <select> draws only its selected option's text, never its options.
    if (el instanceof HTMLSelectElement) {
      facts.input = {
        value: el.selectedOptions[0]?.text ?? '',
        placeholder: '',
        placeholderColor: computed.color,
      };
      return facts;
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

  // Paints each SVG shape draws with before the stand-ins go in.
  const shapePaints = new Map<Element, string[]>();
  for (const [el, facts] of recorded) {
    if (!facts.svg) continue;
    for (const shape of el.querySelectorAll(SVG_SHAPES)) {
      const computed = getComputedStyle(shape);
      shapePaints.set(shape, [computed.fill, computed.stroke]);
    }
  }

  // Each kind numbers its own tokens, and a length stand-in is 16px from the
  // next, so a value a calc() moved off a stand-in reads as no token rather
  // than a neighbour. Chrome caps font sizes at 10000px, so they sit below it.
  const STEP = 16;
  const byKind = new Map<Kind, string[]>();
  for (const [name, kind] of input.tokens)
    byKind.set(kind, [...(byKind.get(kind) ?? []), name]);
  const standIn = (kind: Kind, index: number) => {
    if (kind === 'color') return `rgb(1, ${index >> 8}, ${index & 255})`;
    if (kind === 'shadow')
      return `0px 0px 0px ${10000 + index * STEP}px rgb(1, 0, 0)`;
    if (kind === 'font-size') return `${5000 + index * STEP}px`;
    return `${10000 + index * STEP}px`;
  };
  const html = document.documentElement;
  for (const [kind, names] of byKind) {
    names.forEach((name, index) =>
      html.style.setProperty(`--${name}`, standIn(kind, index))
    );
  }
  const decode = (kind: Kind, offset: number, value: number) => {
    const step = value - offset;
    return step >= 0 && step % STEP === 0
      ? byKind.get(kind)?.[step / STEP]
      : undefined;
  };
  const colorToken = (value: string) => {
    const match = /^rgb\(1, (\d+), (\d+)\)$/.exec(value);
    return match
      ? byKind.get('color')?.[(Number(match[1]) << 8) + Number(match[2])]
      : undefined;
  };
  const lengthToken = (value: string) => {
    const match = /^(1\d{4})px$/.exec(value.trim());
    return match ? decode('length', 10000, Number(match[1])) : undefined;
  };
  // Only font-size reads the font-size range: a length in `em` scales with it, but wasn't declared with it.
  const fontSizeToken = (value: string) => {
    const match = /^(5\d{3}|[6-9]\d{3})px$/.exec(value.trim());
    return match ? decode('font-size', 5000, Number(match[1])) : undefined;
  };
  for (const [el, facts] of recorded) {
    const computed = getComputedStyle(el);
    const map = el.computedStyleMap();
    const set = (property: string, token: string | undefined) => {
      if (token !== undefined) facts.tokens[property] = token;
    };
    for (const property of COLOR_PROBES)
      set(property, colorToken(computed.getPropertyValue(property)));
    for (const property of LENGTH_PROBES)
      set(property, lengthToken(String(map.get(property) ?? '')));
    set('font-size', fontSizeToken(computed.fontSize));
    const [x = '', y = ''] = String(map.get('translate') ?? '').split(' ');
    set('translate-x', lengthToken(x));
    set('translate-y', lengthToken(y));
    const shadow = /\b(1\d{4})px\b/.exec(computed.boxShadow);
    if (shadow) set('box-shadow', decode('shadow', 10000, Number(shadow[1])));
    if (facts.input) {
      set(
        'placeholder-color',
        colorToken(getComputedStyle(el, '::placeholder').color)
      );
    }
    if (facts.svg) {
      const colors: { color: string; token: string }[] = [];
      for (const shape of el.querySelectorAll(SVG_SHAPES)) {
        const before = shapePaints.get(shape) ?? [];
        const after = getComputedStyle(shape);
        [after.fill, after.stroke].forEach((value, index) => {
          const token = colorToken(value);
          const color = before[index];
          if (token && color) colors.push({ color, token });
        });
      }
      facts.svgColors = colors;
    }
  }
  for (const [name] of input.tokens) html.style.removeProperty(`--${name}`);
  (root as HTMLElement).style.removeProperty('scale');
  return { tree, rootScale };
}
