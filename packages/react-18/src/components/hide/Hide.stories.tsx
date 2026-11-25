import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Hide } from './hide';

const meta: Meta<typeof Hide> = {
  component: Hide,
  parameters: {
    docs: {
      description: {
        component:
          'Hide removes its children from view above or below a viewport or container width. Use it for responsive visibility instead of toggling `nx:hidden` classes. To show content only at a width, use Show.',
      },
    },
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Hide>;

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
      <Hide above="lg" as="div">
        <div className={box}>
          Hidden when the viewport is <strong>lg</strong> (≥ 64rem) or wider.
        </div>
      </Hide>
      <Hide below="lg" as="div">
        <div className={box}>
          Hidden when the viewport is narrower than <strong>lg</strong>.
        </div>
      </Hide>
    </div>
  ),
};

export const AllAxes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Each of the four props hides its content at a different viewport or container width.',
      },
    },
  },
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <div>
        <span className={label}>
          {'<Hide above="lg">'} — hidden viewport ≥ lg
        </span>
        <Hide above="lg" as="div">
          <div className={box}>Hidden on wide viewports.</div>
        </Hide>
      </div>
      <div>
        <span className={label}>
          {'<Hide below="lg">'} — hidden viewport &lt; lg
        </span>
        <Hide below="lg" as="div">
          <div className={box}>Hidden on narrow viewports.</div>
        </Hide>
      </div>
      <div
        className="nx:@container nx:rounded-md nx:border-default nx:border-border-default nx:p-2"
        style={{ width: 600 }}
      >
        <span className={label}>
          {'<Hide containerAbove="md">'} — hidden in this 600px container
        </span>
        <Hide containerAbove="md" as="div">
          <div className={box}>Hidden because the container is wide.</div>
        </Hide>
      </div>
      <div
        className="nx:@container nx:rounded-md nx:border-default nx:border-border-default nx:p-2"
        style={{ width: 240 }}
      >
        <span className={label}>
          {'<Hide containerBelow="md">'} — hidden in this 240px container
        </span>
        <Hide containerBelow="md" as="div">
          <div className={box}>Hidden because the container is narrow.</div>
        </Hide>
      </div>
    </div>
  ),
};

// ============================================
// INTERACTION / PLAY TESTS  (inverse of <Show>)
// ============================================

export const WithDataAttributes: Story = {
  render: () => (
    <Hide above="lg" data-testid="el">
      <span>content</span>
    </Hide>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('el')).toHaveAttribute('data-slot', 'hide');
  },
};
