import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { useId } from 'vue';

import { Badge } from '../badge';
import { Button } from '../button';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from '../description-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderTitle,
  PageHeaderTitleRow,
} from '.';

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  decorators: [
    (story) => ({
      components: { story },
      template: '<main class="nx:w-full nx:max-w-5xl nx:p-4"><story /></main>',
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'PageHeader titles a page or section, with optional metadata, status, description and actions. Compact, standard and detail headers are compositions of the same parts, not variants.\n\n- The title renders an `h1`. Use `as-child` to pick another heading level.\n- For a larger title, add `class="nx:typography-heading-large"` to PageHeaderTitle.\n- Put page headers inside `main` and section headers inside their `section`.\n- Actions wrap below the content in narrow containers. Your app owns what they do.',
      },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const headerComponents = {
  Badge,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderTitle,
  PageHeaderTitleRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
};

// The helpers take a #title slot in place of their default title.
const ReportHeader = {
  components: headerComponents,
  template: `
    <PageHeader>
      <PageHeaderContent>
        <slot name="title"><PageHeaderTitle>Activity report</PageHeaderTitle></slot>
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

const CompactHeader = {
  components: headerComponents,
  template: `
    <PageHeader>
      <PageHeaderContent>
        <slot name="title">
          <PageHeaderTitle class="nx:typography-heading-small">Reports</PageHeaderTitle>
        </slot>
      </PageHeaderContent>
      <PageHeaderActions>
        <Button size="sm">New report</Button>
      </PageHeaderActions>
    </PageHeader>
  `,
};

const DetailHeader = {
  components: headerComponents,
  template: `
    <div class="nx:grid nx:gap-6">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderMeta>PO-0001 · Project 254</PageHeaderMeta>
          <PageHeaderTitleRow>
            <slot name="title"><PageHeaderTitle>Purchase order</PageHeaderTitle></slot>
            <Badge variant="secondary">Sent</Badge>
          </PageHeaderTitleRow>
          <PageHeaderDescription>Office furniture for the Riverside workspace.</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">Download</Button>
          <Button>Edit order</Button>
        </PageHeaderActions>
      </PageHeader>
      <DescriptionList>
        <DescriptionListItem>
          <DescriptionListTerm>Supplier</DescriptionListTerm>
          <DescriptionListDescription>Riverside Furniture</DescriptionListDescription>
        </DescriptionListItem>
        <DescriptionListItem>
          <DescriptionListTerm>Delivery date</DescriptionListTerm>
          <DescriptionListDescription>
            <time datetime="2026-10-12">12 October 2026</time>
          </DescriptionListDescription>
        </DescriptionListItem>
      </DescriptionList>
    </div>
  `,
};

const TabbedHeader = {
  components: headerComponents,
  template: `
    <div class="nx:grid nx:gap-4">
      <PageHeader>
        <PageHeaderContent>
          <slot name="title"><PageHeaderTitle>Usage</PageHeaderTitle></slot>
          <PageHeaderDescription>Monitor activity and spending across your workspace.</PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <Tabs default-value="activity">
        <TabsList aria-label="Usage views">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="spend">Spend</TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <p class="nx:typography-body-default nx:text-muted-foreground">Activity for the current billing period.</p>
        </TabsContent>
        <TabsContent value="spend">
          <p class="nx:typography-body-default nx:text-muted-foreground">Spending for the current billing period.</p>
        </TabsContent>
      </Tabs>
    </div>
  `,
};

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Button,
      PageHeader,
      PageHeaderActions,
      PageHeaderContent,
      PageHeaderDescription,
      PageHeaderTitle,
    },
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
  }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', {
        level: 1,
        name: 'Activity report',
      })
    ).toBeVisible();
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: headerComponents,
    template: `
      <PageHeader data-testid="header">
        <PageHeaderContent data-testid="content">
          <PageHeaderMeta data-testid="meta">Workspace</PageHeaderMeta>
          <PageHeaderTitleRow data-testid="title-row">
            <PageHeaderTitle data-testid="title">Activity report</PageHeaderTitle>
          </PageHeaderTitleRow>
          <PageHeaderDescription data-testid="description">Review activity for the selected period.</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions data-testid="actions">
          <Button>Share</Button>
        </PageHeaderActions>
      </PageHeader>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('header')).toHaveAttribute(
      'data-slot',
      'page-header'
    );
    await expect(canvas.getByTestId('content')).toHaveAttribute(
      'data-slot',
      'page-header-content'
    );
    await expect(canvas.getByTestId('meta')).toHaveAttribute(
      'data-slot',
      'page-header-meta'
    );
    await expect(canvas.getByTestId('title-row')).toHaveAttribute(
      'data-slot',
      'page-header-title-row'
    );
    await expect(canvas.getByTestId('title')).toHaveAttribute(
      'data-slot',
      'page-header-title'
    );
    await expect(canvas.getByTestId('description')).toHaveAttribute(
      'data-slot',
      'page-header-description'
    );
    await expect(canvas.getByTestId('actions')).toHaveAttribute(
      'data-slot',
      'page-header-actions'
    );
  },
};

