import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { Show } from './show';
import showMeta from './Show.stories';

const meta: Meta<typeof Show> = {
  ...showMeta,
  title: 'Tests/Show',
};

export default meta;
type Story = StoryObj<typeof Show>;

// The #103 spike guarantee: a shown wrapper is `display: contents`, never
// `block`, so its child stays a real flex item — verified across a toggle.
export const FlexParent: Story = {
  render: () => (
    <div
      className="nx:@container"
      style={{ width: 600 }}
      data-testid="container"
    >
      <div className="nx:flex nx:gap-4">
        <div
          data-testid="item-a"
          className="nx:rounded-md nx:border-default nx:border-border-default"
          style={{ width: 48, height: 48 }}
        />
        <Show containerAbove="md" data-testid="wrap">
          <div
            data-testid="item-b"
            className="nx:rounded-md nx:border-default nx:border-primary-border"
            style={{ width: 48, height: 48 }}
          />
        </Show>
        <div
          data-testid="item-c"
          className="nx:rounded-md nx:border-default nx:border-border-default"
          style={{ width: 48, height: 48 }}
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container');
    const wrap = canvas.getByTestId('wrap');
    const rect = (id: string) => canvas.getByTestId(id).getBoundingClientRect();

    // ≥ md: wrapper is `contents`, so item-b is a real flex sibling of a and c.
    await waitFor(() =>
      expect(getComputedStyle(wrap).display).toBe('contents')
    );
    expect(rect('item-b').top).toBe(rect('item-a').top);
    expect(rect('item-a').left).toBeLessThan(rect('item-b').left);
    expect(rect('item-b').left).toBeLessThan(rect('item-c').left);

    // toggle below md: hidden.
    container.style.width = '300px';
    await waitFor(() => expect(getComputedStyle(wrap).display).toBe('none'));

    // toggle back ≥ md: flex child again (contents), not block.
    container.style.width = '600px';
    await waitFor(() => {
      expect(getComputedStyle(wrap).display).toBe('contents');
      expect(rect('item-b').top).toBe(rect('item-a').top);
    });
  },
};
