import {
  type Meta,
  moduleMetadata,
  type StoryObj,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { NxTabs, NxTabsContent, NxTabsList, NxTabsTrigger } from './tabs';

type TabsListArgs = {
  variant: 'default' | 'underline';
  size: 'sm' | 'default' | 'lg';
};

const meta: Meta<TabsListArgs> = {
  title: 'Components/Tabs',
  parameters: {
    docs: {
      description: {
        component:
          'Tabs switch between panels of related content in one place. Use them to split a view into sections that users visit one at a time.',
      },
    },
  },
  component: NxTabsList,
  decorators: [
    moduleMetadata({
      imports: [NxTabs, NxTabsContent, NxTabsList, NxTabsTrigger],
    }),
  ],
  args: {
    variant: 'default',
    size: 'default',
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'underline'] },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div nxTabs value="account" class="nx:w-96">
        <div nxTabsList [variant]="variant" [size]="size" aria-label="Settings">
          <button nxTabsTrigger value="account">Account</button>
          <button nxTabsTrigger value="billing">Billing</button>
          <button nxTabsTrigger value="team" disabled>Team</button>
        </div>
        <div nxTabsContent value="account">Change your name and email.</div>
        <div nxTabsContent value="billing">Manage your plan and invoices.</div>
        <div nxTabsContent value="team">Invite your team.</div>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<TabsListArgs>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    template: `
      <div nxTabs value="account" class="nx:w-[400px]">
        <div nxTabsList>
          <button nxTabsTrigger value="account">Account</button>
          <button nxTabsTrigger value="password">Password</button>
        </div>
        <div nxTabsContent value="account">
          <p class="nx:typography-body-default nx:text-muted-foreground">Make changes to your account here. Click save when you're done.</p>
        </div>
        <div nxTabsContent value="password">
          <p class="nx:typography-body-default nx:text-muted-foreground">Change your password here. After saving, you'll be logged out.</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabsList = canvas.getByRole('tablist');
    const tab = canvas.getByRole('tab', { name: 'Account' });

    await expect(tabsList).toHaveAttribute('data-variant', 'default');
    await expect(tabsList).toHaveAttribute('data-size', 'default');
    await expect(tab).toHaveAttribute('data-variant', 'default');
    await expect(tab).toHaveAttribute('data-size', 'default');
  },
};

export const UnderlineVariant: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `variant="underline"` on TabsList for a line under the active tab.',
      },
    },
  },
  render: () => ({
    template: `
      <div nxTabs value="account" class="nx:w-[400px]">
        <div nxTabsList variant="underline">
          <button nxTabsTrigger value="account">Account</button>
          <button nxTabsTrigger value="password">Password</button>
          <button nxTabsTrigger value="settings">Settings</button>
        </div>
        <div nxTabsContent value="account">
          <p class="nx:typography-body-default nx:text-muted-foreground">Account settings with underline variant tabs.</p>
        </div>
        <div nxTabsContent value="password">
          <p class="nx:typography-body-default nx:text-muted-foreground">Password settings with underline variant tabs.</p>
        </div>
        <div nxTabsContent value="settings">
          <p class="nx:typography-body-default nx:text-muted-foreground">General settings with underline variant tabs.</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const accountTab = canvas.getByRole('tab', { name: 'Account' });
    const passwordTab = canvas.getByRole('tab', { name: 'Password' });

    await expect(accountTab).toHaveAttribute('data-state', 'active');
    await userEvent.click(passwordTab);
    await expect(passwordTab).toHaveAttribute('data-state', 'active');
    await waitFor(() => {
      const indicator = canvasElement.querySelector(
        '[data-slot="tabs-indicator"]'
      );
      if (!indicator) throw new Error('Tabs indicator not rendered');
      const indicatorRect = indicator.getBoundingClientRect();
      const passwordRect = passwordTab.getBoundingClientRect();
      expect(Math.round(indicatorRect.bottom)).toBe(
        Math.round(passwordRect.bottom)
      );
      expect(Math.round(indicatorRect.left)).toBe(
        Math.round(passwordRect.left)
      );
      expect(indicatorRect.height).toBeGreaterThan(0);
      expect(Math.round(indicatorRect.height)).toBe(
        Math.round(parseFloat(getComputedStyle(passwordTab).borderBottomWidth))
      );
    });
    await expect(
      canvas.getByText('Password settings with underline variant tabs.')
    ).toBeVisible();
  },
};

