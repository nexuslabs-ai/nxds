import type { Meta, StoryObj } from '@storybook/vue3-vite';
import {
  IconCalendar,
  IconChartBar,
  IconChevronRight,
  IconDots,
  IconFolder,
  IconHome,
  IconInbox,
  IconLayoutGrid,
  IconPlus,
  IconSearch,
  IconSettings,
  IconUser,
  IconUsers,
} from '@tabler/icons-vue';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { defineComponent } from 'vue';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';

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
} from '.';

const meta = {
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
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

interface SidebarControlsArgs {
  open: boolean;
  collapsible: 'offcanvas' | 'icon' | 'none';
  side: 'left' | 'right';
  variant: 'sidebar' | 'floating' | 'inset';
}

type ControlsStory = StoryObj<SidebarControlsArgs>;

const NAV_ITEMS = [
  { title: 'Home', icon: IconHome },
  { title: 'Inbox', icon: IconInbox, badge: '4' },
  { title: 'Calendar', icon: IconCalendar },
  { title: 'Search', icon: IconSearch },
  { title: 'Settings', icon: IconSettings },
];

/**
 * The shared nav body used by most stories: a brand row, a "Platform" group of
 * menu items, and an account footer. Attributes fall through to `Sidebar`, so
 * each story can pick its `variant` / `collapsible` / `side`.
 */
const DemoSidebar = defineComponent({
  components: {
    IconLayoutGrid,
    IconUser,
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
  },
  setup: () => ({ items: NAV_ITEMS }),
  template: `
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Acme Inc">
              <IconLayoutGrid />
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
              <SidebarMenuItem v-for="item in items" :key="item.title">
                <SidebarMenuButton :tooltip="item.title" :is-active="item.title === 'Home'">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </SidebarMenuButton>
                <SidebarMenuBadge v-if="item.badge">{{ item.badge }}</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Account">
              <IconUser />
              <span>Account</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  `,
});

/**
 * The content region beside the sidebar — a top bar with the toggle plus some
 * body copy. Kept tall so the docked, full-height sidebar reads naturally.
 */
const DemoInset = defineComponent({
  components: { SidebarInset, SidebarTrigger },
  template: `
    <SidebarInset>
      <header class="nx:flex nx:h-16 nx:items-center nx:gap-2 nx:border-b-default nx:border-border-default nx:px-4">
        <SidebarTrigger />
        <span class="nx:typography-label-default">Dashboard</span>
      </header>
      <div class="nx:min-h-[20rem] nx:p-4 nx:typography-label-default nx:text-muted-foreground"><slot>Main content area.</slot></div>
    </SidebarInset>
  `,
});

export const Default: Story = {
  render: () => ({
    components: { DemoInset, DemoSidebar, SidebarProvider },
    template: `
      <SidebarProvider>
        <DemoSidebar />
        <DemoInset />
      </SidebarProvider>
    `,
  }),
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
  render: (args) => ({
    components: { DemoInset, DemoSidebar, SidebarProvider },
    setup: () => ({ args }),
    template: `
      <SidebarProvider :open="args.open" @open-change="(open) => (args.open = open)">
        <DemoSidebar :collapsible="args.collapsible" :side="args.side" :variant="args.variant" />
        <DemoInset />
      </SidebarProvider>
    `,
  }),
};

const onOpenChange = fn();
export const Controlled: Story = {
  beforeEach: () => {
    onOpenChange.mockClear();
    document.cookie = 'sidebar_state=; path=/; max-age=0';
  },
  render: () => ({
    components: { DemoInset, DemoSidebar, SidebarProvider },
    setup: () => ({ onOpenChange }),
    template: `
      <SidebarProvider :open="true" @open-change="onOpenChange">
        <DemoSidebar />
        <DemoInset />
      </SidebarProvider>
    `,
  }),
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
 * Every `SidebarMenuButton` variant and size, plus an `as-child` link, in an inline panel.
 */
export const AllVariants: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      IconCalendar,
      IconHome,
      IconInbox,
      IconLayoutGrid,
      IconSettings,
      Sidebar,
      SidebarContent,
      SidebarGroup,
      SidebarGroupContent,
      SidebarGroupLabel,
      SidebarHeader,
      SidebarInset,
      SidebarMenu,
      SidebarMenuButton,
      SidebarMenuItem,
      SidebarProvider,
      SidebarTrigger,
    },
    template: `
      <div class="nx:h-96 nx:w-full nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default">
        <SidebarProvider :style="{ minHeight: 'unset', height: '100%' }">
          <Sidebar collapsible="none">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg">
                    <IconLayoutGrid />
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
                      <SidebarMenuButton is-active>
                        <IconHome />
                        <span>Active</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton variant="outline">
                        <IconInbox />
                        <span>Outline</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton size="sm">
                        <IconCalendar />
                        <span>Small</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton as-child>
                        <a href="https://example.com">
                          <IconSettings />
                          <span>As link</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header class="nx:flex nx:h-16 nx:items-center nx:gap-2 nx:border-b-default nx:border-border-default nx:px-4">
              <SidebarTrigger />
              <span class="nx:typography-label-default">Dashboard</span>
            </header>
            <div class="nx:min-h-[20rem] nx:p-4 nx:typography-label-default nx:text-muted-foreground">Main content area.</div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    `,
  }),
};

