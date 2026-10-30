import { PhFile } from '@phosphor-icons/vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import { Button } from '../button';

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '.';

const meta = {
  title: 'Components/Item',
  component: Item,
  parameters: {
    docs: {
      description: {
        component:
          'Item lays out a row with media, a title, a description and actions. Use it for file lists, settings rows and search results. For tabular data, use Table.',
      },
    },
  },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Button,
      PhFile,
      Item,
      ItemActions,
      ItemContent,
      ItemDescription,
      ItemMedia,
      ItemTitle,
    },
    template: `
      <Item variant="outline" class="nx:w-96">
        <ItemMedia variant="icon"><PhFile /></ItemMedia>
        <ItemContent>
          <ItemTitle>Report.pdf</ItemTitle>
          <ItemDescription>2.4 MB · edited 3 days ago</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">Open</Button>
        </ItemActions>
      </Item>
    `,
  }),
};

export const Variants: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Pick a transparent, bordered or filled surface for the row.',
      },
    },
  },
  render: () => ({
    components: { Item, ItemContent, ItemDescription, ItemTitle },
    template: `
      <div class="nx:flex nx:w-96 nx:flex-col nx:gap-3">
        <Item variant="default">
          <ItemContent>
            <ItemTitle>Default</ItemTitle>
            <ItemDescription>Transparent, borderless.</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Outline</ItemTitle>
            <ItemDescription>Bordered surface.</ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="muted">
          <ItemContent>
            <ItemTitle>Muted</ItemTitle>
            <ItemDescription>Filled surface.</ItemDescription>
          </ItemContent>
        </Item>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: { description: { story: 'Use the `sm` size for a denser row.' } },
  },
  render: () => ({
    components: { Item, ItemContent, ItemTitle },
    template: `
      <div class="nx:flex nx:w-96 nx:flex-col nx:gap-3">
        <Item variant="outline" size="default">
          <ItemContent>
            <ItemTitle>Default size</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="outline" size="sm">
          <ItemContent>
            <ItemTitle>Small size</ItemTitle>
          </ItemContent>
        </Item>
      </div>
    `,
  }),
};

export const Media: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Lead the row with an icon tile or an image thumbnail.',
      },
    },
  },
  render: () => ({
    components: { PhFile, Item, ItemContent, ItemMedia, ItemTitle },
    template: `
      <div class="nx:flex nx:w-96 nx:flex-col nx:gap-3">
        <Item variant="outline">
          <ItemMedia variant="icon"><PhFile /></ItemMedia>
          <ItemContent>
            <ItemTitle>Icon media</ItemTitle>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="image">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23999'/%3E%3C/svg%3E" alt="" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Image media</ItemTitle>
          </ItemContent>
        </Item>
      </div>
    `,
  }),
};

export const Grouped: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Stack related rows in an ItemGroup with separators between them.',
      },
    },
  },
  render: () => ({
    components: { Item, ItemContent, ItemGroup, ItemSeparator, ItemTitle },
    template: `
      <ItemGroup class="nx:w-96">
        <Item>
          <ItemContent>
            <ItemTitle>First</ItemTitle>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent>
            <ItemTitle>Second</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>
    `,
  }),
};

export const AsChild: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: { story: 'Render the whole row as a link with `as-child`.' },
    },
  },
  render: () => ({
    components: {
      PhFile,
      Item,
      ItemContent,
      ItemDescription,
      ItemMedia,
      ItemTitle,
    },
    template: `
      <Item as-child variant="outline" class="nx:w-96">
        <a href="/files/report" data-testid="item-link">
          <ItemMedia variant="icon"><PhFile /></ItemMedia>
          <ItemContent>
            <ItemTitle>Open report</ItemTitle>
            <ItemDescription>Navigates to the file.</ItemDescription>
          </ItemContent>
        </a>
      </Item>
    `,
  }),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByTestId('item-link');
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('data-slot', 'item');
  },
};

// Behaviour stories: tests and Storybook only.

export const WithDataAttributes: Story = {
  render: () => ({
    components: {
      PhFile,
      Item,
      ItemContent,
      ItemDescription,
      ItemMedia,
      ItemTitle,
    },
    template: `
      <Item variant="muted" size="sm" class="nx:w-96">
        <ItemMedia variant="icon"><PhFile /></ItemMedia>
        <ItemContent>
          <ItemTitle>Inspect me</ItemTitle>
          <ItemDescription>Hooks for styling and tests.</ItemDescription>
        </ItemContent>
      </Item>
    `,
  }),
  play: async ({ canvasElement }) => {
    const item = canvasElement.querySelector('[data-slot="item"]');
    await expect(item).toBeInTheDocument();
    await expect(item).toHaveAttribute('data-variant', 'muted');
    await expect(item).toHaveAttribute('data-size', 'sm');
    for (const slot of [
      'item-media',
      'item-content',
      'item-title',
      'item-description',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }
  },
};

// A gray thumbnail rendered without a network request.
const THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23999'/%3E%3C/svg%3E";

export const AllVariants: Story = {
  render: () => ({
    components: {
      Button,
      PhFile,
      Item,
      ItemActions,
      ItemContent,
      ItemDescription,
      ItemGroup,
      ItemMedia,
      ItemSeparator,
      ItemTitle,
    },
    setup: () => ({ thumb: THUMB }),
    template: `
      <div class="nx:flex nx:w-96 nx:flex-col nx:gap-3">
        <Item variant="outline">
          <ItemMedia variant="icon"><PhFile /></ItemMedia>
          <ItemContent>
            <ItemTitle>Report.pdf</ItemTitle>
            <ItemDescription>Outline · icon media · action</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="sm">Open</Button>
          </ItemActions>
        </Item>
        <Item variant="muted" size="sm">
          <ItemMedia variant="image"><img :src="thumb" alt="" /></ItemMedia>
          <ItemContent>
            <ItemTitle>Cover.png</ItemTitle>
            <ItemDescription>Muted · sm · image media</ItemDescription>
          </ItemContent>
        </Item>
        <ItemGroup>
          <Item>
            <ItemContent>
              <ItemTitle>Grouped row one</ItemTitle>
            </ItemContent>
          </Item>
          <ItemSeparator />
          <Item>
            <ItemContent>
              <ItemTitle>Grouped row two</ItemTitle>
            </ItemContent>
          </Item>
        </ItemGroup>
      </div>
    `,
  }),
};
