// The plugin's main thread. It builds exactly what capture.json says:
// variables, text and shadow styles, the icon set on an Icons page, then one
// component set per component on the current page. Every value that carries
// a token is bound to its variable. It makes no layout decisions of its own.
import {
  type Bound,
  type BuildReport,
  CAPTURE_FORMAT,
  type CaptureFile,
  type ComponentSpec,
  type FrameLayer,
  type IconLayer,
  type InstanceLayer,
  type Layer,
  type Paint as SpecPaint,
  REPORT_FORMAT,
  type Rgba,
  type Shadow,
  type Sizing,
  type TextLayer,
  unboundValues,
  type VectorLayer,
} from '../../src/spec.ts';

type Container = FrameNode | ComponentNode;

type NumberField =
  | 'itemSpacing'
  | 'counterAxisSpacing'
  | 'paddingTop'
  | 'paddingRight'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'topLeftRadius'
  | 'topRightRadius'
  | 'bottomRightRadius'
  | 'bottomLeftRadius'
  | 'strokeTopWeight'
  | 'strokeRightWeight'
  | 'strokeBottomWeight'
  | 'strokeLeftWeight';

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
  }[];
  /** What is being built, for the report. */
  where: string;
}

const SET_PADDING = 32;
const SET_GAP = 24;
const COMPONENT_GAP = 160;
/** Component sets wrap to a new row past this width on the page. */
const PAGE_WIDTH = 6000;
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

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

function fail(ctx: Context, what: string, error: unknown) {
  ctx.report.failures.push({
    where: what ? `${ctx.where} / ${what}` : ctx.where,
    message: messageOf(error),
  });
}

