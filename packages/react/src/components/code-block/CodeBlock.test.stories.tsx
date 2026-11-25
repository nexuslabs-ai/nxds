import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import type { CodeBlock } from './code-block';
import codeBlockMeta, {
  DiffLinesCopy,
  EmptyLine,
  LongLines,
  WithDataAttributes,
} from './CodeBlock.stories';

const meta: Meta<typeof CodeBlock> = {
  ...codeBlockMeta,
  title: 'Tests/CodeBlock',
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const DiffLinesCopyStyle: Story = {
  ...DiffLinesCopy,
  play: async ({ canvasElement }) => {
    const lines = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="code-block-line"]'
    );

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
  },
};

export const LongLinesGeometry: Story = {
  ...LongLines,
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

export const EmptyLineSize: Story = {
  ...EmptyLine,
  play: async ({ canvasElement }) => {
    const lines = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="code-block-line"]'
    );

    await expect(lines[1]!.offsetHeight).toBe(lines[0]!.offsetHeight);
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const content = canvasElement.querySelector(
      '[data-slot="code-block-content"]'
    );

    await expect(content!.querySelector('code')).toHaveClass('language-ts');
  },
};
