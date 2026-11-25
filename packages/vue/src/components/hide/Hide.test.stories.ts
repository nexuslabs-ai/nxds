import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, waitFor, within } from 'storybook/test';

import hideMeta from './Hide.stories';

import { Hide } from '.';

const meta: Meta<typeof Hide> = {
  ...hideMeta,
  title: 'Tests/Hide',
};

export default meta;
type Story = StoryObj<typeof Hide>;

// Confirms the `display: contents` mechanism also holds for <Hide>'s shown
// state: <Hide containerBelow="md"> is shown at ≥ md, so its child is a flex item.
export const FlexParent: Story = {
  render: () => ({
    components: { Hide },
    template: `
      <div class="nx:@container" style="width: 600px" data-testid="container">
        <div class="nx:flex nx:gap-4">
          <div
            data-testid="item-a"
            class="nx:rounded-md nx:border-default nx:border-border-default"
            style="width: 48px; height: 48px"
          />
          <Hide containerBelow="md" data-testid="wrap">
            <div
              data-testid="item-b"
              class="nx:rounded-md nx:border-default nx:border-primary-border"
              style="width: 48px; height: 48px"
            />
          </Hide>
          <div
            data-testid="item-c"
            class="nx:rounded-md nx:border-default nx:border-border-default"
            style="width: 48px; height: 48px"
          />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container');
    const wrap = canvas.getByTestId('wrap');
    const rect = (id: string) => canvas.getByTestId(id).getBoundingClientRect();

    // ≥ md: containerBelow is shown -> `contents`, item-b is a real flex sibling.
    await waitFor(() =>
      expect(getComputedStyle(wrap).display).toBe('contents')
    );
    expect(rect('item-b').top).toBe(rect('item-a').top);
    expect(rect('item-a').left).toBeLessThan(rect('item-b').left);
    expect(rect('item-b').left).toBeLessThan(rect('item-c').left);

    // toggle below md: now hidden.
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
