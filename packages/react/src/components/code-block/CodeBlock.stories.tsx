import tsx from '@shikijs/langs/tsx';
import type { Meta, StoryObj } from '@storybook/react';
import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { Card, CardHeader, CardTitle } from '../card/card';

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockLine,
  codeBlockTheme,
} from './code-block';

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  parameters: {
    docs: {
      description: {
        component:
          'CodeBlock shows code on its own surface, one CodeBlockLine per line. It does not colour the code. To colour it, highlight the code with Shiki and `codeBlockTheme`, then put the tokens of each line in a CodeBlockLine. A line that is too wide scrolls sideways.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

// ── Fixtures ─────────────────────────────────────────────────────────────────

const switchStory = `export const Toggles: Story = {
  args: { onCheckedChange: fn() },
  play: async ({ canvas, args }) => {
    const toggle = canvas.getByRole('switch');
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};`.split('\n');

const packageJson = `{
  "name": "acme-dashboard",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@nxds/core": "^0.9.0",
    "@nxds/tailwind": "^0.1.0",
    "next": "^15.1.6",
    "react": "^19.2.3"
  }
}`.split('\n');

const installCommand = 'npx nxds-cli@latest add code-block';

const saveBarDiff: { line: string; diff?: 'added' | 'removed' }[] = [
  { line: 'export function SaveBar({ saving, onSave }: SaveBarProps) {' },
  { line: '  return (' },
  { line: '    <Button onClick={onSave} disabled={saving}>', diff: 'removed' },
  { line: '      {saving && <Spinner />}', diff: 'removed' },
  { line: '    <Button onClick={onSave} loading={saving}>', diff: 'added' },
  { line: '      Save changes' },
  { line: '    </Button>' },
  { line: '  );' },
  { line: '}' },
];

const highlighter = createHighlighterCoreSync({
  themes: [codeBlockTheme],
  langs: [tsx],
  engine: createJavaScriptRegexEngine(),
});

const saveBar = highlighter.codeToTokens(
  `import { Button } from '@/components/nxds/button/button';

export function SaveBar({ onSave }: { onSave: () => void }) {
  // Saves the draft and keeps the editor open.
  return <Button onClick={onSave}>Save changes</Button>;
}`,
  { lang: 'tsx', theme: codeBlockTheme.name }
).tokens;

// ============================================
// BASIC STORIES
// ============================================

// A shell command with a copy control: the most common code block.
export const Default: Story = {
  tags: ['docs'],
  render: () => (
    <CodeBlock className="nx:max-w-xl">
      <CodeBlockContent>
        <CodeBlockLine>npx nxds-cli@latest add code-block</CodeBlockLine>
      </CodeBlockContent>
      <CodeBlockCopyButton />
    </CodeBlock>
  ),
};

// The gutter takes the width of the widest number, so the code stays aligned.
export const LineNumbers: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `number` on each line to show it in the gutter. The copy button copies the code without the numbers.',
      },
    },
  },
  render: () => (
    <CodeBlock className="nx:max-w-xl">
      <CodeBlockContent>
        {switchStory.map((line, index) => (
          <CodeBlockLine key={index} number={index + 1}>
            {line}
          </CodeBlockLine>
        ))}
      </CodeBlockContent>
      <CodeBlockCopyButton />
    </CodeBlock>
  ),
};

// One line runs now, two lines ran: the step a test runner is on, and its results.
export const MarkedLines: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `highlighted` to draw the eye to a line, and `status` to mark a result. Give the result in text as well.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:max-w-xl nx:flex-col nx:gap-2">
      <CodeBlock>
        <CodeBlockContent>
          {switchStory.map((line, index) => (
            <CodeBlockLine
              key={index}
              number={index + 1}
              highlighted={index === 6}
              status={
                index === 4 ? 'success' : index === 5 ? 'error' : undefined
              }
            >
              {line}
            </CodeBlockLine>
          ))}
        </CodeBlockContent>
      </CodeBlock>
      <p className="nx:m-0 nx:typography-body-small nx:text-muted-foreground">
        Line 5 passed. Line 6 failed. Line 7 is running.
      </p>
    </div>
  ),
};

