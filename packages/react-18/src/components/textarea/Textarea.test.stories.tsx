import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';

import type { Textarea } from './textarea';
import textareaMeta, {
  BorderlessStates,
  Disabled,
  WithDataAttributes,
} from './Textarea.stories';

const meta: Meta<typeof Textarea> = {
  ...textareaMeta,
  title: 'Tests/Textarea',
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox');

    await expect(textarea).toHaveClass('nx:disabled:border-border-disabled');
    await expect(textarea).toHaveClass('nx:disabled:bg-disabled');
    await expect(textarea).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(textarea).toHaveClass(
      'nx:disabled:placeholder:text-disabled-foreground'
    );
    await expect(window.getComputedStyle(textarea).opacity).toBe('1');
  },
};

export const BorderlessStatesStyle: Story = {
  ...BorderlessStates,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const empty = canvas.getByTestId('textarea-borderless-empty');
    const invalid = canvas.getByTestId('textarea-borderless-invalid');
    const disabled = canvas.getByTestId('textarea-borderless-disabled');

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

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox');

    await expect(textarea).toHaveClass('nx:bg-container');
    await expect(textarea).toHaveClass('nx:enabled:hover:bg-container-hover');
    await expectAutofillPaired(textarea);
  },
};