export const SmallSize: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `size="sm"` on TabsList for compact tabs.',
      },
    },
  },
  render: () => ({
    template: `
      <div nxTabs value="tab1" class="nx:w-[400px]">
        <div nxTabsList size="sm">
          <button nxTabsTrigger value="tab1">Small Tab</button>
          <button nxTabsTrigger value="tab2">Another</button>
          <button nxTabsTrigger value="tab3">Third</button>
        </div>
        <div nxTabsContent value="tab1">
          <p class="nx:typography-body-default nx:text-muted-foreground">Small size tabs content.</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tab = canvas.getByRole('tab', { name: 'Small Tab' });

    await expect(tab).toHaveClass(
      'nx:typography-label-small',
      'nx:px-2',
      'nx:py-1'
    );
    await expect(getComputedStyle(tab).fontSize).toBe('12px');
  },
};

export const LargeSize: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `size="lg"` on TabsList for roomier tabs.',
      },
    },
  },
  render: () => ({
    template: `
      <div nxTabs value="tab1" class="nx:w-[500px]">
        <div nxTabsList size="lg">
          <button nxTabsTrigger value="tab1">Large Tab</button>
          <button nxTabsTrigger value="tab2">Another</button>
          <button nxTabsTrigger value="tab3">Third</button>
        </div>
        <div nxTabsContent value="tab1">
          <p class="nx:typography-body-default nx:text-muted-foreground">Large size tabs content.</p>
        </div>
      </div>
    `,
  }),
};

export const WithDisabledTab: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Disable a TabsTrigger so users can see the tab but not open it.',
      },
    },
  },
  render: () => ({
    template: `
      <div nxTabs value="account" class="nx:w-[400px]">
        <div nxTabsList>
          <button nxTabsTrigger value="account">Account</button>
          <button nxTabsTrigger value="password">Password</button>
          <button nxTabsTrigger value="settings" disabled>Settings</button>
        </div>
        <div nxTabsContent value="account">
          <p class="nx:typography-body-default nx:text-muted-foreground">Account content</p>
        </div>
        <div nxTabsContent value="password">
          <p class="nx:typography-body-default nx:text-muted-foreground">Password content</p>
        </div>
        <div nxTabsContent value="settings">
          <p class="nx:typography-body-default nx:text-muted-foreground">Settings content</p>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledTab = canvas.getByRole('tab', { name: 'Settings' });

    await expect(disabledTab).toBeDisabled();

    // Disabled state uses a semantic text token at full opacity (not a fade).
    await expect(disabledTab).toHaveClass(
      'nx:disabled:text-disabled-foreground'
    );
    await expect(getComputedStyle(disabledTab).opacity).toBe('1');
  },
};