// A change shown as a diff: removed lines, then the lines that replace them.
export const DiffLines: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `diff` to `added` or `removed` to show a change. The copy button copies the new code, without the removed lines.',
      },
    },
  },
  render: () => (
    <CodeBlock className="nx:max-w-xl">
      <CodeBlockContent>
        {saveBarDiff.map(({ line, diff }, index) => (
          <CodeBlockLine key={index} diff={diff}>
            {line}
          </CodeBlockLine>
        ))}
      </CodeBlockContent>
      <CodeBlockCopyButton />
    </CodeBlock>
  ),
};

// Inside a card the card draws the frame, so the block drops its own.
export const InCard: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Use the `flush` variant inside a Card. The card draws the border and the corners.',
      },
    },
  },
  render: () => (
    <Card className="nx:max-w-xl">
      <CardHeader className="nx:border-b-default nx:border-border-default nx:px-4 nx:py-3">
        <CardTitle className="nx:typography-label-default">
          Switch.stories.tsx
        </CardTitle>
      </CardHeader>
      <CodeBlock variant="flush">
        <CodeBlockContent>
          {switchStory.map((line, index) => (
            <CodeBlockLine key={index} number={index + 1}>
              {line}
            </CodeBlockLine>
          ))}
        </CodeBlockContent>
        <CodeBlockCopyButton />
      </CodeBlock>
    </Card>
  ),
};

// A max height turns a long file into a scroll region of its own.
export const MaxHeight: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Add a `nx:max-h-*` class to CodeBlockContent to scroll long code inside a fixed height.',
      },
    },
  },
  render: () => (
    <CodeBlock className="nx:max-w-xl">
      <CodeBlockContent className="nx:max-h-48">
        {packageJson.map((line, index) => (
          <CodeBlockLine key={index} number={index + 1}>
            {line}
          </CodeBlockLine>
        ))}
      </CodeBlockContent>
      <CodeBlockCopyButton />
    </CodeBlock>
  ),
};

// Shiki tokens coloured by codeBlockTheme, as theme variables that follow the mode.
export const SyntaxHighlighting: Story = {
  render: () => (
    <CodeBlock className="nx:max-w-xl">
      <CodeBlockContent>
        {saveBar.map((line, index) => (
          <CodeBlockLine key={index} number={index + 1}>
            {line.map((token, at) => (
              <span key={at} style={{ color: token.color }}>
                {token.content}
              </span>
            ))}
          </CodeBlockLine>
        ))}
      </CodeBlockContent>
      <CodeBlockCopyButton />
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const keyword = within(canvasElement).getByText('import');

    await expect(keyword).toHaveAttribute(
      'style',
      expect.stringContaining('var(--nx-color-syntax-keyword)')
    );
  },
};

// ============================================
// INTERACTION STORIES
// ============================================

const onCopyClick = fn();

export const CopyInteraction: Story = {
  beforeEach: () => {
    onCopyClick.mockClear();
    const writeText = spyOn(navigator.clipboard, 'writeText');
    writeText.mockResolvedValue(undefined);
    return () => writeText.mockRestore();
  },
  render: () => (
    <CodeBlock className="nx:max-w-xl">
      <CodeBlockContent>
        <CodeBlockLine number={1}>
          {"import { Button } from './button';"}
        </CodeBlockLine>
        <CodeBlockLine number={2} />
        <CodeBlockLine number={3}>{'export { Button };'}</CodeBlockLine>
      </CodeBlockContent>
      <CodeBlockCopyButton onClick={onCopyClick} />
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Copy code' });
    const status = canvas.getByRole('status');

    await userEvent.click(button);
    await expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "import { Button } from './button';\n\nexport { Button };"
    );
    await expect(button).toHaveAttribute('data-state', 'copied');
    await expect(status).toHaveTextContent('Code copied to clipboard');

    // A second copy remounts the message, so screen readers announce it again.
    const firstMessage = status.firstElementChild;
    await userEvent.click(button);
    await waitFor(() =>
      expect(status.firstElementChild).not.toBe(firstMessage)
    );
    await expect(status).toHaveTextContent('Code copied to clipboard');
    await expect(onCopyClick).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(button).toHaveAttribute('data-state', 'idle'), {
      timeout: 3000,
    });
    await expect(status).toHaveTextContent('');
  },
};

