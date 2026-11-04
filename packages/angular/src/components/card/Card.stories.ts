import {
  type Meta,
  moduleMetadata,
  type StoryObj,
} from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { NxButton } from '../button/button';
import { NxInput } from '../input/input';
import { NxLabel } from '../label/label';

import {
  NxCard,
  NxCardAction,
  NxCardContent,
  NxCardDescription,
  NxCardFooter,
  NxCardHeader,
  NxCardTitle,
} from './card';

const meta: Meta<NxCard> = {
  title: 'Components/Card',
  parameters: {
    docs: {
      description: {
        component:
          'Card groups related content and actions in a bordered section. Use it for dashboards, settings sections and forms.',
      },
    },
  },
  component: NxCard,
  decorators: [
    moduleMetadata({
      imports: [
        NxButton,
        NxCard,
        NxCardAction,
        NxCardContent,
        NxCardDescription,
        NxCardFooter,
        NxCardHeader,
        NxCardTitle,
        NxInput,
        NxLabel,
      ],
    }),
  ],
  render: () => ({
    template: `
      <div nxCard class="nx:w-96">
        <div nxCardHeader>
          <h3 nxCardTitle>Team plan</h3>
          <p nxCardDescription>Five seats, billed monthly.</p>
          <div nxCardAction><button nxButton size="sm" variant="ghost">Edit</button></div>
        </div>
        <div nxCardContent>Your next invoice is on 1 November.</div>
        <div nxCardFooter>
          <button nxButton variant="outline">Cancel</button>
          <button nxButton>Upgrade</button>
        </div>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<NxCard>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    template: `
      <div nxCard class="nx:w-[350px]">
        <div nxCardHeader>
          <h3 nxCardTitle>Card Title</h3>
          <p nxCardDescription>Card description goes here.</p>
        </div>
        <div nxCardContent>
          <p>Card content goes here.</p>
        </div>
        <div nxCardFooter>
          <button nxButton variant="outline">Cancel</button>
          <button nxButton>Submit</button>
        </div>
      </div>
    `,
  }),
};

export const WithAction: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Put a header action beside the title with CardAction.',
      },
    },
  },
  render: () => ({
    template: `
      <div nxCard class="nx:w-[350px]">
        <div nxCardHeader>
          <h3 nxCardTitle>Card with Action</h3>
          <p nxCardDescription>This card has an action button.</p>
          <div nxCardAction>
            <button nxButton size="sm" variant="outline">Edit</button>
          </div>
        </div>
        <div nxCardContent>
          <p>Content with an action button in the header.</p>
        </div>
      </div>
    `,
  }),
};

export const WithFooter: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Place action buttons at the bottom with CardFooter.',
      },
    },
  },
  render: () => ({
    template: `
      <div nxCard class="nx:w-[350px]">
        <div nxCardHeader>
          <h3 nxCardTitle>Card with Footer</h3>
          <p nxCardDescription>This card demonstrates footer usage.</p>
        </div>
        <div nxCardContent>
          <p>The footer is useful for action buttons.</p>
        </div>
        <div nxCardFooter>
          <button nxButton variant="outline">Cancel</button>
          <button nxButton>Save Changes</button>
        </div>
      </div>
    `,
  }),
};

export const ContentOnly: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Use a card with content only, without a header or footer.',
      },
    },
  },
  render: () => ({
    template: `
      <div nxCard class="nx:w-[350px]">
        <div nxCardContent class="nx:pt-6">
          <p>A card with only content, no header or footer.</p>
        </div>
      </div>
    `,
  }),
};

export const LoginCard: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Wrap a sign-in form in a card with a header and footer.',
      },
    },
  },
  render: () => ({
    template: `
      <form class="nx:w-full nx:max-w-sm" (submit)="$event.preventDefault()">
        <div nxCard>
          <div nxCardHeader>
            <h3 nxCardTitle>Sign in</h3>
            <p nxCardDescription>Enter your email and password to continue.</p>
          </div>
          <div nxCardContent class="nx:grid nx:gap-4">
            <div class="nx:grid nx:gap-1.5">
              <label nxLabel for="login-email">Email</label>
              <input nxInput id="login-email" type="email" autocomplete="email" placeholder="you@example.com" required />
            </div>
            <div class="nx:grid nx:gap-1.5">
              <label nxLabel for="login-password">Password</label>
              <input nxInput id="login-password" type="password" autocomplete="current-password" required />
            </div>
          </div>
          <div nxCardFooter>
            <button nxButton type="submit" class="nx:w-full">Sign in</button>
          </div>
        </div>
      </form>
    `,
  }),
};

export const WithDataAttributes: Story = {
  render: () => ({
    template: `
      <div nxCard class="nx:w-[350px]">
        <div nxCardHeader>
          <h3 nxCardTitle>Data Attributes Test</h3>
          <p nxCardDescription>Testing data-slot attributes.</p>
          <div nxCardAction>
            <button nxButton size="sm">Edit</button>
          </div>
        </div>
        <div nxCardContent>
          <p>Content area.</p>
        </div>
        <div nxCardFooter>
          <button nxButton>Action</button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check data-slot attributes
    const card = canvasElement.querySelector('[data-slot="card"]');
    const header = canvasElement.querySelector('[data-slot="card-header"]');
    const title = canvasElement.querySelector('[data-slot="card-title"]');
    const description = canvasElement.querySelector(
      '[data-slot="card-description"]'
    );
    const action = canvasElement.querySelector('[data-slot="card-action"]');
    const content = canvasElement.querySelector('[data-slot="card-content"]');
    const footer = canvasElement.querySelector('[data-slot="card-footer"]');

    await expect(card).toBeInTheDocument();
    await expect(header).toBeInTheDocument();
    await expect(title).toBeInTheDocument();
    await expect(description).toBeInTheDocument();
    await expect(action).toBeInTheDocument();
    await expect(content).toBeInTheDocument();
    await expect(footer).toBeInTheDocument();

    // Verify title text
    const titleElement = canvas.getByRole('heading', {
      level: 3,
      name: 'Data Attributes Test',
    });
    await expect(titleElement).toHaveAttribute('data-slot', 'card-title');
  },
};

export const TitleAsHeading: Story = {
  render: () => ({
    template: `
      <section aria-labelledby="card-section-heading">
        <div nxCard class="nx:w-[350px]">
          <div nxCardHeader>
            <h2 nxCardTitle id="card-section-heading">Campaign overview</h2>
            <p nxCardDescription>Use a section-level heading when the card sits directly below a page heading.</p>
          </div>
          <div nxCardContent>
            <p>Campaign metrics belong to this section of the page outline.</p>
          </div>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {
      level: 2,
      name: 'Campaign overview',
    });

    await expect(heading).toHaveAttribute('data-slot', 'card-title');
  },
};

export const LongTitleWithAction: Story = {
  render: () => ({
    template: `
      <div nxCard class="nx:w-[320px]">
        <div nxCardHeader>
          <h3 nxCardTitle>Quarterly revenue operations review with customer expansion notes</h3>
          <p nxCardDescription>The action should keep its own reserved column.</p>
          <div nxCardAction>
            <button nxButton size="sm" variant="outline">Edit</button>
          </div>
        </div>
        <div nxCardContent>
          <p>Header text wraps before it reaches the action.</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    await document.fonts.ready;

    const title = canvasElement.querySelector<HTMLElement>(
      '[data-slot="card-title"]'
    );
    const action = canvasElement.querySelector<HTMLElement>(
      '[data-slot="card-action"]'
    );

    if (!title || !action) {
      throw new Error('Expected card title and action to render.');
    }

    const titleRect = title.getBoundingClientRect();
    const actionRect = action.getBoundingClientRect();

    await expect(titleRect.right).toBeLessThanOrEqual(actionRect.left + 0.5);
  },
};
