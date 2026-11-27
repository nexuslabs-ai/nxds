// The `--nx-*` names text reads, and which components read a token. The
// export's theme module runs this in nxds-cli, so it imports nothing.

export interface ComponentReads {
  /** Each `--nx-*` name a component reads, with the components that read it. */
  readers: ReadonlyMap<string, readonly string[]>;
  /** A name built at runtime, such as `--nx-spacing-${spacing}`, by its prefix. */
  prefixes: ReadonlyMap<string, readonly string[]>;
}

// Tailwind's build wraps a long `var()` argument onto its own line.
const VARIABLE = /var\(\s*(--nx-[\w-]+)\s*[,)]/g;
export const DYNAMIC_VARIABLE = /var\(\s*(--nx-[\w-]*-)\$\{/g;
/** Every `--nx-*` name `text` reads. */
export function variablesRead(text: string) {
  return new Set([...text.matchAll(VARIABLE)].map(([, name = '']) => name));
}

/** The components that read `name`, directly or through a runtime-built name. */
export function readersOf({ readers, prefixes }: ComponentReads, name: string) {
  const found = new Set(readers.get(name) ?? []);
  for (const [prefix, names] of prefixes) {
    if (name.startsWith(prefix)) for (const reader of names) found.add(reader);
  }
  return [...found].sort();
}