export const CopyFailure: Story = {
  beforeEach: () => {
    const writeText = spyOn(navigator.clipboard, 'writeText');
    writeText.mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    return () => writeText.mockRestore();
  },
  render: () => (
    <CodeBlock className="nx:max-w-xl">
      <CodeBlockContent>
        <CodeBlockLine>{installCommand}</CodeBlockLine>
      </CodeBlockContent>
      <CodeBlockCopyButton />
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Copy code' });

    await userEvent.click(button);
    await expect(button).toHaveAttribute('data-state', 'failed');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Could not copy code'
    );
  },
};

// With no code in the block, the copy fails instead of copying nothing.
export const CopyEmptyCode: Story = {
  beforeEach: () => {
    const writeText = spyOn(navigator.clipboard, 'writeText');
    writeText.mockResolvedValue(undefined);
    return () => writeText.mockRestore();
  },
  render: () => (
    <CodeBlock className="nx:max-w-xl">
      <CodeBlockContent>
        <CodeBlockLine />
      </CodeBlockContent>
      <CodeBlockCopyButton />
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Copy code' });

    await userEvent.click(button);
    await expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    await expect(button).toHaveAttribute('data-state', 'failed');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Could not copy code'
    );
  },
};

// The scroll region takes focus first, then the copy button; Enter copies.
export const KeyboardInteraction: Story = {
  beforeEach: () => {
    const writeText = spyOn(navigator.clipboard, 'writeText');
    writeText.mockResolvedValue(undefined);
    return () => writeText.mockRestore();
  },
  render: () => (
    <CodeBlock className="nx:max-w-xl">
      <CodeBlockContent>
        <CodeBlockLine>{installCommand}</CodeBlockLine>
      </CodeBlockContent>
      <CodeBlockCopyButton />
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvasElement.querySelector(
      '[data-slot="scroll-area-viewport"]'
    );

    await userEvent.tab();
    await expect(viewport).toHaveFocus();
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Copy code' })
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      installCommand
    );
  },
};

// Removed lines show a minus and stay out of the copy; added lines show a plus.
export const DiffLinesCopy: Story = {
  beforeEach: () => {
    const writeText = spyOn(navigator.clipboard, 'writeText');
    writeText.mockResolvedValue(undefined);
    return () => writeText.mockRestore();
  },
  render: () => (
    <CodeBlock className="nx:max-w-xl">
      <CodeBlockContent>
        <CodeBlockLine number={1}>{'<Button'}</CodeBlockLine>
        <CodeBlockLine number={2} diff="removed">
          {'  disabled={saving}'}
        </CodeBlockLine>
        <CodeBlockLine number={3} diff="added" highlighted>
          {'  loading={saving}'}
        </CodeBlockLine>
        <CodeBlockLine number={4}>{'>'}</CodeBlockLine>
      </CodeBlockContent>
      <CodeBlockCopyButton />
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lines = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="code-block-line"]'
    );

    await expect(lines[1]).toHaveAttribute('data-diff', 'removed');
    await expect(lines[2]).toHaveAttribute('data-diff', 'added');
    // The marker comes before the code, so readers hear it first.
    await expect(
      getComputedStyle(lines[1]!.firstElementChild!, '::before').content
    ).toBe('"−"');
    await expect(
      getComputedStyle(lines[2]!.firstElementChild!, '::before').content
    ).toBe('"+"');
    // The marker shares the line's row, so a diff line is one line tall.
    await expect(lines[1]!.offsetHeight).toBe(lines[0]!.offsetHeight);
    await expect(lines[2]!.offsetHeight).toBe(lines[0]!.offsetHeight);
    await userEvent.click(canvas.getByRole('button', { name: 'Copy code' }));
    await expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '<Button\n  loading={saving}\n>'
    );
  },
};

// ============================================
// EDGE CASES
// ============================================

