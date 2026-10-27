import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  expectExitBeforeUnmount,
  expectInterruptibleOverlayMotion,
} from '../../stories/support/overlay-motion-test-utils';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Button } from '../button';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '.';

const meta = {
  title: 'Components/HoverCard',
  component: HoverCard,
  parameters: {
    docs: {
      description: {
        component:
          'HoverCard shows a preview card when the user hovers or focuses a trigger. Use it for profile and link previews. For content opened by a click, use Popover.',
      },
    },
  },
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// A profile-preview card revealed on hover.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Button, HoverCard, HoverCardContent, HoverCardTrigger },
    template: `
      <HoverCard>
        <HoverCardTrigger as-child>
          <Button variant="link">@nxds</Button>
        </HoverCardTrigger>
        <HoverCardContent>
          <div class="nx:flex nx:flex-col nx:gap-1">
            <p class="nx:typography-label-default nx:font-semibold nx:text-foreground">@nxds</p>
            <p class="nx:typography-body-default nx:text-muted-foreground">The AI-native design system. Joined March 2026.</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    `,
  }),
};

// A richer preview: avatar, bio and join date.
export const ProfileCard: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show an avatar, bio and join date in a wider preview card.',
      },
    },
  },
  render: () => ({
    components: {
      Avatar,
      AvatarFallback,
      AvatarImage,
      Button,
      HoverCard,
      HoverCardContent,
      HoverCardTrigger,
    },
    template: `
      <HoverCard>
        <HoverCardTrigger as-child>
          <Button variant="link">@ada</Button>
        </HoverCardTrigger>
        <HoverCardContent class="nx:w-80">
          <div class="nx:flex nx:gap-4">
            <Avatar>
              <AvatarImage src="/avatars/ada.svg" alt="Ada Lovelace" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <div class="nx:flex nx:flex-col nx:gap-1">
              <p class="nx:typography-label-default nx:font-semibold nx:text-foreground">Ada Lovelace</p>
              <p class="nx:typography-body-default nx:text-muted-foreground">Wrote the first program for the Analytical Engine.</p>
              <p class="nx:typography-label-small nx:text-muted-foreground">Joined December 1843</p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    `,
  }),
};

// `side` opens the card on any edge of its trigger.
export const Placement: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `side` on HoverCardContent to open the card on any edge of the trigger.',
      },
    },
  },
  render: () => ({
    components: { Button, HoverCard, HoverCardContent, HoverCardTrigger },
    setup: () => ({
      sides: [
        { side: 'top', label: 'Top' },
        { side: 'right', label: 'Right' },
        { side: 'bottom', label: 'Bottom' },
        { side: 'left', label: 'Left' },
      ] as const,
    }),
    template: `
      <div class="nx:flex nx:flex-wrap nx:gap-4">
        <HoverCard v-for="{ side, label } in sides" :key="side">
          <HoverCardTrigger as-child>
            <Button variant="outline">{{ label }}</Button>
          </HoverCardTrigger>
          <HoverCardContent :side="side">Opens on the {{ side }} of its trigger.</HoverCardContent>
        </HoverCard>
      </div>
    `,
  }),
};

const instantCard = () => ({
  components: { Button, HoverCard, HoverCardContent, HoverCardTrigger },
  template: `
    <HoverCard :open-delay="0" :close-delay="0">
      <HoverCardTrigger as-child>
        <Button variant="link">@nxds</Button>
      </HoverCardTrigger>
      <HoverCardContent>Joined March 2026</HoverCardContent>
    </HoverCard>
  `,
});

// Hovering the trigger opens the card; moving away closes it.
export const OpenCloseInteraction: Story = {
  render: instantCard,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: '@nxds' });

    await userEvent.hover(trigger);
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="hover-card-content"]')
      ).toBeInTheDocument();
    });
    const content = document.querySelector('[data-slot="hover-card-content"]');
    await expectInterruptibleOverlayMotion(content);

    await userEvent.unhover(trigger);
    // Reka closes only once the pointer leaves the trigger-to-card grace area.
    await userEvent.pointer({
      coords: {
        clientX: window.innerWidth - 1,
        clientY: window.innerHeight - 1,
      },
    });
    await expectExitBeforeUnmount(content);
  },
};

// Focusing the trigger via keyboard opens the card (a11y).
export const KeyboardInteraction: Story = {
  render: instantCard,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: '@nxds' });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="hover-card-content"]')
      ).toBeInTheDocument();
    });
  },
};

// data-slot identifies the trigger and content.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { Button, HoverCard, HoverCardContent, HoverCardTrigger },
    template: `
      <HoverCard default-open>
        <HoverCardTrigger as-child>
          <Button variant="link">@nxds</Button>
        </HoverCardTrigger>
        <HoverCardContent>Content</HoverCardContent>
      </HoverCard>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="hover-card-trigger"]')
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="hover-card-content"]')
      ).toBeInTheDocument();
    });
  },
};

// ============================================
// ALL VARIANTS GRID
// ============================================

// The closed trigger: the card portals to the body, so the showcase renders the resting trigger.
export const AllVariants: Story = {
  render: () => ({
    components: { Button, HoverCard, HoverCardContent, HoverCardTrigger },
    template: `
      <HoverCard>
        <HoverCardTrigger as-child>
          <Button variant="link">@nxds</Button>
        </HoverCardTrigger>
        <HoverCardContent>Joined March 2026</HoverCardContent>
      </HoverCard>
    `,
  }),
};
