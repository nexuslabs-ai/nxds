import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import tabsMeta, {
  DisabledTabInteraction,
  ListRef,
  SmallSize,
  UnderlineVariant,
  WithDataAttributes,
  WithDisabledTab,
} from './Tabs.stories';

const meta: Meta<typeof Tabs> = {
  ...tabsMeta,
  title: 'Tests/Tabs',
};

export default meta;
type Story = StoryObj<typeof Tabs>;

function getTabsIndicator(root: HTMLElement) {
  const indicator = root.querySelector<HTMLElement>(
    '[data-slot="tabs-indicator"]'
  );

  if (!indicator) {
    throw new Error('Expected Tabs indicator to be rendered');
  }

  return indicator;
}

async function waitForIndicatorReady(indicator: HTMLElement) {
  await waitFor(() => expect(indicator.style.opacity).toBe('1'));
}

export const UnderlineVariantGeometry: Story = {
  ...UnderlineVariant,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passwordTab = canvas.getByRole('tab', { name: 'Password' });
    const indicator = getTabsIndicator(canvasElement);

    await userEvent.click(passwordTab);
    await waitFor(() => {
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
    const indicator = getTabsIndicator(canvasElement);

    await userEvent.click(tab1);
    await userEvent.keyboard('{ArrowRight}');

    const tab3 = canvas.getByRole('tab', { name: 'Tab 3' });
    await waitFor(() => {
      const indicatorRect = indicator.getBoundingClientRect();
      const tab3Rect = tab3.getBoundingClientRect();
      expect(Math.round(indicatorRect.left)).toBe(Math.round(tab3Rect.left));
      expect(Math.round(indicatorRect.width)).toBe(Math.round(tab3Rect.width));
    });
  },
};

export const VerticalIndicatorFollowsActiveTab: Story = {
  render: (_args) => (
    <div className="nx:flex nx:gap-8">
      <Tabs
        defaultValue="account"
        orientation="vertical"
        className="nx:flex nx:gap-4"
      >
        <TabsList aria-label="Personal settings">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Change your name and email.</TabsContent>
        <TabsContent value="billing">
          Manage your plan and invoices.
        </TabsContent>
      </Tabs>
      <Tabs
        defaultValue="account"
        orientation="vertical"
        className="nx:flex nx:gap-4"
      >
        <TabsList variant="underline" aria-label="Workspace settings">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Rename your workspace.</TabsContent>
        <TabsContent value="billing">Manage seats and invoices.</TabsContent>
      </Tabs>
    </div>
  ),
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
    const indicator = getTabsIndicator(list);
    const underlineIndicator = getTabsIndicator(underlineList);

    await waitForIndicatorReady(indicator);
    await userEvent.click(billing);
    await waitFor(() => {
      const indicatorRect = indicator.getBoundingClientRect();
      const billingRect = billing.getBoundingClientRect();
      expect(Math.round(indicatorRect.top)).toBe(Math.round(billingRect.top));
      expect(Math.round(indicatorRect.height)).toBe(
        Math.round(billingRect.height)
      );
    });

    await waitForIndicatorReady(underlineIndicator);
    await userEvent.click(underlineBilling);
    await waitFor(() => {
      const indicatorRect = underlineIndicator.getBoundingClientRect();
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

export const ListRefSize: Story = {
  ...ListRef,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('tablist');
    const indicator = getTabsIndicator(list);
    const active = canvas.getByRole('tab', { name: 'Tab 1' });

    await waitFor(() =>
      expect(indicator.style.width).toBe(`${active.offsetWidth}px`)
    );
  },
};
