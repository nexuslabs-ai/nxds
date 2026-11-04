/**
 * `template` with each `{{name}}` replaced by its value. A placeholder with no
 * value throws, naming `file`.
 */
export function fillTemplate(
  file: string,
  template: string,
  values: Readonly<Record<string, string>>
) {
  return template.replace(/\{\{(\w+)\}\}/g, (placeholder, name: string) => {
    const value = values[name];
    if (value === undefined) {
      throw new Error(`${file}: ${placeholder} has no value.`);
    }
    return value;
  });
}
