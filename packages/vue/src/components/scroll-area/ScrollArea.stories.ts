import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, waitFor } from 'storybook/test';

import { Card, CardContent, CardHeader, CardTitle } from '../card';

import { ScrollArea, ScrollBar } from '.';

const meta = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ScrollArea gives a fixed-size region custom scrollbars that look the same on every platform. Use it for panels, lists and drawers with overflowing content. For a full page, let the browser scroll the page.',
      },
    },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

// A long, discrete list — the canonical "tags drawer" scroll fixture.
const versions = Array.from(
  { length: 40 },
  (_, i) => `v1.4.0-canary.${40 - i}`
);

// A horizontal gallery row.
const artworks = [
  { title: 'Aurora', artist: 'Ornella Binni' },
  { title: 'Tide', artist: 'Tom Byrom' },
  { title: 'Drift', artist: 'Vladimir Malyavko' },
  { title: 'Ember', artist: 'Mara Stein' },
  { title: 'Quartz', artist: 'Liang Wu' },
  { title: 'Meadow', artist: 'Sofia Russo' },
];

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { ScrollArea },
    setup: () => ({
      notes: [
        'Scroll areas render a consistent custom scrollbar across Chrome, Safari, and Firefox, replacing the platform scrollbar so the chrome looks the same everywhere.',
        'The viewport measures its content and only surfaces a scrollbar on the axis that actually overflows — a wide-but-short block gets a horizontal bar and no vertical one.',
        'Scrollbars fade in on hover by default. Pass type="always" to keep them pinned, or type="scroll" to show them only while the content is moving.',
        'The thumb is sized in proportion to the visible fraction of the content, so a long document gets a short thumb and a barely-overflowing one gets a long thumb.',
        'Keyboard focus can move into the viewport with a visible focus ring, so the scrollable region stays reachable without a pointer.',
      ],
    }),
    template: `
      <ScrollArea class="nx:h-48 nx:w-72 nx:rounded-md nx:border-default nx:border-border-default">
        <div class="nx:flex nx:flex-col nx:gap-3 nx:p-4 nx:typography-label-default nx:text-foreground">
          <h4 class="nx:font-medium nx:leading-none">Release notes</h4>
          <p v-for="(note, i) in notes" :key="i" class="nx:text-muted-foreground">{{ note }}</p>
        </div>
      </ScrollArea>
    `,
  }),
};

export const VerticalList: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Scroll a long list of rows inside a fixed height.',
      },
    },
  },
  render: () => ({
    components: { ScrollArea },
    setup: () => ({
      versions: Array.from({ length: 40 }, (_, i) => `v1.4.0-canary.${40 - i}`),
    }),
    template: `
      <ScrollArea class="nx:h-72 nx:w-56 nx:rounded-md nx:border-default nx:border-border-default">
        <div class="nx:p-4">
          <h4 class="nx:mb-3 nx:typography-label-default nx:leading-none nx:text-foreground">Builds</h4>
          <ul class="nx:flex nx:flex-col">
            <li
              v-for="version in versions"
              :key="version"
              class="nx:border-b-default nx:border-border-default nx:py-2 nx:typography-label-default nx:text-foreground nx:last:border-b-0"
            >{{ version }}</li>
          </ul>
        </div>
      </ScrollArea>
    `,
  }),
};

export const HorizontalRow: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Add a horizontal `ScrollBar` to scroll a row of items sideways.',
      },
    },
  },
  render: () => ({
    components: { ScrollArea, ScrollBar },
    setup: () => ({
      artworks: [
        { title: 'Aurora', artist: 'Ornella Binni' },
        { title: 'Tide', artist: 'Tom Byrom' },
        { title: 'Drift', artist: 'Vladimir Malyavko' },
        { title: 'Ember', artist: 'Mara Stein' },
        { title: 'Quartz', artist: 'Liang Wu' },
        { title: 'Meadow', artist: 'Sofia Russo' },
      ],
    }),
    template: `
      <ScrollArea class="nx:w-96 nx:rounded-md nx:border-default nx:border-border-default nx:whitespace-nowrap">
        <div class="nx:flex nx:w-max nx:gap-4 nx:p-4">
          <figure v-for="artwork in artworks" :key="artwork.title" class="nx:shrink-0">
            <div class="nx:flex nx:h-40 nx:w-32 nx:items-end nx:rounded-md nx:bg-muted nx:p-3">
              <span class="nx:typography-label-default nx:text-foreground">{{ artwork.title }}</span>
            </div>
            <figcaption class="nx:pt-2 nx:typography-label-small nx:text-muted-foreground">by {{ artwork.artist }}</figcaption>
          </figure>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    `,
  }),
};

