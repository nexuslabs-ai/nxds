// Canvas markup's attributes as an app's components take them. A README
// example writes every prop as a string, such as a chart's `data` as JSON,
// and the release's bundle converts them. An app's own components don't, so
// the export converts them here, by the app's own types, the same way.
import type {
  CanvasSchema,
  SchemaAttribute,
} from '@nxds/claude-design/attribute';
import { convertValue, type Props } from '@nxds/claude-design/values';

import type { MarkupNode } from './page.ts';

/** The prop whose value picks how `attribute` reads, such as Accordion's `type`. */
function pickerOf(attribute: SchemaAttribute) {
  if (attribute.kind === 'list') return attribute.listWhen?.prop ?? null;
  if (attribute.kind === 'date') return attribute.selection?.prop ?? null;
  return null;
}

/** `part`'s props with each attribute string converted to its prop's type. Throws when one doesn't fit. */
function converted(part: string, props: Props, schema: CanvasSchema) {
  const result: Props = { ...props };
  for (const handler of schema.handlers[part] ?? []) {
    result[handler] ??= { __handler: true };
  }
  const attributes = schema.attributes[part] ?? {};
  // The props that pick how another reads convert first.
  const pickers = new Set(Object.values(attributes).map(pickerOf));
  const keys = Object.keys(props).sort(
    (a, b) => Number(pickers.has(b)) - Number(pickers.has(a))
  );
  for (const key of keys) {
    const value = result[key];
    const attribute = attributes[key];
    if (typeof value !== 'string' || !attribute) continue;
    if (attribute.kind === 'icon') {
      result[key] = attribute.as === 'name' ? value : { __icon: value };
      continue;
    }
    const outcome = convertValue(
      value,
      attribute,
      result,
      (schema.required[part] ?? []).includes(key)
    );
    if ('problem' in outcome) {
      throw new Error(
        `the example's ${part} ${key} ${outcome.problem} for the app's ${part}`
      );
    }
    result[key] = outcome.value;
  }
  return result;
}

/** `nodes` with every part's attributes converted by `schema`, an app's. */
export function convertMarkup(
  nodes: readonly MarkupNode[],
  schema: CanvasSchema
): MarkupNode[] {
  return nodes.map((node) => {
    if (typeof node === 'string') return node;
    return {
      ...node,
      props:
        node.part === null
          ? node.props
          : converted(node.part, node.props, schema),
      children: convertMarkup(node.children, schema),
    };
  });
}