async function progress(text: string) {
  figma.ui.postMessage({ type: 'progress', text });
  // Lets the UI repaint between steps.
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/** Loads the closest font Figma has: the family at the nearest named weight, or Inter. Records every replacement. */
async function fontLoader(report: BuildReport) {
  const families = new Map<string, Set<string>>();
  for (const { fontName } of await figma.listAvailableFontsAsync()) {
    const styles = families.get(fontName.family) ?? new Set<string>();
    styles.add(fontName.style);
    families.set(fontName.family, styles);
  }
  const pick = (family: string, weight: number): FontName | undefined => {
    const styles = families.get(family);
    const rounded = Math.min(
      900,
      Math.max(100, Math.round(weight / 100) * 100)
    );
    const style = styles
      ? (STYLE_NAMES[rounded] ?? ['Regular']).find((name) => styles.has(name))
      : undefined;
    return style ? { family, style } : undefined;
  };
  const loaded = new Map<string, FontName>();
  return async (family: string, weight: number) => {
    const key = `${family} ${weight}`;
    const cached = loaded.get(key);
    if (cached) return cached;
    const exact = pick(family, weight);
    const font = exact ??
      pick('Inter', weight) ?? { family: 'Inter', style: 'Regular' };
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

async function createVariables(capture: CaptureFile, ctx: Context) {
  for (const spec of capture.collections) {
    if (spec.variables.length === 0) continue;
    ctx.where = `collection ${spec.name}`;
    const collection = figma.variables.createVariableCollection(spec.name);
    ctx.report.created.collections += 1;
    const first = collection.modes[0];
    if (!first) throw new Error(`${spec.name} has no mode.`);
    collection.renameMode(first.modeId, spec.themed ? 'Light' : 'Value');
    let dark: string | undefined;
    if (spec.themed) {
      try {
        dark = collection.addMode('Dark');
      } catch (error) {
        ctx.report.darkModeError = messageOf(error);
      }
      ctx.report.modes = collection.modes.map((mode) => mode.name);
    }
    for (const entry of spec.variables) {
      try {
        const variable = figma.variables.createVariable(
          entry.name,
          collection,
          entry.type
        );
        variable.description = entry.description;
        variable.setVariableCodeSyntax('WEB', `var(--${entry.token})`);
        variable.setValueForMode(first.modeId, variableValue(entry.light));
        if (dark !== undefined)
          variable.setValueForMode(
            dark,
            variableValue(entry.dark ?? entry.light)
          );
        ctx.variables.set(entry.token, variable);
        ctx.report.created.variables += 1;
      } catch (error) {
        fail(ctx, entry.name, error);
      }
    }
  }
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

async function createStyles(capture: CaptureFile, ctx: Context) {
  ctx.where = 'text styles';
  for (const spec of capture.textStyles) {
    try {
      const style = figma.createTextStyle();
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
        if (variable) style.setBoundVariable(field, variable);
      }
      ctx.textStyles.set(spec.name, style);
      ctx.report.created.textStyles += 1;
    } catch (error) {
      fail(ctx, spec.name, error);
    }
  }
  ctx.where = 'shadow styles';
  for (const spec of capture.effectStyles) {
    try {
      const style = figma.createEffectStyle();
      style.name = spec.name;
      style.description = spec.description;
      style.effects = spec.effects.map(effect);
      ctx.effectStyles.set(spec.name, style);
      ctx.report.created.effectStyles += 1;
    } catch (error) {
      fail(ctx, spec.name, error);
    }
  }
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
    node.setBoundVariable(field as VariableBindableNodeField, variable);
  } catch (error) {
    fail(ctx, `${node.name} ${field}`, error);
  }
}

function setNumber(
  node: Container,
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

/** The icon set, as one component per icon on an Icons page, each a single vector so its colour survives a swap. */
async function createIcons(capture: CaptureFile, ctx: Context) {
  ctx.where = 'icons';
  if (capture.icons.length === 0) return;
  const page = figma.createPage();
  page.name = 'Icons';
  const color = variableFor(capture.iconColor, ctx, 'icon colour');
  for (const [index, spec] of capture.icons.entries()) {
    try {
      const frame = figma.createNodeFromSvg(spec.svg);
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
      const component = figma.createComponentFromNode(frame);
      component.name = `icon/${spec.name}`;
      if (color) recolor(component, color);
      component.x = (index % ICONS_PER_ROW) * (ICON_SIZE * 3);
      component.y = Math.floor(index / ICONS_PER_ROW) * (ICON_SIZE * 3);
      ctx.icons.set(spec.name, component);
      ctx.report.created.icons += 1;
    } catch (error) {
      fail(ctx, spec.name, error);
    }
    if (index % 100 === 99)
      await progress(
        `Building icons: ${index + 1} of ${capture.icons.length}…`
      );
  }
}

async function applyFrame(node: Container, layer: FrameLayer, ctx: Context) {
  node.name = layer.name;
  node.fills = layer.fills.map((fill) =>
    paint(fill, ctx, `${layer.name} fill`)
  );
  node.clipsContent = layer.clips;
  node.opacity = layer.opacity;
  const { layout, stroke, radius } = layer;
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
}

function reference(node: SceneNode, layer: Layer, ctx: Context) {
  const characters = layer.type === 'TEXT' ? layer.textProperty : undefined;
  const swap = layer.type === 'ICON' ? layer.swapProperty : undefined;
  if (layer.visibleProperty || characters || swap) {
    ctx.references.push({
      node,
      visible: layer.visibleProperty,
      characters,
      swap,
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

const variantValues = (name: string) =>
  Object.fromEntries(
    name.split(', ').map((pair) => pair.split('=') as [string, string])
  );

/** `properties`' key for the property called `name` of `type`, which Figma suffixes with an id. */
const propertyKey = (
  properties: ComponentProperties,
  name: string,
  type: ComponentPropertyType
) =>
  Object.keys(properties).find(
    (key) => key.split('#')[0] === name && properties[key]?.type === type
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
              ([name, value]) => variantValues(child.name)[name] === value
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
  try {
    node.isExposedInstance = true;
  } catch (error) {
    fail(ctx, `${layer.name} exposed`, error);
  }
  ctx.report.created.instances += 1;
  return node;
}

async function buildLayer(
  layer: Layer,
  parent: Container | null,
  ctx: Context
): Promise<SceneNode> {
  if (layer.type === 'FRAME') {
    const node = parent ? figma.createFrame() : figma.createComponent();
    await applyFrame(node, layer, ctx);
    parent?.appendChild(node);
    place(node, layer, parent, ctx);
    for (const child of layer.children) {
      try {
        await buildLayer(child, node, ctx);
      } catch (error) {
        fail(ctx, child.name, error);
      }
    }
    reference(node, layer, ctx);
    return node;
  }
  if (!parent)
    throw new Error(`A ${layer.type} layer can't be a component's root.`);
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
  reference(node, layer, ctx);
  return node;
}

/** Lays the variants out in a grid: one column per value of the last variant property. */
function arrange(set: ComponentSetNode, spec: ComponentSpec) {
  const last = spec.variantProperties[spec.variantProperties.length - 1];
  const columns = last ? last.values.length : 1;
  const children = set.children;
  const width = Math.max(...children.map((child) => child.width));
  const height = Math.max(...children.map((child) => child.height));
  children.forEach((child, index) => {
    child.x = SET_PADDING + (index % columns) * (width + SET_GAP);
    child.y = SET_PADDING + Math.floor(index / columns) * (height + SET_GAP);
  });
  const rows = Math.ceil(children.length / columns);
  set.resizeWithoutConstraints(
    SET_PADDING * 2 + columns * width + (columns - 1) * SET_GAP,
    SET_PADDING * 2 + rows * height + (rows - 1) * SET_GAP
  );
}

async function buildComponent(spec: ComponentSpec, ctx: Context) {
  ctx.references = [];
  const variants: ComponentNode[] = [];
  for (const variant of spec.variants) {
    ctx.where = `${spec.name} ${variant.name}`;
    const node = await buildLayer(variant.root, null, ctx);
    if (node.type !== 'COMPONENT')
      throw new Error(`${spec.name}'s root isn't a component.`);
    node.name = spec.variantProperties.length > 0 ? variant.name : spec.name;
    if (variant.notes.length > 0) node.description = variant.notes.join('\n');
    variants.push(node);
    if (variants.length % PROGRESS_EVERY === 0) {
      await progress(
        `Building ${spec.name}: ${variants.length} of ${spec.variants.length} variants…`
      );
    }
  }
  ctx.where = spec.name;
  const [single] = variants;
  if (!single) throw new Error(`${spec.name} has no variants.`);
  const owner =
    spec.variantProperties.length > 0
      ? figma.combineAsVariants(variants, figma.currentPage)
      : single;
  if (owner.type === 'COMPONENT_SET') {
    owner.name = spec.name;
    arrange(owner, spec);
    ctx.report.created.componentSets += 1;
  }
  ctx.report.created.components += variants.length;
  const keys = new Map<string, string>();
  const add = (
    kind: string,
    name: string,
    type: ComponentPropertyType,
    value: string | boolean
  ) => {
    try {
      keys.set(
        `${kind} ${name}`,
        owner.addComponentProperty(name, type, value)
      );
    } catch (error) {
      fail(ctx, `${name} property`, error);
    }
  };
  for (const property of spec.booleanProperties)
    add('visible', property.name, 'BOOLEAN', property.default);
  for (const property of spec.textProperties)
    add('characters', property.name, 'TEXT', property.default);
  for (const property of spec.swapProperties) {
    const icon = ctx.icons.get(property.default);
    if (icon) add('swap', property.name, 'INSTANCE_SWAP', icon.id);
  }
  for (const { node, visible, characters, swap } of ctx.references) {
    const references: {
      visible?: string;
      characters?: string;
      mainComponent?: string;
    } = {};
    if (visible) references.visible = keys.get(`visible ${visible}`);
    if (characters)
      references.characters = keys.get(`characters ${characters}`);
    if (swap) references.mainComponent = keys.get(`swap ${swap}`);
    try {
      node.componentPropertyReferences = references;
    } catch (error) {
      fail(ctx, `${node.name} properties`, error);
    }
  }
  return owner;
}

async function build(capture: CaptureFile): Promise<BuildReport> {
  const report: BuildReport = {
    format: REPORT_FORMAT,
    version: 2,
    created: {
      collections: 0,
      variables: 0,
      textStyles: 0,
      effectStyles: 0,
      icons: 0,
      componentSets: 0,
      components: 0,
      instances: 0,
    },
    modes: [],
    unbound: [],
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
    font: await fontLoader(report),
    references: [],
    where: 'setup',
  };
  try {
    if (capture.format !== CAPTURE_FORMAT || capture.version !== 2) {
      throw new Error(
        'This capture comes from another nxds-cli version than this plugin. Rebuild the plugin from the same checkout.'
      );
    }
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await progress('Creating variables…');
    await createVariables(capture, ctx);
    await progress('Creating text and shadow styles…');
    await createStyles(capture, ctx);
    await progress('Building the icon set…');
    await createIcons(capture, ctx);
    const page = figma.currentPage;
    let x = 0;
    let y = 0;
    let rowHeight = 0;
    const built: SceneNode[] = [];
    for (const spec of capture.components) {
      await progress(
        `Building ${spec.name}: ${spec.variants.length} variants…`
      );
      try {
        const owner = await buildComponent(spec, ctx);
        page.appendChild(owner);
        if (x > 0 && x + owner.width > PAGE_WIDTH) {
          x = 0;
          y += rowHeight + COMPONENT_GAP;
          rowHeight = 0;
        }
        owner.x = x;
        owner.y = y;
        x += owner.width + COMPONENT_GAP;
        rowHeight = Math.max(rowHeight, owner.height);
        ctx.components.set(spec.name, owner);
        built.push(owner);
      } catch (error) {
        ctx.where = spec.name;
        fail(ctx, '', error);
      }
      for (const variant of spec.variants)
        report.unbound.push(...unboundValues(spec.name, variant));
    }
    figma.viewport.scrollAndZoomIntoView(built);
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
