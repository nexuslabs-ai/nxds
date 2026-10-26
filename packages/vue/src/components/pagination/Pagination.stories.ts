import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  type PaginationProps,
} from '.';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Pagination links to the pages of a long list or table. Use it when results are split across pages. Your app decides which page numbers to show.',
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;
type ClickStory = StoryObj<
  PaginationProps & { onClick: (event: MouseEvent) => void }
>;

const paginationComponents = {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};

// Pagination links are anchors; with no router in a story, activating one
// performs the default navigation and tears down the test page. Cancel it,
// then let the spy observe the click.
function cancelNavigation(onClick: (event: MouseEvent) => void) {
  return (event: MouseEvent) => {
    event.preventDefault();
    onClick(event);
  };
}

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Pagination,
      PaginationContent,
      PaginationEllipsis,
      PaginationItem,
      PaginationLink,
      PaginationNext,
      PaginationPrevious,
    },
    template: `
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" is-active>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">10</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    `,
  }),
};

export const FewPages: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show every page number when they all fit, with no ellipsis.',
      },
    },
  },
  render: () => ({
    components: {
      Pagination,
      PaginationContent,
      PaginationItem,
      PaginationLink,
      PaginationNext,
      PaginationPrevious,
    },
    template: `
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" is-active>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    `,
  }),
};

export const AsChild: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          "Pass `as-child` to render each link as your router's link component.",
      },
    },
  },
  render: () => ({
    components: {
      Pagination,
      PaginationContent,
      PaginationItem,
      PaginationLink,
      PaginationNext,
      PaginationPrevious,
    },
    template: `
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious as-child>
              <a href="#prev">Previous</a>
            </PaginationPrevious>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink as-child>
              <a href="#page-1">1</a>
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink as-child is-active>
              <a href="#page-2">2</a>
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext as-child>
              <a href="#next">Next</a>
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The styling merges onto the slotted <a>: it carries the data-slot hook,
    // aria-current, and its own href — with no nested <a><a>.
    const page2 = canvas.getByRole('link', { name: '2' });
    await expect(page2).toHaveAttribute('href', '#page-2');
    await expect(page2).toHaveAttribute('data-slot', 'pagination-link');
    await expect(page2).toHaveAttribute('aria-current', 'page');
    await expect(page2.querySelector('a')).toBeNull();

    // Edge controls forward their slotted child too, keeping the preset label.
    const prev = canvas.getByRole('link', { name: 'Go to previous page' });
    await expect(prev).toHaveAttribute('href', '#prev');
  },
};

// Behaviour stories: tests and Storybook only.

export const ClickInteraction: ClickStory = {
  args: { onClick: fn() },
  render: (args) => ({
    components: paginationComponents,
    setup: () => ({ handleClick: cancelNavigation(args.onClick) }),
    template: `
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" @click="handleClick">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" is-active @click="handleClick">2</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page1 = canvas.getByRole('link', { name: '1' });

    await userEvent.click(page1);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const KeyboardInteraction: ClickStory = {
  args: { onClick: fn() },
  render: (args) => ({
    components: paginationComponents,
    setup: () => ({ handleClick: cancelNavigation(args.onClick) }),
    template: `
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" @click="handleClick">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page1 = canvas.getByRole('link', { name: '1' });

    await userEvent.tab();
    await expect(page1).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: paginationComponents,
    template: `
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" is-active>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const slot of [
      'pagination',
      'pagination-content',
      'pagination-item',
      'pagination-link',
      'pagination-ellipsis',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }

    const active = canvasElement.querySelector('[data-active="true"]');
    await expect(active).toHaveAttribute('aria-current', 'page');
  },
};

export const AllVariants: Story = {
  render: () => ({
    components: paginationComponents,
    template: `
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" is-active>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">10</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    `,
  }),
};
