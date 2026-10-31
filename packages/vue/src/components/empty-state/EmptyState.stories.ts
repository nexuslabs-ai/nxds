import { PhUsers } from '@phosphor-icons/vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../button';

import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from '.';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component:
          'EmptyState explains why a list, table or record view has no content yet. Give it an icon, a title, a short description and an optional action.',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Button,
      EmptyState,
      EmptyStateContent,
      EmptyStateDescription,
      EmptyStateHeader,
      EmptyStateMedia,
      EmptyStateTitle,
      PhUsers,
    },
    template: `
      <EmptyState>
        <EmptyStateHeader>
          <EmptyStateMedia variant="icon">
            <PhUsers aria-hidden="true" />
          </EmptyStateMedia>
          <EmptyStateTitle>No contacts yet</EmptyStateTitle>
          <EmptyStateDescription>Add your first contact to start building your CRM.</EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateContent>
          <Button>Add contact</Button>
        </EmptyStateContent>
      </EmptyState>
    `,
  }),
};

export const WithoutAction: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Leave out EmptyStateContent when there is no action to offer.',
      },
    },
  },
  render: () => ({
    components: {
      EmptyState,
      EmptyStateDescription,
      EmptyStateHeader,
      EmptyStateMedia,
      EmptyStateTitle,
      PhUsers,
    },
    template: `
      <EmptyState>
        <EmptyStateHeader>
          <EmptyStateMedia variant="icon">
            <PhUsers aria-hidden="true" />
          </EmptyStateMedia>
          <EmptyStateTitle>No results</EmptyStateTitle>
          <EmptyStateDescription>Try adjusting your filters or search terms.</EmptyStateDescription>
        </EmptyStateHeader>
      </EmptyState>
    `,
  }),
};

export const TitleAsHeading: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Use `as-child` on EmptyStateTitle to render a real `h2` that names its section.',
      },
    },
  },
  render: () => ({
    components: {
      EmptyState,
      EmptyStateDescription,
      EmptyStateHeader,
      EmptyStateMedia,
      EmptyStateTitle,
      PhUsers,
    },
    template: `
      <section aria-labelledby="empty-state-section-heading">
        <EmptyState>
          <EmptyStateHeader>
            <EmptyStateMedia variant="icon">
              <PhUsers aria-hidden="true" />
            </EmptyStateMedia>
            <EmptyStateTitle as-child>
              <h2 id="empty-state-section-heading">No contacts yet</h2>
            </EmptyStateTitle>
            <EmptyStateDescription>The empty-state title can be the section heading without adding a duplicate hidden heading.</EmptyStateDescription>
          </EmptyStateHeader>
        </EmptyState>
      </section>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {
      level: 2,
      name: 'No contacts yet',
    });

    await expect(heading).toHaveAttribute('data-slot', 'empty-state-title');
  },
};

export const Bordered: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `bordered` to add a dashed frame around the empty state.',
      },
    },
  },
  render: () => ({
    components: {
      EmptyState,
      EmptyStateDescription,
      EmptyStateHeader,
      EmptyStateMedia,
      EmptyStateTitle,
      PhUsers,
    },
    template: `
      <EmptyState bordered>
        <EmptyStateHeader>
          <EmptyStateMedia variant="icon">
            <PhUsers aria-hidden="true" />
          </EmptyStateMedia>
          <EmptyStateTitle>No contacts yet</EmptyStateTitle>
          <EmptyStateDescription>Add your first contact to get started.</EmptyStateDescription>
        </EmptyStateHeader>
      </EmptyState>
    `,
  }),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-slot="empty-state"]');
    await expect(root).toHaveAttribute('data-bordered', 'true');
    await expect(root).toHaveStyle({ borderStyle: 'dashed' });
  },
};

export const AllVariants: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Compare the `icon` and `default` media variants, with and without a frame.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      EmptyState,
      EmptyStateContent,
      EmptyStateDescription,
      EmptyStateHeader,
      EmptyStateMedia,
      EmptyStateTitle,
      PhUsers,
    },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-6">
        <EmptyState bordered>
          <EmptyStateHeader>
            <EmptyStateMedia variant="icon">
              <PhUsers aria-hidden="true" />
            </EmptyStateMedia>
            <EmptyStateTitle>No contacts yet</EmptyStateTitle>
            <EmptyStateDescription>Add your first contact to get started.</EmptyStateDescription>
          </EmptyStateHeader>
          <EmptyStateContent>
            <Button>Add contact</Button>
          </EmptyStateContent>
        </EmptyState>

        <EmptyState>
          <EmptyStateHeader>
            <EmptyStateMedia variant="default">
              <PhUsers aria-hidden="true" class="nx:size-icon-[calc(var(--nx-icon-glyph-default)*3)] nx:icon-stroke nx:text-muted-foreground" />
            </EmptyStateMedia>
            <EmptyStateTitle>No results</EmptyStateTitle>
            <EmptyStateDescription>Try adjusting your filters.</EmptyStateDescription>
          </EmptyStateHeader>
        </EmptyState>
      </div>
    `,
  }),
};

// Behaviour stories: tests and Storybook only.

export const WithDataAttributes: Story = {
  render: () => ({
    components: {
      Button,
      EmptyState,
      EmptyStateContent,
      EmptyStateDescription,
      EmptyStateHeader,
      EmptyStateMedia,
      EmptyStateTitle,
      PhUsers,
    },
    template: `
      <EmptyState>
        <EmptyStateHeader>
          <EmptyStateMedia variant="icon">
            <PhUsers aria-hidden="true" />
          </EmptyStateMedia>
          <EmptyStateTitle>No contacts yet</EmptyStateTitle>
          <EmptyStateDescription>Add your first contact.</EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateContent>
          <Button>Add contact</Button>
        </EmptyStateContent>
      </EmptyState>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const slot of [
      'empty-state',
      'empty-state-header',
      'empty-state-media',
      'empty-state-title',
      'empty-state-description',
      'empty-state-content',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }

    const media = canvasElement.querySelector(
      '[data-slot="empty-state-media"]'
    );
    await expect(media).toHaveAttribute('data-variant', 'icon');
  },
};

export const LongCopyWithLink: Story = {
  render: () => ({
    components: {
      EmptyState,
      EmptyStateDescription,
      EmptyStateHeader,
      EmptyStateMedia,
      EmptyStateTitle,
      PhUsers,
    },
    template: `
      <EmptyState>
        <EmptyStateHeader>
          <EmptyStateMedia variant="icon">
            <PhUsers aria-hidden="true" />
          </EmptyStateMedia>
          <EmptyStateTitle>No team members match the filters you have applied to this view</EmptyStateTitle>
          <EmptyStateDescription>
            Try broadening your search, clearing a filter, or inviting someone
            new. You can also
            <a href="/docs/team">learn more about managing your team</a> in the
            docs.
          </EmptyStateDescription>
        </EmptyStateHeader>
      </EmptyState>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /learn more/i });

    await expect(link.parentElement).toHaveAttribute(
      'data-slot',
      'empty-state-description'
    );
    // underline-offset-4 is unique to the hook — no anchor defaults to 4px.
    await expect(link).toHaveStyle({ textUnderlineOffset: '4px' });

    await userEvent.tab();
    await expect(link).toHaveFocus();

    await expect(
      canvas.getByText(/broadening your search/i)
    ).toBeInTheDocument();
  },
};
