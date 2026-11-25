import {
  PhArrowUUpLeft,
  PhCursor,
  PhEraser,
  PhPencilSimple,
  PhTextB,
  PhTextItalic,
} from '@phosphor-icons/vue';
import type { StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import { defineComponent } from 'vue';

import { Hide } from '../hide';
import { Show } from '../show';

import toolbarMeta, {
  Attached,
  Calendar,
  IconOnly,
  NarrowContainer,
  Sizes,
  StartIcon,
  Vertical,
} from './Toolbar.stories';

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarTool,
  ToolbarToolGroup,
} from '.';

const meta = {
  ...toolbarMeta,
  title: 'Tests/Toolbar',
};

export default meta;
type Story = StoryObj<typeof toolbarMeta>;

export const CalendarSize: Story = {
  ...Calendar,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const month = canvas.getByRole('radio', { name: 'Month' });
    const unselectedWidth = month.getBoundingClientRect().width;
    await userEvent.click(month);
    await expect(month.getBoundingClientRect().width).toBe(unselectedWidth);
  },
};

export const VerticalGeometry: Story = {
  ...Vertical,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas
      .getByRole('button', { name: 'Select' })
      .getBoundingClientRect();
    const second = canvas
      .getByRole('button', { name: 'Draw' })
      .getBoundingClientRect();
    await expect(second.top).toBeGreaterThanOrEqual(first.bottom);
  },
};

export const NarrowContainerGeometry: Story = {
  ...NarrowContainer,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toolbar = canvas.getByRole('toolbar');
    const first = canvas.getByRole('button', { name: 'Download files' });
    const last = canvas.getByRole('button', { name: 'Duplicate files' });
    await expect(toolbar.scrollWidth).toBeLessThanOrEqual(
      toolbar.clientWidth + 1
    );
    await expect(last.getBoundingClientRect().top).toBeGreaterThan(
      first.getBoundingClientRect().top
    );
  },
};

export const SizesGeometry: Story = {
  ...Sizes,
  play: async ({ canvasElement }) => {
    const separators: number[] = [];
    for (const toolbar of within(canvasElement).getAllByRole('toolbar', {
      name: /controls$/,
    })) {
      const bar = within(toolbar);
      const button = bar.getByRole('button', { name: 'Action' });
      const toggle = bar.getByRole('button', { name: 'Bold' });
      const undo = bar.getByRole('button', { name: 'Undo' });
      const height = button.getBoundingClientRect().height;
      await expect(toggle.getBoundingClientRect().height).toBe(height);
      await expect(undo.getBoundingClientRect().height).toBe(height);
      await expect(getComputedStyle(toggle).fontSize).toBe(
        getComputedStyle(button).fontSize
      );
      const separator = bar.getByRole('separator').getBoundingClientRect();
      await expect(separator.height).toBeLessThan(height);
      separators.push(separator.height);
    }
    await expect(separators[0]).toBeLessThan(separators[2] ?? 0);
  },
};

