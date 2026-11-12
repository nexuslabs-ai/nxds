// capture.json: what `nxds-cli export figma` recorded, already in Figma's
// terms, and the build report the plugin sends back. The CLI decides every
// layer, size and binding; the plugin only creates what this file says.

export const CAPTURE_FORMAT = 'nxds-figma-capture';
export const REPORT_FORMAT = 'nxds-figma-report';

/** sRGB, each channel 0–1. */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** A value, and the nxds token it was declared with when it was one. */
export interface Bound {
  value: number;
  token?: string;
}

export interface Paint {
  color: Rgba;
  token?: string;
}

export interface Shadow {
  type: 'DROP_SHADOW' | 'INNER_SHADOW';
  color: Rgba;
  x: number;
  y: number;
  blur: number;
  spread: number;
}

export type Sizing = 'FIXED' | 'HUG' | 'FILL';

interface LayerBase {
  name: string;
  /** The element it came from, such as `button[data-slot=button]`. */
  source: string;
  width: Bound;
  height: Bound;
  sizing: { horizontal: Sizing; vertical: Sizing };
  /** Placed over its parent at x, y instead of in its auto layout. `stretch` keeps it on all four edges when the parent resizes. */
  absolute?: { x: number; y: number; stretch: boolean };
  opacity: number;
  /** The boolean component property that shows or hides this layer. */
  visibleProperty?: string;
}

export interface Padding {
  top: Bound;
  right: Bound;
  bottom: Bound;
  left: Bound;
}

export interface AutoLayout {
  mode: 'HORIZONTAL' | 'VERTICAL';
  wrap: boolean;
  gap: Bound;
  /** The gap between wrapped lines. */
  lineGap: Bound;
  padding: Padding;
  primaryAlign: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAlign: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
}

export interface FrameLayer extends LayerBase {
  type: 'FRAME';
  layout?: AutoLayout;
  fills: Paint[];
  stroke?: {
    paint: Paint;
    top: Bound;
    right: Bound;
    bottom: Bound;
    left: Bound;
    dashed: boolean;
  };
  radius: {
    topLeft: Bound;
    topRight: Bound;
    bottomRight: Bound;
    bottomLeft: Bound;
  };
  /** `style` names the effect style a shadow token became. */
  shadow?: { style?: string; effects: Shadow[] };
  clips: boolean;
  children: Layer[];
}

export interface TextLayer extends LayerBase {
  type: 'TEXT';
  characters: string;
  /** The text component property this layer's characters come from. */
  textProperty?: string;
  /** The text style it uses, such as `label/default`. */
  style?: string;
  font: {
    family: string;
    weight: number;
    size: number;
    /** Undefined for `normal`. */
    lineHeight?: number;
    letterSpacing: number;
  };
  fill: Paint;
  textCase: 'ORIGINAL' | 'UPPER';
  underline: boolean;
  align: 'LEFT' | 'CENTER' | 'RIGHT';
  /** WIDTH_AND_HEIGHT for one line that sizes itself, HEIGHT for text that wraps. */
  autoResize: 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'NONE';
}

/** An icon or other SVG, imported as vectors. `fill` is the colour `currentColor` drew. */
export interface VectorLayer extends LayerBase {
  type: 'SVG';
  svg: string;
  fill?: Paint;
}

/** An instance of another component this file builds, such as a Button inside an Alert. */
export interface InstanceLayer extends LayerBase {
  type: 'INSTANCE';
  component: string;
  /** Its variant, by variant property name. */
  variant: Record<string, string>;
  /** Text property overrides, by property name. */
  texts: Record<string, string>;
}

export type Layer = FrameLayer | TextLayer | VectorLayer | InstanceLayer;

export interface VariantSpec {
  /** By variant property name. */
  values: Record<string, string>;
  /** Figma's variant name: `Variant=default, Size=sm`. */
  name: string;
  /** The browser screenshot to compare against, relative to capture.json. */
  screenshot: string;
  root: FrameLayer;
  /** Where Figma can't match the browser, in words. */
  notes: string[];
}

export interface ComponentSpec {
  name: string;
  variantProperties: { name: string; values: string[] }[];
  booleanProperties: { name: string; default: boolean }[];
  textProperties: { name: string; default: string }[];
  variants: VariantSpec[];
}

export interface VariableSpec {
  token: string;
  name: string;
  type: 'COLOR' | 'FLOAT';
  light: Rgba | number;
  /** Set for colours that differ in the dark theme. */
  dark?: Rgba | number;
  description: string;
}

export interface CollectionSpec {
  name: string;
  /** True for the collection that gets a Dark mode when Figma allows one. */
  themed: boolean;
  variables: VariableSpec[];
}

