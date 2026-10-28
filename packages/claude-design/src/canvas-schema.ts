// nxds:canvas-schema, the attributes bundle.js converts strings by
// (src/runtime/attributes.ts), as index.d.ts reads them from each prop.
import type {
  Attribute,
  CanvasAttribute,
  ScalarAttribute,
} from './attribute.ts';
import type { FlatComponent } from './props.ts';
import type { CanvasSchema } from './runtime/attributes.ts';
import { kebab } from './runtime/canvas-names.ts';

function withoutSuggested({
  kind,
  literals,
  string,
  number,
  boolean,
}: ScalarAttribute): ScalarAttribute {
  return { kind, literals, string, number, boolean };
}

function forRuntime(attribute: CanvasAttribute): CanvasAttribute {
  if (attribute.kind === 'scalar') return withoutSuggested(attribute);
  if (attribute.kind !== 'list') return attribute;
  const { item, single } = attribute;
  return {
    ...attribute,
    item: item.kind === 'scalar' ? withoutSuggested(item) : item,
    single: single && withoutSuggested(single),
  };
}

// Null for a prop whose attribute string is already its value. A required
// string stays, so an empty one gets a placeholder.
function converted(
  attribute: Attribute | null,
  required: boolean
): CanvasAttribute | null {
  if (!attribute || attribute.kind === 'content' || attribute.kind === 'none') {
    return null;
  }
  if (attribute.kind !== 'scalar' || required) return forRuntime(attribute);
  const { literals, string, number, boolean } = attribute;
  const plainString = string && literals.length === 0 && !number && !boolean;
  return plainString ? null : withoutSuggested(attribute);
}

/** Parts that read their children's types, as Recharts finds a chart's series and Cells. */
const UNWRAPS = (part: FlatComponent) =>
  part.slug === 'recharts' || part.name === 'ChartContainer';

export function canvasSchema(parts: readonly FlatComponent[]): CanvasSchema {
  const schema: CanvasSchema = {
    attributes: {},
    required: {},
    unwrap: parts.filter(UNWRAPS).map((part) => part.name),
    renames: {},
  };
  for (const part of parts) {
    const renames = part.props
      .filter((prop) => /^data[A-Z]/.test(prop.name))
      .map((prop) => [kebab(prop.name), prop.name]);
    if (renames.length > 0)
      schema.renames[part.name] = Object.fromEntries(renames);
    const attributes: Record<string, CanvasAttribute> = {};
    const required: string[] = [];
    for (const prop of part.props) {
      const isRequired = !prop.optional && prop.defaultValue === null;
      const attribute = converted(prop.attribute, isRequired);
      if (!attribute) continue;
      attributes[prop.name] = attribute;
      if (isRequired) required.push(prop.name);
    }
    if (Object.keys(attributes).length > 0) {
      schema.attributes[part.name] = attributes;
    }
    if (required.length > 0) schema.required[part.name] = required;
  }
  return schema;
}