export const GroupSpacing: Story = {
  render: () => ({
    components: {
      PhArrowUUpLeft,
      PhTextB,
      PhTextItalic,
      PhPencilSimple,
      PhCursor,
      Toolbar,
      ToolbarButton,
      ToolbarGroup,
      ToolbarToggleGroup,
      ToolbarToggleItem,
      ToolbarTool,
      ToolbarToolGroup,
    },
    setup: () => ({
      bars: [
        ['default', undefined],
        ['floating', undefined],
        ['default', 'nx:gap-4'],
      ] as const,
    }),
    template: `
      <div class="nx:grid nx:gap-6">
        <Toolbar
          v-for="[variant, className] in bars"
          :key="variant + '-' + className"
          :variant="variant"
          :class="className"
          :aria-label="variant + ' bar'"
        >
          <ToolbarToolGroup aria-label="Tools" default-value="select">
            <ToolbarTool value="select" icon-only>
              <template #start-icon><PhCursor /></template>Select</ToolbarTool>
            <ToolbarTool value="draw" icon-only>
              <template #start-icon><PhPencilSimple /></template>Draw</ToolbarTool>
          </ToolbarToolGroup>
          <ToolbarToggleGroup type="multiple" aria-label="Formatting">
            <ToolbarToggleItem value="bold" icon-only>
              <template #start-icon><PhTextB /></template>Bold</ToolbarToggleItem>
            <ToolbarToggleItem value="italic" icon-only>
              <template #start-icon><PhTextItalic /></template>Italic</ToolbarToggleItem>
          </ToolbarToggleGroup>
          <ToolbarGroup aria-label="History">
            <ToolbarButton icon-only>
              <template #start-icon><PhArrowUUpLeft /></template>Undo</ToolbarButton>
          </ToolbarGroup>
        </Toolbar>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const toolbar of within(canvasElement).getAllByRole('toolbar')) {
      const barGap = getComputedStyle(toolbar).columnGap;
      for (const name of ['Tools', 'Formatting', 'History']) {
        await expect(
          getComputedStyle(within(toolbar).getByRole('group', { name }))
            .columnGap
        ).toBe(barGap);
      }
    }
  },
};

const HistoryGroup = defineComponent({
  components: { PhArrowUUpLeft, PhEraser, ToolbarButton, ToolbarGroup },
  template: `
    <ToolbarGroup aria-label="History">
      <ToolbarButton icon-only>
        <template #start-icon><PhArrowUUpLeft /></template>Undo</ToolbarButton>
      <ToolbarButton icon-only>
        <template #start-icon><PhEraser /></template>Clear canvas</ToolbarButton>
    </ToolbarGroup>
  `,
});

export const GroupInShowHide: Story = {
  render: () => ({
    components: { Hide, HistoryGroup, Show, Toolbar },
    template: `
      <Toolbar variant="floating" aria-label="Canvas tools">
        <Show above="md" as="div">
          <HistoryGroup />
        </Show>
        <Hide above="md" as="div">
          <HistoryGroup />
        </Hide>
      </Toolbar>
    `,
  }),
  play: async ({ canvasElement }) => {
    const toolbar = within(canvasElement).getByRole('toolbar');
    await expect(
      getComputedStyle(within(toolbar).getByRole('group', { name: 'History' }))
        .columnGap
    ).toBe(getComputedStyle(toolbar).columnGap);
  },
};

export const VerticalTools: Story = {
  render: () => ({
    components: {
      PhArrowUUpLeft,
      PhEraser,
      PhPencilSimple,
      PhCursor,
      Toolbar,
      ToolbarButton,
      ToolbarGroup,
      ToolbarTool,
      ToolbarToolGroup,
    },
    template: `
      <Toolbar orientation="vertical" aria-label="Canvas tools">
        <ToolbarToolGroup aria-label="Tools" default-value="select">
          <ToolbarTool value="select" icon-only>
            <template #start-icon><PhCursor /></template>Select</ToolbarTool>
          <ToolbarTool value="draw" icon-only>
            <template #start-icon><PhPencilSimple /></template>Draw</ToolbarTool>
        </ToolbarToolGroup>
        <ToolbarGroup aria-label="History">
          <ToolbarButton icon-only>
            <template #start-icon><PhArrowUUpLeft /></template>Undo</ToolbarButton>
          <ToolbarButton icon-only>
            <template #start-icon><PhEraser /></template>Clear canvas</ToolbarButton>
        </ToolbarGroup>
      </Toolbar>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [first, second] of [
      ['Select', 'Draw'],
      ['Undo', 'Clear canvas'],
    ]) {
      const above = canvas
        .getByRole('button', { name: first })
        .getBoundingClientRect();
      const below = canvas
        .getByRole('button', { name: second })
        .getBoundingClientRect();
      await expect(below.top).toBeGreaterThanOrEqual(above.bottom);
    }
  },
};

export const IconOnlySquare: Story = {
  ...IconOnly,
  play: async ({ canvasElement }) => {
    const toolbar = within(canvasElement).getByRole('toolbar', {
      name: 'Text formatting',
    });
    for (const name of ['Undo formatting', 'Bold', 'Select']) {
      const button = within(toolbar).getByRole('button', { name });
      const { width, height } = button.getBoundingClientRect();
      await expect(width).toBe(height);
      await expect(within(button).getByText(name)).toHaveClass('nx:sr-only');
    }
  },
};

export const StartIconStyle: Story = {
  ...StartIcon,
  play: async ({ canvasElement }) => {
    const toolbar = within(canvasElement).getByRole('toolbar', {
      name: 'Text formatting',
    });
    for (const name of ['Undo formatting', 'Bold', 'Select']) {
      const button = within(toolbar).getByRole('button', { name });
      await expect(button.querySelector('.nx\\:sr-only')).toBeNull();
    }
  },
};

export const AttachedStyle: Story = {
  ...Attached,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Bold note' }));
    await expect(canvas.getByRole('textbox', { name: 'Note' })).toHaveStyle({
      fontWeight: '700',
    });
  },
};
