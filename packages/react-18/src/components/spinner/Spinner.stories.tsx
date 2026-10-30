import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { Spinner } from './spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          'Spinner shows that something is loading. Use it for page loads, "loading more" rows and Suspense fallbacks. For a loading Button, use its `loading` prop.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

// The default spinner — a 16px glyph rotating in the current text color.
export const Default: Story = {
  tags: ['docs'],
  render: () => <Spinner />,
};

// Sized with nx:size-* utilities; the glyph inherits currentColor, so it tints
// with nx:text-*.
export const Sizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Size the spinner with a `size-icon` class, such as `nx:size-icon-glyph-lg` or `nx:size-icon-[calc(var(--nx-icon-glyph-default)*2)]`, so its line grows with it. Tint it with `nx:text-*`.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-4 nx:text-foreground">
      <Spinner />
      <Spinner className="nx:size-icon-glyph-lg" />
      <Spinner className="nx:size-icon-[calc(var(--nx-icon-glyph-default)*2)] nx:text-primary-subtle-foreground" />
    </div>
  ),
};

// Beside the text it describes; a loading Button uses its own `loading` prop.
export const WithText: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Place the spinner beside text that says what is loading.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:items-center nx:gap-2 nx:typography-body-default nx:text-muted-foreground">
      <Spinner />
      Loading results…
    </div>
  ),
};

// The spinner is a status live-region: role="status" carrying an accessible
// name, plus a data-slot hook.
export const WithDataAttributes: Story = {
  render: () => <Spinner />,
  play: async ({ canvasElement }) => {
    const spinner = within(canvasElement).getByRole('status');
    await expect(spinner).toHaveAccessibleName('Loading');
    await expect(spinner).toHaveAttribute('data-slot', 'spinner');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// A range of sizes, a tinted variant, and an inline "loading more" caption.
// Reused by the per-base variant generator.
export const AllVariants: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4 nx:text-foreground">
      <div className="nx:flex nx:items-center nx:gap-4">
        <Spinner />
        <Spinner className="nx:size-icon-glyph-lg" />
        <Spinner className="nx:size-icon-[calc(var(--nx-icon-glyph-default)*2)]" />
      </div>
      <div className="nx:flex nx:items-center nx:gap-2 nx:typography-label-default nx:text-muted-foreground">
        <Spinner />
        <span>Loading more…</span>
      </div>
    </div>
  ),
};
