import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, mocked, userEvent, waitFor, within } from 'storybook/test';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '.';

const meta = {
  title: 'Components/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Resizable splits an area into panels that users resize by dragging or with the keyboard. Use it for layouts like a sidebar beside an editor. Give every `ResizableHandle` an `aria-label`.',
      },
    },
  },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const resizableComponents = {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
};

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { ResizableHandle, ResizablePanel, ResizablePanelGroup },
    template: `
      <ResizablePanelGroup
        orientation="horizontal"
        class="nx:max-w-md nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default"
        style="height: 220px"
      >
        <ResizablePanel :default-size="50">
          <div class="nx:p-6 nx:text-center nx:font-semibold">One</div>
        </ResizablePanel>
        <ResizableHandle with-handle aria-label="Resize panels" />
        <ResizablePanel :default-size="50">
          <div class="nx:p-6 nx:text-center nx:font-semibold">Two</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    `,
  }),
};

export const Vertical: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Stack panels vertically, with a horizontal divider between them.',
      },
    },
  },
  render: () => ({
    components: { ResizableHandle, ResizablePanel, ResizablePanelGroup },
    template: `
      <ResizablePanelGroup
        orientation="vertical"
        class="nx:max-w-md nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default"
        style="height: 220px"
      >
        <ResizablePanel :default-size="50">
          <div class="nx:p-6 nx:text-center nx:font-semibold">Top</div>
        </ResizablePanel>
        <ResizableHandle with-handle aria-label="Resize panels" />
        <ResizablePanel :default-size="50">
          <div class="nx:p-6 nx:text-center nx:font-semibold">Bottom</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    `,
  }),
};

export const ThreePanels: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Split the area into three panels with two handles.',
      },
    },
  },
  render: () => ({
    components: { ResizableHandle, ResizablePanel, ResizablePanelGroup },
    template: `
      <ResizablePanelGroup
        orientation="horizontal"
        class="nx:max-w-md nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default"
        style="height: 220px"
      >
        <ResizablePanel :default-size="25">
          <div class="nx:p-6 nx:text-center nx:font-semibold">Nav</div>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize nav" />
        <ResizablePanel :default-size="50">
          <div class="nx:p-6 nx:text-center nx:font-semibold">Content</div>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize aside" />
        <ResizablePanel :default-size="25">
          <div class="nx:p-6 nx:text-center nx:font-semibold">Aside</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    `,
  }),
};

// Behaviour stories: tests and Storybook only.

const TwoPanels = {
  components: resizableComponents,
  template: `
    <ResizablePanelGroup
      orientation="horizontal"
      class="nx:max-w-md nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default"
      style="height: 220px"
    >
      <ResizablePanel :default-size="50">
        <div class="nx:p-6 nx:text-center nx:font-semibold">One</div>
      </ResizablePanel>
      <ResizableHandle with-handle aria-label="Resize panels" />
      <ResizablePanel :default-size="50">
        <div class="nx:p-6 nx:text-center nx:font-semibold">Two</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  `,
};

// Arrow keys on the focused separator resize the panels (aria-valuenow moves).
export const KeyboardInteraction: Story = {
  render: () => ({
    components: { TwoPanels },
    template: '<TwoPanels />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator');
    // The separator reports its value once the group has laid out.
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow', '50'));
    handle.focus();
    await expect(handle).toHaveFocus();
    const before = handle.getAttribute('aria-valuenow');
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(handle.getAttribute('aria-valuenow')).not.toBe(before);
    });
  },
};

// A px panel still reports its size as a percentage, in panel order.
export const LayoutChangeInteraction: Story = {
  args: { 'onLayout-change': fn() },
  render: (args) => ({
    components: resizableComponents,
    setup: () => ({ args }),
    template: `
      <ResizablePanelGroup
        v-bind="args"
        orientation="horizontal"
        class="nx:max-w-md nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default"
        style="height: 220px"
      >
        <ResizablePanel :default-size="120" size-unit="px">
          <div class="nx:p-6 nx:text-center nx:font-semibold">One</div>
        </ResizablePanel>
        <ResizableHandle with-handle aria-label="Resize panels" />
        <ResizablePanel>
          <div class="nx:p-6 nx:text-center nx:font-semibold">Two</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator');
    await waitFor(() => expect(handle).toHaveAttribute('aria-valuenow'));
    const onLayoutChange = mocked(args['onLayout-change']!);
    onLayoutChange.mockClear();
    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(onLayoutChange).toHaveBeenCalled());
    const [layout] = onLayoutChange.mock.lastCall!;
    await expect(layout).toHaveLength(2);
    await expect(layout[0]).toBeLessThan(50);
    await expect(layout.reduce((sum, size) => sum + size, 0)).toBeCloseTo(100);
  },
};

// data-slot identifies the group, panels, and handle.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { TwoPanels },
    template: '<TwoPanels />',
  }),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="resizable-panel-group"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="resizable-panel"]')
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="resizable-handle"]')
    ).toBeInTheDocument();
  },
};

// Horizontal and vertical splits side by side.
export const AllVariants: Story = {
  render: () => ({
    components: resizableComponents,
    template: `
      <div class="nx:flex nx:flex-wrap nx:gap-4">
        <ResizablePanelGroup
          orientation="horizontal"
          class="nx:max-w-md nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default"
          style="height: 220px"
        >
          <ResizablePanel :default-size="50">
            <div class="nx:p-6 nx:text-center nx:font-semibold">One</div>
          </ResizablePanel>
          <ResizableHandle with-handle aria-label="Resize columns" />
          <ResizablePanel :default-size="50">
            <div class="nx:p-6 nx:text-center nx:font-semibold">Two</div>
          </ResizablePanel>
        </ResizablePanelGroup>
        <ResizablePanelGroup
          orientation="vertical"
          class="nx:max-w-md nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default"
          style="height: 220px"
        >
          <ResizablePanel :default-size="50">
            <div class="nx:p-6 nx:text-center nx:font-semibold">Top</div>
          </ResizablePanel>
          <ResizableHandle with-handle aria-label="Resize rows" />
          <ResizablePanel :default-size="50">
            <div class="nx:p-6 nx:text-center nx:font-semibold">Bottom</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    `,
  }),
};
