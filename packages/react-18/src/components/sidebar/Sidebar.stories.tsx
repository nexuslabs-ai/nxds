import * as React from 'react';

import { DENSITY_OPTIONS } from '@nxds/core';
import {
  CalendarBlankIcon,
  CaretRightIcon,
  ChartBarIcon,
  DotsThreeIcon,
  FolderIcon,
  GearIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SquaresFourIcon,
  TrayIcon,
  UserIcon,
  UsersIcon,
} from '@phosphor-icons/react/ssr';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';
import { expectTextFits } from '../../stories/support/story-height-test-utils';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from './sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    docs: {
      description: {
        component:
          "Sidebar is the app's main navigation panel. It collapses to an icon rail or off screen, and opens as a Sheet on narrow screens. Wrap the app shell in `SidebarProvider` and put the page content in `SidebarInset`.",
      },
    },
    layout: 'fullscreen',
  },
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

/**
 * The shared nav body used by most stories: a brand row, a "Platform" group of
 * menu items, and an account footer. `props` flow straight through to `Sidebar`
 * so each story can pick its `variant` / `collapsible` / `side`.
 */
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

/**
 * The content region beside the sidebar — a top bar with the toggle plus some
 * body copy. Kept tall so the docked, full-height sidebar reads naturally.
 */
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

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar />
      <DemoInset />
    </SidebarProvider>
  ),
};

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

const onOpenChange = fn();
export const Controlled: Story = {
  beforeEach: () => {
    onOpenChange.mockClear();
    document.cookie = 'sidebar_state=; path=/; max-age=0';
  },
  render: () => (
    <SidebarProvider open onOpenChange={onOpenChange}>
      <DemoSidebar />
      <DemoInset />
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    // A controlled provider reports the change and leaves the state to `open`.
    const sidebar = canvasElement.querySelector(
      '[data-slot="sidebar"][data-state]'
    );
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-slot="sidebar-trigger"]'
    );
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');

    await userEvent.click(trigger!);
    await expect(onOpenChange).toHaveBeenCalledWith(false);
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
    await expect(document.cookie).not.toContain('sidebar_state');
  },
};

/**
 * Every `SidebarMenuButton` variant and size, plus an `asChild` link, in an inline panel.
 */
export const AllVariants: Story = {
  tags: ['docs'],
  render: () => (
    <div className="nx:h-96 nx:w-full nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default">
      <SidebarProvider style={{ minHeight: 'unset', height: '100%' }}>
        <Sidebar collapsible="none">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <SquaresFourIcon />
                  <span>Acme Inc</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Variants</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <HouseIcon />
                      <span>Active</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton variant="outline">
                      <TrayIcon />
                      <span>Outline</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="sm">
                      <CalendarBlankIcon />
                      <span>Small</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="https://example.com">
                        <GearIcon />
                        <span>As link</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <DemoInset />
      </SidebarProvider>
    </div>
  ),
};

export const Collapsed: Story = {
  name: 'Collapsed (icon)',
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <DemoSidebar collapsible="icon" />
      <DemoInset>
        Collapsed to an icon rail — hover a button to see its tooltip.
      </DemoInset>
    </SidebarProvider>
  ),
};

export const CollapsedTooltip: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar collapsible="icon" />
      <DemoInset />
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sidebar = canvasElement.querySelector(
      '[data-slot="sidebar"][data-state]'
    );
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-slot="sidebar-trigger"]'
    );
    const body = within(canvasElement.ownerDocument.body);
    const home = canvas.getByRole('button', { name: 'Home' });
    await userEvent.hover(home);
    await userEvent.unhover(home);

    await userEvent.click(trigger!);
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    await expect(body.queryByRole('tooltip')).toBeNull();

    await userEvent.hover(home);
    await expect(await body.findByRole('tooltip')).toHaveTextContent('Home');
    await userEvent.keyboard('{Control>}b{/Control}');
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
    await waitFor(() => expect(body.queryByRole('tooltip')).toBeNull());
    await userEvent.unhover(home);
    await userEvent.click(trigger!);
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    await expect(body.queryByRole('tooltip')).toBeNull();

    canvas.getByRole('button', { name: 'Inbox' }).focus();
    await expect(await body.findByRole('tooltip')).toHaveTextContent('Inbox');
  },
};

export const WithSubmenu: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Nest pages under a menu item with `SidebarMenuSub`.',
      },
    },
  },
  render: () => (
    <div className="nx:h-96 nx:w-full nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default">
      <SidebarProvider style={{ minHeight: 'unset', height: '100%' }}>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <FolderIcon />
                      <span>Design System</span>
                      <CaretRightIcon className="nx:ml-auto" />
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#tokens" isActive>
                          Tokens
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#components">
                          Components
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#documentation">
                          Documentation
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <TrayIcon />
                      <span>Inbox</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <DemoInset />
      </SidebarProvider>
    </div>
  ),
};

export const LoadingSkeleton: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarInput aria-label="Search" placeholder="Search…" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Loading</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <DemoInset />
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Search',
    });
    await expect(input).toHaveAttribute('data-slot', 'sidebar-input');
    await expect(input).toHaveClass('nx:bg-background');
    await expectAutofillPaired(input);
  },
};

