import {
  type Meta,
  moduleMetadata,
  type StoryObj,
} from '@storybook/angular-vite';
import { expect, userEvent, within } from 'storybook/test';

import { NxInput } from '../input/input';

import { NxLabel } from './label';

const meta: Meta<NxLabel> = {
  title: 'Components/Label',
  component: NxLabel,
  decorators: [moduleMetadata({ imports: [NxLabel, NxInput] })],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Label names a form control. Set `for` to the control's `id` so a click on the label focuses or toggles the control. Inside a Field, use FieldLabel.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<NxLabel>;

// ============================================
// BASIC STORIES
// ============================================

export const WithInput: Story = {
  tags: ['docs'],
  render: () => ({
    template: `
      <div class="nx:flex nx:flex-col nx:gap-2">
        <label nxLabel for="email">Email</label>
        <input nxInput id="email" type="email" placeholder="you@example.com" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Dim the label when the checkbox placed before it is disabled.',
      },
    },
  },
  // The label dims when its `nx:peer` sibling control is disabled.
  render: () => ({
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <input type="checkbox" id="accept-terms" class="nx:peer" disabled />
        <label nxLabel for="accept-terms">Accept terms</label>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Accept terms');

    // Peer-disabled label uses a semantic text token at full opacity (not a fade).
    await expect(label).toHaveClass(
      'nx:peer-disabled:text-disabled-foreground'
    );
    await expect(getComputedStyle(label).opacity).toBe('1');
  },
};

export const LongContent: Story = {
  render: () => ({
    template: `
      <div class="nx:w-56">
        <label nxLabel>
          Notification preference for product updates and workspace activity
        </label>
      </div>
    `,
  }),
};

// ============================================
// INTERACTION TESTS
// ============================================

export const ClickInteraction: Story = {
  render: () => ({
    template: `
      <div class="nx:flex nx:flex-col nx:gap-2">
        <label nxLabel for="click-email">Email address</label>
        <input nxInput id="click-email" type="email" placeholder="you@example.com" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Email address');
    const input = canvas.getByRole('textbox');

    // Clicking the label moves focus to its associated control
    await expect(input).not.toHaveFocus();
    await userEvent.click(label);
    await expect(input).toHaveFocus();
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    template: '<label nxLabel>Field label</label>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Field label');

    await expect(label).toHaveAttribute('data-slot', 'label');
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <label nxLabel>Default label</label>

        <div class="nx:w-56">
          <label nxLabel>
            Notification preference for product updates and workspace activity
          </label>
        </div>

        <label nxLabel>
          <input type="checkbox" aria-label="Nested checkbox" />
          With nested control
        </label>

        <span class="nx:flex nx:items-center nx:gap-2">
          <input
            type="checkbox"
            disabled
            class="nx:peer"
            aria-label="Unavailable option"
          />
          <label nxLabel>Peer-disabled</label>
        </span>
      </div>
    `,
  }),
};
