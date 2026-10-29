import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { IconSearch } from '@tabler/icons-vue';
import { expect, within } from 'storybook/test';

import { Kbd, KbdGroup } from '.';

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: {
    docs: {
      description: {
        component:
          'Kbd shows a keyboard key, such as `Esc` or `⌘`. Use it to document shortcuts. For a key combination, wrap several Kbd elements in KbdGroup.',
      },
    },
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

// A single keycap next to a two-key chord composed with KbdGroup.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Kbd, KbdGroup },
    template: `
      <div class="nx:flex nx:items-center nx:gap-4">
        <Kbd>⌘</Kbd>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
    `,
  }),
};

// Single modifier keys render as square-ish caps (min-width floor); wider
// labels grow to fit.
export const SingleKeys: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show single keys as caps that widen to fit longer labels.',
      },
    },
  },
  render: () => ({
    components: { Kbd },
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⌃</Kbd>
        <Kbd>Esc</Kbd>
        <Kbd>Enter</Kbd>
      </div>
    `,
  }),
};

export const SeparatedChord: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Put a literal `+` between keys inside a KbdGroup.',
      },
    },
  },
  render: () => ({
    components: { Kbd, KbdGroup },
    template: `
      <KbdGroup class="nx:gap-2">
        <Kbd>⌘</Kbd>
        <span class="nx:text-muted-foreground">+</span>
        <Kbd>K</Kbd>
      </KbdGroup>
    `,
  }),
};

// SVG children inherit the keycap icon sizing hook.
export const WithIcon: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Place an icon inside a key cap, sized to match the text.',
      },
    },
  },
  render: () => ({
    components: { IconSearch, Kbd },
    template: `
      <Kbd><IconSearch aria-hidden="true" />K</Kbd>
    `,
  }),
};

// Both structural parts carry a data-slot hook for styling and inspection.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { Kbd, KbdGroup },
    template: `
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector<HTMLElement>(
      '[data-slot="kbd-group"]'
    );
    await expect(group).toBeInTheDocument();
    await expect(group?.tagName).toBe('KBD');
    await expect(group).not.toHaveAttribute('role');
    await expect(group).not.toHaveAttribute('tabindex');

    const keycaps = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="kbd"]')
    );
    await expect(keycaps).toHaveLength(2);

    const [commandKey, letterKey] = keycaps;
    await expect(commandKey?.tagName).toBe('KBD');
    await expect(commandKey?.textContent).toBe('⌘');
    await expect(commandKey).not.toHaveAttribute('role');
    await expect(commandKey).not.toHaveAttribute('tabindex');

    await expect(letterKey?.tagName).toBe('KBD');
    await expect(letterKey?.textContent).toBe('K');
    await expect(letterKey).not.toHaveAttribute('role');
    await expect(letterKey).not.toHaveAttribute('tabindex');
  },
};

const DENSITIES = [
  'tight',
  'compact',
  'default',
  'comfortable',
  'relaxed',
  'spacious',
] as const;

/** The line height, snapped down to the 1/64px steps that layout uses. */
function lineHeight(element: Element) {
  return Math.floor(parseFloat(getComputedStyle(element).lineHeight) * 64) / 64;
}

/** The height inside the border and padding, with fractions kept. */
function contentHeight(element: Element) {
  const style = getComputedStyle(element);
  const edges = [
    'borderTopWidth',
    'borderBottomWidth',
    'paddingTop',
    'paddingBottom',
  ] as const;
  return edges.reduce(
    (height, edge) => height - parseFloat(style[edge]),
    element.getBoundingClientRect().height
  );
}

export const TextFitsAtEveryDensity: Story = {
  // Text is tallest at the largest UI font size, so it fits at every smaller one.
  globals: { uiFontSize: 16 },
  render: () => ({
    components: { Kbd },
    setup: () => ({ densities: DENSITIES }),
    template: `
      <div class="nx:flex nx:flex-col nx:items-start nx:gap-3">
        <div
          v-for="density in densities"
          :key="density"
          :data-density="density"
          :data-testid="'row-' + density"
        >
          <Kbd>Ctrl</Kbd>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const density of DENSITIES) {
      const element = within(canvas.getByTestId(`row-${density}`)).getByText(
        'Ctrl'
      );
      // The key label fits inside the border at every density.
      await expect(contentHeight(element)).toBeGreaterThanOrEqual(
        lineHeight(element)
      );
    }
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => ({
    components: { Kbd, KbdGroup },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <div class="nx:flex nx:items-center nx:gap-2">
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>⌥</Kbd>
          <Kbd>⌃</Kbd>
          <Kbd>↵</Kbd>
        </div>
        <div class="nx:flex nx:items-center nx:gap-2">
          <Kbd>Esc</Kbd>
          <Kbd>Tab</Kbd>
          <Kbd>Enter</Kbd>
          <Kbd>Space</Kbd>
        </div>
        <div class="nx:flex nx:items-center nx:gap-4">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
        </div>
      </div>
    `,
  }),
};
