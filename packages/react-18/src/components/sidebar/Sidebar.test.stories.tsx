import * as React from 'react';

import { DENSITY_OPTIONS } from '@nxds/core';
import {
  CalendarBlankIcon,
  GearIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  SquaresFourIcon,
  TrayIcon,
  UserIcon,
} from '@phosphor-icons/react/ssr';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { expect, within } from 'storybook/test';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';
import { expectTextFits } from '../../stories/support/story-height-test-utils';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from './sidebar';
import sidebarMeta, { Disabled, LoadingSkeleton } from './Sidebar.stories';

const meta: Meta<typeof Sidebar> = {
  ...sidebarMeta,
  title: 'Tests/Sidebar',
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

type SidebarControlsArgs = Pick<
  React.ComponentProps<typeof Sidebar>,
  'collapsible' | 'side' | 'variant'
> & {
  open: boolean;
};

type ControlsStory = StoryObj<SidebarControlsArgs>;

const NAV_ITEMS = [
  { title: 'Home', icon: HouseIcon },
  { title: 'Inbox', icon: TrayIcon, badge: '4' },
  { title: 'Calendar', icon: CalendarBlankIcon },
  { title: 'Search', icon: MagnifyingGlassIcon },
  { title: 'Settings', icon: GearIcon },
];

function DemoSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Acme Inc">
              <SquaresFourIcon />
              <span>Acme Inc</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={item.title === 'Home'}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Account">
              <UserIcon />
              <span>Account</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function DemoInset({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarInset>
      <header className="nx:flex nx:h-16 nx:items-center nx:gap-2 nx:border-b-default nx:border-border-default nx:px-4">
        <SidebarTrigger />
        <span className="nx:typography-label-default">Dashboard</span>
      </header>
      <div className="nx:min-h-[20rem] nx:p-4 nx:typography-label-default nx:text-muted-foreground">
        {children ?? 'Main content area.'}
      </div>
    </SidebarInset>
  );
}

export const InteractiveControls: ControlsStory = {
  name: 'Interactive Controls',
  args: {
    open: true,
    collapsible: 'offcanvas',
    variant: 'sidebar',
    side: 'left',
  },
  argTypes: {
    open: {
      control: 'boolean',
    },
    collapsible: {
      control: 'inline-radio',
      options: ['offcanvas', 'icon', 'none'],
    },
    variant: {
      control: 'inline-radio',
      options: ['sidebar', 'floating', 'inset'],
    },
    side: {
      control: 'inline-radio',
      options: ['left', 'right'],
    },
  },
  parameters: {
    controls: {
      include: ['open', 'collapsible', 'variant', 'side'],
    },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<SidebarControlsArgs>();

    return (
      <SidebarProvider
        open={args.open}
        onOpenChange={(open) => updateArgs({ open })}
      >
        <DemoSidebar
          collapsible={args.collapsible}
          side={args.side}
          variant={args.variant}
        />
        <DemoInset />
      </SidebarProvider>
    );
  },
};

/** Checks that every menu button sits inside `rail` with the same space on both sides. */
async function expectButtonsCentered(rail: HTMLElement) {
  const left = rail.getBoundingClientRect().left + rail.clientLeft;
  const right = left + rail.clientWidth;
  const buttons = rail.querySelectorAll('[data-slot="sidebar-menu-button"]');
  await expect(buttons.length).toBeGreaterThan(0);
  for (const button of buttons) {
    const box = button.getBoundingClientRect();
    await expect(box.left - left).toBeGreaterThanOrEqual(0);
    await expect(right - box.right).toBeGreaterThanOrEqual(0);
    await expect(
      Math.abs(box.left - left - (right - box.right))
    ).toBeLessThanOrEqual(1);
  }
}

/** Checks that the space the Sidebar keeps beside the page is as wide as its rail. */
async function expectGapMatchesRail(canvasElement: HTMLElement) {
  const width = (slot: string) =>
    canvasElement
      .querySelector(`[data-slot="${slot}"]`)!
      .getBoundingClientRect().width;
  await expect(width('sidebar-gap')).toBe(width('sidebar-container'));
}

export const CollapsedRailAtLargerScale: Story = {
  // The largest scale with the smallest density gives the rail the most to
  // hold. The density is set on the Sidebar, not on the page.
  globals: { uiScale: 'larger' },
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <DemoSidebar collapsible="icon" data-density="tight" />
      <DemoInset>The icon rail grows with the UI scale.</DemoInset>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    await expectButtonsCentered(
      canvasElement.querySelector<HTMLElement>(
        '[data-slot="sidebar-container"]'
      )!
    );
    await expectGapMatchesRail(canvasElement);
  },
};

export const FloatingRailAtStrongStroke: Story = {
  // The floating rail adds the panel padding and border to the rail width.
  globals: { uiScale: 'larger', stroke: 'strong' },
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <DemoSidebar collapsible="icon" variant="floating" data-density="tight" />
      <DemoInset>The floating rail holds its padding and border.</DemoInset>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    await expectButtonsCentered(
      canvasElement.querySelector<HTMLElement>('[data-slot="sidebar-inner"]')!
    );
    await expectGapMatchesRail(canvasElement);
  },
};

export const LoadingSkeletonStyle: Story = {
  ...LoadingSkeleton,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Search',
    });
    await expect(input).toHaveClass('nx:bg-background');
    await expectAutofillPaired(input);
  },
};

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled item' });

    // A disabled menu button recolors via a semantic disabled-text token at
    // full opacity (not a fade).
    await expect(button).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(button).opacity).toBe('1');
  },
};

const DENSITIES = DENSITY_OPTIONS.map((option) => option.value);

export const BadgeTextFitsAtEveryDensity: Story = {
  // Text is tallest at the Larger UI scale, so it fits at every smaller one.
  globals: { uiScale: 'larger' },
  render: () => (
    <SidebarProvider>
      <Sidebar collapsible="none">
        <SidebarContent>
          {DENSITIES.map((density) => (
            <SidebarMenu
              key={density}
              data-density={density}
              data-testid={`row-${density}`}
            >
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <TrayIcon />
                  <span>Inbox</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>4</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          ))}
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const density of DENSITIES) {
      // The count fits inside the badge at every density.
      await expectTextFits(
        within(canvas.getByTestId(`row-${density}`)).getByText('4')
      );
    }
  },
};
