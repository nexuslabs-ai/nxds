import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import fieldMeta, {
  Default,
  Disabled,
  RequiredAndOptionalIndicators,
} from './Field.stories';

const meta = {
  ...fieldMeta,
  title: 'Tests/Field',
};

export default meta;
type Story = StoryObj<typeof fieldMeta>;

export const DefaultGeometry: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Email');
    const input = canvas.getByLabelText('Email');
    const labelToInputGap = Math.round(
      input.getBoundingClientRect().top - label.getBoundingClientRect().bottom
    );

    // 8px is the Field label→control gap (gap-2).
    await expect(labelToInputGap).toBe(8);
  },
};

export const RequiredAndOptionalIndicatorsStyle: Story = {
  ...RequiredAndOptionalIndicators,
  play: async ({ canvasElement }) => {
    const [, optionalIndicator] = Array.from(
      canvasElement.querySelectorAll<HTMLElement>(
        '[data-slot="field-required-indicator"]'
      )
    );

    await expect(optionalIndicator).toHaveClass(
      'nx:data-[optional=true]:typography-body-default'
    );
  },
};

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    // The FieldLabel dims via the field group's data-disabled, using a semantic
    // text token at full opacity (not a fade).
    const fieldLabel = canvasElement.querySelector<HTMLElement>(
      '[data-slot="field-label"]'
    )!;
    await expect(fieldLabel).toHaveClass(
      'nx:group-data-[disabled=true]/field:text-disabled-foreground'
    );
    await expect(getComputedStyle(fieldLabel).opacity).toBe('1');
  },
};
