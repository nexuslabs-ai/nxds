import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import { Button } from '../button';

import pageHeaderMeta from './PageHeader.stories';

import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '.';

const meta = {
  ...pageHeaderMeta,
  title: 'Tests/PageHeader',
};

export default meta;
type Story = StoryObj<typeof pageHeaderMeta>;

const headerComponents = {
  Button,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
};

const ReportHeader = {
  components: headerComponents,
  template: `
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>Activity report</PageHeaderTitle>
        <PageHeaderDescription>Review activity for the selected period.</PageHeaderDescription>
      </PageHeaderContent>
      <PageHeaderActions>
        <Button variant="outline">Export</Button>
        <Button>Share</Button>
      </PageHeaderActions>
    </PageHeader>
  `,
};

const longDescription =
  'A longer description that must wrap without pushing actions outside the available space.';

const LongContentHeader = {
  components: headerComponents,
  setup: () => ({ longDescription }),
  template: `
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>RegionalDisasterRecoveryConfigurationReview</PageHeaderTitle>
        <PageHeaderDescription>{{ longDescription }}</PageHeaderDescription>
      </PageHeaderContent>
      <PageHeaderActions>
        <Button variant="outline">Download report</Button>
        <Button>Share report</Button>
        <Button variant="outline">Archive</Button>
      </PageHeaderActions>
    </PageHeader>
  `,
};

export const ContainerLayouts: Story = {
  render: () => ({
    components: { LongContentHeader, ReportHeader },
    template: `
      <div class="nx:grid nx:gap-8">
        <section style="width: 280px" data-testid="narrow"><ReportHeader /></section>
        <section style="width: 280px" data-testid="narrow-long"><LongContentHeader /></section>
        <section style="width: 460px" data-testid="medium"><LongContentHeader /></section>
        <section style="width: 720px" data-testid="wide"><ReportHeader /></section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const description = 'Review activity for the selected period.';

    const narrow = canvas.getByTestId('narrow');
    const narrowContent = within(narrow)
      .getByText(description)
      .getBoundingClientRect();
    const narrowAction = within(narrow)
      .getByRole('button', { name: 'Export' })
      .getBoundingClientRect();
    await expect(narrowAction.top).toBeGreaterThanOrEqual(narrowContent.bottom);
    await expect(narrow.scrollWidth).toBeLessThanOrEqual(
      narrow.clientWidth + 1
    );

    const narrowLongHeader = canvas
      .getByTestId('narrow-long')
      .querySelector('header')!;
    await expect(narrowLongHeader.scrollWidth).toBeLessThanOrEqual(
      narrowLongHeader.clientWidth + 1
    );

    const medium = canvas.getByTestId('medium');
    const mediumContent = within(medium)
      .getByText(longDescription)
      .getBoundingClientRect();
    const mediumAction = within(medium)
      .getByRole('button', { name: 'Download report' })
      .getBoundingClientRect();
    await expect(mediumAction.top).toBeGreaterThanOrEqual(mediumContent.bottom);
    await expect(medium.scrollWidth).toBeLessThanOrEqual(
      medium.clientWidth + 1
    );

    const wide = canvas.getByTestId('wide');
    const wideContent = within(wide)
      .getByText(description)
      .getBoundingClientRect();
    const wideAction = within(wide)
      .getByRole('button', { name: 'Export' })
      .getBoundingClientRect();
    await expect(wideAction.left).toBeGreaterThanOrEqual(wideContent.right);
    await expect(wide.scrollWidth).toBeLessThanOrEqual(wide.clientWidth + 1);
  },
};
