import type { StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import inlineEditMeta, { AllVariants } from './InlineEdit.stories';

const meta = {
  ...inlineEditMeta,
  title: 'Tests/InlineEdit',
};

export default meta;
type Story = StoryObj<typeof inlineEditMeta>;

export const AllVariantsTypography: Story = {
  ...AllVariants,
  play: async ({ canvasElement }) => {
    const values = Array.from(
      canvasElement.querySelectorAll('[data-slot="inline-edit-value"]')
    ).filter((element) => element.textContent === 'Priya Shah');
    const styles = values.map((element) => {
      const style = getComputedStyle(element);
      return {
        size: style.fontSize,
        weight: style.fontWeight,
        lineHeight: style.lineHeight,
        color: style.color,
      };
    });
    await expect(styles).toHaveLength(3);
    await expect(styles[0]).toEqual(styles[1]);
    await expect(styles[1]).toEqual(styles[2]);
  },
};
