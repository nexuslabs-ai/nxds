// Recorded facts → Figma layers. Flex becomes auto layout, block flow a
// vertical stack, and a grid a row of its columns, which is what a designer
// builds by hand. Sizes come from what the CSS declared: a length is fixed and
// bound to its token, `auto` hugs, and grow, stretch or 100% fills. Margins
// and small in-flow offsets become padding, so spacing stays bound. An icon
// becomes an instance of the icon set, and a part another component draws
// becomes an instance of that component.
import type { ElementFacts, Recorded, TextFacts } from './page.ts';
import type {
  AutoLayout,
  Bound,
  EffectStyleSpec,
  FrameLayer,
  IconLayer,
  InstanceLayer,
  Layer,
  Padding,
  Paint,
  Sizing,
  TextLayer,
  TextStyleSpec,
  VectorLayer,
} from './spec.ts';
import { firstFamily, hex, parseShadows, rgba } from './tokens.ts';

/** A variant of a component built earlier, as other components meet it. */
export interface SourceVariant {
  name: string;
  values: Record<string, string>;
  /** How its root looks, to check an element really is this variant. */
  fingerprint: string;
}

/** A component built earlier, which later components hold instances of. */
export interface InstanceSource {
  name: string;
  variantProperties: readonly { name: string; values: readonly string[] }[];
  variants: readonly SourceVariant[];
  /** Its text properties, in the order its text runs appear. */
  textProperties: readonly string[];
  booleanProperties: readonly string[];
  /** Its instance-swap properties, in the order its icons appear. */
  swapProperties: readonly string[];
  /** The variant an element of this component is, read from the element and its ancestors. */
  variant(
    element: ElementFacts,
    ancestors: readonly ElementFacts[]
  ): Record<string, string>;
}

export interface ConvertContext {
  component: string;
  /** The root's `data-slot`. */
  slot: string;
  /** The card's slot prefix, such as `dropdown-menu`, which part names drop. */
  prefix: string;
  /** Text property names by the `data-slot` of the element holding the text. */
  textNames: Readonly<Record<string, string>>;
  /** Components built before this one, by each `data-slot` they draw. */
  instances: ReadonlyMap<string, InstanceSource>;
  /** Icon names by their shape, from `svgSignature`. */
  icons: ReadonlyMap<string, string>;
  textStyles: ReadonlyMap<string, TextStyleSpec>;
  effectStyles: ReadonlyMap<string, EffectStyleSpec>;
  notes: string[];
}

/** What one conversion tracks as it walks the tree. */
interface Walk extends ConvertContext {
  root: ElementFacts;
  ancestors: ElementFacts[];
  /** Property names given out so far in this variant, so each is unique. */
  names: Map<string, number>;
}

/** How a parent lays out its children. `row` is a grid's row of columns, `column` one of its columns. */
interface Parent {
  kind: 'flex' | 'block' | 'row' | 'column';
  mode: 'HORIZONTAL' | 'VERTICAL';
  alignItems: string;
  /** Declared width and height are both lengths. */
  fixed: boolean;
  /** The grid track a `row` child sits in. */
  track?: Sizing;
  facts: ElementFacts;
}

const SIDES = ['top', 'right', 'bottom', 'left'] as const;
const CORNERS = [
  ['topLeft', 'top-left'],
  ['topRight', 'top-right'],
  ['bottomRight', 'bottom-right'],
  ['bottomLeft', 'bottom-left'],
] as const;

const num = (value: string | undefined) => {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
};

const zero = (): Bound => ({ value: 0 });

const isLength = (value: string | undefined) =>
  /^-?[\d.]+px$/.test(value ?? '');

const withToken = (value: number, token: string | undefined): Bound =>
  token === undefined ? { value } : { value, token };

const bound = (el: ElementFacts, property: string): Bound =>
  withToken(num(el.style[property]), el.tokens[property]);

const size = (el: ElementFacts, axis: 'width' | 'height'): Bound =>
  withToken(el.rect[axis], el.tokens[axis]);

function paintOf(
  el: ElementFacts,
  property: string,
  colorText = el.style[property] ?? ''
): Paint | undefined {
  const color = rgba(colorText);
  if (!color) return undefined;
  const token = el.tokens[property];
  return token === undefined ? { color } : { color, token };
}

const BLACK: Paint = { color: { r: 0, g: 0, b: 0, a: 1 } };

/** An SVG's shape: its viewBox and every path, so the same icon matches at any size or colour. */
export function svgSignature(svg: string) {
  const viewBox = /viewBox="([^"]*)"/.exec(svg)?.[1] ?? '';
  const paths = [...svg.matchAll(/\sd="([^"]*)"/g)].map((match) => match[1]);
  return paths.length > 0 ? `${viewBox}|${paths.join('|')}` : '';
}

/** How an element's box looks: the computed values a component's variants differ by. */
export function fingerprint(el: ElementFacts) {
  const properties = [
    'background-color',
    'color',
    'border-top-width',
    'border-top-color',
    'border-bottom-width',
    'border-left-width',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border-top-left-radius',
    'font-size',
    'opacity',
  ];
  return [
    el.tag,
    Math.round(el.rect.height),
    ...properties.map((property) => el.style[property]),
  ].join('|');
}