export const NarrowDrawer: Story = {
  globals: {
    viewport: { value: 'mobile', isRotated: false },
  },
  render: () => (
    <SidebarProvider>
      <DemoSidebar />
      <DemoInset>
        Below the md breakpoint (768px) the sidebar becomes a drawer — tap the
        toggle to open it.
      </DemoInset>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="sidebar-trigger"]'
    );
    await userEvent.click(trigger!);
    const drawer = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog'
    );
    await expect(drawer).toHaveAttribute('data-slot', 'sidebar');
    await expect(drawer).toHaveAttribute('data-narrow', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const WithDataAttributes: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar variant="floating" side="right" />
      <DemoInset />
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    // data-state / data-variant / data-side live on the desktop docked panel,
    // which renders because the test viewport is at or above `md`.
    const sidebar = canvasElement.querySelector(
      '[data-slot="sidebar"][data-state]'
    );
    await expect(sidebar).toBeInTheDocument();
    await expect(sidebar).toHaveAttribute('data-variant', 'floating');
    await expect(sidebar).toHaveAttribute('data-side', 'right');
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');

    const trigger = canvasElement.querySelector(
      '[data-slot="sidebar-trigger"]'
    );
    await expect(trigger).toBeInTheDocument();

    const activeButton = canvasElement.querySelector(
      '[data-slot="sidebar-menu-button"][data-active="true"]'
    );
    await expect(activeButton).toBeInTheDocument();

    // The content region is a labelled navigation landmark (issue #418).
    await expect(
      within(canvasElement).getByRole('navigation', { name: 'Sidebar' })
    ).toBeInTheDocument();
  },
};

export const ClickInteraction: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar />
      <DemoInset />
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    // data-state lives on the desktop docked panel (test viewport ≥ `md`).
    const sidebar = canvasElement.querySelector(
      '[data-slot="sidebar"][data-state]'
    );
    const trigger = canvasElement.querySelector<HTMLButtonElement>(
      '[data-slot="sidebar-trigger"]'
    );
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');

    await userEvent.click(trigger!);
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');

    await userEvent.click(trigger!);
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  },
};

export const KeyboardInteraction: Story = {
  render: () => (
    <SidebarProvider>
      <DemoSidebar />
      <DemoInset />
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    // data-state lives on the desktop docked panel (test viewport ≥ `md`).
    const sidebar = canvasElement.querySelector(
      '[data-slot="sidebar"][data-state]'
    );
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');

    // Ctrl/Cmd+B toggles the sidebar from anywhere in the document.
    await userEvent.keyboard('{Control>}b{/Control}');
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');

    await userEvent.keyboard('{Control>}b{/Control}');
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  },
};

export const Disabled: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <HouseIcon />
                    <span>Disabled item</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled item' });

    await expect(button).toBeDisabled();
    // A disabled menu button recolors via a semantic disabled-text token at
    // full opacity (not a fade).
    await expect(button).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(button).opacity).toBe('1');
  },
};

const DENSITIES = DENSITY_OPTIONS.map((option) => option.value);

export const BadgeTextFitsAtEveryDensity: Story = {
  // At 16px UI text, the text line is taller than the Tight minimum height.
  globals: { uiFontSize: 16 },
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

/**
 * A full sidebar that uses most parts together, from the workspace switcher to nested submenus.
 */
export const Complex: Story = {
  name: 'Complex (kitchen sink)',
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Acme Inc">
                <SquaresFourIcon />
                <span>Acme Inc</span>
                <CaretRightIcon className="nx:ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarInput aria-label="Search" placeholder="Search…" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Add project">
              <PlusIcon />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Dashboard">
                    <HouseIcon />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>3</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Inbox">
                    <TrayIcon />
                    <span>Inbox</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>12</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Projects">
                    <FolderIcon />
                    <span>Projects</span>
                    <CaretRightIcon className="nx:ml-auto" />
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#overview">
                        Overview
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#mobile" isActive>
                        Mobile App
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#marketing">
                        Marketing Site
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Tasks">
                    <CalendarBlankIcon />
                    <span>Tasks</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction aria-label="Task options">
                    <DotsThreeIcon />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Members">
                    <UsersIcon />
                    <span>Members</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Reports">
                    <ChartBarIcon />
                    <span>Reports</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>New</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <GearIcon />
                    <span>Settings</span>
                    <CaretRightIcon className="nx:ml-auto" />
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#general">
                        General
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#billing">
                        Billing
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Jane Doe">
                <UserIcon />
                <span>Jane Doe</span>
                <CaretRightIcon className="nx:ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <DemoInset />
    </SidebarProvider>
  ),
};

export const Compact: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `size="sm"` on every row for a denser sidebar with 12px text.',
      },
    },
  },
  render: () => (
    <div className="nx:h-96 nx:w-full nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default">
      <SidebarProvider style={{ minHeight: 'unset', height: '100%' }}>
        <Sidebar collapsible="none">
          <SidebarHeader>
            <SidebarInput aria-label="Search" placeholder="Search…" />
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
                          size="sm"
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
                  <SidebarMenuItem>
                    <SidebarMenuButton size="sm" tooltip="Projects">
                      <FolderIcon />
                      <span>Projects</span>
                      <CaretRightIcon className="nx:ml-auto" />
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#overview" size="sm">
                          Overview
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#mobile" size="sm" isActive>
                          Mobile App
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm" tooltip="Account">
                  <UserIcon />
                  <span>Account</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <DemoInset>
          Compact rows use the small size (12px body-small) for denser,
          information-heavy sidebars.
        </DemoInset>
      </SidebarProvider>
    </div>
  ),
};

export const Flat: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Skip the group parts and put `nx:p-2` on `SidebarContent` for a flat list of links.',
      },
    },
  },
  render: () => (
    <div className="nx:h-96 nx:w-full nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default">
      <SidebarProvider style={{ minHeight: 'unset', height: '100%' }}>
        <Sidebar collapsible="none">
          <SidebarContent className="nx:p-2">
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
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <DemoInset>
          Flat structure — no SidebarGroup/-Label/-Content, just a SidebarMenu
          of buttons.
        </DemoInset>
      </SidebarProvider>
    </div>
  ),
};
