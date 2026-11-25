// capture.json: what `nxds-cli export figma` recorded, already in Figma's
// terms, and the build report the plugin sends back. The CLI decides every
// layer, size and binding; the plugin only creates what this file says.

export const CAPTURE_FORMAT = 'nxds-figma-capture';
export const REPORT_FORMAT = 'nxds-figma-report';
/** The version of capture.json, the report and the plugin's tags, which the plugin stamps on the Figma file. The plugin refuses a capture or a Figma file of another version. The CLI refuses a report of another version. */
export const PROTOCOL_VERSION = 8;

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
  /** A declared minimum size, such as a Button's `min-h-10`. */
  minWidth?: Bound;
  minHeight?: Bound;
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
  /** The slot component property this frame is, which holds what the part's `children` were. */
  slotProperty?: string;
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
    size: Bound;
    /** Undefined for `normal`. */
    lineHeight?: Bound;
    letterSpacing: Bound;
  };
  fill: Paint;
  textCase: 'ORIGINAL' | 'UPPER';
  underline: boolean;
  align: 'LEFT' | 'CENTER' | 'RIGHT';
  /** WIDTH_AND_HEIGHT for one line that sizes itself, HEIGHT for text that wraps. */
  autoResize: 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'NONE';
}

/** An SVG that isn't an icon, such as a chart, imported as vectors. Each shape's colour that came from a token is bound to it. */
export interface VectorLayer extends LayerBase {
  type: 'SVG';
  svg: string;
  /** Tokens by the `#rrggbb` colour they drew in this SVG. */
  colors: Record<string, string>;
}

/** An instance of an icon from the icon set, recoloured to the colour it drew in. */
export interface IconLayer extends LayerBase {
  type: 'ICON';
  icon: string;
  fill: Paint;
  /** The instance-swap component property that picks this icon. */
  swapProperty?: string;
}

/** An instance of another component this file builds, such as a Button inside an Alert. */
export interface InstanceLayer extends LayerBase {
  type: 'INSTANCE';
  component: string;
  /** Its variant, by variant property name. */
  variant: Record<string, string>;
  /** Text property overrides, by property name. */
  texts: Record<string, string>;
  /** Boolean property overrides, by property name. */
  booleans: Record<string, boolean>;
  /** Instance-swap overrides, by property name: the icon each shows. */
  swaps: Record<string, string>;
  /** Its fill, stroke and corners when what holds it restyles it, such as a ButtonGroup squaring its buttons' inner corners. */
  restyle?: Pick<FrameLayer, 'fills' | 'stroke' | 'radius'>;
  /** What goes in its slot, when its component has one: the element's own children. */
  slotContent?: Layer[];
}

export type Layer =
  | FrameLayer
  | TextLayer
  | VectorLayer
  | IconLayer
  | InstanceLayer;

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

/** How a component set lays out its variants, by variant property name. Each property is in exactly one list. */
export interface GridSpec {
  /** Each combination is a titled block, stacked down the page. */
  blocks: string[];
  /** Each combination is a labelled row in every block. */
  rows: string[];
  /** Each combination is a labelled column in every block. */
  columns: string[];
}

export interface ComponentSpec {
  name: string;
  /** The card it belongs to, such as `Tabs` for Tab. Each card gets its own Figma page. */
  card: string;
  variantProperties: { name: string; values: string[] }[];
  grid: GridSpec;
  booleanProperties: { name: string; default: boolean }[];
  textProperties: { name: string; default: string }[];
  /** Instance-swap properties, with the icon each shows by default. */
  swapProperties: { name: string; default: string }[];
  /** Slot properties, each filled with its variant's captured content by default. */
  slotProperties: { name: string }[];
  variants: VariantSpec[];
}