export interface TextStyleSpec {
  name: string;
  token: string;
  family: string;
  weight: number;
  size: number;
  lineHeight?: number;
  letterSpacing: number;
  description: string;
}

export interface EffectStyleSpec {
  name: string;
  token: string;
  effects: Shadow[];
  description: string;
}

export interface CaptureFile {
  format: typeof CAPTURE_FORMAT;
  version: 1;
  nxds: { release: string; theme: Record<string, string> };
  collections: CollectionSpec[];
  textStyles: TextStyleSpec[];
  effectStyles: EffectStyleSpec[];
  /** In build order: a component comes after every component it holds an instance of. */
  components: ComponentSpec[];
}

/** A value a layer uses that isn't bound to a variable or style. */
export interface UnboundValue {
  component: string;
  variant: string;
  /** Layer names from the variant's root, joined with ` / `. */
  layer: string;
  property: string;
  value: string;
}

export interface BuildReport {
  format: typeof REPORT_FORMAT;
  version: 1;
  created: {
    collections: number;
    variables: number;
    textStyles: number;
    effectStyles: number;
    componentSets: number;
    components: number;
    instances: number;
  };
  /** The modes the themed collection ended with. */
  modes: string[];
  /** Figma's exact message when it refused the Dark mode. */
  darkModeError?: string;
  unbound: UnboundValue[];
  fonts: { requested: string; used: string }[];
  failures: { where: string; message: string }[];
}

/** Figma's name for a variant: each property and value, in property order. */
export function variantName(
  properties: readonly { name: string }[],
  values: Record<string, string>
) {
  return properties.map(({ name }) => `${name}=${values[name]}`).join(', ');
}

const css = ({ r, g, b, a }: Rgba) =>
  `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${Number(a.toFixed(3))})`;

/**
 * Every value in a variant that isn't bound to a variable or style: colours,
 * sizes, padding, gaps, radii, stroke widths, shadows and text without a
 * text style. Zero and fully transparent values are left out, since there is
 * nothing to bind.
 */
export function unboundValues(component: string, variant: VariantSpec) {
  const found: UnboundValue[] = [];
  const add = (path: string[], property: string, value: string) =>
    found.push({
      component,
      variant: variant.name,
      layer: path.join(' / '),
      property,
      value,
    });
  const bound = (path: string[], property: string, value: Bound) => {
    if (value.token === undefined && value.value !== 0) {
      add(path, property, `${value.value}px`);
    }
  };
  const paint = (path: string[], property: string, value: Paint) => {
    if (value.token === undefined && value.color.a > 0) {
      add(path, property, css(value.color));
    }
  };
  const visit = (layer: Layer, parent: string[]) => {
    const path = [...parent, layer.name];
    // An instance takes its size from its component, which reports its own.
    if (layer.type === 'INSTANCE') return;
    // A stretched layer, such as a focus ring, takes its size from its parent.
    if (!layer.absolute?.stretch) {
      if (layer.sizing.horizontal === 'FIXED')
        bound(path, 'width', layer.width);
      if (layer.sizing.vertical === 'FIXED')
        bound(path, 'height', layer.height);
    }
    if (layer.type === 'TEXT') {
      paint(path, 'text colour', layer.fill);
      if (!layer.style) {
        add(path, 'text style', `${layer.font.size}px ${layer.font.weight}`);
      }
    }
    if (layer.type === 'SVG' && layer.fill)
      paint(path, 'icon colour', layer.fill);
    if (layer.type !== 'FRAME') return;
    for (const fill of layer.fills) paint(path, 'fill', fill);
    if (layer.stroke) {
      paint(path, 'stroke', layer.stroke.paint);
      for (const side of ['top', 'right', 'bottom', 'left'] as const) {
        bound(path, `stroke ${side}`, layer.stroke[side]);
      }
    }
    for (const corner of [
      'topLeft',
      'topRight',
      'bottomRight',
      'bottomLeft',
    ] as const) {
      bound(path, `radius ${corner}`, layer.radius[corner]);
    }
    if (layer.shadow && !layer.shadow.style) {
      add(path, 'shadow', `${layer.shadow.effects.length} shadow(s)`);
    }
    if (layer.layout) {
      bound(path, 'gap', layer.layout.gap);
      if (layer.layout.wrap) bound(path, 'line gap', layer.layout.lineGap);
      for (const side of ['top', 'right', 'bottom', 'left'] as const) {
        bound(path, `padding ${side}`, layer.layout.padding[side]);
      }
    }
    for (const child of layer.children) visit(child, path);
  };
  visit(variant.root, []);
  return found;
}