export const ClickInteraction: Story = {
  render: () => ({
    template: `
      <div nxTabs value="tab1" class="nx:w-[400px]">
        <div nxTabsList>
          <button nxTabsTrigger value="tab1">Tab 1</button>
          <button nxTabsTrigger value="tab2">Tab 2</button>
        </div>
        <div nxTabsContent value="tab1"><p>Content 1</p></div>
        <div nxTabsContent value="tab2"><p>Content 2</p></div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });
    const tab2 = canvas.getByRole('tab', { name: 'Tab 2' });

    await expect(tab1).toHaveAttribute('data-state', 'active');
    await expect(tab2).toHaveAttribute('data-state', 'inactive');
    await expect(canvas.getByText('Content 1')).toBeVisible();

    await userEvent.click(tab2);

    await expect(tab1).toHaveAttribute('data-state', 'inactive');
    await expect(tab2).toHaveAttribute('data-state', 'active');
    await expect(canvas.getByText('Content 2')).toBeVisible();
  },
};

export const KeyboardInteraction: Story = {
  render: () => ({
    template: `
      <div nxTabs value="tab1" class="nx:w-[400px]">
        <div nxTabsList>
          <button nxTabsTrigger value="tab1">Tab 1</button>
          <button nxTabsTrigger value="tab2">Tab 2</button>
          <button nxTabsTrigger value="tab3">Tab 3</button>
        </div>
        <div nxTabsContent value="tab1"><p>Content 1</p></div>
        <div nxTabsContent value="tab2"><p>Content 2</p></div>
        <div nxTabsContent value="tab3"><p>Content 3</p></div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Focus the first tab
    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });
    await userEvent.click(tab1);
    await expect(tab1).toHaveFocus();

    // Navigate right with arrow key
    await userEvent.keyboard('{ArrowRight}');
    const tab2 = canvas.getByRole('tab', { name: 'Tab 2' });
    await expect(tab2).toHaveFocus();

    // Navigate right again
    await userEvent.keyboard('{ArrowRight}');
    const tab3 = canvas.getByRole('tab', { name: 'Tab 3' });
    await expect(tab3).toHaveFocus();

    // Navigate left
    await userEvent.keyboard('{ArrowLeft}');
    await expect(tab2).toHaveFocus();
  },
};

export const DisabledTabInteraction: Story = {
  render: () => ({
    template: `
      <div nxTabs value="tab1" class="nx:w-[400px]">
        <div nxTabsList>
          <button nxTabsTrigger value="tab1">Tab 1</button>
          <button nxTabsTrigger value="tab2" disabled>Tab 2 (Disabled)</button>
          <button nxTabsTrigger value="tab3">Tab 3</button>
        </div>
        <div nxTabsContent value="tab1"><p>Content 1</p></div>
        <div nxTabsContent value="tab2"><p>Content 2</p></div>
        <div nxTabsContent value="tab3"><p>Content 3</p></div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const disabledTab = canvas.getByRole('tab', { name: 'Tab 2 (Disabled)' });
    await expect(disabledTab).toBeDisabled();

    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });

    await expect(tab1).toHaveAttribute('data-state', 'active');
    await expect(canvas.getByText('Content 1')).toBeVisible();

    await userEvent.click(tab1);
    await userEvent.keyboard('{ArrowRight}');

    const tab3 = canvas.getByRole('tab', { name: 'Tab 3' });
    await expect(tab3).toHaveFocus();
    await expect(tab1).toHaveAttribute('data-state', 'inactive');
    await expect(disabledTab).toHaveAttribute('data-state', 'inactive');
    await expect(tab3).toHaveAttribute('data-state', 'active');
    await waitFor(() => {
      const indicator = canvasElement.querySelector(
        '[data-slot="tabs-indicator"]'
      );
      if (!indicator) throw new Error('Tabs indicator not rendered');
      expect(Math.round(indicator.getBoundingClientRect().left)).toBe(
        Math.round(tab3.getBoundingClientRect().left)
      );
    });
    await expect(canvas.getByText('Content 3')).toBeVisible();
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    template: `
      <div nxTabs value="tab1" class="nx:w-[400px]">
        <div nxTabsList variant="underline" size="lg">
          <button nxTabsTrigger value="tab1">Tab 1</button>
          <button nxTabsTrigger value="tab2">Tab 2</button>
        </div>
        <div nxTabsContent value="tab1"><p>Content 1</p></div>
        <div nxTabsContent value="tab2"><p>Content 2</p></div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check data-slot attributes
    const tabsList = canvas.getByRole('tablist');
    await expect(tabsList).toHaveAttribute('data-slot', 'tabs-list');
    await expect(tabsList).toHaveAttribute('data-variant', 'underline');
    await expect(tabsList).toHaveAttribute('data-size', 'lg');

    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });
    await expect(tab1).toHaveAttribute('data-slot', 'tabs-trigger');
    await expect(tab1).toHaveAttribute('data-variant', 'underline');
    await expect(tab1).toHaveAttribute('data-size', 'lg');

    const tab2 = canvas.getByRole('tab', { name: 'Tab 2' });
    await expect(tab2).toHaveAttribute('data-slot', 'tabs-trigger');
    await expect(tab2).toHaveAttribute('data-variant', 'underline');
    await expect(tab2).toHaveAttribute('data-size', 'lg');

    // Check tabpanel has data-slot
    const tabPanel = canvas.getByRole('tabpanel');
    await expect(tabPanel).toHaveAttribute('data-slot', 'tabs-content');

    await expect(tab2).toHaveClass(
      'nx:typography-label-default',
      'nx:px-4',
      'nx:py-2'
    );
    await expect(getComputedStyle(tab2).fontSize).toBe('14px');
  },
};