export interface VariableSpec {
  token: string;
  name: string;
  type: 'COLOR' | 'FLOAT';
  light: Rgba | number;
  /** Set for colours that differ in the dark theme. */
  dark?: Rgba | number;
  /** The token this one is declared as a reference to, in light and in dark, which Figma makes an alias. */
  lightAlias?: string;
  darkAlias?: string;
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
  /** The typography tokens its class declares, by the text field each sets. */
  variables: { fontSize?: string; lineHeight?: string; letterSpacing?: string };
}

export interface EffectStyleSpec {
  name: string;
  token: string;
  effects: Shadow[];
}

export interface IconSpec {
  /** The name `Nxds.Icon` takes, such as `plus` or `check-circle-fill`. */
  name: string;
  svg: string;
}

export interface CaptureFile {
  format: typeof CAPTURE_FORMAT;
  version: typeof PROTOCOL_VERSION;
  /** True when it holds only some components, so the plugin leaves every other part of the file alone. */
  partial: boolean;
  /** The nxds release the app's components came from. */
  nxds: { version: string };
  collections: CollectionSpec[];
  textStyles: TextStyleSpec[];
  effectStyles: EffectStyleSpec[];
  /** The icon set; its components take the colour token `iconColor`. */
  icons: IconSpec[];
  iconColor: string;
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
  version: typeof PROTOCOL_VERSION;
  /** What the run created, or updated when the file already had it. An unchanged icon isn't counted. */
  written: {
    pages: number;
    collections: number;
    variables: number;
    textStyles: number;
    effectStyles: number;
    icons: number;
    componentSets: number;
    components: number;
    instances: number;
  };
  /** What a full run deleted because the capture no longer has it, such as `page Kbd`. */
  removed: string[];
  /** The modes the themed collection ended with. */
  modes: string[];
  /** Figma's exact message when it refused the Dark mode. */
  darkModeError?: string;
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
 * sizes, padding, gaps, radii, stroke widths, shadows and type. Zero and
 * fully transparent values are left out, since there is nothing to bind.
 */
function variantUnbound(component: string, variant: VariantSpec) {
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
    if (value.token === undefined && value.value !== 0)
      add(path, property, `${value.value}px`);
  };
  const paint = (path: string[], property: string, value: Paint) => {
    if (value.token === undefined && value.color.a > 0)
      add(path, property, css(value.color));
  };
  const visit = (layer: Layer, parent: string[]) => {
    const path = [...parent, layer.name];
    // An instance takes its size from its component, which reports its own,
    // and a layer drawn at opacity 0, such as an unchecked tick, shows no value.
    if (layer.opacity === 0) return;
    if (layer.type === 'INSTANCE') {
      for (const child of layer.slotContent ?? []) visit(child, path);
      return;
    }
    // A stretched layer, such as a focus ring, takes its size from its parent.
    if (!layer.absolute?.stretch) {
      if (layer.sizing.horizontal === 'FIXED')
        bound(path, 'width', layer.width);
      if (layer.sizing.vertical === 'FIXED')
        bound(path, 'height', layer.height);
    }
    if (layer.minWidth) bound(path, 'min width', layer.minWidth);
    if (layer.minHeight) bound(path, 'min height', layer.minHeight);
    if (layer.type === 'TEXT') {
      paint(path, 'text colour', layer.fill);
      if (!layer.style) {
        bound(path, 'font size', layer.font.size);
        if (layer.font.lineHeight)
          bound(path, 'line height', layer.font.lineHeight);
        bound(path, 'letter spacing', layer.font.letterSpacing);
      }
    }
    if (layer.type === 'ICON') paint(path, 'icon colour', layer.fill);
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
    if (layer.shadow && !layer.shadow.style)
      add(path, 'shadow', `${layer.shadow.effects.length} shadow(s)`);
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

/** Every value in the capture's variants that isn't bound to a variable or style. */
export function unboundValues(capture: CaptureFile) {
  return capture.components.flatMap((component) =>
    component.variants.flatMap((variant) =>
      variantUnbound(component.name, variant)
    )
  );
}
