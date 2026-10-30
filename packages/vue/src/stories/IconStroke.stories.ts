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
import { EmptyStateMedia } from '../components/empty-state';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../components/input-group';
import { Kbd } from '../components/kbd';
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

/**
 * Parts that draw the icons you pass, and the size each draws them at. Each
 * holds a Lucide and a HugeIcons icon.
 */
const STROKED_PARTS = {
  kbd: 12,
  badge: 14,
  button: 16,
  toggle: 16,
  'dropdown-menu-item': 16,
  'input-group-addon': 16,
  'alert-icon': 16,
  'sidebar-menu-button': 16,
  'tabs-trigger': 16,
  'empty-state-media': 24,
};

/** Internal icons and their size: Select's chevron, and Spinner's own `<svg>`. */
const INTERNAL_ICONS = {
  '[data-slot="select-trigger"] svg': 16,
  '[data-slot="spinner"]': 16,
};

/** A Lucide star, stroked on its `<svg>`, and a HugeIcons star, stroked on each path. */
const StrokedIcons = defineComponent({
  components: { HugeiconsIcon, Star },
  setup: () => ({ StarIcon }),
  template: `
    <Star data-testid="lucide" aria-hidden="true" />
    <HugeiconsIcon :icon="StarIcon" data-testid="hugeicons" aria-hidden="true" />
  `,
});

/** The line the stroke tokens set for an icon of `size` px. */
function expectedLine(element: Element, size: number) {
  const style = getComputedStyle(element);
  const base = parseFloat(style.getPropertyValue('--nx-icon-stroke-base'));
  const ratio = parseFloat(style.getPropertyValue('--nx-icon-stroke-ratio'));
  return {
    size,
    line: base + size * ratio,
    vectorEffect: 'non-scaling-stroke',
  };
}

/** The size an icon is drawn at, and the line its first shape draws. */
function drawnLine(icon: Element) {
  const shape = icon.querySelector('path') ?? icon;
  const style = getComputedStyle(shape);
  return {
    size: parseFloat(getComputedStyle(icon).width),
    line: parseFloat(style.strokeWidth),
    vectorEffect: style.vectorEffect,
  };
}

/** The line each library draws in `part`. */
function drawnLines(part: Element | null) {
  const lucide = part?.querySelector('[data-testid="lucide"]');
  const hugeicons = part?.querySelector('[data-testid="hugeicons"]');
  if (!lucide || !hugeicons) {
    throw new Error('The part has no Lucide and HugeIcons icon');
  }
  return { lucide: drawnLine(lucide), hugeicons: drawnLine(hugeicons) };
}

function internalLine(page: Document, selector: string) {
  const icon = page.querySelector(selector);
  if (!icon) throw new Error(`${selector} matches no icon`);
  return drawnLine(icon);
}

/**
 * Every component that draws icons strokes them at the line the stroke tokens
 * set for the icon's size, whatever line the icon library sets.
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
      EmptyStateMedia,
      HugeiconsIcon,
      InputGroup,
      InputGroupAddon,
      InputGroupInput,
      Kbd,
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
        <Kbd>
          <StrokedIcons />
        </Kbd>
        <EmptyStateMedia variant="icon">
          <StrokedIcons />
        </EmptyStateMedia>
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
    const parts = Object.entries(STROKED_PARTS);
    const internal = Object.entries(INTERNAL_ICONS);

    await expect(
      Object.fromEntries(
        parts.map(([slot]) => [
          slot,
          drawnLines(page.querySelector(`[data-slot="${slot}"]`)),
        ])
      )
    ).toEqual(
      Object.fromEntries(
        parts.map(([slot, size]) => {
          const line = expectedLine(canvasElement, size);
          return [slot, { lucide: line, hugeicons: line }];
        })
      )
    );
    await expect(
      internal.map(([selector]) => internalLine(page, selector))
    ).toEqual(internal.map(([, size]) => expectedLine(canvasElement, size)));
  },
};

/**
 * The stroke tokens set on a part change its icons' line. Set on an ancestor,
 * they change the line of every icon under it.
 */
export const LineOverride: Story = {
  render: () => ({
    components: { Button, StrokedIcons },
    template: `
      <div class="nx:flex nx:items-start nx:gap-4">
        <Button data-testid="part" :style="{ '--nx-icon-stroke-base': '1px' }">
          <StrokedIcons />
          Starred
        </Button>
        <div data-testid="ancestor" :style="{ '--nx-icon-stroke-ratio': '0.125' }">
          <Button>
            <StrokedIcons />
            Starred
          </Button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const defaultLine = expectedLine(canvasElement, 16).line;
    for (const testId of ['part', 'ancestor']) {
      const scope = canvas.getByTestId(testId);
      const line = expectedLine(scope, 16);
      await expect(line.line).toBeGreaterThan(defaultLine);
      await expect(drawnLines(scope)).toEqual({
        lucide: line,
        hugeicons: line,
      });
    }
  },
};
