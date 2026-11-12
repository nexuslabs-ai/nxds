// A prop's allowed values and default, read from the release's
// components/index.d.ts: one flat `<Part>Props` interface per part, each prop
// a union of string literals with its default in an `@default` tag.

export interface PropValues {
  values: string[];
  default?: string;
}

/** `part`'s `prop`, with its string-literal values. Throws when the release has no such prop, or it isn't a union of strings. */
export function propValues(
  indexDts: string,
  part: string,
  prop: string
): PropValues {
  const start = indexDts.indexOf(`export interface ${part}Props {`);
  if (start === -1) throw new Error(`index.d.ts has no ${part}Props.`);
  const end = indexDts.indexOf('\n}', start);
  const lines = indexDts.slice(start, end).split('\n');
  let defaultValue: string | undefined;
  for (const line of lines) {
    const tag = /@default\s+("[^"]*"|\S+)/.exec(line);
    if (tag?.[1]) {
      defaultValue = tag[1].startsWith('"')
        ? (JSON.parse(tag[1]) as string)
        : tag[1];
      continue;
    }
    const match = /^\s+([\w$]+)\??: (.+);$/.exec(line);
    if (!match) continue;
    if (match[1] !== prop) {
      defaultValue = undefined;
      continue;
    }
    const literals = (match[2] ?? '').split(' | ');
    if (!literals.every((literal) => /^"[^"]*"$/.test(literal))) {
      throw new Error(
        `${part}Props.${prop} isn't a union of strings: ${match[2]}`
      );
    }
    return {
      values: literals.map((literal) => JSON.parse(literal) as string),
      default: defaultValue,
    };
  }
  throw new Error(`index.d.ts: ${part}Props has no ${prop}.`);
}

/** The values with the default first, so Figma shows the default variant first. */
export function defaultFirst({ values, default: first }: PropValues) {
  if (first === undefined || !values.includes(first)) return values;
  return [first, ...values.filter((value) => value !== first)];
}
