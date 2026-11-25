import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import accordionMeta, {
  Disabled,
  WithDataAttributes,
} from './Accordion.stories';

const meta = {
  ...accordionMeta,
  title: 'Tests/Accordion',
};

export default meta;
type Story = StoryObj<typeof accordionMeta>;

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole('button');

    // Disabled state uses a semantic text token at full opacity (not a fade).
    await expect(triggers[0]).toHaveClass(
      'nx:disabled:text-disabled-foreground'
    );
    await expect(getComputedStyle(triggers[0]!).opacity).toBe('1');
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const item = canvasElement.querySelector('[data-slot="accordion-item"]');
    const trigger = canvas.getByRole('button');
    const chevron = trigger.querySelector('svg');
    const content = canvasElement.querySelector(
      '[data-slot="accordion-content"]'
    );

    await expect(item).toHaveClass('nx:bg-container');
    await expect(item).toHaveClass('nx:duration-fast');
    await expect(item).toHaveClass('nx:hover:bg-container-hover');
    await expect(item).toHaveClass('nx:data-disabled:hover:bg-container');
    await expect(trigger).toHaveClass('nx:transition-control');
    await expect(trigger).toHaveClass('nx:duration-fast');
    await expect(trigger).not.toHaveClass('nx:transition-all');
    await expect(chevron).toHaveClass('nx:duration-default');
    await expect(content).toHaveClass('nx:duration-default');
    await expect(content).toHaveClass(
      'nx:data-[state=open]:animate-accordion-down'
    );
    await expect(content).not.toHaveClass('nx:transition-all');
  },
};
