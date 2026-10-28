const SCOPES = {
  'syntax-keyword': [
    'keyword',
    'storage',
    'storage.type',
    'storage.modifier',
    'keyword.control',
    'variable.language',
  ],
  'syntax-string': [
    'string',
    'constant.character.escape',
    'punctuation.definition.string',
  ],
  'syntax-function': [
    'entity.name.function',
    'support.function',
    'meta.function-call',
    'entity.other.attribute-name',
  ],
  'syntax-type': [
    'entity.name.type',
    'entity.name.class',
    'entity.name.tag',
    'support.type',
    'support.class',
  ],
  'syntax-constant': [
    'constant.numeric',
    'constant.language',
    'constant.other',
  ],
  'muted-foreground': ['comment', 'punctuation.definition.comment'],
  'muted-foreground-subtle': ['punctuation', 'keyword.operator', 'meta.brace'],
} satisfies Record<string, readonly string[]>;

const TOKEN_COLORS = Object.entries(SCOPES).map(([token, scope]) => ({
  scope: [...scope],
  settings: { foreground: `var(--nx-color-${token})` },
}));

/**
 * Shiki theme for CodeBlock. Each syntax colour is a theme token that stays
 * legible on the CodeBlock surface, a highlighted line and the diff tints, in
 * light and dark mode.
 */
const codeBlockTheme = {
  name: 'nxds',
  colors: { 'editor.foreground': 'var(--nx-color-foreground)' },
  settings: TOKEN_COLORS,
  // rehype-pretty-code reads a theme as a light/dark record unless it carries
  // `tokenColors`; Shiki itself reads `settings`.
  tokenColors: TOKEN_COLORS,
};

export { codeBlockTheme };