export const TitleOnly: Story = {
  render: () => ({
    components: headerComponents,
    template: `
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Documents</PageHeaderTitle>
        </PageHeaderContent>
      </PageHeader>
    `,
  }),
};

export const SectionHeader: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Title a section inside a page with an `h2` through `as-child`.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      PageHeader,
      PageHeaderActions,
      PageHeaderContent,
      PageHeaderDescription,
      PageHeaderTitle,
    },
    setup: () => ({ titleId: useId() }),
    template: `
      <section :aria-labelledby="titleId">
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderTitle as-child>
              <h2 :id="titleId">Notification settings</h2>
            </PageHeaderTitle>
            <PageHeaderDescription>Choose which updates you receive.</PageHeaderDescription>
          </PageHeaderContent>
          <PageHeaderActions>
            <Button variant="outline">Reset</Button>
          </PageHeaderActions>
        </PageHeader>
      </section>
    `,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('heading', {
        level: 2,
        name: 'Notification settings',
      })
    ).toHaveAttribute('data-slot', 'page-header-title');
  },
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

const onSave = fn();

export const KeyboardAction: Story = {
  beforeEach: () => {
    onSave.mockClear();
  },
  render: () => ({
    components: headerComponents,
    setup: () => ({ onSave }),
    template: `
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Document</PageHeaderTitle>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button @click="onSave">Save</Button>
        </PageHeaderActions>
      </PageHeader>
    `,
  }),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(
      within(canvasElement).getByRole('button', { name: 'Save' })
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onSave).toHaveBeenCalledOnce();
  },
};

export const Compact: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Pair a title with one small action for a dense page.',
      },
    },
  },
  render: () => ({
    components: {
      Button,
      PageHeader,
      PageHeaderActions,
      PageHeaderContent,
      PageHeaderTitle,
    },
    template: `
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle class="nx:typography-heading-small">Reports</PageHeaderTitle>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button size="sm">New report</Button>
        </PageHeaderActions>
      </PageHeader>
    `,
  }),
};

