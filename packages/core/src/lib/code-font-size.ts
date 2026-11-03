/** The rule that sets code text to `size`, which the code font size pref writes. */
export function codeFontSizeRule(size: string): string {
  return `.nx\\:font-mono, .nx\\:typography-code-block, .nx\\:typography-code-inline { font-size: ${size}; }`;
}
