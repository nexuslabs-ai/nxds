import { claudeDesignPrompt } from '../_lib/claude-design-prompt';

import { CodeSample } from './CodeSample';

/** The Claude Design setup prompt, for the default theme. */
export function ClaudeDesignPrompt() {
  return <CodeSample lang="text">{claudeDesignPrompt()}</CodeSample>;
}
