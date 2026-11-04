// The prompt that sets nxds up in a Claude chat. The Claude Design page shows
// it, the Playground copies it with the person's theme, and write-markdown.ts
// checks that the page's Markdown tells Claude to read the theme line. Node
// runs that script as is, so this module imports nothing.

/** The label of the prompt's theme line. The page's steps tell Claude to look for it. */
export const THEME_FLAGS_LABEL = 'Theme flags:';

/**
 * The setup prompt. With `flags`, such as `--brand-color '#e11d48'`, it adds
 * a theme line for Claude to pass to the export command as written.
 */
export function claudeDesignPrompt(flags = '') {
  return [
    'Set up the nxds design system on a Claude Design canvas for me.',
    'Fetch https://nxds.dev/getting-started/claude-design.md and follow its steps exactly, in order.',
    ...(flags ? [`${THEME_FLAGS_LABEL} \`${flags}\``] : []),
    "When the sampler artboard passes every check, tell me and give me the system's link. Then wait for my design request.",
  ].join('\n');
}
