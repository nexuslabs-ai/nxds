// The plugin's main thread. It builds exactly what capture.json says:
// variables, text and shadow styles, the icon set on an Icons page, then one
// component set per component on its card's page. Every value that carries
// a token is bound to its variable. It makes no layout decisions of its own.
//
// It tags everything it makes with what it stands for, such as its token, so
// running it again in the same file updates that file in place: variables,
// styles and icons, and each captured component redrawn inside the component
// it built before, so every instance of it follows.
import {
  type Bound,
  type BuildReport,
  CAPTURE_FORMAT,
  type CaptureFile,
  type ComponentSpec,
  type FrameLayer,
  type IconLayer,
  type IconSpec,
  type InstanceLayer,
  type Layer,
  type Paint as SpecPaint,
  PROTOCOL_VERSION,
  REPORT_FORMAT,
  type Rgba,
  type Shadow,
  type Sizing,
  type TextLayer,
  type VariantSpec,
  type VectorLayer,
} from '../../src/spec.ts';

type Container = FrameNode | ComponentNode | SlotNode;

/** A frame's layout and border numbers, each set with `setNumber`. */
const NUMBER_FIELDS = [
  'itemSpacing',
  'counterAxisSpacing',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'topLeftRadius',
  'topRightRadius',
  'bottomRightRadius',
  'bottomLeftRadius',
  'strokeTopWeight',
  'strokeRightWeight',
  'strokeBottomWeight',
  'strokeLeftWeight',
] as const satisfies readonly VariableBindableNodeField[];

type NumberField = (typeof NUMBER_FIELDS)[number];

/** The fields a variant's frame binds, which are unbound before it's drawn again. */
const FRAME_BINDINGS: readonly VariableBindableNodeField[] = [
  'width',
  'height',
  'minWidth',
  'minHeight',
  ...NUMBER_FIELDS,
];

interface Context {
  report: BuildReport;
  variables: Map<string, Variable>;
  textStyles: Map<string, TextStyle>;
  effectStyles: Map<string, EffectStyle>;
  /** Icon components, by icon name. */
  icons: Map<string, ComponentNode>;
  /** Built components, by name, for the instances later components hold. */
  components: Map<string, ComponentSetNode | ComponentNode>;
  font(family: string, weight: number): Promise<FontName>;
  /** The layers that carry a component property, in the component being built. */
  references: {
    node: SceneNode;
    visible?: string;
    characters?: string;
    swap?: string;
    slot?: string;
  }[];
  /** What is being built, for the report. */
  where: string;
}

const SET_PADDING = 32;
const SET_GAP = 24;
/** Between one block of a component set and the next block's title. */
const BLOCK_GAP = 64;
/** Between a label and what it labels. */
const LABEL_GAP = 16;
/** The text the plugin labels components with: a component's name, a block's title and a row or column. */
const TEXT = {
  heading: { size: 24, style: 'Semi Bold' },
  title: { size: 16, style: 'Semi Bold' },
  label: { size: 12, style: 'Regular' },
} as const;
const LABEL_COLOR: RGB = { r: 0.4, g: 0.4, b: 0.4 };
/** The paper each component sits on, so it reads on Figma's dark canvas. */
const PAPER: SolidPaint = { type: 'SOLID', color: { r: 1, g: 1, b: 1 } };
const PAPER_RADIUS = 16;
const COMPONENT_GAP = 160;
/** Component sets wrap to a new row past this width on the page. */
const PAGE_WIDTH = 6000;
/** Plugin data key marking what the plugin made, and what it stands for, so a later run finds it. */
const TAG = 'nxds';
/** Plugin data key holding the id of the node a tag was set on. */
const TAGGED_ID = 'nxds-id';
/** Plugin data key on the file holding the PROTOCOL_VERSION it was built at. */
const FILE_VERSION = 'nxds-version';
const ICON_SIZE = 24;
const ICONS_PER_ROW = 24;
/** How many variants are built between progress updates. */
const PROGRESS_EVERY = 24;

const STYLE_NAMES: Record<number, string[]> = {
  100: ['Thin', 'Hairline'],
  200: ['ExtraLight', 'Extra Light', 'UltraLight'],
  300: ['Light'],
  400: ['Regular', 'Normal', 'Book', 'Roman'],
  500: ['Medium'],
  600: ['SemiBold', 'Semi Bold', 'Semibold', 'DemiBold', 'Demi Bold'],
  700: ['Bold'],
  800: ['ExtraBold', 'Extra Bold', 'UltraBold'],
  900: ['Black', 'Heavy'],
};

type Taggable = PluginDataMixin & { readonly id: string };

function tag(item: Taggable, value: string) {
  item.setPluginData(TAG, value);
  item.setPluginData(TAGGED_ID, item.id);
}
/** `item`'s tag. Figma copies plugin data to a duplicate, so a tag set on another id isn't this item's. */
const tagOf = (item: Taggable) =>
  item.getPluginData(TAGGED_ID) === item.id ? item.getPluginData(TAG) : '';
const pageTagged = (value: string) =>
  figma.root.children.find((page) => tagOf(page) === value);
/** The tags on a component's component set or component, on the paper frame it sits on, and on its card's page. */
const componentTag = (name: string) => `component:${name}`;
const paperTag = (name: string) => `paper:${name}`;
const cardTag = (card: string) => `card:${card}`;
/** The name in `item`'s tag when it's one of the tags above, such as `Button` in `component:Button`. */
function taggedName(item: Taggable, kind: 'component' | 'paper' | 'card') {
  const value = tagOf(item);
  const prefix = `${kind}:`;
  return value.startsWith(prefix) ? value.slice(prefix.length) : undefined;
}

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** Records each failure once. A redrawn variant's root is drawn twice, so its failures would come twice. */
function fail(ctx: Context, what: string, error: unknown) {
  const where = what ? `${ctx.where} / ${what}` : ctx.where;
  const message = messageOf(error);
  const { failures } = ctx.report;
  if (failures.some((each) => each.where === where && each.message === message))
    return;
  failures.push({ where, message });
}