const visible = (el: ElementFacts | TextFacts) => {
  if (el.kind === 'text') return true;
  const { style, rect } = el;
  if (style['display'] === 'none' || style['visibility'] === 'hidden')
    return false;
  // Screen-reader-only text, such as AlertClose's "Dismiss alert".
  if (style['clip-path'] === 'inset(50%)') return false;
  return !(
    style['position'] === 'absolute' &&
    rect.width <= 1 &&
    rect.height <= 1
  );
};

const isAbsolute = (el: ElementFacts) =>
  el.style['position'] === 'absolute' || el.style['position'] === 'fixed';

function translateOf(el: ElementFacts) {
  if (el.style['translate'] === 'none') return { x: 0, y: 0 };
  const [x = '0', y = '0'] = (el.style['translate'] ?? 'none').split(' ');
  return { x: num(x), y: num(y) };
}

const strokeWidths = (el: ElementFacts) =>
  SIDES.map((side) => {
    const style = el.style[`border-${side}-style`];
    return style === 'none' || style === 'hidden'
      ? 0
      : num(el.style[`border-${side}-width`]);
  });

const hasFill = (el: ElementFacts) =>
  (rgba(el.style['background-color'] ?? '')?.a ?? 0) > 0;
const hasStroke = (el: ElementFacts) =>
  strokeWidths(el).some((width) => width > 0);
const hasShadow = (el: ElementFacts) =>
  parseShadows(el.style['box-shadow'] ?? '').length > 0;
const hasPadding = (el: ElementFacts) =>
  SIDES.some((side) => num(el.style[`padding-${side}`]) !== 0);
const hasOutline = (el: ElementFacts) =>
  el.style['outline-style'] !== 'none' && num(el.style['outline-width']) > 0;

/** No box of its own to draw, so a single text run or icon can stand in for it. */
const isPlain = (el: ElementFacts) =>
  !hasFill(el) &&
  !hasStroke(el) &&
  !hasShadow(el) &&
  !hasPadding(el) &&
  !hasOutline(el);

const capitalize = (words: string) =>
  words.charAt(0).toUpperCase() + words.slice(1);

function layerName(el: ElementFacts, ctx: Walk) {
  if (el.part) return capitalize(el.part.replace(/^Show /, ''));
  if (el.slot === ctx.slot) return ctx.component;
  if (el.slot) {
    const short = el.slot.startsWith(`${ctx.prefix}-`)
      ? el.slot.slice(ctx.prefix.length + 1)
      : el.slot;
    return capitalize(short.replace(/-/g, ' '));
  }
  const role = el.attributes['role'];
  if (role && role !== 'presentation' && role !== 'none')
    return capitalize(role);
  if (el.tag === 'svg') return 'Icon';
  if (el.tag === 'img') return 'Image';
  return 'Frame';
}

/** `name`, or `name 2`, `name 3` when the variant already has one. */
function unique(ctx: Walk, name: string) {
  const count = (ctx.names.get(name) ?? 0) + 1;
  ctx.names.set(name, count);
  return count === 1 ? name : `${name} ${count}`;
}

const visibleKids = (el: ElementFacts) => el.children.filter(visible);

const JUSTIFY: Record<string, AutoLayout['primaryAlign']> = {
  center: 'CENTER',
  'flex-end': 'MAX',
  end: 'MAX',
  right: 'MAX',
  'space-between': 'SPACE_BETWEEN',
};

const ALIGN: Record<string, AutoLayout['counterAlign']> = {
  center: 'CENTER',
  'flex-end': 'MAX',
  end: 'MAX',
  'self-end': 'MAX',
};

function counterAlign(value: string | undefined, mode: AutoLayout['mode']) {
  if (value === 'baseline' && mode === 'HORIZONTAL') return 'BASELINE';
  return ALIGN[value ?? ''] ?? 'MIN';
}

const padding = (el: ElementFacts): Padding => ({
  top: bound(el, 'padding-top'),
  right: bound(el, 'padding-right'),
  bottom: bound(el, 'padding-bottom'),
  left: bound(el, 'padding-left'),
});

const stretches = (value: string | undefined) =>
  value === 'stretch' || value === 'normal';

