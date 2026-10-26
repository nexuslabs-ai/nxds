import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '.';

const meta = {
  title: 'Components/Carousel',
  component: Carousel,
  parameters: {
    docs: {
      description: {
        component:
          'Carousel shows a set of slides that readers move through one at a time. Use it for galleries and featured content. Install the `embla-carousel-vue` peer dependency first.',
      },
    },
  },
  decorators: [
    (story) => ({
      components: { story },
      template: '<div class="nx:mx-auto nx:w-full nx:max-w-xs"><story /></div>',
    }),
  ],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const carouselComponents = {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
};

// Five numbered slides reused across stories.
const SlideItems = {
  components: { CarouselItem },
  template: `
    <CarouselItem v-for="n in 5" :key="n" :aria-label="'Slide ' + n + ' of 5'">
      <div class="nx:flex nx:aspect-square nx:items-center nx:justify-center nx:rounded-md nx:border-default nx:border-border-default">
        <span class="nx:text-[2.25rem] nx:font-semibold">{{ n }}</span>
      </div>
    </CarouselItem>
  `,
};

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Carousel,
      CarouselContent,
      CarouselItem,
      CarouselNext,
      CarouselPrevious,
    },
    template: `
      <Carousel class="nx:w-full" aria-label="Image carousel">
        <CarouselContent>
          <CarouselItem v-for="n in 5" :key="n" :aria-label="'Slide ' + n + ' of 5'">
            <div class="nx:flex nx:aspect-square nx:items-center nx:justify-center nx:rounded-md nx:border-default nx:border-border-default">
              <span class="nx:text-[2.25rem] nx:font-semibold">{{ n }}</span>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    `,
  }),
};

export const Vertical: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Scroll slides vertically, with a fixed height on CarouselContent.',
      },
    },
  },
  render: () => ({
    components: {
      Carousel,
      CarouselContent,
      CarouselItem,
      CarouselNext,
      CarouselPrevious,
    },
    template: `
      <Carousel orientation="vertical" class="nx:w-full" aria-label="Vertical carousel">
        <CarouselContent class="nx:h-[350px]">
          <CarouselItem v-for="n in 5" :key="n" :aria-label="'Slide ' + n + ' of 5'">
            <div class="nx:flex nx:aspect-square nx:items-center nx:justify-center nx:rounded-md nx:border-default nx:border-border-default">
              <span class="nx:text-[2.25rem] nx:font-semibold">{{ n }}</span>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    `,
  }),
};

// Behaviour stories: tests and Storybook only.

// Clicking Next enables Previous (the scroll-position state machine).
export const ClickInteraction: Story = {
  render: () => ({
    components: { ...carouselComponents, SlideItems },
    template: `
      <Carousel class="nx:w-full" aria-label="Click demo carousel">
        <CarouselContent><SlideItems /></CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    const next = canvas.getByRole('button', { name: 'Next slide' });
    // Previous is disabled at the first slide; wait for Embla to enable Next.
    await expect(prev).toBeDisabled();
    await waitFor(() => expect(next).toBeEnabled());
    await userEvent.click(next);
    await waitFor(() => expect(prev).toBeEnabled());
  },
};

// Captures the Embla API so the play fn can read the carousel's position.
const keyboardApiRef: { current: CarouselApi | undefined } = {
  current: undefined,
};

// ArrowRight advances a horizontal carousel; ArrowDown is ignored (vertical-only).
export const KeyboardInteraction: Story = {
  render: () => ({
    components: { ...carouselComponents, SlideItems },
    setup: () => ({
      setApi: (api: CarouselApi) => {
        keyboardApiRef.current = api;
      },
    }),
    template: `
      <Carousel class="nx:w-full" aria-label="Keyboard demo carousel" :set-api="setApi">
        <CarouselContent><SlideItems /></CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    const next = canvas.getByRole('button', { name: 'Next slide' });
    await waitFor(() => expect(next).toBeEnabled());
    next.focus();
    // Horizontal carousel ignores ArrowDown — it must stay on the first slide.
    await userEvent.keyboard('{ArrowDown}');
    expect(keyboardApiRef.current?.selectedScrollSnap()).toBe(0);
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(prev).toBeEnabled());
  },
};

// Vertical carousels use ArrowDown / ArrowUp instead of horizontal arrows.
export const VerticalKeyboardInteraction: Story = {
  render: () => ({
    components: { ...carouselComponents, SlideItems },
    template: `
      <Carousel orientation="vertical" class="nx:w-full" aria-label="Vertical keyboard demo carousel">
        <CarouselContent class="nx:h-[350px]"><SlideItems /></CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    const next = canvas.getByRole('button', { name: 'Next slide' });
    await waitFor(() => expect(next).toBeEnabled());

    await expect(
      canvasElement.querySelector('[data-slot="carousel"]')
    ).toHaveAttribute('data-orientation', 'vertical');

    next.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(prev).toBeEnabled());
  },
};

// data-slot identifies the root, content, items, and both controls.
export const WithDataAttributes: Story = {
  render: () => ({
    components: { ...carouselComponents, SlideItems },
    template: `
      <Carousel class="nx:w-full" aria-label="Data attributes carousel">
        <CarouselContent><SlideItems /></CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    `,
  }),
  play: async ({ canvasElement }) => {
    for (const slot of [
      'carousel',
      'carousel-content',
      'carousel-item',
      'carousel-previous',
      'carousel-next',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }

    await expect(
      canvasElement.querySelector('[data-slot="carousel"]')
    ).toHaveAttribute('data-orientation', 'horizontal');
  },
};

// A horizontal carousel with outline controls.
export const AllVariants: Story = {
  render: () => ({
    components: { ...carouselComponents, SlideItems },
    template: `
      <Carousel class="nx:w-full" aria-label="All bases carousel">
        <CarouselContent><SlideItems /></CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    `,
  }),
};