async function progress(text: string) {
  figma.ui.postMessage({ type: 'progress', text });
  // Lets the UI repaint between steps.
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/** Each font family Figma has, with its style names. */
async function availableFonts() {
  const families = new Map<string, Set<string>>();
  for (const { fontName } of await figma.listAvailableFontsAsync()) {
    const styles = families.get(fontName.family) ?? new Set<string>();
    styles.add(fontName.style);
    families.set(fontName.family, styles);
  }
  return families;
}

/** `family` at the named style nearest `weight`, when Figma has one. */
function pick(
  families: ReadonlyMap<string, ReadonlySet<string>>,
  family: string,
  weight: number
): FontName | undefined {
  const styles = families.get(family);
  const rounded = Math.min(900, Math.max(100, Math.round(weight / 100) * 100));
  const style = styles
    ? (STYLE_NAMES[rounded] ?? ['Regular']).find((name) => styles.has(name))
    : undefined;
  return style ? { family, style } : undefined;
}

/** Loads the closest font Figma has: the family at the nearest named weight, or Inter. Records every replacement. Lists Figma's fonts on first use. */
function fontLoader(report: BuildReport) {
  let available: Promise<Map<string, Set<string>>> | undefined;
  const loaded = new Map<string, FontName>();
  return async (family: string, weight: number) => {
    const key = `${family} ${weight}`;
    const cached = loaded.get(key);
    if (cached) return cached;
    available ??= availableFonts();
    const families = await available;
    // Fontsource names a variable font "Inter Variable"; Figma lists the same typeface as "Inter".
    const exact =
      pick(families, family, weight) ??
      pick(families, family.replace(/ Variable$/, ''), weight);
    const font = exact ??
      pick(families, 'Inter', weight) ?? { family: 'Inter', style: 'Regular' };
    if (!exact)
      report.fonts.push({
        requested: key,
        used: `${font.family} ${font.style}`,
      });
    await figma.loadFontAsync(font);
    loaded.set(key, font);
    return font;
  };
}

const variableValue = (value: Rgba | number): VariableValue =>
  typeof value === 'number'
    ? value
    : { r: value.r, g: value.g, b: value.b, a: value.a };

function newCollection(name: string) {
  const collection = figma.variables.createVariableCollection(name);
  tag(collection, `collection:${name}`);
  return collection;
}

/** Deletes each item whose tag `keep` doesn't have, and reports it. */
function removeLeftovers(
  items: readonly (Taggable & { name: string; remove(): void })[],
  keep: ReadonlySet<string>,
  kind: string,
  ctx: Context
) {
  for (const item of items) {
    if (keep.has(tagOf(item))) continue;
    ctx.report.removed.push(`${kind} ${item.name}`);
    item.remove();
  }
}

/** Updates the file's nxds variables, found by token, and creates the ones it lacks. A variable keeps its bindings when someone renames it. */
async function writeVariables(capture: CaptureFile, ctx: Context) {
  const collections = (
    await figma.variables.getLocalVariableCollectionsAsync()
  ).filter((collection) => tagOf(collection).startsWith('collection:'));
  const variables = (await figma.variables.getLocalVariablesAsync()).filter(
    (variable) => tagOf(variable).startsWith('variable:')
  );
  const references: { variable: Variable; mode: string; token: string }[] = [];
  const specs = capture.collections.filter((spec) => spec.variables.length > 0);
  for (const spec of specs) {
    ctx.where = `collection ${spec.name}`;
    const collection =
      collections.find((each) => tagOf(each) === `collection:${spec.name}`) ??
      newCollection(spec.name);
    collection.name = spec.name;
    ctx.report.written.collections += 1;
    const first = collection.modes[0];
    if (!first) throw new Error(`${spec.name} has no mode.`);
    collection.renameMode(first.modeId, spec.themed ? 'Light' : 'Value');
    let dark = spec.themed
      ? collection.modes.find((mode) => mode.name === 'Dark')?.modeId
      : undefined;
    if (spec.themed) {
      if (dark === undefined) {
        try {
          dark = collection.addMode('Dark');
        } catch (error) {
          ctx.report.darkModeError = messageOf(error);
        }
      }
      ctx.report.modes = collection.modes.map((mode) => mode.name);
    }
    const known = new Map(
      variables
        .filter((variable) => variable.variableCollectionId === collection.id)
        .map((variable) => [tagOf(variable), variable])
    );
    for (const entry of spec.variables) {
      const key = `variable:${entry.token}`;
      try {
        const found = known.get(key);
        if (found && found.resolvedType !== entry.type) {
          found.remove();
          known.delete(key);
        }
        const variable =
          found?.resolvedType === entry.type
            ? found
            : figma.variables.createVariable(
                entry.name,
                collection,
                entry.type
              );
        tag(variable, key);
        variable.name = entry.name;
        variable.description = entry.description;
        variable.setVariableCodeSyntax('WEB', `var(--${entry.token})`);
        variable.setValueForMode(first.modeId, variableValue(entry.light));
        if (dark !== undefined)
          variable.setValueForMode(
            dark,
            variableValue(entry.dark ?? entry.light)
          );
        ctx.variables.set(entry.token, variable);
        ctx.report.written.variables += 1;
        if (entry.lightAlias)
          references.push({
            variable,
            mode: first.modeId,
            token: entry.lightAlias,
          });
        const darkAlias = entry.darkAlias ?? entry.lightAlias;
        if (dark !== undefined && darkAlias)
          references.push({ variable, mode: dark, token: darkAlias });
      } catch (error) {
        fail(ctx, entry.name, error);
      }
    }
    if (!capture.partial)
      removeLeftovers(
        [...known.values()],
        new Set(spec.variables.map((entry) => `variable:${entry.token}`)),
        'variable',
        ctx
      );
  }
  // A variable declared as a reference to another, such as a colour an app's
  // colours file sets to var(--nx-color-blue-600), aliases it. Every variable
  // exists by now, so a reference can cross collections.
  ctx.where = 'aliases';
  for (const { variable, mode, token } of references) {
    const target = variableFor(token, ctx, `${variable.name} alias`);
    if (!target) continue;
    try {
      variable.setValueForMode(
        mode,
        figma.variables.createVariableAlias(target)
      );
    } catch (error) {
      fail(ctx, `${variable.name} alias`, error);
    }
  }
  if (!capture.partial)
    removeLeftovers(
      collections,
      new Set(specs.map((spec) => `collection:${spec.name}`)),
      'collection',
      ctx
    );
}

function effect(shadow: Shadow): Effect {
  const base = {
    color: {
      r: shadow.color.r,
      g: shadow.color.g,
      b: shadow.color.b,
      a: shadow.color.a,
    },
    offset: { x: shadow.x, y: shadow.y },
    radius: shadow.blur,
    spread: shadow.spread,
    visible: true,
    blendMode: 'NORMAL' as const,
  };
  return shadow.type === 'DROP_SHADOW'
    ? { ...base, type: 'DROP_SHADOW' }
    : { ...base, type: 'INNER_SHADOW' };
}

function variableFor(token: string | undefined, ctx: Context, what: string) {
  if (token === undefined) return undefined;
  const variable = ctx.variables.get(token);
  if (!variable) fail(ctx, what, new Error(`No variable for --${token}.`));
  return variable;
}

const styleTag = (token: string) => `style:${token}`;

function newTextStyle(token: string) {
  const style = figma.createTextStyle();
  tag(style, styleTag(token));
  return style;
}

function newEffectStyle(token: string) {
  const style = figma.createEffectStyle();
  tag(style, styleTag(token));
  return style;
}

/** Updates the file's nxds text and shadow styles, found by token, and creates the ones it lacks. */
async function writeStyles(capture: CaptureFile, ctx: Context) {
  ctx.where = 'text styles';
  const textStyles = (await figma.getLocalTextStylesAsync()).filter((style) =>
    tagOf(style).startsWith('style:')
  );
  for (const spec of capture.textStyles) {
    try {
      const style =
        textStyles.find((each) => tagOf(each) === styleTag(spec.token)) ??
        newTextStyle(spec.token);
      style.name = spec.name;
      style.description = spec.description;
      style.fontName = await ctx.font(spec.family, spec.weight);
      style.fontSize = spec.size;
      style.lineHeight =
        spec.lineHeight === undefined
          ? { unit: 'AUTO' }
          : { unit: 'PIXELS', value: spec.lineHeight };
      style.letterSpacing = { unit: 'PIXELS', value: spec.letterSpacing };
      for (const field of [
        'fontSize',
        'lineHeight',
        'letterSpacing',
      ] as const) {
        const variable = variableFor(
          spec.variables[field],
          ctx,
          `${spec.name} ${field}`
        );
        style.setBoundVariable(field, variable ?? null);
      }
      ctx.textStyles.set(spec.name, style);
      ctx.report.written.textStyles += 1;
    } catch (error) {
      fail(ctx, spec.name, error);
    }
  }
  ctx.where = 'shadow styles';
  const effectStyles = (await figma.getLocalEffectStylesAsync()).filter(
    (style) => tagOf(style).startsWith('style:')
  );
  for (const spec of capture.effectStyles) {
    try {
      const style =
        effectStyles.find((each) => tagOf(each) === styleTag(spec.token)) ??
        newEffectStyle(spec.token);
      style.name = spec.name;
      style.description = spec.description;
      style.effects = spec.effects.map(effect);
      ctx.effectStyles.set(spec.name, style);
      ctx.report.written.effectStyles += 1;
    } catch (error) {
      fail(ctx, spec.name, error);
    }
  }
  if (capture.partial) return;
  const tags = (specs: readonly { token: string }[]) =>
    new Set(specs.map((spec) => styleTag(spec.token)));
  removeLeftovers(textStyles, tags(capture.textStyles), 'text style', ctx);
  removeLeftovers(
    effectStyles,
    tags(capture.effectStyles),
    'shadow style',
    ctx
  );
}

function paint(value: SpecPaint, ctx: Context, what: string): SolidPaint {
  const { r, g, b, a } = value.color;
  const solid: SolidPaint = { type: 'SOLID', color: { r, g, b }, opacity: a };
  const variable = variableFor(value.token, ctx, what);
  // A colour variable carries its own alpha.
  return variable
    ? figma.variables.setBoundVariableForPaint(
        { ...solid, opacity: 1 },
        'color',
        variable
      )
    : solid;
}

function bind(
  node: SceneNode,
  field: VariableBindableNodeField | VariableBindableTextField,
  token: string | undefined,
  ctx: Context
) {
  const variable = variableFor(token, ctx, `${node.name} ${field}`);
  if (!variable) return;
  try {
    node.setBoundVariable(field, variable);
  } catch (error) {
    fail(ctx, `${node.name} ${field}`, error);
  }
}

function setNumber(
  node: Container | InstanceNode,
  field: NumberField,
  value: Bound,
  ctx: Context
) {
  node[field] = value.value;
  bind(node, field, value.token, ctx);
}

/** Every solid fill and stroke under `node` bound to `variable`, or only those drawn in `color`. */
function recolor(
  node: SceneNode & ChildrenMixin,
  variable: Variable,
  color?: string
) {
  const matches = (each: SolidPaint) =>
    color === undefined ||
    `#${[each.color.r, each.color.g, each.color.b]
      .map((channel) =>
        Math.round(channel * 255)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')}` === color;
  const bound = (paints: readonly Paint[]) =>
    paints.map((each) =>
      each.type === 'SOLID' && matches(each)
        ? figma.variables.setBoundVariableForPaint(each, 'color', variable)
        : each
    );
  for (const child of node.findAll()) {
    if ('fills' in child && child.fills !== figma.mixed)
      child.fills = bound(child.fills);
    if ('strokes' in child) child.strokes = bound(child.strokes);
  }
}

function newPage(name: string, value: string) {
  const page = figma.createPage();
  page.name = name;
  tag(page, value);
  return page;
}

/** An SVG as a frame holding one vector, so its colour survives a swap. */
function iconFrame(svg: string, page: PageNode) {
  const frame = figma.createNodeFromSvg(svg);
  page.appendChild(frame);
  const vectors = frame.findAll(
    (node) => node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION'
  );
  if (vectors.length > 1) figma.flatten(vectors, frame);
  const vector = frame.findOne((node) => node.type === 'VECTOR');
  if (vector && 'constraints' in vector) {
    vector.name = 'Vector';
    vector.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  }
  frame.fills = [];
  frame.clipsContent = false;
  frame.resize(ICON_SIZE, ICON_SIZE);
  return frame;
}

/** Draws an icon into its existing component, which keeps every instance, or into a new one. */
function drawIcon(
  spec: IconSpec,
  existing: ComponentNode | undefined,
  page: PageNode,
  color: Variable | undefined
) {
  const frame = iconFrame(spec.svg, page);
  let component = existing;
  if (component) {
    for (const child of [...component.children]) child.remove();
    for (const child of [...frame.children]) component.appendChild(child);
    frame.remove();
  } else {
    component = figma.createComponentFromNode(frame);
    tag(component, `icon:${spec.name}`);
  }
  component.setPluginData('svg', spec.svg);
  if (color) recolor(component, color);
  return component;
}

/** The icon set on the Icons page. An icon whose SVG changed is redrawn in place. */
async function writeIcons(capture: CaptureFile, ctx: Context) {
  ctx.where = 'icons';
  if (capture.icons.length === 0) return;
  const page = pageTagged('icons') ?? newPage('Icons', 'icons');
  const existing = page.children.filter(
    (node): node is ComponentNode =>
      node.type === 'COMPONENT' && tagOf(node).startsWith('icon:')
  );
  const byTag = new Map(existing.map((node) => [tagOf(node), node]));
  const color = variableFor(capture.iconColor, ctx, 'icon colour');
  for (const [index, spec] of capture.icons.entries()) {
    try {
      const known = byTag.get(`icon:${spec.name}`);
      const unchanged = known?.getPluginData('svg') === spec.svg;
      const component =
        known && unchanged ? known : drawIcon(spec, known, page, color);
      component.name = `icon/${spec.name}`;
      if (!unchanged) ctx.report.written.icons += 1;
      component.x = (index % ICONS_PER_ROW) * (ICON_SIZE * 3);
      component.y = Math.floor(index / ICONS_PER_ROW) * (ICON_SIZE * 3);
      ctx.icons.set(spec.name, component);
    } catch (error) {
      fail(ctx, spec.name, error);
    }
    if (index % 100 === 99)
      await progress(
        `Building icons: ${index + 1} of ${capture.icons.length}…`
      );
  }
  if (!capture.partial)
    removeLeftovers(
      existing,
      new Set(capture.icons.map((spec) => `icon:${spec.name}`)),
      'icon',
      ctx
    );
}

/** A layer's stroke and corners, bound to their tokens. */
function applyBorder(
  node: Container | InstanceNode,
  layer: Pick<FrameLayer, 'name' | 'stroke' | 'radius'>,
  ctx: Context
) {
  const { stroke, radius } = layer;
  if (stroke) {
    node.strokes = [paint(stroke.paint, ctx, `${layer.name} stroke`)];
    node.strokeAlign = 'INSIDE';
    setNumber(node, 'strokeTopWeight', stroke.top, ctx);
    setNumber(node, 'strokeRightWeight', stroke.right, ctx);
    setNumber(node, 'strokeBottomWeight', stroke.bottom, ctx);
    setNumber(node, 'strokeLeftWeight', stroke.left, ctx);
    if (stroke.dashed) node.dashPattern = [4, 4];
  } else {
    node.strokes = [];
  }
  setNumber(node, 'topLeftRadius', radius.topLeft, ctx);
  setNumber(node, 'topRightRadius', radius.topRight, ctx);
  setNumber(node, 'bottomRightRadius', radius.bottomRight, ctx);
  setNumber(node, 'bottomLeftRadius', radius.bottomLeft, ctx);
}

async function applyFrame(node: Container, layer: FrameLayer, ctx: Context) {
  node.name = layer.name;
  node.fills = layer.fills.map((fill) =>
    paint(fill, ctx, `${layer.name} fill`)
  );
  node.clipsContent = layer.clips;
  node.opacity = layer.opacity;
  const { layout } = layer;
  if (layout) {
    node.layoutMode = layout.mode;
    node.layoutWrap = layout.wrap ? 'WRAP' : 'NO_WRAP';
    node.primaryAxisAlignItems = layout.primaryAlign;
    node.counterAxisAlignItems = layout.counterAlign;
    node.strokesIncludedInLayout = true;
    setNumber(node, 'itemSpacing', layout.gap, ctx);
    if (layout.wrap) setNumber(node, 'counterAxisSpacing', layout.lineGap, ctx);
    setNumber(node, 'paddingTop', layout.padding.top, ctx);
    setNumber(node, 'paddingRight', layout.padding.right, ctx);
    setNumber(node, 'paddingBottom', layout.padding.bottom, ctx);
    setNumber(node, 'paddingLeft', layout.padding.left, ctx);
  }
  applyBorder(node, layer, ctx);
  if (layer.shadow) {
    const style = layer.shadow.style
      ? ctx.effectStyles.get(layer.shadow.style)
      : undefined;
    if (style) await node.setEffectStyleIdAsync(style.id);
    else node.effects = layer.shadow.effects.map(effect);
  }
  node.resize(
    Math.max(layer.width.value, 0.01),
    Math.max(layer.height.value, 0.01)
  );
}

type Sized = FrameNode | ComponentNode | TextNode | InstanceNode;

/** Puts a layer in its parent's auto layout with its hug, fill or fixed sizing, or over it at x, y. */
function place(
  node: Sized,
  layer: Layer,
  parent: Container | null,
  ctx: Context
) {
  if (layer.absolute && parent) {
    if (parent.layoutMode !== 'NONE') node.layoutPositioning = 'ABSOLUTE';
    node.x = layer.absolute.x;
    node.y = layer.absolute.y;
    if (layer.absolute.stretch)
      node.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
    return;
  }
  const autoLayout =
    node.type === 'TEXT' ||
    node.type === 'INSTANCE' ||
    node.layoutMode !== 'NONE';
  const allowed = (sizing: Sizing): Sizing => {
    if (sizing === 'FILL' && (!parent || parent.layoutMode === 'NONE'))
      return 'FIXED';
    if (sizing === 'HUG' && !autoLayout) return 'FIXED';
    return sizing;
  };
  const horizontal = allowed(layer.sizing.horizontal);
  const vertical = allowed(layer.sizing.vertical);
  try {
    node.layoutSizingHorizontal = horizontal;
    node.layoutSizingVertical = vertical;
  } catch (error) {
    fail(ctx, `${layer.name} sizing`, error);
  }
  if (node.type === 'TEXT') return;
  if (horizontal === 'FIXED') bind(node, 'width', layer.width.token, ctx);
  if (vertical === 'FIXED') bind(node, 'height', layer.height.token, ctx);
  if (node.type === 'INSTANCE') return;
  for (const [field, minimum] of [
    ['minWidth', layer.minWidth],
    ['minHeight', layer.minHeight],
  ] as const) {
    if (!minimum) continue;
    try {
      node[field] = minimum.value;
      bind(node, field, minimum.token, ctx);
    } catch (error) {
      fail(ctx, `${layer.name} ${field}`, error);
    }
  }
}

function reference(node: SceneNode, layer: Layer, ctx: Context) {
  const characters = layer.type === 'TEXT' ? layer.textProperty : undefined;
  const swap = layer.type === 'ICON' ? layer.swapProperty : undefined;
  const slot = layer.type === 'FRAME' ? layer.slotProperty : undefined;
  if (layer.visibleProperty || characters || swap || slot) {
    ctx.references.push({
      node,
      visible: layer.visibleProperty,
      characters,
      swap,
      slot,
    });
  }
}

async function buildText(layer: TextLayer, parent: Container, ctx: Context) {
  const node = figma.createText();
  parent.appendChild(node);
  node.fontName = await ctx.font(layer.font.family, layer.font.weight);
  node.characters = layer.characters;
  node.fontSize = layer.font.size.value;
  node.lineHeight =
    layer.font.lineHeight === undefined
      ? { unit: 'AUTO' }
      : { unit: 'PIXELS', value: layer.font.lineHeight.value };
  node.letterSpacing = {
    unit: 'PIXELS',
    value: layer.font.letterSpacing.value,
  };
  const style = layer.style ? ctx.textStyles.get(layer.style) : undefined;
  if (style) {
    await node.setTextStyleIdAsync(style.id);
  } else {
    bind(node, 'fontSize', layer.font.size.token, ctx);
    bind(node, 'lineHeight', layer.font.lineHeight?.token, ctx);
    bind(node, 'letterSpacing', layer.font.letterSpacing.token, ctx);
  }
  node.textCase = layer.textCase;
  node.textDecoration = layer.underline ? 'UNDERLINE' : 'NONE';
  node.textAlignHorizontal = layer.align;
  node.fills = [paint(layer.fill, ctx, `${layer.name} colour`)];
  node.name = layer.name;
  node.opacity = layer.opacity;
  node.textAutoResize = layer.autoResize;
  if (layer.autoResize !== 'WIDTH_AND_HEIGHT') {
    node.resize(
      Math.max(layer.width.value, 1),
      Math.max(layer.height.value, 1)
    );
  }
  return node;
}

function buildVector(layer: VectorLayer, parent: Container, ctx: Context) {
  const node = figma.createNodeFromSvg(layer.svg);
  parent.appendChild(node);
  node.name = layer.name;
  node.fills = [];
  node.clipsContent = false;
  node.opacity = layer.opacity;
  for (const child of node.findAll()) {
    if ('constraints' in child)
      child.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  }
  for (const [color, token] of Object.entries(layer.colors)) {
    const variable = variableFor(token, ctx, `${layer.name} colour`);
    if (variable) recolor(node, variable, color);
  }
  return node;
}

function buildIcon(layer: IconLayer, parent: Container, ctx: Context) {
  const main = ctx.icons.get(layer.icon);
  if (!main) throw new Error(`The icon set has no ${layer.icon}.`);
  const node = main.createInstance();
  parent.appendChild(node);
  node.name = layer.name;
  node.opacity = layer.opacity;
  node.resize(
    Math.max(layer.width.value, 0.01),
    Math.max(layer.height.value, 0.01)
  );
  const vector = node.findOne((child) => child.name === 'Vector');
  if (vector && 'fills' in vector)
    vector.fills = [paint(layer.fill, ctx, `${layer.name} colour`)];
  return node;
}

/** A property's name: its key without the id Figma suffixes it with. */
const propertyName = (key: string) => key.split('#')[0];

/** `properties`' key for the property called `name` of `type`. */
const propertyKey = (
  properties: Readonly<Record<string, { type: ComponentPropertyType }>>,
  name: string,
  type: ComponentPropertyType
) =>
  Object.keys(properties).find(
    (key) => propertyName(key) === name && properties[key]?.type === type
  );

function buildInstance(layer: InstanceLayer, parent: Container, ctx: Context) {
  const owner = ctx.components.get(layer.component);
  if (!owner)
    throw new Error(
      `${layer.component} wasn't built, so there's nothing to make an instance of.`
    );
  const main =
    owner.type === 'COMPONENT_SET'
      ? owner.children.find(
          (child) =>
            child.type === 'COMPONENT' &&
            Object.entries(layer.variant).every(
              ([name, value]) => child.variantProperties?.[name] === value
            )
        )
      : owner;
  if (main?.type !== 'COMPONENT')
    throw new Error(
      `${layer.component} has no variant ${JSON.stringify(layer.variant)}.`
    );
  const node = main.createInstance();
  parent.appendChild(node);
  node.name = layer.name;
  const properties = node.componentProperties;
  const updates: Record<string, string | boolean> = {};
  for (const [name, value] of Object.entries(layer.texts)) {
    const key = propertyKey(properties, name, 'TEXT');
    if (key) updates[key] = value;
  }
  for (const [name, value] of Object.entries(layer.booleans)) {
    const key = propertyKey(properties, name, 'BOOLEAN');
    if (key) updates[key] = value;
  }
  for (const [name, icon] of Object.entries(layer.swaps)) {
    const key = propertyKey(properties, name, 'INSTANCE_SWAP');
    const component = ctx.icons.get(icon);
    if (key && component) updates[key] = component.id;
  }
  if (Object.keys(updates).length > 0) node.setProperties(updates);
  if (layer.restyle) {
    node.fills = layer.restyle.fills.map((fill) =>
      paint(fill, ctx, `${layer.name} fill`)
    );
    applyBorder(node, { name: layer.name, ...layer.restyle }, ctx);
  }
  try {
    node.isExposedInstance = true;
  } catch (error) {
    fail(ctx, `${layer.name} exposed`, error);
  }
  ctx.report.written.instances += 1;
  return node;
}

/** Builds each layer into `parent`. A layer that fails is reported, and the rest still build. */
async function buildChildren(
  layers: readonly Layer[],
  parent: Container,
  ctx: Context
) {
  for (const layer of layers) {
    try {
      await buildLayer(layer, parent, ctx);
    } catch (error) {
      fail(ctx, layer.name, error);
    }
  }
}

async function buildLayer(
  layer: Layer,
  parent: Container,
  ctx: Context
): Promise<SceneNode> {
  if (layer.type === 'FRAME') {
    const node = figma.createFrame();
    await applyFrame(node, layer, ctx);
    parent.appendChild(node);
    place(node, layer, parent, ctx);
    await buildChildren(layer.children, node, ctx);
    reference(node, layer, ctx);
    return node;
  }
  let node: SceneNode;
  if (layer.type === 'TEXT') node = await buildText(layer, parent, ctx);
  else if (layer.type === 'ICON') node = buildIcon(layer, parent, ctx);
  else if (layer.type === 'INSTANCE') node = buildInstance(layer, parent, ctx);
  else node = buildVector(layer, parent, ctx);
  if (node.type === 'FRAME') {
    // An SVG keeps the size it was imported at.
    if (layer.absolute) {
      if (parent.layoutMode !== 'NONE') node.layoutPositioning = 'ABSOLUTE';
      node.x = layer.absolute.x;
      node.y = layer.absolute.y;
    }
  } else if (node.type === 'TEXT' || node.type === 'INSTANCE') {
    place(node, layer, parent, ctx);
  }
  if (
    node.type === 'INSTANCE' &&
    layer.type === 'INSTANCE' &&
    layer.slotContent
  )
    await fillSlot(node, layer.slotContent, ctx);
  reference(node, layer, ctx);
  return node;
}

/** Puts an instance's own content in its slot, in place of its component's. */
async function fillSlot(
  node: InstanceNode,
  content: readonly Layer[],
  ctx: Context
) {
  const slot = node.findChild((child) => child.type === 'SLOT');
  if (slot?.type !== 'SLOT') throw new Error(`${node.name} has no slot.`);
  for (const child of [...slot.children]) child.remove();
  await buildChildren(content, slot, ctx);
}

/** Clears a variant's component of what an earlier build drew and set only when a layer had it, so it's drawn again from blank. */
async function clearComponent(node: ComponentNode) {
  for (const child of [...node.children]) child.remove();
  const bound = node.boundVariables ?? {};
  for (const field of FRAME_BINDINGS) {
    if (bound[field]) node.setBoundVariable(field, null);
  }
  if (node.layoutMode !== 'NONE') {
    node.minWidth = null;
    node.minHeight = null;
  }
  node.layoutMode = 'NONE';
  await node.setEffectStyleIdAsync('');
  node.effects = [];
  node.dashPattern = [];
}

/** Draws a variant's root frame and its layers into `node`. */
async function drawVariant(
  node: ComponentNode,
  variant: VariantSpec,
  ctx: Context
) {
  const { root } = variant;
  if (root.type !== 'FRAME')
    throw new Error(`A ${root.type} layer can't be a component's root.`);
  await applyFrame(node, root, ctx);
  place(node, root, null, ctx);
  await buildChildren(root.children, node, ctx);
}

/** Draws each variant into a new component. When one fails, it removes them all, so last run's components stay as they were. */
async function drawVariants(spec: ComponentSpec, page: PageNode, ctx: Context) {
  const drawn: { variant: VariantSpec; node: ComponentNode }[] = [];
  try {
    for (const variant of spec.variants) {
      ctx.where = `${spec.name} ${variant.name}`;
      const node = figma.createComponent();
      page.appendChild(node);
      drawn.push({ variant, node });
      await drawVariant(node, variant, ctx);
      if (drawn.length % PROGRESS_EVERY === 0) {
        await progress(
          `Building ${spec.name}: ${drawn.length} of ${spec.variants.length} variants…`
        );
      }
    }
  } catch (error) {
    for (const { node } of drawn) node.remove();
    throw error;
  }
  return drawn;
}

/** Moves `drawn`'s layers into `old`, the component last run drew the variant in, so its instances follow. */
async function redraw(
  old: ComponentNode,
  drawn: ComponentNode,
  variant: VariantSpec,
  ctx: Context
) {
  await clearComponent(old);
  await applyFrame(old, variant.root, ctx);
  place(old, variant.root, null, ctx);
  for (const child of [...drawn.children]) old.appendChild(child);
  drawn.remove();
  return old;
}

/** Every combination of the named properties' values, in property order. */
function combinations(spec: ComponentSpec, names: readonly string[]) {
  let found: Record<string, string>[] = [{}];
  for (const name of names) {
    const values =
      spec.variantProperties.find((property) => property.name === name)
        ?.values ?? [];
    found = found.flatMap((combination) =>
      values.map((value) => ({ ...combination, [name]: value }))
    );
  }
  return found;
}

/** A combination in words: each value, `true` as its property's name and `false` left out. */
function caption(combination: Record<string, string>) {
  const entries = Object.entries(combination);
  const words = entries
    .filter(([, value]) => value !== 'false')
    .map(([name, value]) => (value === 'true' ? name : value));
  if (words.length > 0) return words.join(' · ');
  return entries.map(([name]) => `No ${name.toLowerCase()}`).join(' · ');
}

function label(
  parent: FrameNode,
  characters: string,
  x: number,
  y: number,
  kind: keyof typeof TEXT = 'label'
) {
  const text = figma.createText();
  tag(text, 'label');
  text.fontName = { family: 'Inter', style: TEXT[kind].style };
  text.fontSize = TEXT[kind].size;
  text.characters = characters;
  text.fills = [{ type: 'SOLID', color: LABEL_COLOR }];
  parent.appendChild(text);
  text.x = x;
  text.y = y;
  return text;
}

/** `frame` as the paper a component sits on, holding `owner`, with last run's labels removed. Another component's set someone dropped on it is left for that component's build to move back. */
function holder(
  frame: FrameNode,
  owner: ComponentSetNode | ComponentNode,
  spec: ComponentSpec
) {
  for (const child of [...frame.children]) {
    if (tagOf(child) === 'label') child.remove();
  }
  frame.name = spec.name;
  frame.fills = [PAPER];
  frame.cornerRadius = PAPER_RADIUS;
  frame.clipsContent = false;
  frame.appendChild(owner);
}

/** A single component under its name, in `frame`. */
function titled(
  component: ComponentNode,
  spec: ComponentSpec,
  frame: FrameNode
) {
  holder(frame, component, spec);
  const heading = label(frame, spec.name, SET_PADDING, SET_PADDING, 'heading');
  component.x = SET_PADDING;
  component.y = heading.y + heading.height + LABEL_GAP;
  frame.resizeWithoutConstraints(
    Math.max(heading.width, component.width) + SET_PADDING * 2,
    component.y + component.height + SET_PADDING
  );
}

/**
 * Lays the set's variants out as its grid says: a titled block for each
 * combination of `blocks`, each with labelled rows and columns. Each column is
 * as wide as its widest variant and each row as tall as its tallest. `frame`
 * holds the set with its labels drawn over it.
 */
function arrange(set: ComponentSetNode, spec: ComponentSpec, frame: FrameNode) {
  const { blocks, rows, columns } = spec.grid;
  holder(frame, set, spec);
  const variants = set.children.filter(
    (child): child is ComponentNode => child.type === 'COMPONENT'
  );
  const matching = (combination: Record<string, string>) =>
    variants.filter((variant) =>
      Object.entries(combination).every(
        ([name, value]) => variant.variantProperties?.[name] === value
      )
    );
  const largest = (
    combination: Record<string, string>,
    side: 'width' | 'height'
  ) => Math.max(0, ...matching(combination).map((variant) => variant[side]));
  const columnValues = combinations(spec, columns);
  const rowValues = combinations(spec, rows);
  const measure = (characters: string) => {
    const text = label(frame, characters, 0, 0);
    const { width } = text;
    text.remove();
    return width;
  };
  const widths = columnValues.map((column) =>
    Math.max(largest(column, 'width'), measure(caption(column)))
  );
  const heights = rowValues.map((row) => largest(row, 'height'));
  const left =
    SET_PADDING +
    (rows.length > 0
      ? Math.max(...rowValues.map((row) => measure(caption(row)))) + LABEL_GAP
      : 0);
  const xs = widths.map(
    (_, index) =>
      left +
      widths.slice(0, index).reduce((sum, width) => sum + width + SET_GAP, 0)
  );
  let y =
    SET_PADDING +
    label(frame, spec.name, SET_PADDING, SET_PADDING, 'heading').height +
    BLOCK_GAP / 2;
  for (const block of combinations(spec, blocks)) {
    if (blocks.length > 0)
      y +=
        label(frame, caption(block), SET_PADDING, y, 'title').height +
        LABEL_GAP;
    if (columns.length > 0) {
      const headings = columnValues.map((column, index) =>
        label(frame, caption(column), xs[index] ?? left, y)
      );
      y += Math.max(...headings.map((text) => text.height)) + LABEL_GAP;
    }
    rowValues.forEach((row, rowIndex) => {
      const height = heights[rowIndex] ?? 0;
      if (rows.length > 0) {
        const text = label(frame, caption(row), SET_PADDING, y);
        text.y = y + (height - text.height) / 2;
      }
      columnValues.forEach((column, columnIndex) => {
        const [variant] = matching({ ...block, ...row, ...column });
        if (!variant) return;
        variant.x = xs[columnIndex] ?? left;
        variant.y = y + (height - variant.height) / 2;
      });
      y += height + SET_GAP;
    });
    y += BLOCK_GAP - SET_GAP;
  }
  const right = (xs[xs.length - 1] ?? left) + (widths[widths.length - 1] ?? 0);
  set.resizeWithoutConstraints(
    right + SET_PADDING,
    y - BLOCK_GAP + SET_PADDING
  );
  frame.resizeWithoutConstraints(set.width, set.height);
}

/** Last run's component sets and components, by component name, wherever someone moved them in the file. */
function builtComponents() {
  const found = new Map<string, ComponentSetNode | ComponentNode>();
  const tagged = figma.root.findAllWithCriteria({
    types: ['COMPONENT_SET', 'COMPONENT'],
    pluginData: { keys: [TAG] },
  });
  for (const node of tagged) {
    const name = taggedName(node, 'component');
    if (name !== undefined) found.set(name, node);
  }
  return found;
}

/** The paper frame `spec` sits on, on its card's page: last run's, or a new one. */
function paperFor(spec: ComponentSpec, page: PageNode) {
  const found = page.children.find(
    (node): node is FrameNode =>
      node.type === 'FRAME' && tagOf(node) === paperTag(spec.name)
  );
  if (found) return found;
  const frame = figma.createFrame();
  tag(frame, paperTag(spec.name));
  page.appendChild(frame);
  return frame;
}

/**
 * Whether `node`, a variant last run drew, can be redrawn as the variant
 * `values` names. Each property both have takes the same value. A property
 * `node` lacks, one the component gained, takes its first value. A property
 * the component dropped doesn't count.
 */
function sameVariant(
  node: ComponentNode,
  values: Record<string, string>,
  firsts: ReadonlyMap<string, string | undefined>
) {
  const old = node.variantProperties ?? {};
  return Object.entries(values).every(([name, value]) =>
    name in old ? old[name] === value : value === firsts.get(name)
  );
}

/** The component last run drew each of `spec`'s variants in, matched by its variant properties. Each is drawn in at most once. */
function reusable(
  spec: ComponentSpec,
  owner: ComponentSetNode | ComponentNode | undefined
): (ComponentNode | undefined)[] {
  if (!owner) return [];
  const unclaimed =
    owner.type === 'COMPONENT'
      ? [owner]
      : owner.children.filter(
          (child): child is ComponentNode => child.type === 'COMPONENT'
        );
  const firsts = new Map(
    spec.variantProperties.map(({ name, values }) => [name, values[0]])
  );
  return spec.variants.map((variant) => {
    const index = unclaimed.findIndex((node) =>
      sameVariant(node, variant.values, firsts)
    );
    return index === -1 ? undefined : unclaimed.splice(index, 1)[0];
  });
}

/** The component set or component that holds `variants`: last run's when it can, so its instances follow. */
function assemble(
  spec: ComponentSpec,
  variants: ComponentNode[],
  old: ComponentSetNode | ComponentNode | undefined,
  page: PageNode
) {
  const [first] = variants;
  if (!first) throw new Error(`${spec.name} has no variants.`);
  if (spec.variantProperties.length === 0) {
    if (old && old !== first) {
      page.appendChild(first);
      old.remove();
    }
    return first;
  }
  if (old?.type !== 'COMPONENT_SET') {
    // Last run's single component is one of the variants now, when one matched it.
    if (old && variants.includes(old)) tag(old, '');
    else old?.remove();
    return figma.combineAsVariants(variants, page);
  }
  for (const node of variants) {
    if (node.parent !== old) old.appendChild(node);
  }
  for (const child of [...old.children]) {
    if (!variants.includes(child as ComponentNode)) child.remove();
  }
  return old;
}

interface PropertySpec {
  name: string;
  type: ComponentPropertyType;
  value: string | boolean;
}

/** The property's key: last run's, with its default updated, so instances keep what they set, or a new one. */
function writeProperty(
  owner: ComponentSetNode | ComponentNode,
  { name, type, value }: PropertySpec
) {
  const key = propertyKey(owner.componentPropertyDefinitions, name, type);
  if (key === undefined) return owner.addComponentProperty(name, type, value);
  // A slot has no default.
  if (type === 'SLOT') return key;
  return owner.editComponentProperty(key, { defaultValue: value });
}

/** Sets `spec`'s component properties on `owner`, and removes the ones it no longer has. Returns each one's key, by `<type> <name>`. */
function writeProperties(
  owner: ComponentSetNode | ComponentNode,
  spec: ComponentSpec,
  ctx: Context
) {
  const properties: PropertySpec[] = [
    ...spec.booleanProperties.map(
      (property): PropertySpec => ({
        name: property.name,
        type: 'BOOLEAN',
        value: property.default,
      })
    ),
    ...spec.textProperties.map(
      (property): PropertySpec => ({
        name: property.name,
        type: 'TEXT',
        value: property.default,
      })
    ),
    ...spec.swapProperties.flatMap((property): PropertySpec[] => {
      const icon = ctx.icons.get(property.default);
      return icon
        ? [{ name: property.name, type: 'INSTANCE_SWAP', value: icon.id }]
        : [];
    }),
    ...spec.slotProperties.map(
      (property): PropertySpec => ({
        name: property.name,
        type: 'SLOT',
        value: '',
      })
    ),
  ];
  for (const [key, definition] of Object.entries(
    owner.componentPropertyDefinitions
  )) {
    if (definition.type === 'VARIANT') continue;
    const kept = properties.some(
      ({ name, type }) => type === definition.type && name === propertyName(key)
    );
    if (kept) continue;
    try {
      owner.deleteComponentProperty(key);
    } catch (error) {
      fail(ctx, `${key} property`, error);
    }
  }
  const keys = new Map<string, string>();
  for (const property of properties) {
    try {
      keys.set(
        `${property.type} ${property.name}`,
        writeProperty(owner, property)
      );
    } catch (error) {
      fail(ctx, `${property.name} property`, error);
    }
  }
  return keys;
}

/**
 * Builds a component on `page`, whichever page the user has open meanwhile.
 * Every variant is drawn first. Then each is moved inside the component last
 * run built for it, `built`'s, so every instance of it, here or in a file using
 * the library, follows. When the build fails, the components it made are
 * removed.
 */
async function buildComponent(
  spec: ComponentSpec,
  page: PageNode,
  built: ComponentSetNode | ComponentNode | undefined,
  ctx: Context
) {
  ctx.references = [];
  const drawn = await drawVariants(spec, page, ctx);
  try {
    // Someone can remove last run's component while the variants draw.
    const old = built?.removed ? undefined : built;
    const reused = reusable(spec, old);
    const variants: ComponentNode[] = [];
    for (const [index, { variant, node }] of drawn.entries()) {
      ctx.where = `${spec.name} ${variant.name}`;
      const previous = reused[index];
      const component = previous
        ? await redraw(previous, node, variant, ctx)
        : node;
      reference(component, variant.root, ctx);
      component.description = variant.notes.join('\n');
      component.name =
        spec.variantProperties.length > 0 ? variant.name : spec.name;
      variants.push(component);
    }
    ctx.where = spec.name;
    const owner = assemble(spec, variants, old, page);
    tag(owner, componentTag(spec.name));
    if (owner.type === 'COMPONENT_SET') owner.name = spec.name;
    const keys = writeProperties(owner, spec, ctx);
    for (const { node, visible, characters, swap, slot } of ctx.references) {
      // The installed typings don't list `slotContentId` yet, though Figma's docs do.
      const references: {
        visible?: string;
        characters?: string;
        mainComponent?: string;
        slotContentId?: string;
      } = {};
      if (visible) references.visible = keys.get(`BOOLEAN ${visible}`);
      if (characters) references.characters = keys.get(`TEXT ${characters}`);
      if (swap) references.mainComponent = keys.get(`INSTANCE_SWAP ${swap}`);
      if (slot) references.slotContentId = keys.get(`SLOT ${slot}`);
      try {
        node.componentPropertyReferences = references;
      } catch (error) {
        fail(ctx, `${node.name} properties`, error);
      }
    }
    // Laid out last, since a property's default can hide a layer.
    const frame = paperFor(spec, page);
    if (owner.type === 'COMPONENT_SET') {
      arrange(owner, spec, frame);
      ctx.report.written.componentSets += 1;
    } else {
      titled(owner, spec, frame);
    }
    ctx.report.written.components += variants.length;
    return owner;
  } catch (error) {
    for (const { node } of drawn) {
      if (!node.removed) node.remove();
    }
    throw error;
  }
}

/**
 * Stamps the file with PROTOCOL_VERSION. Refuses a file an export of another
 * version built, whose tags this plugin can't read, so it doesn't build every
 * component a second time beside the old ones.
 */
function stampFile() {
  const stamp = figma.root.getPluginData(FILE_VERSION);
  // A file built before files were stamped has tagged pages and no stamp.
  const built =
    stamp !== '' ||
    figma.root.children.some((page) => page.getPluginData(TAG) !== '');
  if (built && stamp !== String(PROTOCOL_VERSION)) {
    throw new Error(
      "Another version of the nxds export built this file, and this plugin can't update it. Run the plugin in a new file."
    );
  }
  figma.root.setPluginData(FILE_VERSION, String(PROTOCOL_VERSION));
}

/** The cover: the page the plugin first ran on, or a new one in a file that already has nxds pages. */
function coverPage() {
  const found = pageTagged('cover');
  if (found) return found;
  const fresh = !figma.root.children.some((page) => tagOf(page) !== '');
  const page = fresh ? figma.currentPage : figma.createPage();
  page.name = 'nxds';
  tag(page, 'cover');
  return page;
}

/** On a full run, deletes the card pages and components the capture no longer has, and each paper not on its component's card. */
async function removeOldComponents(
  capture: CaptureFile,
  cover: PageNode,
  ctx: Context
) {
  ctx.where = 'cleanup';
  const cardOf = new Map(
    capture.components.map((spec) => [spec.name, spec.card])
  );
  const cards = new Set(cardOf.values());
  const cardPages = figma.root.children.flatMap((page) => {
    const card = taggedName(page, 'card');
    return card === undefined ? [] : [{ page, card }];
  });
  for (const { page, card } of cardPages) {
    if (cards.has(card)) continue;
    if (figma.currentPage === page) await figma.setCurrentPageAsync(cover);
    ctx.report.removed.push(`page ${page.name}`);
    page.remove();
  }
  for (const [name, owner] of builtComponents()) {
    if (cardOf.has(name)) continue;
    ctx.report.removed.push(`component ${name}`);
    owner.remove();
  }
  // A component moved to another card leaves its old paper behind.
  for (const { page, card } of cardPages) {
    if (page.removed) continue;
    for (const node of [...page.children]) {
      const name = taggedName(node, 'paper');
      if (name !== undefined && cardOf.get(name) !== card) node.remove();
    }
  }
}

/** Lays a page's components out in rows that wrap past PAGE_WIDTH, in page order. */
function layOut(page: PageNode) {
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  for (const node of page.children) {
    if (taggedName(node, 'paper') === undefined) continue;
    if (x > 0 && x + node.width > PAGE_WIDTH) {
      x = 0;
      y += rowHeight + COMPONENT_GAP;
      rowHeight = 0;
    }
    node.x = x;
    node.y = y;
    x += node.width + COMPONENT_GAP;
    rowHeight = Math.max(rowHeight, node.height);
  }
}

/** The cover first, then the card pages by name, then Icons, then any page someone else added. */
function orderPages() {
  const rank = (page: PageNode) => {
    const value = tagOf(page);
    if (value === 'cover') return '0';
    if (value === 'icons') return '2';
    return `1${page.name}`;
  };
  const ours = figma.root.children.filter((page) => tagOf(page) !== '');
  ours.sort((a, b) => (rank(a) < rank(b) ? -1 : rank(a) > rank(b) ? 1 : 0));
  ours.forEach((page, index) => figma.root.insertChild(index, page));
}

async function build(capture: CaptureFile): Promise<BuildReport> {
  const report: BuildReport = {
    format: REPORT_FORMAT,
    version: PROTOCOL_VERSION,
    written: {
      pages: 0,
      collections: 0,
      variables: 0,
      textStyles: 0,
      effectStyles: 0,
      icons: 0,
      componentSets: 0,
      components: 0,
      instances: 0,
    },
    removed: [],
    modes: [],
    fonts: [],
    failures: [],
  };
  const ctx: Context = {
    report,
    variables: new Map(),
    textStyles: new Map(),
    effectStyles: new Map(),
    icons: new Map(),
    components: new Map(),
    font: fontLoader(report),
    references: [],
    where: 'setup',
  };
  try {
    if (
      capture.format !== CAPTURE_FORMAT ||
      capture.version !== PROTOCOL_VERSION
    ) {
      throw new Error(
        'This capture comes from another nxds-cli version than this plugin. Rebuild the plugin from the same checkout.'
      );
    }
    await figma.loadAllPagesAsync();
    stampFile();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
    await progress('Writing variables…');
    await writeVariables(capture, ctx);
    await progress('Writing text and shadow styles…');
    await writeStyles(capture, ctx);
    const cover = coverPage();
    await progress('Writing the icon set…');
    await writeIcons(capture, ctx);
    const pages = new Map<string, PageNode>();
    const pageFor = (card: string) => {
      const known = pages.get(card);
      if (known) return known;
      const page = pageTagged(cardTag(card)) ?? newPage(card, cardTag(card));
      pages.set(card, page);
      report.written.pages += 1;
      return page;
    };
    const built = builtComponents();
    for (const spec of capture.components) {
      await progress(
        `Building ${spec.name}: ${spec.variants.length} variants…`
      );
      try {
        const owner = await buildComponent(
          spec,
          pageFor(spec.card),
          built.get(spec.name),
          ctx
        );
        ctx.components.set(spec.name, owner);
      } catch (error) {
        ctx.where = spec.name;
        fail(ctx, '', error);
      }
    }
    if (!capture.partial) await removeOldComponents(capture, cover, ctx);
    // Capture order puts each part before what holds it.
    for (const spec of capture.components) {
      const page = pages.get(spec.card);
      const node = page?.children.find(
        (child) => tagOf(child) === paperTag(spec.name)
      );
      if (page && node) page.appendChild(node);
    }
    for (const page of pages.values()) layOut(page);
    orderPages();
  } catch (error) {
    fail(ctx, '', error);
  }
  return report;
}

figma.showUI(__html__, { width: 380, height: 240, themeColors: true });

figma.ui.onmessage = async (message: {
  type: string;
  capture?: CaptureFile;
  summary?: string;
}) => {
  if (message.type === 'capture' && message.capture) {
    const report = await build(message.capture);
    figma.ui.postMessage({ type: 'report', report });
  }
  if (message.type === 'posted') figma.closePlugin(message.summary);
};