/** Fixed, hug or fill for one axis, from what the CSS declared and how the parent lays it out. */
function axisSizing(
  el: ElementFacts,
  axis: 'horizontal' | 'vertical',
  parent: Parent | null,
  autoLayout: boolean
): Sizing {
  const declared = el.declared[axis === 'horizontal' ? 'width' : 'height'];
  const hug: Sizing = autoLayout ? 'HUG' : 'FIXED';
  if (isLength(declared)) return 'FIXED';
  const full = declared?.endsWith('%') === true && num(declared) >= 100;
  if (!parent) {
    // A root that fills its container, or takes a percentage of it, keeps the width it had.
    if (
      axis === 'horizontal' &&
      (declared?.endsWith('%') || !el.style['display']?.startsWith('inline'))
    )
      return 'FIXED';
    return hug;
  }
  const align =
    el.style['align-self'] === 'auto'
      ? parent.alignItems
      : el.style['align-self'];
  if (parent.kind === 'flex') {
    const primary = (parent.mode === 'HORIZONTAL') === (axis === 'horizontal');
    if (primary) return num(el.style['flex-grow']) > 0 || full ? 'FILL' : hug;
    return stretches(align) || full ? 'FILL' : hug;
  }
  if (parent.kind === 'row') {
    if (axis === 'horizontal')
      return parent.track === 'FILL' || full ? 'FILL' : (parent.track ?? hug);
    return stretches(align) ? 'FILL' : hug;
  }
  if (axis === 'vertical') return hug;
  if (full) return 'FILL';
  if (parent.kind === 'column') {
    return stretches(el.style['justify-self']) ||
      el.style['justify-self'] === 'auto'
      ? 'FILL'
      : hug;
  }
  return el.style['display']?.startsWith('inline') ? hug : 'FILL';
}

function sizingOf(
  el: ElementFacts,
  parent: Parent | null,
  autoLayout: boolean
) {
  return {
    horizontal: axisSizing(el, 'horizontal', parent, autoLayout),
    vertical: axisSizing(el, 'vertical', parent, autoLayout),
  };
}

/** A text run in `owner`'s font and colour. `opacity` is the owner's when the text stands in for it, and 1 inside a frame that already has it. */
function textLayer(
  run: TextFacts,
  owner: ElementFacts,
  name: string,
  sizing: { horizontal: Sizing; vertical: Sizing },
  opacity: number,
  ctx: Walk
): TextLayer {
  const { style } = owner;
  const collapse = !(style['white-space'] ?? '').startsWith('pre');
  const lineHeight =
    style['line-height'] === 'normal' ? undefined : bound(owner, 'line-height');
  const font = {
    family: firstFamily(style['font-family'] ?? ''),
    weight: num(style['font-weight']) || 400,
    size: bound(owner, 'font-size'),
    lineHeight,
    letterSpacing:
      style['letter-spacing'] === 'normal'
        ? zero()
        : bound(owner, 'letter-spacing'),
  };
  const textStyle = owner.typography
    ? ctx.textStyles.get(owner.typography)
    : undefined;
  const matches =
    textStyle !== undefined &&
    textStyle.size === font.size.value &&
    textStyle.weight === font.weight &&
    textStyle.lineHeight === font.lineHeight?.value &&
    Math.abs(textStyle.letterSpacing - font.letterSpacing.value) < 0.01;
  const align = style['text-align'];
  const layer: TextLayer = {
    type: 'TEXT',
    name,
    source: `text in ${owner.tag}`,
    characters: collapse ? run.text.replace(/\s+/g, ' ').trim() : run.text,
    textProperty: unique(ctx, name),
    font,
    fill: paintOf(owner, 'color') ?? BLACK,
    textCase: style['text-transform'] === 'uppercase' ? 'UPPER' : 'ORIGINAL',
    underline: (style['text-decoration-line'] ?? '').includes('underline'),
    align:
      align === 'center'
        ? 'CENTER'
        : align === 'right' || align === 'end'
          ? 'RIGHT'
          : 'LEFT',
    autoResize: sizing.horizontal === 'HUG' ? 'WIDTH_AND_HEIGHT' : 'HEIGHT',
    width: { value: run.rect.width },
    height: { value: run.rect.height },
    sizing: {
      horizontal: sizing.horizontal,
      vertical: sizing.vertical === 'FILL' ? 'FILL' : 'HUG',
    },
    opacity,
  };
  if (matches) layer.style = textStyle.name;
  return layer;
}

/** A text run inside a frame: one line hugs in a row, and text in a stack wraps at the stack's width. */
function runSizing(
  run: TextFacts,
  parent: Parent
): { horizontal: Sizing; vertical: Sizing } {
  if (parent.mode === 'HORIZONTAL')
    return { horizontal: run.lines > 1 ? 'FILL' : 'HUG', vertical: 'HUG' };
  return { horizontal: 'FILL', vertical: 'HUG' };
}