// A line wider than the block scrolls the region, not the page.
export const LongLines: Story = {
  render: () => (
    <CodeBlock className="nx:w-80">
      <CodeBlockContent>
        <CodeBlockLine number={1}>
          {
            "const message = 'A line this long runs past the edge of the block, so the block scrolls sideways.';"
          }
        </CodeBlockLine>
        <CodeBlockLine number={2} highlighted>
          {'console.log(message);'}
        </CodeBlockLine>
      </CodeBlockContent>
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );
    const lines = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="code-block-line"]'
    );

    await expect(viewport!.scrollWidth).toBeGreaterThan(viewport!.clientWidth);
    // The highlight spans the scrolled width, not only the visible part.
    await expect(lines[1]!.offsetWidth).toBe(lines[0]!.offsetWidth);
  },
};

// An empty line keeps the height of a line of text.
export const EmptyLine: Story = {
  render: () => (
    <CodeBlock className="nx:max-w-xl">
      <CodeBlockContent>
        <CodeBlockLine>{'const first = 1;'}</CodeBlockLine>
        <CodeBlockLine />
        <CodeBlockLine>{'const second = 2;'}</CodeBlockLine>
      </CodeBlockContent>
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const lines = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="code-block-line"]'
    );

    await expect(lines[1]!.offsetHeight).toBe(lines[0]!.offsetHeight);
  },
};

export const WithDataAttributes: Story = {
  render: () => (
    <CodeBlock variant="flush" className="nx:max-w-xl">
      <CodeBlockContent language="ts">
        <CodeBlockLine number={1} highlighted status="success">
          {'await userEvent.click(toggle);'}
        </CodeBlockLine>
        <CodeBlockLine number={2}>
          {'await expect(toggle).toBeChecked();'}
        </CodeBlockLine>
      </CodeBlockContent>
      <CodeBlockCopyButton />
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="code-block"]');
    const content = canvasElement.querySelector(
      '[data-slot="code-block-content"]'
    );
    const lines = canvasElement.querySelectorAll(
      '[data-slot="code-block-line"]'
    );
    const button = canvasElement.querySelector(
      '[data-slot="code-block-copy-button"]'
    );

    await expect(root).toHaveAttribute('data-variant', 'flush');
    await expect(content!.querySelector('code')).toHaveClass('language-ts');
    await expect(lines[0]).toHaveAttribute('data-number', '1');
    await expect(lines[0]).toHaveAttribute('data-highlighted');
    await expect(lines[0]).toHaveAttribute('data-status', 'success');
    await expect(lines[1]).not.toHaveAttribute('data-highlighted');
    await expect(lines[1]).not.toHaveAttribute('data-status');
    await expect(button).toHaveAttribute('data-state', 'idle');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:w-full nx:max-w-xl nx:flex-col nx:gap-6 nx:typography-label-default nx:text-foreground">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <span className="nx:text-muted-foreground">Default</span>
        <CodeBlock>
          <CodeBlockContent>
            <CodeBlockLine number={1}>{installCommand}</CodeBlockLine>
            <CodeBlockLine number={2} highlighted>
              {'npx nxds-cli@latest add card'}
            </CodeBlockLine>
          </CodeBlockContent>
          <CodeBlockCopyButton />
        </CodeBlock>
      </div>
      <div className="nx:flex nx:flex-col nx:gap-2">
        <span className="nx:text-muted-foreground">Flush, inside a Card</span>
        <Card>
          <CodeBlock variant="flush">
            <CodeBlockContent>
              <CodeBlockLine number={1} status="success">
                {installCommand}
              </CodeBlockLine>
              <CodeBlockLine number={2} status="error">
                {'npx nxds-cli@latest add card'}
              </CodeBlockLine>
            </CodeBlockContent>
            <CodeBlockCopyButton />
          </CodeBlock>
        </Card>
      </div>
      <div className="nx:flex nx:flex-col nx:gap-2">
        <span className="nx:text-muted-foreground">Diff lines</span>
        <CodeBlock>
          <CodeBlockContent>
            <CodeBlockLine number={1} diff="removed">
              {'npx nxds-cli@latest add card'}
            </CodeBlockLine>
            <CodeBlockLine number={2} diff="added">
              {installCommand}
            </CodeBlockLine>
          </CodeBlockContent>
          <CodeBlockCopyButton />
        </CodeBlock>
      </div>
    </div>
  ),
};
