import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import {
  type Pagination,
  PaginationNext,
  PaginationPrevious,
} from './pagination';
import paginationMeta, { IconOnly } from './Pagination.stories';

const meta: Meta<typeof Pagination> = {
  ...paginationMeta,
  title: 'Tests/Pagination',
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const IconOnlySquare: Story = {
  ...IconOnly,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const { name, label } of [
      { name: 'Go to previous page', label: 'Previous' },
      { name: 'Go to next page', label: 'Next' },
    ]) {
      const link = canvas.getByRole('link', { name });
      const { width, height } = link.getBoundingClientRect();
      await expect(width).toBe(height);
      await expect(within(link).getByText(label)).toHaveClass('nx:sr-only');
    }
  },
};

// Each line must fail to compile: `iconOnly` renders its own chevron and
// hidden label, so it refuses `children` and `asChild`.
const _rejectedIconOnlyLinks = [
  // @ts-expect-error An icon-only link renders its own label.
  <PaginationPrevious key="children" href="#" iconOnly>
    Back
  </PaginationPrevious>,
  // @ts-expect-error asChild can't render an icon-only link.
  <PaginationNext key="as-child" href="#" iconOnly asChild />,
];

// A screen-size switch is one boolean prop.
function _ResponsivePrevious({ isNarrow }: { isNarrow: boolean }) {
  return <PaginationPrevious href="#" iconOnly={isNarrow} />;
}