export const Collapsed: Story = {
  name: 'Collapsed (icon)',
  render: () => ({
    components: { DemoInset, DemoSidebar, SidebarProvider },
    template: `
      <SidebarProvider :default-open="false">
        <DemoSidebar collapsible="icon" />
        <DemoInset>Collapsed to an icon rail — hover a button to see its tooltip.</DemoInset>
      </SidebarProvider>
    `,
  }),
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
  render: () => ({
    components: {
      IconChevronRight,
      IconFolder,
      IconInbox,
      Sidebar,
      SidebarContent,
      SidebarGroup,
      SidebarGroupContent,
      SidebarGroupLabel,
      SidebarInset,
      SidebarMenu,
      SidebarMenuButton,
      SidebarMenuItem,
      SidebarMenuSub,
      SidebarMenuSubButton,
      SidebarMenuSubItem,
      SidebarProvider,
      SidebarRail,
      SidebarSeparator,
      SidebarTrigger,
    },
    template: `
      <div class="nx:h-96 nx:w-full nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default">
        <SidebarProvider :style="{ minHeight: 'unset', height: '100%' }">
          <Sidebar collapsible="none">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Projects</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton is-active>
                        <IconFolder />
                        <span>Design System</span>
                        <IconChevronRight class="nx:ml-auto" />
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#tokens" is-active>Tokens</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#components">Components</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#documentation">Documentation</SidebarMenuSubButton>
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
                        <IconInbox />
                        <span>Inbox</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <header class="nx:flex nx:h-16 nx:items-center nx:gap-2 nx:border-b-default nx:border-border-default nx:px-4">
              <SidebarTrigger />
              <span class="nx:typography-label-default">Dashboard</span>
            </header>
            <div class="nx:min-h-[20rem] nx:p-4 nx:typography-label-default nx:text-muted-foreground">Main content area.</div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    `,
  }),
};