export const Both: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Scroll a large grid on both axes with two scrollbars.',
      },
    },
  },
  render: () => ({
    components: { ScrollArea, ScrollBar },
    template: `
      <ScrollArea class="nx:h-72 nx:w-96 nx:rounded-md nx:border-default nx:border-border-default">
        <div class="nx:w-max nx:p-4">
          <div v-for="row in 20" :key="row" class="nx:flex nx:gap-2 nx:py-1">
            <div
              v-for="col in 15"
              :key="col"
              class="nx:flex nx:size-12 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:bg-muted nx:typography-label-small nx:text-muted-foreground"
            >{{ (row - 1) * 15 + col - 1 }}</div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    `,
  }),
};

export const VisibleAffordance: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `type="always"` so dense panels show their scrollbars without a hover.',
      },
    },
  },
  render: () => ({
    components: { ScrollArea, ScrollBar },
    setup: () => ({
      runs: Array.from({ length: 28 }, (_, i) => ({
        id: `run-${4820 - i}`,
        branch: ['main', 'release/vega', 'codex/ui-polish', 'docs/mwg'][i % 4],
        owner: ['Mira', 'Omar', 'Jules', 'Nia'][i % 4],
        duration: `${3 + (i % 9)}m ${10 + ((i * 7) % 50)}s`,
        status: ['Passed', 'Queued', 'Reviewing', 'Blocked'][i % 4],
      })),
    }),
    template: `
      <ScrollArea type="always" class="nx:h-64 nx:w-80 nx:rounded-md nx:border-default nx:border-border-default">
        <div class="nx:w-max nx:p-4">
          <div class="nx:grid nx:grid-cols-[112px_160px_96px_96px_96px] nx:gap-x-4 nx:border-b-default nx:border-border-default nx:pb-2 nx:typography-label-small nx:text-muted-foreground">
            <span>Run</span>
            <span>Branch</span>
            <span>Owner</span>
            <span>Duration</span>
            <span>Status</span>
          </div>
          <div class="nx:flex nx:flex-col">
            <div
              v-for="run in runs"
              :key="run.id"
              class="nx:grid nx:grid-cols-[112px_160px_96px_96px_96px] nx:gap-x-4 nx:border-b-default nx:border-border-default nx:py-2 nx:typography-label-default nx:text-foreground nx:last:border-b-0"
            >
              <span class="nx:font-mono nx:typography-label-small">{{ run.id }}</span>
              <span>{{ run.branch }}</span>
              <span>{{ run.owner }}</span>
              <span>{{ run.duration }}</span>
              <span>{{ run.status }}</span>
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    `,
  }),
  play: async ({ canvasElement }) => {
    const viewport = canvasElement.querySelector(
      '[data-slot="scroll-area-viewport"]'
    );
    const verticalScrollbar = canvasElement.querySelector(
      '[data-slot="scroll-bar"][data-orientation="vertical"]'
    );
    const horizontalScrollbar = canvasElement.querySelector(
      '[data-slot="scroll-bar"][data-orientation="horizontal"]'
    );

    await expect(viewport).toHaveAttribute('tabindex', '0');
    await expect(verticalScrollbar).toBeInTheDocument();
    await expect(horizontalScrollbar).toBeInTheDocument();

    // Reka mounts each thumb at once and marks it visible once it measures overflow.
    await waitFor(() => {
      expect(
        canvasElement.querySelectorAll(
          '[data-slot="scroll-bar-thumb"][data-state="visible"]'
        ).length
      ).toBeGreaterThan(1);
    });
  },
};