export const Detail: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Show a record with metadata, a status Badge in PageHeaderTitleRow and actions.',
      },
    },
  },
  render: () => ({
    components: {
      Badge,
      Button,
      DescriptionList,
      DescriptionListDescription,
      DescriptionListItem,
      DescriptionListTerm,
      PageHeader,
      PageHeaderActions,
      PageHeaderContent,
      PageHeaderDescription,
      PageHeaderMeta,
      PageHeaderTitle,
      PageHeaderTitleRow,
    },
    template: `
      <div class="nx:grid nx:gap-6">
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderMeta>PO-0001 · Project 254</PageHeaderMeta>
            <PageHeaderTitleRow>
              <PageHeaderTitle>Purchase order</PageHeaderTitle>
              <Badge variant="secondary">Sent</Badge>
            </PageHeaderTitleRow>
            <PageHeaderDescription>Office furniture for the Riverside workspace.</PageHeaderDescription>
          </PageHeaderContent>
          <PageHeaderActions>
            <Button variant="outline">Download</Button>
            <Button>Edit order</Button>
          </PageHeaderActions>
        </PageHeader>
        <DescriptionList>
          <DescriptionListItem>
            <DescriptionListTerm>Supplier</DescriptionListTerm>
            <DescriptionListDescription>Riverside Furniture</DescriptionListDescription>
          </DescriptionListItem>
          <DescriptionListItem>
            <DescriptionListTerm>Delivery date</DescriptionListTerm>
            <DescriptionListDescription>
              <time datetime="2026-10-12">12 October 2026</time>
            </DescriptionListDescription>
          </DescriptionListItem>
        </DescriptionList>
      </div>
    `,
  }),
};

export const WithTabs: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Place Tabs under the header to switch between views of the page.',
      },
    },
  },
  render: () => ({
    components: {
      PageHeader,
      PageHeaderContent,
      PageHeaderDescription,
      PageHeaderTitle,
      Tabs,
      TabsContent,
      TabsList,
      TabsTrigger,
    },
    template: `
      <div class="nx:grid nx:gap-4">
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderTitle>Usage</PageHeaderTitle>
            <PageHeaderDescription>Monitor activity and spending across your workspace.</PageHeaderDescription>
          </PageHeaderContent>
        </PageHeader>
        <Tabs default-value="activity">
          <TabsList aria-label="Usage views">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="spend">Spend</TabsTrigger>
          </TabsList>
          <TabsContent value="activity">
            <p class="nx:typography-body-default nx:text-muted-foreground">Activity for the current billing period.</p>
          </TabsContent>
          <TabsContent value="spend">
            <p class="nx:typography-body-default nx:text-muted-foreground">Spending for the current billing period.</p>
          </TabsContent>
        </Tabs>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Spend' }));
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(
      'Spending for the current billing period.'
    );
    await expect(canvas.getByRole('tab', { name: 'Spend' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  },
};

export const LargeHeading: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Add `nx:typography-heading-large` to the title for a larger heading.',
      },
    },
  },
  render: () => ({
    components: {
      PageHeader,
      PageHeaderContent,
      PageHeaderDescription,
      PageHeaderTitle,
    },
    template: `
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle class="nx:typography-heading-large">Workspace overview</PageHeaderTitle>
          <PageHeaderDescription>Track usage, members, and billing across your workspace.</PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: {
      CompactHeader,
      DetailHeader,
      PageHeaderTitle,
      ReportHeader,
      TabbedHeader,
    },
    template: `
      <div class="nx:grid nx:gap-10">
        <section aria-label="Compact header">
          <CompactHeader>
            <template #title>
              <PageHeaderTitle as-child class="nx:typography-heading-small"><h2>Reports</h2></PageHeaderTitle>
            </template>
          </CompactHeader>
        </section>
        <section aria-label="Standard header">
          <ReportHeader>
            <template #title>
              <PageHeaderTitle as-child><h2>Activity report</h2></PageHeaderTitle>
            </template>
          </ReportHeader>
        </section>
        <section aria-label="Detail header">
          <DetailHeader>
            <template #title>
              <PageHeaderTitle as-child><h2>Purchase order</h2></PageHeaderTitle>
            </template>
          </DetailHeader>
        </section>
        <section aria-label="Header with tabs">
          <TabbedHeader>
            <template #title>
              <PageHeaderTitle as-child><h2>Usage</h2></PageHeaderTitle>
            </template>
          </TabbedHeader>
        </section>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole('heading', { level: 1 })).toHaveLength(
      0
    );
    await expect(canvas.getAllByRole('heading', { level: 2 })).toHaveLength(4);
  },
};