/** An icon from the set, as an instance, or any other SVG as vectors. `named` is the element whose name and part it takes. */
function svgLayer(
  svg: ElementFacts,
  named: ElementFacts,
  ctx: Walk
): IconLayer | VectorLayer {
  const base = {
    name: layerName(named, ctx),
    source: `svg${svg.slot ? `[data-slot=${svg.slot}]` : ''}`,
    width: size(svg, 'width'),
    height: size(svg, 'height'),
    sizing: { horizontal: 'FIXED', vertical: 'FIXED' } as const,
    opacity:
      num(svg.style['opacity'] ?? '1') *
      (named === svg ? 1 : num(named.style['opacity'] ?? '1')),
    ...(named.part ? { visibleProperty: named.part } : {}),
  };
  const icon = ctx.icons.get(svgSignature(svg.svg ?? ''));
  if (icon) {
    const layer: IconLayer = {
      ...base,
      type: 'ICON',
      icon,
      fill: paintOf(svg, 'color') ?? BLACK,
    };
    const slotted = [svg.slot, named.slot].some((slot) =>
      slot?.includes('icon')
    );
    if (slotted || named.part) layer.swapProperty = unique(ctx, base.name);
    return layer;
  }
  const colors: Record<string, string> = {};
  for (const { color, token } of svg.svgColors ?? []) {
    const parsed = rgba(color);
    if (parsed) colors[hex(parsed)] = token;
  }
  // SVG import reads hex colours, so each computed colour is written as one, with its alpha as an opacity.
  const markup = (svg.svg ?? '').replace(
    /(fill|stroke)="([^"]+)"/g,
    (whole, attribute: string, value: string) => {
      const parsed = rgba(value);
      if (!parsed || value === 'none') return whole;
      return `${attribute}="${hex(parsed)}"${parsed.a < 1 ? ` ${attribute}-opacity="${parsed.a}"` : ''}`;
    }
  );
  return { ...base, type: 'SVG', svg: markup, colors };
}

/** Every text run, icon and part under `el`, in order. */
function contents(el: ElementFacts) {
  const texts: string[] = [];
  const icons: ElementFacts[] = [];
  const parts = new Set<string>();
  const visit = (facts: ElementFacts) => {
    if (facts.part) parts.add(facts.part);
    if (facts.svg !== undefined) {
      icons.push(facts);
      return;
    }
    for (const child of facts.children.filter(visible)) {
      if (child.kind === 'text')
        texts.push(child.text.replace(/\s+/g, ' ').trim());
      else visit(child);
    }
  };
  visit(el);
  return { texts: texts.filter(Boolean), icons, parts };
}

/** The variant of `source` an element is: the one its attributes name, if it looks like it, or the variant that does. */
function matchVariant(el: ElementFacts, source: InstanceSource, ctx: Walk) {
  const wanted = source.variant(el, ctx.ancestors);
  const looks = fingerprint(el);
  const named = source.variants.find((entry) =>
    Object.entries(wanted).every(
      ([name, value]) => entry.values[name] === value
    )
  );
  if (named?.fingerprint === looks) return named;
  const lookalikes = source.variants.filter(
    (entry) => entry.fingerprint === looks
  );
  const agreement = (entry: SourceVariant) =>
    Object.entries(wanted).filter(
      ([name, value]) => entry.values[name] === value
    ).length;
  return lookalikes.sort((a, b) => agreement(b) - agreement(a))[0];
}

function instanceLayer(
  el: ElementFacts,
  source: InstanceSource,
  parent: Parent,
  ctx: Walk
): InstanceLayer | null {
  const variant = matchVariant(el, source, ctx);
  if (!variant) {
    ctx.notes.push(
      `${layerName(el, ctx)}: no ${source.name} variant looks like it, so it's drawn as layers.`
    );
    return null;
  }
  const found = contents(el);
  const texts: Record<string, string> = {};
  source.textProperties.forEach((property, index) => {
    const text = found.texts[index];
    if (text !== undefined) texts[property] = text;
  });
  const booleans: Record<string, boolean> = {};
  for (const property of source.booleanProperties)
    booleans[property] = found.parts.has(property);
  const swaps: Record<string, string> = {};
  const icons = found.icons
    .map((svg) => ctx.icons.get(svgSignature(svg.svg ?? '')))
    .filter((name) => name !== undefined);
  source.swapProperties.forEach((property, index) => {
    const name = icons[index];
    if (name) swaps[property] = name;
  });
  const layer: InstanceLayer = {
    type: 'INSTANCE',
    name: source.name,
    source: `${el.tag}[data-slot=${el.slot}]`,
    component: source.name,
    variant: variant.values,
    texts,
    booleans,
    swaps,
    width: size(el, 'width'),
    height: size(el, 'height'),
    sizing: sizingOf(el, parent, true),
    opacity: 1,
  };
  if (el.part) layer.visibleProperty = el.part;
  return layer;
}

/** A ring outside the frame, standing in for the CSS outline Figma doesn't have. */
function focusRing(el: ElementFacts): FrameLayer {
  const width = num(el.style['outline-width']);
  const distance = width + num(el.style['outline-offset']);
  const stroke = withToken(width, el.tokens['outline-width']);
  // A pill's ring stays a pill: its corners can't be rounder than half its short side.
  const pill = Math.min(el.rect.width, el.rect.height) / 2 + distance;
  const corner = (css: string): Bound => ({
    value: Math.min(num(el.style[`border-${css}-radius`]) + distance, pill),
  });
  return {
    type: 'FRAME',
    name: 'Focus ring',
    source: 'outline',
    absolute: { x: -distance, y: -distance, stretch: true },
    width: { value: el.rect.width + 2 * distance },
    height: { value: el.rect.height + 2 * distance },
    sizing: { horizontal: 'FIXED', vertical: 'FIXED' },
    opacity: 1,
    fills: [],
    stroke: {
      paint: paintOf(el, 'outline-color') ?? BLACK,
      top: stroke,
      right: stroke,
      bottom: stroke,
      left: stroke,
      dashed: false,
    },
    radius: {
      topLeft: corner('top-left'),
      topRight: corner('top-right'),
      bottomRight: corner('bottom-right'),
      bottomLeft: corner('bottom-left'),
    },
    clips: false,
    children: [],
  };
}