export const InCard: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Keep a long list inside a Card from stretching the Card.',
      },
    },
  },
  render: () => ({
    components: { Card, CardContent, CardHeader, CardTitle, ScrollArea },
    setup: () => ({
      versions: Array.from({ length: 40 }, (_, i) => `v1.4.0-canary.${40 - i}`),
    }),
    template: `
      <Card class="nx:w-80">
        <CardHeader>
          <CardTitle>Builds</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea class="nx:h-48 nx:rounded-md nx:border-default nx:border-border-default">
            <ul class="nx:flex nx:flex-col nx:p-3">
              <li
                v-for="version in versions"
                :key="version"
                class="nx:border-b-default nx:border-border-default nx:py-2 nx:typography-label-default nx:text-container-foreground nx:last:border-b-0"
              >{{ version }}</li>
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    `,
  }),
};

// Behaviour stories: tests and Storybook only.

// `type="always"` pins the scrollbar so its slot is queryable without
// simulating hover.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { ScrollArea },
    template: `
      <ScrollArea type="always" class="nx:h-32 nx:w-48 nx:rounded-md nx:border-default nx:border-border-default">
        <div class="nx:flex nx:flex-col nx:gap-2 nx:p-4 nx:typography-label-default nx:text-foreground">
          <span v-for="i in 12" :key="i">Line {{ i }}</span>
        </div>
      </ScrollArea>
    `,
  }),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="scroll-area"]');
    const viewport = canvasElement.querySelector(
      '[data-slot="scroll-area-viewport"]'
    );
    const scrollbar = canvasElement.querySelector('[data-slot="scroll-bar"]');

    await expect(root).toBeInTheDocument();
    await expect(viewport).toBeInTheDocument();
    await expect(scrollbar).toBeInTheDocument();
  },
};

export const AllVariants: Story = {
  render: () => ({
    components: { ScrollArea, ScrollBar },
    setup: () => ({ versions: versions.slice(0, 20), artworks }),
    template: `
      <div class="nx:flex nx:flex-wrap nx:items-start nx:gap-6 nx:typography-label-default nx:text-foreground">
        <div class="nx:flex nx:flex-col nx:gap-2">
          <span class="nx:text-muted-foreground">Vertical</span>
          <ScrollArea class="nx:h-40 nx:w-48 nx:rounded-md nx:border-default nx:border-border-default">
            <ul class="nx:flex nx:flex-col nx:p-3">
              <li
                v-for="version in versions"
                :key="version"
                class="nx:border-b-default nx:border-border-default nx:py-1.5 nx:last:border-b-0"
              >{{ version }}</li>
            </ul>
          </ScrollArea>
        </div>

        <div class="nx:flex nx:flex-col nx:gap-2">
          <span class="nx:text-muted-foreground">Horizontal</span>
          <ScrollArea class="nx:w-64 nx:rounded-md nx:border-default nx:border-border-default nx:whitespace-nowrap">
            <div class="nx:flex nx:w-max nx:gap-3 nx:p-3">
              <div
                v-for="artwork in artworks"
                :key="artwork.title"
                class="nx:flex nx:size-24 nx:shrink-0 nx:items-end nx:rounded-md nx:bg-muted nx:p-2 nx:typography-label-small"
              >{{ artwork.title }}</div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div class="nx:flex nx:flex-col nx:gap-2">
          <span class="nx:text-muted-foreground">Both</span>
          <ScrollArea class="nx:h-40 nx:w-64 nx:rounded-md nx:border-default nx:border-border-default">
            <div class="nx:w-max nx:p-3">
              <div v-for="row in 12" :key="row" class="nx:flex nx:gap-2 nx:py-1">
                <div
                  v-for="col in 10"
                  :key="col"
                  class="nx:flex nx:size-10 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:bg-muted nx:typography-label-small nx:text-muted-foreground"
                >{{ (row - 1) * 10 + col - 1 }}</div>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    `,
  }),
};
