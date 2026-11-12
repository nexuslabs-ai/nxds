// A part's props, read from the release's components/index.d.ts: one flat
// `<Part>Props` interface per part, each prop's type printed as the canvas
// takes it, with its default in an `@default` tag.

export interface PropInfo {
  name: string;
  /** The string literals of a union of strings, or undefined. */
  literals?: string[];
  boolean: boolean;
  default?: string;
}

/** Every prop of `part`. Throws when the release has no such part. */
export function partProps(indexDts: string, part: string): PropInfo[] {
  const start = indexDts.indexOf(`export interface ${part}Props {`);
  if (start === -1) throw new Error(`index.d.ts has no ${part}Props.`);
  const end = indexDts.indexOf('\n}', start);
  const props: PropInfo[] = [];
  let defaultValue: string | undefined;
  for (const line of indexDts.slice(start, end).split('\n')) {
    const tag = /@default\s+("[^"]*"|\S+)/.exec(line);
    if (tag?.[1]) {
      defaultValue = tag[1].startsWith('"')
        ? (JSON.parse(tag[1]) as string)
        : tag[1];
      continue;
    }
    const match = /^\s+([\w$]+)\??: (.+);$/.exec(line);
    if (!match?.[1] || !match[2]) continue;
    const parts = match[2].split(' | ');
    const literals = parts.every((literal) => /^"[^"]*"$/.test(literal))
      ? parts.map((literal) => JSON.parse(literal) as string)
      : undefined;
    props.push({
      name: match[1],
      literals,
      boolean: match[2] === 'boolean',
      default: defaultValue,
    });
    defaultValue = undefined;
  }
  return props;
}

/** `prop` of `part`. Throws when the part has no such prop. */
export function partProp(indexDts: string, part: string, prop: string) {
  const found = partProps(indexDts, part).find((entry) => entry.name === prop);
  if (!found) throw new Error(`index.d.ts: ${part}Props has no ${prop}.`);
  return found;
}

/** The values with the default first, so Figma shows the default variant first. */
export function defaultFirst(
  values: readonly string[],
  first: string | undefined
) {
  if (first === undefined || !values.includes(first)) return [...values];
  return [first, ...values.filter((value) => value !== first)];
}
