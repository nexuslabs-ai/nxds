/**
 * `template` with each `{{nxds:name}}` replaced by its value. A placeholder
 * with no value throws, naming `file`. A plain `{{name}}` is a canvas binding
 * and stays as written.
 */
export function fillTemplate(
  file: string,
  template: string,
  values: Readonly<Record<string, string>>
) {
  return template.replace(
    /\{\{nxds:(\w+)\}\}/g,
    (placeholder, name: string) => {
      const value = values[name];
      if (value === undefined) {
        throw new Error(`${file}: ${placeholder} has no value.`);
      }
      return value;
    }
  );
}
