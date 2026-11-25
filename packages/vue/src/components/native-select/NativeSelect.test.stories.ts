import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';

import nativeSelectMeta, {
  BorderlessStates,
  Disabled,
  WithDataAttributes,
} from './NativeSelect.stories';

import type { NativeSelect } from '.';

// `change` falls through to the `<select>`, so it is not a declared emit.
type NativeSelectArgs = InstanceType<typeof NativeSelect>['$props'] & {
  onChange?: (event: Event) => void;
};

const meta = {
  ...nativeSelectMeta,
  title: 'Tests/NativeSelect',
};

export default meta;
type Story = StoryObj<Meta<NativeSelectArgs>>;

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox', { name: 'Plan' });
    await expect(select).toHaveClass('nx:disabled:border-border-disabled');
    await expect(select).toHaveClass('nx:disabled:bg-disabled');
    await expect(select).toHaveClass('nx:disabled:text-disabled-foreground');

    const icon = canvasElement.querySelector(
      '[data-slot="native-select-icon"]'
    );
    await expect(icon).toHaveClass(
      'nx:group-has-[select:disabled]/native-select:text-disabled-foreground'
    );
  },
};

export const BorderlessStatesStyle: Story = {
  ...BorderlessStates,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const base = canvas.getByTestId('native-select-borderless-default');
    const invalid = canvas.getByTestId('native-select-borderless-invalid');
    const disabled = canvas.getByTestId('native-select-borderless-disabled');

    await expect(base).toHaveClass('nx:border-transparent');
    await expect(base).toHaveClass('nx:bg-control-background');
    await expect(base).toHaveClass(
      'nx:enabled:hover:bg-control-background-hover'
    );

    await expect(invalid).toHaveClass('nx:aria-invalid:border-error-border');
    // A borderless field keeps a transparent border, and the invalid state
    // recolours it in place.
    const restStyles = window.getComputedStyle(base);
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

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole('combobox', {
      name: 'Plan',
    });
    await expect(select).toHaveClass('nx:bg-container');
    await expect(select).toHaveClass('nx:enabled:hover:bg-container-hover');
    await expectAutofillPaired(select);
  },
};