function boxOf(el: ElementFacts, ctx: Walk) {
  const widths = strokeWidths(el);
  const side = SIDES[widths.findIndex((width) => width > 0)];
  const strokeSide = (index: number): Bound => {
    const value = widths[index] ?? 0;
    return value === 0
      ? { value }
      : withToken(value, el.tokens[`border-${SIDES[index] ?? 'top'}-width`]);
  };
  // An image is drawn as a placeholder fill: the export carries no image files.
  const fill =
    el.tag === 'img'
      ? { color: { r: 0.9, g: 0.9, b: 0.9, a: 1 } }
      : hasFill(el)
        ? paintOf(el, 'background-color')
        : undefined;
  const shadowToken = el.tokens['box-shadow'];
  const effects = parseShadows(el.style['box-shadow'] ?? '');
  const style = shadowToken
    ? ctx.effectStyles.get(shadowToken)?.name
    : undefined;
  return {
    fills: fill ? [fill] : [],
    stroke: side
      ? {
          paint: paintOf(el, `border-${side}-color`) ?? {
            color: { r: 0, g: 0, b: 0, a: 0 },
          },
          top: strokeSide(0),
          right: strokeSide(1),
          bottom: strokeSide(2),
          left: strokeSide(3),
          dashed: el.style[`border-${side}-style`] === 'dashed',
        }
      : undefined,
    radius: Object.fromEntries(
      CORNERS.map(([key, css]) => [key, bound(el, `border-${css}-radius`)])
    ) as FrameLayer['radius'],
    shadow:
      effects.length > 0 ? { ...(style ? { style } : {}), effects } : undefined,
  };
}

/** Margins, and an in-flow translate, as padding around the layer. */
function offsetsOf(el: ElementFacts, ctx: Walk, name: string): Padding | null {
  const offsets: Padding = {
    top: bound(el, 'margin-top'),
    right: bound(el, 'margin-right'),
    bottom: bound(el, 'margin-bottom'),
    left: bound(el, 'margin-left'),
  };
  for (const side of SIDES) {
    if (offsets[side].value < 0) {
      ctx.notes.push(
        `${name}: Figma has no negative margin, so its ${offsets[side].value}px ${side} margin is left out.`
      );
      offsets[side] = zero();
    }
  }
  const { x, y } = translateOf(el);
  const shift = (
    side: 'left' | 'top',
    amount: number,
    token: string | undefined
  ) => {
    if (amount === 0) return;
    if (amount < 0) {
      ctx.notes.push(
        `${name}: the browser moves it ${amount}px; Figma keeps it in place.`
      );
      return;
    }
    const current = offsets[side];
    offsets[side] =
      current.value === 0 && token !== undefined
        ? { value: amount, token }
        : { value: current.value + amount };
  };
  shift('left', x, el.tokens['translate-x']);
  shift('top', y, el.tokens['translate-y']);
  return SIDES.some((side) => offsets[side].value !== 0) ? offsets : null;
}

const add = (a: Bound, b: Bound): Bound => {
  if (b.value === 0) return a;
  if (a.value === 0) return b;
  return { value: a.value + b.value };
};

/** `layer` with `offsets` around it: in its own padding when it draws nothing, otherwise in a wrapper. */
function withOffsets(layer: Layer, offsets: Padding): Layer {
  const fixed = (side: (typeof SIDES)[number]) =>
    side === 'top' || side === 'bottom'
      ? layer.sizing.vertical === 'FIXED'
      : layer.sizing.horizontal === 'FIXED';
  if (
    layer.type === 'FRAME' &&
    layer.layout !== undefined &&
    layer.fills.length === 0 &&
    layer.stroke === undefined &&
    layer.shadow === undefined &&
    SIDES.every((side) => offsets[side].value === 0 || !fixed(side))
  ) {
    const { padding } = layer.layout;
    for (const side of SIDES) padding[side] = add(padding[side], offsets[side]);
    layer.width = {
      value: layer.width.value + offsets.left.value + offsets.right.value,
    };
    layer.height = {
      value: layer.height.value + offsets.top.value + offsets.bottom.value,
    };
    return layer;
  }
  const wrapper: FrameLayer = {
    type: 'FRAME',
    name: layer.name,
    source: 'margin',
    layout: {
      mode: 'VERTICAL',
      wrap: false,
      gap: zero(),
      lineGap: zero(),
      padding: offsets,
      primaryAlign: 'MIN',
      counterAlign: 'MIN',
    },
    width: {
      value: layer.width.value + offsets.left.value + offsets.right.value,
    },
    height: {
      value: layer.height.value + offsets.top.value + offsets.bottom.value,
    },
    sizing: {
      horizontal: layer.sizing.horizontal === 'FILL' ? 'FILL' : 'HUG',
      vertical: layer.sizing.vertical === 'FILL' ? 'FILL' : 'HUG',
    },
    opacity: 1,
    fills: [],
    radius: {
      topLeft: zero(),
      topRight: zero(),
      bottomRight: zero(),
      bottomLeft: zero(),
    },
    clips: false,
    children: [{ ...layer, visibleProperty: undefined }],
  };
  if (layer.visibleProperty) wrapper.visibleProperty = layer.visibleProperty;
  return wrapper;
}

