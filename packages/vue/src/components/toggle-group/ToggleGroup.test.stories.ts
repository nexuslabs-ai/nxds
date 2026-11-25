import { PhTextAlignLeft, PhTextAlignRight } from '@phosphor-icons/vue';
import type { StoryObj } from '@storybook/vue3-vite';
import { expect, type Mock, userEvent, waitFor, within } from 'storybook/test';

import toggleGroupMeta, {
  ControlledDisabledTransition,
  EmptyAndSingle,
  InvalidOwnership,
  OutlinePrimarySizes,
  WithDataAttributes,
  WithoutRovingFocus,
} from './ToggleGroup.stories';

import { ToggleGroup, ToggleGroupItem } from '.';

type ToggleGroupArgs = InstanceType<typeof ToggleGroup>['$props'] & {
  'onUpdate:modelValue'?: Mock<(value: unknown) => void>;
};

const meta = {
  ...toggleGroupMeta,
  title: 'Tests/ToggleGroup',
};

export default meta;
type Story = StoryObj<ToggleGroupArgs>;

export const WithoutRovingFocusStyle: Story = {
  ...WithoutRovingFocus,
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector('[data-slot="toggle-group"]')!;
    await expect(getComputedStyle(group).flexDirection).toBe('column');
  },
};

export const ControlledDisabledTransitionStyle: Story = {
  ...ControlledDisabledTransition,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole('radio', { name: 'Bold' });
    const box = bold.getBoundingClientRect();
    const token = (name: string) =>
      getComputedStyle(bold).getPropertyValue(`--nx-color-${name}`).trim();
    await expect(getComputedStyle(bold).borderTopColor).toBe(
      token('border-error-active')
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Disable formatting' })
    );
    // border-color eases through transition-control; wait for it to settle.
    await waitFor(() =>
      expect(getComputedStyle(bold).borderTopColor).toBe(
        token('border-disabled')
      )
    );
    await expect([
      bold.getBoundingClientRect().width,
      bold.getBoundingClientRect().height,
    ]).toEqual([box.width, box.height]);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Enable formatting' })
    );
    await waitFor(() =>
      expect(getComputedStyle(bold).borderTopColor).toBe(
        token('border-error-active')
      )
    );
  },
};

export const InvalidOwnershipStyle: Story = {
  ...InvalidOwnership,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const normal = canvas.getByRole('button', { name: 'Bold' });
    await expect(getComputedStyle(normal).borderTopColor).toBe(
      getComputedStyle(normal)
        .getPropertyValue('--nx-color-border-default')
        .trim()
    );
    for (const item of within(
      canvas.getByLabelText('Item errors')
    ).getAllByRole('button')) {
      await expect(getComputedStyle(item).borderTopColor).toBe(
        getComputedStyle(item)
          .getPropertyValue('--nx-color-border-error-active')
          .trim()
      );
    }
  },
};

export const EmptyAndSingleStyle: Story = {
  ...EmptyAndSingle,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const item = canvas.getByRole('button', { name: 'Single composed bold' });
    await userEvent.click(item);
    const style = getComputedStyle(item);
    const radius = style.getPropertyValue('--nx-radius-md').trim();
    await expect(style.borderTopLeftRadius).toBe(radius);
    await expect(style.borderTopRightRadius).toBe(radius);
  },
};

// A half-step spacing reads its own spacing token.
export const HalfStepSpacing: Story = {
  render: () => ({
    components: {
      PhTextAlignLeft,
      PhTextAlignRight,
      ToggleGroup,
      ToggleGroupItem,
    },
    template: `
      <ToggleGroup
        type="single"
        variant="outline"
        :spacing="0.5"
        aria-label="Text alignment"
      >
        <ToggleGroupItem value="left" aria-label="Align left">
          <PhTextAlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <PhTextAlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByLabelText('Text alignment');
    await expect(getComputedStyle(group).columnGap).toBe(
      getComputedStyle(group).getPropertyValue('--nx-spacing-0_5').trim()
    );
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const [inherited, override] = canvasElement.querySelectorAll(
      '[data-slot="toggle-group-item"]'
    );
    await expect(inherited).toHaveClass('nx:border-border-default');
    await expect(override).not.toHaveClass('nx:border-border-default');
  },
};

const SIZES = ['sm', 'default', 'lg'] as const;

// outline-primary shares the outline variant's box at every size — only the
// border colour differs.
export const OutlinePrimarySizesGeometry: Story = {
  ...OutlinePrimarySizes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const size of SIZES) {
      const outline = canvas.getByLabelText(`outline ${size}`);
      const primary = canvas.getByLabelText(`outline-primary ${size}`);
      const outlineBox = outline.getBoundingClientRect();
      const primaryBox = primary.getBoundingClientRect();
      await expect([primaryBox.width, primaryBox.height]).toEqual([
        outlineBox.width,
        outlineBox.height,
      ]);
    }
  },
};