export const IndicatorFollowsActiveTab: Story = {
  play: async ({ canvasElement }) => {
    const billing = within(canvasElement).getByRole('tab', { name: 'Billing' });

    await userEvent.click(billing);
    await waitFor(() => {
      const indicator = canvasElement.querySelector(
        '[data-slot="tabs-indicator"]'
      );
      if (!indicator) throw new Error('Tabs indicator not rendered');
      const indicatorRect = indicator.getBoundingClientRect();
      const billingRect = billing.getBoundingClientRect();
      expect(Math.round(indicatorRect.left)).toBe(Math.round(billingRect.left));
      expect(Math.round(indicatorRect.width)).toBe(
        Math.round(billingRect.width)
      );
    });
  },
};

export const VerticalIndicatorFollowsActiveTab: Story = {
  render: () => ({
    template: `
      <div class="nx:flex nx:gap-8">
        <div nxTabs value="account" orientation="vertical" class="nx:flex nx:gap-4">
          <div nxTabsList aria-label="Personal settings">
            <button nxTabsTrigger value="account">Account</button>
            <button nxTabsTrigger value="billing">Billing</button>
          </div>
          <div nxTabsContent value="account">Change your name and email.</div>
          <div nxTabsContent value="billing">Manage your plan and invoices.</div>
        </div>
        <div nxTabs value="account" orientation="vertical" class="nx:flex nx:gap-4">
          <div nxTabsList variant="underline" aria-label="Workspace settings">
            <button nxTabsTrigger value="account">Account</button>
            <button nxTabsTrigger value="billing">Billing</button>
          </div>
          <div nxTabsContent value="account">Rename your workspace.</div>
          <div nxTabsContent value="billing">Manage seats and invoices.</div>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('tablist', { name: 'Personal settings' });
    const underlineList = canvas.getByRole('tablist', {
      name: 'Workspace settings',
    });
    const billing = within(list).getByRole('tab', { name: 'Billing' });
    const underlineBilling = within(underlineList).getByRole('tab', {
      name: 'Billing',
    });

    await userEvent.click(billing);
    await waitFor(() => {
      const indicator = list.querySelector('[data-slot="tabs-indicator"]');
      if (!indicator) throw new Error('Tabs indicator not rendered');
      const indicatorRect = indicator.getBoundingClientRect();
      const billingRect = billing.getBoundingClientRect();
      expect(Math.round(indicatorRect.top)).toBe(Math.round(billingRect.top));
      expect(Math.round(indicatorRect.height)).toBe(
        Math.round(billingRect.height)
      );
    });

    await userEvent.click(underlineBilling);
    await waitFor(() => {
      const indicator = underlineList.querySelector(
        '[data-slot="tabs-indicator"]'
      );
      if (!indicator) throw new Error('Tabs indicator not rendered');
      const indicatorRect = indicator.getBoundingClientRect();
      const billingRect = underlineBilling.getBoundingClientRect();
      expect(Math.round(indicatorRect.top)).toBe(Math.round(billingRect.top));
      expect(Math.round(indicatorRect.right)).toBe(
        Math.round(billingRect.right)
      );
      expect(indicatorRect.width).toBeGreaterThan(0);
      expect(Math.round(indicatorRect.width)).toBe(
        Math.round(
          parseFloat(getComputedStyle(underlineBilling).borderRightWidth)
        )
      );
    });
  },
};
