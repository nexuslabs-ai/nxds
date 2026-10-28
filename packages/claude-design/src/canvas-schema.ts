// nxds:canvas-schema, the rules bundle.js converts attribute strings by
// (src/attributes.ts), written from each prop's attribute kind.
import type { Attribute, ScalarAttribute } from './attribute.ts';
import type { CanvasSchema, Rule } from './attributes.ts';
import { kebab } from './canvas-wrapper.ts';
import type { FlatComponent } from './props.ts';

function scalarRule(scalar: ScalarAttribute): Rule {
  const only = scalar.literals.length === 0;
  if (only && scalar.boolean && !scalar.string && !scalar.number) return 'b';
  if (only && scalar.number && !scalar.string && !scalar.boolean) return 'n';
  const flags = [
    scalar.string ? 's' : '',
    scalar.number ? 'n' : '',
    scalar.boolean ? 'b' : '',
  ].join('');
  return ['e', scalar.literals, flags];
}

// Null for a prop whose attribute string is already its value.
function ruleOf(attribute: Attribute | null, required: boolean): Rule | null {
  switch (attribute?.kind) {
    case 'scalar': {
      const rule = scalarRule(attribute);
      const plainString =
        Array.isArray(rule) && rule[1].length === 0 && rule[2] === 's';
      if (!plainString) return rule;
      return required ? 's' : null;
    }
    case 'list':
      return [
        'l',
        attribute.item.kind === 'date' ? 'd' : scalarRule(attribute.item),
        attribute.single ? scalarRule(attribute.single) : null,
      ];
    case 'date':
      return attribute.selection ? 'D' : 'd';
    case 'icon':
      return attribute.as === 'name' ? 'i' : 'I';
    case 'json':
      return [
        'j',
        attribute.shape === 'object'
          ? 'o'
          : attribute.shape === 'array'
            ? 'a'
            : '*',
        attribute.required,
        attribute.dateKeys,
        attribute.dateItems ? 1 : 0,
        attribute.boolean ? 1 : 0,
      ];
    default:
      return null;
  }
}

/** Parts that read their children's types, as Recharts finds a chart's series and Cells. */
const UNWRAPS = (part: FlatComponent) =>
  part.slug === 'recharts' || part.name === 'ChartContainer';

export function canvasSchema(parts: readonly FlatComponent[]): CanvasSchema {
  const schema: CanvasSchema = {
    rules: {},
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
    const rules: Record<string, Rule> = {};
    const required: string[] = [];
    for (const prop of part.props) {
      const isRequired = !prop.optional && prop.defaultValue === null;
      const rule = ruleOf(prop.attribute, isRequired);
      if (!rule) continue;
      rules[prop.name] = rule;
      if (isRequired) required.push(prop.name);
    }
    if (Object.keys(rules).length > 0) schema.rules[part.name] = rules;
    if (required.length > 0) schema.required[part.name] = required;
  }
  return schema;
}
