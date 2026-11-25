import type { StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import tabsMeta, {
  DisabledTabInteraction,
  SmallSize,
  UnderlineVariant,
  WithDataAttributes,
  WithDisabledTab,
} from './Tabs.stories';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '.';

const meta = {
  ...tabsMeta,
  title: 'Tests/Tabs',
};

export default meta;
type Story = StoryObj<typeof tabsMeta>;

export const UnderlineVariantGeometry: Story = {
  ...UnderlineVariant,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passwordTab = canvas.getByRole('tab', { name: 'Password' });

    await userEvent.click(passwordTab);
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
  },
};

export const SmallSizeStyle: Story = {
  ...SmallSize,
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

export const WithDisabledTabStyle: Story = {
  ...WithDisabledTab,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledTab = canvas.getByRole('tab', { name: 'Settings' });

    // Disabled state uses a semantic text token at full opacity (not a fade).
    await expect(disabledTab).toHaveClass(
      'nx:disabled:text-disabled-foreground'
    );
    await expect(getComputedStyle(disabledTab).opacity).toBe('1');
  },
};

export const DisabledTabInteractionGeometry: Story = {
  ...DisabledTabInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });

    await userEvent.click(tab1);
    await userEvent.keyboard('{ArrowRight}');

    const tab3 = canvas.getByRole('tab', { name: 'Tab 3' });
    await waitFor(() => {
      const indicator = canvasElement.querySelector(
        '[data-slot="tabs-indicator"]'
      );
      if (!indicator) throw new Error('Tabs indicator not rendered');
      expect(Math.round(indicator.getBoundingClientRect().left)).toBe(
        Math.round(tab3.getBoundingClientRect().left)
      );
    });
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tab2 = canvas.getByRole('tab', { name: 'Tab 2' });

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
    components: { Tabs, TabsContent, TabsList, TabsTrigger },
    template: `
      <div class="nx:flex nx:gap-8">
        <Tabs default-value="account" orientation="vertical" class="nx:flex nx:gap-4">
          <TabsList aria-label="Personal settings">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="account">Change your name and email.</TabsContent>
          <TabsContent value="billing">Manage your plan and invoices.</TabsContent>
        </Tabs>
        <Tabs default-value="account" orientation="vertical" class="nx:flex nx:gap-4">
          <TabsList variant="underline" aria-label="Workspace settings">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="account">Rename your workspace.</TabsContent>
          <TabsContent value="billing">Manage seats and invoices.</TabsContent>
        </Tabs>
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
