import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Show } from './show';

const meta: Meta<typeof Show> = {
  component: Show,
  parameters: {
    docs: {
      description: {
        component:
          'Show displays its children only above or below a viewport or container width. Use it for responsive visibility instead of toggling `nx:hidden` classes. To hide content at a width, use Hide.',
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Show>;

const box =
  'nx:rounded-md nx:border-default nx:border-border-default nx:p-3 nx:text-foreground';
const label = 'nx:text-muted-foreground nx:mb-1 nx:block';

// ============================================
// VISUAL
// ============================================

export const Default: Story = {
  tags: ['docs'],
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-2">
      <Show above="lg" as="div">
        <div className={box}>
          Visible when the viewport is <strong>lg</strong> (≥ 64rem) or wider.
        </div>
      </Show>
      <Show below="lg" as="div">
        <div className={box}>
          Visible when the viewport is narrower than <strong>lg</strong>.
        </div>
      </Show>
    </div>
  ),
};

export const AllAxes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Each of the four props shows its content at a different viewport or container width.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <div>
        <span className={label}>{'<Show above="lg">'} — viewport ≥ lg</span>
        <Show above="lg" as="div">
          <div className={box}>Shown on wide viewports.</div>
        </Show>
      </div>
      <div>
        <span className={label}>{'<Show below="lg">'} — viewport &lt; lg</span>
        <Show below="lg" as="div">
          <div className={box}>Shown on narrow viewports.</div>
        </Show>
      </div>
      <div
        className="nx:@container nx:rounded-md nx:border-default nx:border-border-default nx:p-2"
        style={{ width: 600 }}
      >
        <span className={label}>
          {'<Show containerAbove="md">'} — this 600px container ≥ md
        </span>
        <Show containerAbove="md" as="div">
          <div className={box}>Shown because the container is wide.</div>
        </Show>
      </div>
      <div
        className="nx:@container nx:rounded-md nx:border-default nx:border-border-default nx:p-2"
        style={{ width: 240 }}
      >
        <span className={label}>
          {'<Show containerBelow="md">'} — this 240px container &lt; md
        </span>
        <Show containerBelow="md" as="div">
          <div className={box}>Shown because the container is narrow.</div>
        </Show>
      </div>
    </div>
  ),
};

// ============================================
// INTERACTION / PLAY TESTS
// ============================================

export const WithDataAttributes: Story = {
  render: () => (
    <Show above="lg" data-testid="el">
      <span>content</span>
    </Show>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('el')).toHaveAttribute('data-slot', 'show');
  },
};
