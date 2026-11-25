import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { expectMenuItemInsetAtEveryDensity } from '../../stories/support/menu-item-inset-test-utils';
import { expectInterruptibleOverlayMotion } from '../../stories/support/overlay-motion-test-utils';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import selectMeta, {
  BorderlessStates,
  DisabledInteraction,
  InvalidTrigger,
  OpenCloseInteraction,
  Sizes,
  WithDataAttributes,
} from './Select.stories';

const meta: Meta<typeof Select> = {
  ...selectMeta,
  title: 'Tests/Select',
};

export default meta;
type Story = StoryObj<typeof Select>;

export const InvalidTriggerStyle: Story = {
  ...InvalidTrigger,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Invalid select' });

    await expect(trigger).toHaveClass('nx:aria-invalid:border-error-border');
    await expect(trigger).toHaveClass(
      'nx:aria-invalid:focus-visible:outline-focus-error'
    );
  },
};

export const BorderlessStatesStyle: Story = {
  ...BorderlessStates,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const empty = canvas.getByTestId('select-borderless-empty');
    const invalid = canvas.getByTestId('select-borderless-invalid');
    const disabled = canvas.getByTestId('select-borderless-disabled');

    await expect(empty).toHaveClass('nx:border-transparent');
    await expect(empty).toHaveClass('nx:bg-control-background');
    await expect(empty).toHaveClass(
      'nx:enabled:hover:bg-control-background-hover'
    );

    await expect(invalid).toHaveClass('nx:aria-invalid:border-error-border');
    // The stroke is a real border now, so a borderless field keeps a
    // transparent one and the invalid state recolours it in place.
    const restStyles = window.getComputedStyle(empty);
    await expect(Number.parseFloat(restStyles.borderTopWidth)).toBeGreaterThan(
      0
    );
    await expect(restStyles.borderTopColor).toBe('rgba(0, 0, 0, 0)');

    const invalidStyles = window.getComputedStyle(invalid);
    await expect(
      Number.parseFloat(invalidStyles.borderTopWidth)
    ).toBeGreaterThan(0);
    await expect(invalidStyles.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(invalidStyles.boxShadow).toBe('none');

    await expect(disabled).toHaveClass('nx:disabled:bg-disabled');
    await expect(disabled).not.toHaveClass(
      'nx:disabled:border-border-disabled'
    );
  },
};

const SIZES = ['sm', 'default', 'lg'] as const;

export const SizesGeometry: Story = {
  ...Sizes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const height = (element: HTMLElement) =>
      Math.round(element.getBoundingClientRect().height);

    for (const size of SIZES) {
      const trigger = canvas.getByRole('combobox', { name: `${size} select` });
      const input = canvas.getByRole('textbox', { name: `${size} input` });

      await expect(height(trigger)).toBe(height(input));
    }
  },
};

export const CheckInsetAtEveryDensity: Story = {
  render: (_args) => (
    <Select defaultValue="banana">
      <SelectTrigger className="nx:w-[180px]" aria-label="Select a fruit">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));
    const listbox = await within(document.body).findByRole('listbox');
    const option = within(listbox).getByRole('option', { name: 'Banana' });
    const check = option.querySelector<HTMLElement>(
      '[data-slot="select-item-indicator-icon"]'
    )!.parentElement!;
    await expectMenuItemInsetAtEveryDensity(listbox, option, check);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).toBeNull();
    });
  },
};

export const OpenCloseInteractionMotion: Story = {
  ...OpenCloseInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('combobox'));
    await within(document.body).findByRole('listbox');

    const content = document.querySelector('[data-slot="select-content"]');
    await expectInterruptibleOverlayMotion(content);

    // Close it again, so the story's axe check runs on the closed select.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).toBeNull();
    });
  },
};

export const DisabledInteractionStyle: Story = {
  ...DisabledInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    await expect(trigger).toHaveClass('nx:disabled:border-border-disabled');
    await expect(trigger).toHaveClass('nx:disabled:bg-disabled');
    await expect(trigger).toHaveClass('nx:disabled:text-disabled-foreground');

    const icon = trigger.querySelector('svg');
    await expect(icon).toHaveClass(
      'nx:group-disabled/select-trigger:text-disabled-foreground'
    );
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    await expect(trigger).toHaveClass('nx:bg-container');
    await expect(trigger).toHaveClass('nx:enabled:hover:bg-container-hover');
  },
};