export const LoadingSkeleton: Story = {
  render: () => ({
    components: {
      DemoInset,
      Sidebar,
      SidebarContent,
      SidebarGroup,
      SidebarGroupContent,
      SidebarGroupLabel,
      SidebarHeader,
      SidebarInput,
      SidebarMenu,
      SidebarMenuItem,
      SidebarMenuSkeleton,
      SidebarProvider,
      SidebarRail,
    },
    template: `
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
                  <SidebarMenuItem v-for="i in 6" :key="i">
                    <SidebarMenuSkeleton show-icon />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <DemoInset />
      </SidebarProvider>
    `,
  }),
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
  render: () => ({
    components: { DemoInset, DemoSidebar, SidebarProvider },
    template: `
      <SidebarProvider>
        <DemoSidebar />
        <DemoInset>Below the md breakpoint (768px) the sidebar becomes a drawer — tap the toggle to open it.</DemoInset>
      </SidebarProvider>
    `,
  }),
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
  render: () => ({
    components: { DemoInset, DemoSidebar, SidebarProvider },
    template: `
      <SidebarProvider>
        <DemoSidebar variant="floating" side="right" />
        <DemoInset />
      </SidebarProvider>
    `,
  }),
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
  render: () => ({
    components: { DemoInset, DemoSidebar, SidebarProvider },
    template: `
      <SidebarProvider>
        <DemoSidebar />
        <DemoInset />
      </SidebarProvider>
    `,
  }),
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
  render: () => ({
    components: { DemoInset, DemoSidebar, SidebarProvider },
    template: `
      <SidebarProvider>
        <DemoSidebar />
        <DemoInset />
      </SidebarProvider>
    `,
  }),
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
  render: () => ({
    components: {
      IconHome,
      Sidebar,
      SidebarContent,
      SidebarGroup,
      SidebarGroupContent,
      SidebarMenu,
      SidebarMenuButton,
      SidebarMenuItem,
      SidebarProvider,
    },
    template: `
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <IconHome />
                      <span>Disabled item</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    `,
  }),
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

/**
 * A full sidebar that uses most parts together, from the workspace switcher to nested submenus.
 */
export const Complex: Story = {
  name: 'Complex (kitchen sink)',
  render: () => ({
    components: {
      DemoInset,
      IconCalendar,
      IconChartBar,
      IconChevronRight,
      IconDots,
      IconFolder,
      IconHome,
      IconInbox,
      IconLayoutGrid,
      IconPlus,
      IconSettings,
      IconUser,
      IconUsers,
      Sidebar,
      SidebarContent,
      SidebarFooter,
      SidebarGroup,
      SidebarGroupAction,
      SidebarGroupContent,
      SidebarGroupLabel,
      SidebarHeader,
      SidebarInput,
      SidebarMenu,
      SidebarMenuAction,
      SidebarMenuBadge,
      SidebarMenuButton,
      SidebarMenuItem,
      SidebarMenuSub,
      SidebarMenuSubButton,
      SidebarMenuSubItem,
      SidebarProvider,
      SidebarRail,
    },
    template: `
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" tooltip="Acme Inc">
                  <IconLayoutGrid />
                  <span>Acme Inc</span>
                  <IconChevronRight class="nx:ml-auto" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarInput aria-label="Search" placeholder="Search…" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarGroupAction aria-label="Add project">
                <IconPlus />
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton is-active tooltip="Dashboard">
                      <IconHome />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>3</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Inbox">
                      <IconInbox />
                      <span>Inbox</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>12</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Projects">
                      <IconFolder />
                      <span>Projects</span>
                      <IconChevronRight class="nx:ml-auto" />
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#overview">Overview</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#mobile" is-active>Mobile App</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#marketing">Marketing Site</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Tasks">
                      <IconCalendar />
                      <span>Tasks</span>
                    </SidebarMenuButton>
                    <SidebarMenuAction aria-label="Task options">
                      <IconDots />
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
                      <IconUsers />
                      <span>Members</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Reports">
                      <IconChartBar />
                      <span>Reports</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>New</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Settings">
                      <IconSettings />
                      <span>Settings</span>
                      <IconChevronRight class="nx:ml-auto" />
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#general">General</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#billing">Billing</SidebarMenuSubButton>
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
                  <IconUser />
                  <span>Jane Doe</span>
                  <IconChevronRight class="nx:ml-auto" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <DemoInset />
      </SidebarProvider>
    `,
  }),
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
  render: () => ({
    components: {
      IconChevronRight,
      IconFolder,
      IconUser,
      Sidebar,
      SidebarContent,
      SidebarFooter,
      SidebarGroup,
      SidebarGroupContent,
      SidebarGroupLabel,
      SidebarHeader,
      SidebarInput,
      SidebarInset,
      SidebarMenu,
      SidebarMenuBadge,
      SidebarMenuButton,
      SidebarMenuItem,
      SidebarMenuSub,
      SidebarMenuSubButton,
      SidebarMenuSubItem,
      SidebarProvider,
      SidebarRail,
      SidebarTrigger,
    },
    setup: () => ({
      items: [
        { title: 'Home', icon: IconHome },
        { title: 'Inbox', icon: IconInbox, badge: '4' },
        { title: 'Calendar', icon: IconCalendar },
        { title: 'Search', icon: IconSearch },
        { title: 'Settings', icon: IconSettings },
      ],
    }),
    template: `
      <div class="nx:h-96 nx:w-full nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default">
        <SidebarProvider :style="{ minHeight: 'unset', height: '100%' }">
          <Sidebar collapsible="none">
            <SidebarHeader>
              <SidebarInput aria-label="Search" placeholder="Search…" />
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem v-for="item in items" :key="item.title">
                      <SidebarMenuButton size="sm" :tooltip="item.title" :is-active="item.title === 'Home'">
                        <component :is="item.icon" />
                        <span>{{ item.title }}</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge v-if="item.badge">{{ item.badge }}</SidebarMenuBadge>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton size="sm" tooltip="Projects">
                        <IconFolder />
                        <span>Projects</span>
                        <IconChevronRight class="nx:ml-auto" />
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#overview" size="sm">Overview</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="#mobile" size="sm" is-active>Mobile App</SidebarMenuSubButton>
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
                    <IconUser />
                    <span>Account</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <header class="nx:flex nx:h-16 nx:items-center nx:gap-2 nx:border-b-default nx:border-border-default nx:px-4">
              <SidebarTrigger />
              <span class="nx:typography-label-default">Dashboard</span>
            </header>
            <div class="nx:min-h-[20rem] nx:p-4 nx:typography-label-default nx:text-muted-foreground">Compact rows use the small size (12px body-small) for denser, information-heavy sidebars.</div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    `,
  }),
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
  render: () => ({
    components: {
      Sidebar,
      SidebarContent,
      SidebarInset,
      SidebarMenu,
      SidebarMenuBadge,
      SidebarMenuButton,
      SidebarMenuItem,
      SidebarProvider,
      SidebarRail,
      SidebarTrigger,
    },
    setup: () => ({
      items: [
        { title: 'Home', icon: IconHome },
        { title: 'Inbox', icon: IconInbox, badge: '4' },
        { title: 'Calendar', icon: IconCalendar },
        { title: 'Search', icon: IconSearch },
        { title: 'Settings', icon: IconSettings },
      ],
    }),
    template: `
      <div class="nx:h-96 nx:w-full nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default">
        <SidebarProvider :style="{ minHeight: 'unset', height: '100%' }">
          <Sidebar collapsible="none">
            <SidebarContent class="nx:p-2">
              <SidebarMenu>
                <SidebarMenuItem v-for="item in items" :key="item.title">
                  <SidebarMenuButton :tooltip="item.title" :is-active="item.title === 'Home'">
                    <component :is="item.icon" />
                    <span>{{ item.title }}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge v-if="item.badge">{{ item.badge }}</SidebarMenuBadge>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <header class="nx:flex nx:h-16 nx:items-center nx:gap-2 nx:border-b-default nx:border-border-default nx:px-4">
              <SidebarTrigger />
              <span class="nx:typography-label-default">Dashboard</span>
            </header>
            <div class="nx:min-h-[20rem] nx:p-4 nx:typography-label-default nx:text-muted-foreground">Flat structure — no SidebarGroup/-Label/-Content, just a SidebarMenu of buttons.</div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    `,
  }),
};