/** A child of an auto-layout frame, with its margins, or placed absolutely. */
function childLayer(
  child: ElementFacts | TextFacts,
  parent: Parent,
  ctx: Walk
): Layer | null {
  if (child.kind === 'text') {
    // The root's own text is its Label; text in a named part takes the part's name.
    const owner = parent.facts;
    const name =
      owner === ctx.root
        ? 'Label'
        : owner.slot
          ? layerName(owner, ctx)
          : 'Text';
    return textLayer(
      child,
      parent.facts,
      name,
      runSizing(child, parent),
      1,
      ctx
    );
  }
  if (!visible(child)) return null;
  const translated = translateOf(child);
  const moved = translated.x !== 0 || translated.y !== 0;
  if (isAbsolute(child) || (moved && parent.fixed)) {
    const layer = elementLayer(child, null, ctx, false);
    if (!layer) return null;
    layer.absolute = {
      x: child.rect.x - parent.facts.rect.x,
      y: child.rect.y - parent.facts.rect.y,
      stretch: false,
    };
    layer.sizing = { horizontal: 'FIXED', vertical: 'FIXED' };
    return layer;
  }
  const layer = elementLayer(child, parent, ctx, false);
  if (!layer) return null;
  const offsets = offsetsOf(child, ctx, layer.name);
  return offsets ? withOffsets(layer, offsets) : layer;
}

const isDeclaredFixed = (el: ElementFacts) =>
  isLength(el.declared['width']) && isLength(el.declared['height']);

/** The grid's columns, each the children whose box starts in it. Null when a child spans columns. */
function gridColumns(el: ElementFacts, kids: ElementFacts[]) {
  const used = (el.style['grid-template-columns'] ?? '').split(' ').map(num);
  const gap = num(el.style['column-gap']);
  const starts: number[] = [];
  let at = num(el.style['padding-left']) + num(el.style['border-left-width']);
  for (const track of used) {
    starts.push(at);
    at += track + gap;
  }
  const columns: ElementFacts[][] = used.map(() => []);
  for (const kid of kids) {
    const offset = kid.rect.x;
    let index = 0;
    starts.forEach((columnStart, i) => {
      if (
        Math.abs(columnStart - offset) < Math.abs((starts[index] ?? 0) - offset)
      )
        index = i;
    });
    if (kid.rect.width > (used[index] ?? 0) + 1) return null;
    columns[index]?.push(kid);
  }
  return columns;
}

function trackSizing(track: string): Sizing {
  if (track.includes('fr')) return 'FILL';
  return isLength(track) ? 'FIXED' : 'HUG';
}

/** Splits a track list on spaces outside parentheses. */
function tracksOf(list: string) {
  const tracks: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of list) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ' ' && depth === 0) {
      if (current) tracks.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  if (current) tracks.push(current);
  return tracks;
}

function frameChildren(
  el: ElementFacts,
  ctx: Walk
): { layout?: AutoLayout; children: Layer[] } {
  ctx.ancestors.push(el);
  try {
    return layoutChildren(el, ctx);
  } finally {
    ctx.ancestors.pop();
  }
}

