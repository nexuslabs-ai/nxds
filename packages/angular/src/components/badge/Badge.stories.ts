import {
  phosphorCheck,
  phosphorCheckCircle,
  phosphorInfo,
  phosphorWarning,
  phosphorWarningCircle,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';
import {
  type Meta,
  moduleMetadata,
  type StoryObj,
} from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';

import { NxIcon, trustIconMarkup } from '../../lib/icon';
import { NxSpinner } from '../spinner/spinner';

import { NxBadge, NxBadgeLeftIcon, NxBadgeRightIcon } from './badge';

const VARIANTS = [
  'default',
  'secondary',
  'error',
  'warning',
  'success',
  'information',
] as const;
const FILLS = ['solid', 'light', 'outline'] as const;

const icons = {
  phCheck: trustIconMarkup(phosphorCheck),
  phCheckCircle: trustIconMarkup(phosphorCheckCircle),
  phInfo: trustIconMarkup(phosphorInfo),
  phWarning: trustIconMarkup(phosphorWarning),
  phWarningCircle: trustIconMarkup(phosphorWarningCircle),
  phX: trustIconMarkup(phosphorX),
};

// `nx:h-6` / `nx:w-6` at `density: default`.
const BADGE_SIZE_PX = 24;
// `nx:size-3.5` icon slot.
const BADGE_ICON_SIZE_PX = 14;

type BadgeArgs = {
  variant: (typeof VARIANTS)[number];
  fill: (typeof FILLS)[number];
  isCaps: boolean;
  isNumber: boolean;
};

const meta: Meta<BadgeArgs> = {
  title: 'Components/Badge',
  parameters: {
    docs: {
      description: {
        component:
          "Badge labels an item with a short status, category or count. It is not interactive. Pair a status color with text or an icon, because color alone doesn't carry meaning.",
      },
    },
  },
  component: NxBadge,
  decorators: [
    moduleMetadata({
      imports: [NxBadge, NxBadgeLeftIcon, NxBadgeRightIcon, NxIcon, NxSpinner],
    }),
  ],
  args: {
    variant: 'default',
    fill: 'solid',
    isCaps: true,
    isNumber: false,
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    fill: { control: 'select', options: FILLS },
    isCaps: { control: 'boolean' },
    isNumber: { control: 'boolean' },
  },
  render: (args) => ({
    props: args,
    template:
      '<span nxBadge [variant]="variant" [fill]="fill" [isCaps]="isCaps" [isNumber]="isNumber">Active</span>',
  }),
};

export default meta;
type Story = StoryObj<BadgeArgs>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    template: `
      <span nxBadge>Badge</span>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Badge');

    await expect(badge).toHaveAttribute('data-variant', 'default');
    await expect(badge).toHaveAttribute('data-fill', 'solid');
    await expect(badge).toHaveAttribute('data-caps', 'true');
  },
};

export const WithRightIcon: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Add a trailing icon with `nxBadgeRightIcon`.',
      },
    },
  },
  render: () => ({
    props: icons,
    template: `
      <span nxBadge variant="secondary" [isCaps]="false">
        Dismiss
        <svg nxBadgeRightIcon [nxIcon]="phX"></svg>
      </span>
    `,
  }),
};

export const IconOnly: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show only an icon, named for screen readers with `aria-label`.',
      },
    },
  },
  globals: { density: 'default' },
  render: () => ({
    props: icons,
    template: `
      <span nxBadge variant="success" fill="light" aria-label="Approved">
        <svg nxBadgeLeftIcon [nxIcon]="phCheck"></svg>
      </span>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('img', { name: 'Approved' });
    const svg = badge.querySelector('svg');
    const rect = badge.getBoundingClientRect();

    if (!(svg instanceof SVGElement)) {
      throw new Error('Expected icon-only badge to render an SVG icon.');
    }

    const svgRect = svg.getBoundingClientRect();

    await expect(badge).toHaveAttribute('data-icon-only', 'true');
    expect(badge.textContent).toBe('');
    expect(Math.round(rect.height)).toBe(BADGE_SIZE_PX);
    expect(Math.round(rect.width)).toBeGreaterThanOrEqual(BADGE_SIZE_PX);
    expect(Math.round(svgRect.width)).toBe(BADGE_ICON_SIZE_PX);
    expect(Math.round(svgRect.height)).toBe(BADGE_ICON_SIZE_PX);
  },
};

