// nxds:canvas-schema, the attributes bundle.js converts strings by
// (src/runtime/attributes.ts), as index.d.ts reads them from each prop.
import type {
  Attribute,
  CanvasAttribute,
  ScalarAttribute,
  SchemaAttribute,
  SchemaScalar,
} from './attribute.ts';
import { type FlatComponent, isRequired } from './props.ts';
import type { CanvasSchema } from './runtime/attributes.ts';
import { kebab } from './runtime/canvas-names.ts';

function withoutSuggested(attribute: ScalarAttribute): SchemaScalar {
  const { suggested: _suggested, ...rest } = attribute;
  return rest;
}

function forRuntime(attribute: CanvasAttribute): SchemaAttribute {
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
): SchemaAttribute | null {
  if (
    !attribute ||
    attribute.kind === 'content' ||
    attribute.kind === 'handler' ||
    attribute.kind === 'none'
  ) {
    return null;
  }
  if (attribute.kind !== 'scalar' || required) return forRuntime(attribute);
  const { literals, string, number, boolean } = attribute;
  const plainString = string && literals.length === 0 && !number && !boolean;
  return plainString ? null : withoutSuggested(attribute);
}

export function canvasSchema(parts: readonly FlatComponent[]): CanvasSchema {
  const schema: CanvasSchema = {
    attributes: {},
    required: {},
    unwrap: parts.filter((part) => part.unwraps).map((part) => part.name),
    renames: {},
    handlers: {},
  };
  for (const part of parts) {
    const renames = part.props
      .filter((prop) => /^data[A-Z]/.test(prop.name))
      .map((prop) => [kebab(prop.name), prop.name]);
    if (renames.length > 0)
      schema.renames[part.name] = Object.fromEntries(renames);
    const handlers = part.props
      .filter((prop) => isRequired(prop) && prop.attribute?.kind === 'handler')
      .map((prop) => prop.name);
    if (handlers.length > 0) schema.handlers[part.name] = handlers;
    const attributes: Record<string, SchemaAttribute> = {};
    const required: string[] = [];
    for (const prop of part.props) {
      const attribute = converted(prop.attribute, isRequired(prop));
      if (!attribute) continue;
      attributes[prop.name] = attribute;
      if (isRequired(prop)) required.push(prop.name);
    }
    if (Object.keys(attributes).length > 0) {
      schema.attributes[part.name] = attributes;
    }
    if (required.length > 0) schema.required[part.name] = required;
  }
  return schema;
}
