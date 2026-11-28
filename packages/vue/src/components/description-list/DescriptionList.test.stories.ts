import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import descriptionListMeta, { LongContent } from './DescriptionList.stories';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from '.';

const meta = {
  ...descriptionListMeta,
  title: 'Tests/DescriptionList',
};

export default meta;
type Story = StoryObj<typeof descriptionListMeta>;

const ProfileDetails = {
  components: {
    DescriptionList,
    DescriptionListDescription,
    DescriptionListItem,
    DescriptionListTerm,
  },
  template: `
    <DescriptionList>
      <DescriptionListItem>
        <DescriptionListTerm>Name</DescriptionListTerm>
        <DescriptionListDescription>Priya Shah</DescriptionListDescription>
      </DescriptionListItem>
      <DescriptionListItem>
        <DescriptionListTerm>Email</DescriptionListTerm>
        <DescriptionListDescription>priya@example.com</DescriptionListDescription>
      </DescriptionListItem>
    </DescriptionList>
  `,
};

export const ContainerLayouts: Story = {
  render: () => ({
    components: { ProfileDetails },
    template: `
      <div class="nx:flex nx:flex-wrap nx:gap-8">
        <div style="width: 280px" data-testid="narrow"><ProfileDetails /></div>
        <div style="width: 640px" data-testid="wide"><ProfileDetails /></div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const narrow = canvas.getByTestId('narrow');
    const wide = canvas.getByTestId('wide');
    const termNarrow = narrow.querySelector('dt')!;
    const valueNarrow = narrow.querySelector('dd')!;
    const termWide = wide.querySelector('dt')!;
    const valueWide = wide.querySelector('dd')!;
    await expect(narrow.getBoundingClientRect().width).toBeLessThan(448);
    await expect(wide.getBoundingClientRect().width).toBeGreaterThan(448);
    await expect(
      valueNarrow.getBoundingClientRect().top
    ).toBeGreaterThanOrEqual(termNarrow.getBoundingClientRect().bottom);
    await expect(valueWide.getBoundingClientRect().left).toBeGreaterThan(
      termWide.getBoundingClientRect().left
    );
    await expect(
      Math.abs(
        valueWide.getBoundingClientRect().top -
          termWide.getBoundingClientRect().top
      )
    ).toBeLessThan(2);
  },
};

export const LongContentGeometry: Story = {
  ...LongContent,
  play: async ({ canvasElement }) => {
    for (const list of canvasElement.querySelectorAll('dl')) {
      await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth + 1);
      for (const cell of list.querySelectorAll('dt, dd')) {
        await expect(cell.scrollWidth).toBeLessThanOrEqual(
          cell.clientWidth + 1
        );
      }
    }
  },
};