function layoutChildren(
  el: ElementFacts,
  ctx: Walk
): { layout?: AutoLayout; children: Layer[] } {
  const kids = visibleKids(el);
  const display = el.style['display'] ?? 'block';
  const fixed = isDeclaredFixed(el);
  const base = {
    wrap: false,
    gap: zero(),
    lineGap: zero(),
    padding: padding(el),
    primaryAlign: 'MIN' as const,
    counterAlign: 'MIN' as const,
  };
  const build = (parent: Parent, items: (ElementFacts | TextFacts)[]) =>
    items
      .map((item) => childLayer(item, parent, ctx))
      .filter((layer): layer is Layer => layer !== null);

  if (el.input) {
    const showsValue = el.input.value !== '';
    // The placeholder draws in its own colour, from `::placeholder`.
    const owner: ElementFacts = {
      ...el,
      style: {
        ...el.style,
        color: showsValue
          ? (el.style['color'] ?? '')
          : el.input.placeholderColor,
      },
      tokens: { ...el.tokens },
    };
    const colorToken = showsValue
      ? el.tokens['color']
      : el.tokens['placeholder-color'];
    delete owner.tokens['color'];
    if (colorToken) owner.tokens['color'] = colorToken;
    const lineHeight = num(el.style['line-height']) || el.rect.height;
    const run: TextFacts = {
      kind: 'text',
      text: showsValue ? el.input.value : el.input.placeholder,
      rect: { x: 0, y: 0, width: el.rect.width, height: lineHeight },
      lines: 1,
    };
    const counter = el.tag === 'textarea' ? 'MIN' : 'CENTER';
    return {
      layout: { ...base, mode: 'HORIZONTAL', counterAlign: counter },
      children: [
        textLayer(
          run,
          owner,
          'Text',
          { horizontal: 'FILL', vertical: 'HUG' },
          1,
          ctx
        ),
      ],
    };
  }

  if (display.includes('flex')) {
    const direction = el.style['flex-direction'] ?? 'row';
    const mode = direction.startsWith('column') ? 'VERTICAL' : 'HORIZONTAL';
    if (direction.endsWith('reverse'))
      ctx.notes.push(
        `${layerName(el, ctx)}: ${direction} is drawn in source order.`
      );
    const layout: AutoLayout = {
      ...base,
      mode,
      wrap: el.style['flex-wrap'] === 'wrap',
      gap: bound(el, mode === 'HORIZONTAL' ? 'column-gap' : 'row-gap'),
      lineGap: bound(el, mode === 'HORIZONTAL' ? 'row-gap' : 'column-gap'),
      primaryAlign: JUSTIFY[el.style['justify-content'] ?? ''] ?? 'MIN',
      counterAlign: counterAlign(el.style['align-items'], mode),
    };
    const parent: Parent = {
      kind: 'flex',
      mode,
      alignItems: el.style['align-items'] ?? 'normal',
      fixed,
      facts: el,
    };
    return { layout, children: build(parent, kids) };
  }

  if (display.includes('grid')) {
    const elements = kids.filter(
      (kid): kid is ElementFacts => kid.kind === 'element'
    );
    const inFlow = elements.filter((kid) => !isAbsolute(kid));
    const tracks = tracksOf(el.declared['grid-template-columns'] ?? '');
    const columns = gridColumns(el, inFlow);
    const absolute = build(
      {
        kind: 'flex',
        mode: 'HORIZONTAL',
        alignItems: 'normal',
        fixed: true,
        facts: el,
      },
      elements.filter(isAbsolute)
    );
    if (
      !columns ||
      tracks.length !== columns.length ||
      kids.some((kid) => kid.kind === 'text')
    ) {
      ctx.notes.push(
        `${layerName(el, ctx)}: its grid can't be split into columns, so its children are placed absolutely.`
      );
      const placed = inFlow.flatMap((kid): Layer[] => {
        const layer = elementLayer(kid, null, ctx, false);
        if (!layer) return [];
        layer.absolute = {
          x: kid.rect.x - el.rect.x,
          y: kid.rect.y - el.rect.y,
          stretch: false,
        };
        layer.sizing = { horizontal: 'FIXED', vertical: 'FIXED' };
        return [layer];
      });
      return { children: [...placed, ...absolute] };
    }
    const alignItems = el.style['align-items'] ?? 'normal';
    const layout: AutoLayout = {
      ...base,
      mode: 'HORIZONTAL',
      gap: bound(el, 'column-gap'),
      counterAlign: counterAlign(alignItems, 'HORIZONTAL'),
    };
    if (columns.filter((column) => column.length > 1).length > 1) {
      ctx.notes.push(
        `${layerName(el, ctx)}: grid rows across columns are no longer aligned with each other.`
      );
    }
    const children = columns.flatMap((items, index): Layer[] => {
      const track = trackSizing(tracks[index] ?? 'auto');
      const row: Parent = {
        kind: 'row',
        mode: 'HORIZONTAL',
        alignItems,
        fixed,
        track,
        facts: el,
      };
      const [only] = items;
      if (items.length === 0 || !only) return [];
      if (items.length === 1) return build(row, [only]);
      const parent: Parent = {
        kind: 'column',
        mode: 'VERTICAL',
        alignItems: 'normal',
        fixed: false,
        facts: el,
      };
      const left = Math.min(...items.map((item) => item.rect.x));
      const top = Math.min(...items.map((item) => item.rect.y));
      const column: FrameLayer = {
        type: 'FRAME',
        name: 'Body',
        source: `grid column ${index + 1}`,
        layout: {
          mode: 'VERTICAL',
          wrap: false,
          gap: bound(el, 'row-gap'),
          lineGap: zero(),
          padding: { top: zero(), right: zero(), bottom: zero(), left: zero() },
          primaryAlign: 'MIN',
          counterAlign: 'MIN',
        },
        width: {
          value:
            Math.max(...items.map((item) => item.rect.x + item.rect.width)) -
            left,
        },
        height: {
          value:
            Math.max(...items.map((item) => item.rect.y + item.rect.height)) -
            top,
        },
        sizing: {
          horizontal: track,
          vertical: stretches(alignItems) ? 'FILL' : 'HUG',
        },
        opacity: 1,
        fills: [],
        radius: {
          topLeft: zero(),
          topRight: zero(),
          bottomRight: zero(),
          bottomLeft: zero(),
        },
        clips: false,
        children: build(parent, items),
      };
      return [column];
    });
    return { layout, children: [...children, ...absolute] };
  }

  if (kids.length === 0) return { children: [] };
  const parent: Parent = {
    kind: 'block',
    mode: 'VERTICAL',
    alignItems: 'stretch',
    fixed,
    facts: el,
  };
  return {
    layout: { ...base, mode: 'VERTICAL' },
    children: build(parent, kids),
  };
}

