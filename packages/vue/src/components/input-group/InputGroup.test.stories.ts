import { DENSITY_OPTIONS } from '@nxds/core';
import type { StoryObj } from '@storybook/vue3-vite';
import { expect, type Mock, within } from 'storybook/test';

import { expectAutofillPaired } from '../../stories/support/autofill-pairing';
import {
  expectInsideBorder,
  expectTextFits,
} from '../../stories/support/story-height-test-utils';

import inputGroupMeta, {
  BorderlessStates,
  ButtonSizes,
  Disabled,
  WithDataAttributes,
  WithKbd,
  WithTextarea,
} from './InputGroup.stories';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '.';

// `click` falls through to the native element, so it is not a declared prop.
type InputGroupArgs = InstanceType<typeof InputGroup>['$props'] & {
  onClick?: Mock<(event: MouseEvent) => void>;
};

const meta = {
  ...inputGroupMeta,
  title: 'Tests/InputGroup',
};

export default meta;
type Story = StoryObj<InputGroupArgs>;

export const ButtonSizesStyle: Story = {
  ...ButtonSizes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');

    await document.fonts.ready;
    buttons.forEach((button) => {
      expect(getComputedStyle(button).paddingTop).toBe('0px');
      expect(getComputedStyle(button).paddingBottom).toBe('0px');
    });
  },
};

export const WithTextareaStyle: Story = {
  ...WithTextarea,
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole('textbox', {
      name: 'Message',
    });
    await expectAutofillPaired(textarea);
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="input-group"]');
    await expect(group).toHaveClass('nx:bg-container');
    await expect(group).toHaveClass(
      'nx:not-data-[disabled=true]:hover:bg-container-hover'
    );
  },
};

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(window.getComputedStyle(input).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)'
    );
    await expectAutofillPaired(input);
  },
};

export const BorderlessStatesStyle: Story = {
  ...BorderlessStates,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const empty = canvas.getByTestId('ig-borderless-empty');
    const invalid = canvas.getByTestId('ig-borderless-invalid');
    const disabled = canvas.getByTestId('ig-borderless-disabled');

    await expect(empty).toHaveClass('nx:border-transparent');
    await expect(empty).toHaveClass('nx:bg-control-background');
    await expect(empty).toHaveClass(
      'nx:not-data-[disabled=true]:hover:bg-control-background-hover'
    );

    await expect(invalid).toHaveClass(
      'nx:has-[[data-slot][aria-invalid=true]]:border-error-border'
    );
    const invalidStyles = window.getComputedStyle(invalid);
    await expect(
      Number.parseFloat(invalidStyles.borderTopWidth)
    ).toBeGreaterThan(0);
    await expect(invalidStyles.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(invalidStyles.boxShadow).toBe('none');

    const disabledInput = canvas.getByRole('textbox', {
      name: 'Disabled borderless email',
    });
    await expect(window.getComputedStyle(disabledInput).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)'
    );
    await expect(disabled).toHaveClass('nx:data-[disabled=true]:bg-disabled');
    await expect(disabled).not.toHaveClass(
      'nx:data-[disabled=true]:border-border-disabled'
    );
  },
};

export const WithKbdStyle: Story = {
  ...WithKbd,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // has-[>kbd]:-mr-1.5 → −6px (spacing-1.5 is mode-invariant).
    await expect(
      window.getComputedStyle(canvas.getByTestId('ig-kbd-addon')).marginRight
    ).toBe('-6px');
  },
};

const DENSITIES = DENSITY_OPTIONS.map((option) => option.value);

export const ExtraSmallButtonAtEveryDensity: Story = {
  // Text is tallest at the Larger UI scale, so it fits at every smaller one.
  globals: { uiScale: 'larger' },
  render: () => ({
    components: {
      InputGroup,
      InputGroupAddon,
      InputGroupButton,
      InputGroupInput,
    },
    setup: () => ({ densities: DENSITIES }),
    template: `
      <div class="nx:flex nx:w-80 nx:flex-col nx:gap-3">
        <div
          v-for="density in densities"
          :key="density"
          :data-density="density"
          :data-testid="'row-' + density"
        >
          <InputGroup>
            <InputGroupInput :aria-label="'Invite link, ' + density" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="xs">Copy</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const density of DENSITIES) {
      const button = within(canvas.getByTestId(`row-${density}`)).getByRole(
        'button',
        { name: 'Copy' }
      );
      // The label fits inside the button, and the button inside the group.
      await expectTextFits(button);
      await expectInsideBorder(
        button,
        button.closest<HTMLElement>('[data-slot="input-group"]')!
      );
    }
  },
};