export const StatusWithIcons: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Pair each status color with text and a suggested icon, so status never relies on color alone.',
      },
    },
  },
  render: () => ({
    props: icons,
    template: `
      <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
        <span nxBadge variant="success" fill="light" [isCaps]="false">
          <svg nxBadgeLeftIcon [nxIcon]="phCheckCircle"></svg>
          Success
        </span>
        <span nxBadge variant="warning" fill="light" [isCaps]="false">
          <svg nxBadgeLeftIcon [nxIcon]="phWarning"></svg>
          Warning
        </span>
        <span nxBadge variant="error" fill="light" [isCaps]="false">
          <svg nxBadgeLeftIcon [nxIcon]="phWarningCircle"></svg>
          Error
        </span>
        <span nxBadge variant="information" fill="light" [isCaps]="false">
          <svg nxBadgeLeftIcon [nxIcon]="phInfo"></svg>
          Info
        </span>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  tags: ['docs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Compare every `variant` and `fill` in caps and sentence case.',
      },
    },
  },
  render: () => ({
    props: icons,
    template: `
      <div class="nx:flex nx:flex-col nx:gap-8">
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Solid Fill (Caps)</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <span nxBadge variant="default">Label</span>
            <span nxBadge variant="secondary">Label</span>
            <span nxBadge variant="error">Label</span>
            <span nxBadge variant="warning">Label</span>
            <span nxBadge variant="success">Label</span>
            <span nxBadge variant="information">Label</span>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Solid Fill (Sentence)</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <span nxBadge variant="default" [isCaps]="false">Label</span>
            <span nxBadge variant="secondary" [isCaps]="false">Label</span>
            <span nxBadge variant="error" [isCaps]="false">Label</span>
            <span nxBadge variant="warning" [isCaps]="false">Label</span>
            <span nxBadge variant="success" [isCaps]="false">Label</span>
            <span nxBadge variant="information" [isCaps]="false">Label</span>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Light Fill (Caps)</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <span nxBadge variant="default" fill="light">Label</span>
            <span nxBadge variant="secondary" fill="light">Label</span>
            <span nxBadge variant="error" fill="light">Label</span>
            <span nxBadge variant="warning" fill="light">Label</span>
            <span nxBadge variant="success" fill="light">Label</span>
            <span nxBadge variant="information" fill="light">Label</span>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Light Fill (Sentence)</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <span nxBadge variant="default" fill="light" [isCaps]="false">Label</span>
            <span nxBadge variant="secondary" fill="light" [isCaps]="false">Label</span>
            <span nxBadge variant="error" fill="light" [isCaps]="false">Label</span>
            <span nxBadge variant="warning" fill="light" [isCaps]="false">Label</span>
            <span nxBadge variant="success" fill="light" [isCaps]="false">Label</span>
            <span nxBadge variant="information" fill="light" [isCaps]="false">Label</span>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Outline Fill (Caps)</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <span nxBadge variant="default" fill="outline">Default</span>
            <span nxBadge variant="secondary" fill="outline">Secondary</span>
            <span nxBadge variant="error" fill="outline">Error</span>
            <span nxBadge variant="warning" fill="outline">Warning</span>
            <span nxBadge variant="success" fill="outline">Success</span>
            <span nxBadge variant="information" fill="outline">Info</span>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Outline Fill (Sentence)</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <span nxBadge variant="default" fill="outline" [isCaps]="false">Default</span>
            <span nxBadge variant="secondary" fill="outline" [isCaps]="false">Secondary</span>
            <span nxBadge variant="error" fill="outline" [isCaps]="false">Error</span>
            <span nxBadge variant="warning" fill="outline" [isCaps]="false">Warning</span>
            <span nxBadge variant="success" fill="outline" [isCaps]="false">Success</span>
            <span nxBadge variant="information" fill="outline" [isCaps]="false">Info</span>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Number Badges</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <span nxBadge variant="default" isNumber>8</span>
            <span nxBadge variant="secondary" isNumber>8</span>
            <span nxBadge variant="error" isNumber>8</span>
            <span nxBadge variant="warning" isNumber>8</span>
            <span nxBadge variant="success" isNumber>8</span>
            <span nxBadge variant="information" isNumber>8</span>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">Icon Only</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <span nxBadge variant="success" fill="light" aria-label="Approved"><svg nxBadgeLeftIcon [nxIcon]="phCheck"></svg></span>
            <span nxBadge variant="default" fill="solid" aria-label="Verified"><svg nxBadgeLeftIcon [nxIcon]="phCheck"></svg></span>
            <span nxBadge variant="error" fill="outline" aria-label="Error"><svg nxBadgeRightIcon [nxIcon]="phX"></svg></span>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">With Icons</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <span nxBadge variant="default" [isCaps]="false"><svg nxBadgeLeftIcon [nxIcon]="phCheck"></svg>Label</span>
            <span nxBadge variant="success" [isCaps]="false"><svg nxBadgeLeftIcon [nxIcon]="phCheck"></svg>Label</span>
            <span nxBadge variant="error" [isCaps]="false"><svg nxBadgeRightIcon [nxIcon]="phX"></svg>Label</span>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-3 nx:typography-label-default">With SVG Loader</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <span nxBadge variant="information" fill="outline" [isCaps]="false">
              <svg nxSpinner nxBadgeLeftIcon role="presentation" aria-hidden="true" [attr.aria-label]="null"></svg>
              Loading
            </span>
            <span nxBadge variant="information" fill="light" [isCaps]="false">
              <svg nxSpinner nxBadgeLeftIcon role="presentation" aria-hidden="true" [attr.aria-label]="null"></svg>
              Syncing
            </span>
          </div>
        </div>
      </div>
    `,
  }),
};

export const WithDataAttributes: Story = {
  render: () => ({
    template:
      '<span nxBadge variant="success" fill="light" [isCaps]="false">Status</span>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Status');

    await expect(badge).toHaveAttribute('data-slot', 'badge');
    await expect(badge).toHaveAttribute('data-variant', 'success');
    await expect(badge).toHaveAttribute('data-fill', 'light');
    await expect(badge).toHaveAttribute('data-caps', 'false');
  },
};

export const OutlineFill: Story = {
  render: () => ({
    template: '<span nxBadge variant="success" fill="outline">Outline</span>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Outline');
    const badgeStyles = getComputedStyle(badge);

    await expect(badge).toHaveAttribute('data-variant', 'success');
    await expect(badge).toHaveAttribute('data-fill', 'outline');
    // Assert the rendered result (opaque fill + visible border), not the
    // utility class names — class names are implementation detail and mergeable.
    expect(badgeStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(parseFloat(badgeStyles.borderTopWidth)).toBeGreaterThan(0);
  },
};

export const WithBothIcons: Story = {
  render: () => ({
    props: icons,
    template: `
      <span nxBadge variant="default" [isCaps]="false">
        <svg nxBadgeLeftIcon [nxIcon]="phCheck"></svg>
        Status
        <svg nxBadgeRightIcon [nxIcon]="phX"></svg>
      </span>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Status');
    const svgs = badge.querySelectorAll('svg');

    await expect(svgs).toHaveLength(2);
    for (const svg of svgs) {
      const rect = svg.getBoundingClientRect();

      expect(Math.round(rect.width)).toBe(BADGE_ICON_SIZE_PX);
      expect(Math.round(rect.height)).toBe(BADGE_ICON_SIZE_PX);
    }
  },
};

