import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '.';

const meta = {
  parameters: {
    docs: {
      description: {
        component:
          'Tabs switch between panels of related content in one place. Use them to split a view into sections that users visit one at a time.',
      },
    },
  },
  component: TabsList,
  argTypes: {
    variant: { control: 'select', options: ['default', 'underline'] },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
  },
  render: (args) => ({
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    setup: () => ({ args }),
    template: `
      <Tabs default-value="account" class="nx:w-96">
        <TabsList v-bind="args" aria-label="Settings">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team" disabled>Team</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Change your name and email.</TabsContent>
        <TabsContent value="billing">Manage your plan and invoices.</TabsContent>
        <TabsContent value="team">Invite your team.</TabsContent>
      </Tabs>
    `,
  }),
} satisfies Meta<typeof TabsList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="account" class="nx:w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <p class="nx:typography-body-default nx:text-muted-foreground">Make changes to your account here. Click save when you're done.</p>
        </TabsContent>
        <TabsContent value="password">
          <p class="nx:typography-body-default nx:text-muted-foreground">Change your password here. After saving, you'll be logged out.</p>
        </TabsContent>
      </Tabs>
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
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="account" class="nx:w-[400px]">
        <TabsList variant="underline">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <p class="nx:typography-body-default nx:text-muted-foreground">Account settings with underline variant tabs.</p>
        </TabsContent>
        <TabsContent value="password">
          <p class="nx:typography-body-default nx:text-muted-foreground">Password settings with underline variant tabs.</p>
        </TabsContent>
        <TabsContent value="settings">
          <p class="nx:typography-body-default nx:text-muted-foreground">General settings with underline variant tabs.</p>
        </TabsContent>
      </Tabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const accountTab = canvas.getByRole('tab', { name: 'Account' });
    const passwordTab = canvas.getByRole('tab', { name: 'Password' });

    await expect(accountTab).toHaveAttribute('data-state', 'active');
    await userEvent.click(passwordTab);
    await expect(passwordTab).toHaveAttribute('data-state', 'active');
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
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="tab1" class="nx:w-[400px]">
        <TabsList size="sm">
          <TabsTrigger value="tab1">Small Tab</TabsTrigger>
          <TabsTrigger value="tab2">Another</TabsTrigger>
          <TabsTrigger value="tab3">Third</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <p class="nx:typography-body-default nx:text-muted-foreground">Small size tabs content.</p>
        </TabsContent>
      </Tabs>
    `,
  }),
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
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="tab1" class="nx:w-[500px]">
        <TabsList size="lg">
          <TabsTrigger value="tab1">Large Tab</TabsTrigger>
          <TabsTrigger value="tab2">Another</TabsTrigger>
          <TabsTrigger value="tab3">Third</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <p class="nx:typography-body-default nx:text-muted-foreground">Large size tabs content.</p>
        </TabsContent>
      </Tabs>
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
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="account" class="nx:w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="settings" disabled>Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <p class="nx:typography-body-default nx:text-muted-foreground">Account content</p>
        </TabsContent>
        <TabsContent value="password">
          <p class="nx:typography-body-default nx:text-muted-foreground">Password content</p>
        </TabsContent>
        <TabsContent value="settings">
          <p class="nx:typography-body-default nx:text-muted-foreground">Settings content</p>
        </TabsContent>
      </Tabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledTab = canvas.getByRole('tab', { name: 'Settings' });

    await expect(disabledTab).toBeDisabled();
  },
};

export const ClickInteraction: Story = {
  render: () => ({
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="tab1" class="nx:w-[400px]">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1"><p>Content 1</p></TabsContent>
        <TabsContent value="tab2"><p>Content 2</p></TabsContent>
      </Tabs>
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
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="tab1" class="nx:w-[400px]">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1"><p>Content 1</p></TabsContent>
        <TabsContent value="tab2"><p>Content 2</p></TabsContent>
        <TabsContent value="tab3"><p>Content 3</p></TabsContent>
      </Tabs>
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
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="tab1" class="nx:w-[400px]">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>Tab 2 (Disabled)</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1"><p>Content 1</p></TabsContent>
        <TabsContent value="tab2"><p>Content 2</p></TabsContent>
        <TabsContent value="tab3"><p>Content 3</p></TabsContent>
      </Tabs>
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
    await expect(canvas.getByText('Content 3')).toBeVisible();
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <Tabs default-value="tab1" class="nx:w-[400px]">
        <TabsList variant="underline" size="lg">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1"><p>Content 1</p></TabsContent>
        <TabsContent value="tab2"><p>Content 2</p></TabsContent>
      </Tabs>
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
  },
};
