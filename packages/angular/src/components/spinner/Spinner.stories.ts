import {
  type Meta,
  moduleMetadata,
  type StoryObj,
} from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { NxSpinner } from './spinner';

const meta: Meta<NxSpinner> = {
  title: 'Components/Spinner',
  parameters: {
    docs: {
      description: {
        component:
          'Spinner shows that something is loading. For a loading Button, use its `loading` prop.',
      },
    },
  },
  component: NxSpinner,
  decorators: [moduleMetadata({ imports: [NxSpinner] })],
};

export default meta;
type Story = StoryObj<NxSpinner>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    template: `
      <svg nxSpinner></svg>
    `,
  }),
};

export const Sizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Size the spinner with `nx:size-*` and tint it with `nx:text-*`.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="nx:flex nx:items-center nx:gap-4 nx:text-foreground">
        <svg nxSpinner class="nx:size-4"></svg>
        <svg nxSpinner class="nx:size-6"></svg>
        <svg nxSpinner class="nx:size-8 nx:text-primary-subtle-foreground"></svg>
      </div>
    `,
  }),
};

export const WithText: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Place the spinner beside text that says what is loading.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="nx:flex nx:items-center nx:gap-2 nx:typography-body-default nx:text-muted-foreground">
        <svg nxSpinner class="nx:size-4"></svg>
        Loading results…
      </div>
    `,
  }),
};

export const WithDataAttributes: Story = {
  render: () => ({
    template: '<svg nxSpinner></svg>',
  }),
  play: async ({ canvasElement }) => {
    const spinner = within(canvasElement).getByRole('status');
    await expect(spinner).toHaveAccessibleName('Loading');
    await expect(spinner).toHaveAttribute('data-slot', 'spinner');
  },
};