function elementLayer(
  el: ElementFacts,
  parent: Parent | null,
  ctx: Walk,
  isRoot: boolean
): Layer | null {
  if (!isRoot && !visible(el)) return null;
  const source =
    isRoot || el.slot === null ? undefined : ctx.instances.get(el.slot);
  if (source && parent) {
    const instance = instanceLayer(el, source, parent, ctx);
    if (instance) return instance;
  }
  if (el.svg !== undefined) return svgLayer(el, el, ctx);
  const kids = visibleKids(el);
  const [only] = kids;
  if (!isRoot && only && kids.length === 1 && isPlain(el) && !el.input) {
    // A box with a declared size, such as AlertClose's 32px button, keeps its frame.
    const sized =
      isLength(el.declared['width']) || isLength(el.declared['height']);
    if (only.kind === 'text' && parent && !sized) {
      const named =
        (el.slot ? ctx.textNames[el.slot] : undefined) ?? layerName(el, ctx);
      const layer = textLayer(
        only,
        el,
        named === 'Frame' ? 'Text' : named,
        sizingOf(el, parent, true),
        num(el.style['opacity'] ?? '1'),
        ctx
      );
      if (el.part) layer.visibleProperty = el.part;
      return layer;
    }
    const sameBox =
      only.kind === 'element' &&
      Math.abs(only.rect.width - el.rect.width) < 0.5 &&
      Math.abs(only.rect.height - el.rect.height) < 0.5;
    if (only.kind === 'element' && only.svg !== undefined && sameBox)
      return svgLayer(only, el, ctx);
  }
  const { layout, children } = frameChildren(el, ctx);
  const inFlow = children.some((child) => !child.absolute);
  const frame: FrameLayer = {
    type: 'FRAME',
    name: layerName(el, ctx),
    source: `${el.tag}${el.slot ? `[data-slot=${el.slot}]` : ''}`,
    width: size(el, 'width'),
    height: size(el, 'height'),
    sizing: sizingOf(el, parent, layout !== undefined && inFlow),
    opacity: num(el.style['opacity'] ?? '1'),
    ...boxOf(el, ctx),
    clips:
      el.style['overflow-x'] === 'hidden' || el.style['overflow-x'] === 'clip',
    children,
  };
  if (layout) frame.layout = layout;
  if (hasOutline(el)) frame.children.push(focusRing(el));
  if (el.part) frame.visibleProperty = el.part;
  return frame;
}

/** A component whose root is an SVG, such as Spinner: a frame its size holding the icon or vectors. */
function svgRoot(svg: ElementFacts, ctx: Walk): FrameLayer {
  const layer = svgLayer(svg, svg, ctx);
  return {
    type: 'FRAME',
    name: ctx.component,
    source: `svg${svg.slot ? `[data-slot=${svg.slot}]` : ''}`,
    width: layer.width,
    height: layer.height,
    sizing: { horizontal: 'FIXED', vertical: 'FIXED' },
    opacity: 1,
    fills: [],
    radius: {
      topLeft: zero(),
      topRight: zero(),
      bottomRight: zero(),
      bottomLeft: zero(),
    },
    clips: false,
    layout: {
      mode: 'HORIZONTAL',
      wrap: false,
      gap: zero(),
      lineGap: zero(),
      padding: { top: zero(), right: zero(), bottom: zero(), left: zero() },
      primaryAlign: 'CENTER',
      counterAlign: 'CENTER',
    },
    children: [
      {
        ...layer,
        width: { value: layer.width.value },
        height: { value: layer.height.value },
        sizing: { horizontal: 'FILL', vertical: 'FILL' },
      },
    ],
  };
}

/** The variant's root frame, which the plugin turns into a component. */
export function convertVariant(
  recorded: Recorded,
  ctx: ConvertContext
): FrameLayer {
  if (recorded.rootScale !== 'none' && recorded.rootScale !== '1') {
    ctx.notes.push(
      `The browser shrinks it to scale ${recorded.rootScale}. Figma can't scale a variant, so it keeps its full size.`
    );
  }
  const walk: Walk = {
    ...ctx,
    root: recorded.tree,
    ancestors: [],
    names: new Map(),
  };
  const root =
    recorded.tree.svg === undefined
      ? elementLayer(recorded.tree, null, walk, true)
      : svgRoot(recorded.tree, walk);
  if (root?.type !== 'FRAME')
    throw new Error(`${ctx.component}: the root didn't record as a frame.`);
  // A repeated part repeats its note.
  const notes = [...new Set(ctx.notes)];
  ctx.notes.splice(0, ctx.notes.length, ...notes);
  return root;
}