export const WithSvgLoader: Story = {
  render: () => ({
    template: `
      <span nxBadge variant="information" fill="outline" [isCaps]="false">
        <svg nxSpinner nxBadgeLeftIcon role="presentation" aria-hidden="true" [attr.aria-label]="null"></svg>
        Loading
      </span>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Loading');
    const spinner = badge.querySelector('[data-slot="spinner"]');

    if (!(spinner instanceof SVGElement)) {
      throw new Error('Expected loader badge to render a Spinner SVG.');
    }

    const rect = spinner.getBoundingClientRect();

    await expect(spinner).toHaveAttribute('role', 'presentation');
    await expect(spinner).toHaveAttribute('aria-hidden', 'true');
    await expect(spinner).not.toHaveAttribute('aria-label');
    expect(Math.round(rect.width)).toBe(BADGE_ICON_SIZE_PX);
    expect(Math.round(rect.height)).toBe(BADGE_ICON_SIZE_PX);
  },
};

export const NumberBadgeHighValue: Story = {
  globals: { density: 'default' },
  render: () => ({
    template: '<span nxBadge isNumber variant="error">99+</span>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('99+');
    const rect = badge.getBoundingClientRect();

    await expect(badge).toHaveAttribute('data-number', 'true');
    expect(Math.round(rect.height)).toBe(BADGE_SIZE_PX);
    expect(Math.round(rect.width)).toBeGreaterThan(BADGE_SIZE_PX);
  },
};

export const LongContent: Story = {
  render: () => ({
    template:
      '<span nxBadge [isCaps]="false">This is a very long badge text</span>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('This is a very long badge text');

    await expect(badge).toBeInTheDocument();
  },
};
