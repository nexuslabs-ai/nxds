import { StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Star } from '@lucide/vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import { defineComponent } from 'vue';

import { Alert, AlertIcon, AlertTitle } from '../components/alert';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/dropdown-menu';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../components/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/select';
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '../components/sidebar';
import { Spinner } from '../components/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/tabs';
import { Toggle } from '../components/toggle';

const meta = {
  title: 'Internal/Icon Stroke',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Parts that draw the icons you pass. Each holds a Lucide and a HugeIcons icon. */
const STROKED_PARTS = [
  'button',
  'toggle',
  'dropdown-menu-item',
  'input-group-addon',
  'badge',
  'alert-icon',
  'tabs-trigger',
  'sidebar-menu-button',
];

/** Internal icons: Select's chevron, and Spinner's own `<svg>`. */
const INTERNAL_ICONS = [
  '[data-slot="select-trigger"] svg',
  '[data-slot="spinner"]',
];

const ICON_STROKE = '1.75px';

/** A Lucide star, stroked on its `<svg>`, and a HugeIcons star, stroked on each path. */
const StrokedIcons = defineComponent({
  components: { HugeiconsIcon, Star },
  setup: () => ({ StarIcon }),
  template: `
    <Star data-testid="lucide" aria-hidden="true" />
    <HugeiconsIcon :icon="StarIcon" data-testid="hugeicons" aria-hidden="true" />
  `,
});

/** The line each library draws in the part `slot`. */
function drawnStrokes(page: Document, slot: string) {
  const part = page.querySelector(`[data-slot="${slot}"]`);
  const lucide = part?.querySelector('[data-testid="lucide"]');
  const hugeicons = part?.querySelector('[data-testid="hugeicons"] path');
  if (!lucide || !hugeicons) {
    throw new Error(`${slot} has no Lucide and HugeIcons icon`);
  }
  return {
    lucide: getComputedStyle(lucide).strokeWidth,
    hugeicons: getComputedStyle(hugeicons).strokeWidth,
  };
}

function internalStroke(page: Document, selector: string) {
  const icon = page.querySelector(selector);
  if (!icon) throw new Error(`${selector} matches no icon`);
  return getComputedStyle(icon).strokeWidth;
}

/**
 * Every component that draws icons strokes them at `--nx-icon-stroke`,
 * whatever line the icon library sets.
 */
export const EveryComponent: Story = {
  render: () => ({
    components: {
      Alert,
      AlertIcon,
      AlertTitle,
      Badge,
      Button,
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
      HugeiconsIcon,
      InputGroup,
      InputGroupAddon,
      InputGroupInput,
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
      Sidebar,
      SidebarContent,
      SidebarMenu,
      SidebarMenuButton,
      SidebarMenuItem,
      SidebarProvider,
      Spinner,
      Star,
      StrokedIcons,
      Tabs,
      TabsContent,
      TabsList,
      TabsTrigger,
      Toggle,
    },
    setup: () => ({ StarIcon }),
    template: `
      <div class="nx:flex nx:flex-col nx:items-start nx:gap-4">
        <Button>
          <StrokedIcons />
          Starred
        </Button>
        <Toggle aria-label="Star">
          <StrokedIcons />
        </Toggle>
        <DropdownMenu :open="true" :modal="false">
          <DropdownMenuTrigger as-child>
            <Button variant="outline">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>
              <StrokedIcons />
              Star
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <InputGroup class="nx:w-64">
          <InputGroupAddon>
            <StrokedIcons />
          </InputGroupAddon>
          <InputGroupInput aria-label="Search starred" placeholder="Search" />
        </InputGroup>
        <Badge>
          <template #left-icon>
            <Star data-testid="lucide" aria-hidden="true" />
          </template>
          <template #right-icon>
            <HugeiconsIcon :icon="StarIcon" data-testid="hugeicons" aria-hidden="true" />
          </template>
          Starred
        </Badge>
        <Alert class="nx:w-80">
          <AlertIcon>
            <StrokedIcons />
          </AlertIcon>
          <AlertTitle>Project starred</AlertTitle>
        </Alert>
        <Tabs default-value="starred">
          <TabsList>
            <TabsTrigger value="starred">
              <StrokedIcons />
              Starred
            </TabsTrigger>
          </TabsList>
          <TabsContent value="starred">Starred projects</TabsContent>
        </Tabs>
        <SidebarProvider :style="{ minHeight: 'unset' }">
          <Sidebar collapsible="none">
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <StrokedIcons />
                    <span>Starred</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
        <Select>
          <SelectTrigger aria-label="Sort" class="nx:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
        <Spinner />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const page = canvasElement.ownerDocument;
    await within(page.body).findByRole('menuitem', { name: 'Star' });

    await expect(
      Object.fromEntries(
        STROKED_PARTS.map((slot) => [slot, drawnStrokes(page, slot)])
      )
    ).toEqual(
      Object.fromEntries(
        STROKED_PARTS.map((slot) => [
          slot,
          { lucide: ICON_STROKE, hugeicons: ICON_STROKE },
        ])
      )
    );
    await expect(
      INTERNAL_ICONS.map((selector) => internalStroke(page, selector))
    ).toEqual(INTERNAL_ICONS.map(() => ICON_STROKE));
  },
};
