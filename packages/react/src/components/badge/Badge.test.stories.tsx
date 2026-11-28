import { DENSITY_OPTIONS } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { expectTextFits } from '../../stories/support/story-height-test-utils';

import { Badge } from './badge';
import badgeMeta, {
  IconOnly,
  NumberBadgeHighValue,
  OutlineFill,
  WithBothIcons,
  WithSvgLoader,
} from './Badge.stories';

const meta: Meta<typeof Badge> = {
  ...badgeMeta,
  title: 'Tests/Badge',
};

export default meta;
type Story = StoryObj<typeof Badge>;

// `nx:min-h-6` / `nx:w-6` at `density: default`.
const BADGE_SIZE_PX = 24;
// `nx:size-icon-glyph-sm` icon slot.
const BADGE_ICON_SIZE_PX = 14;

export const OutlineFillStyle: Story = {
  ...OutlineFill,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Outline');
    const badgeStyles = getComputedStyle(badge);

    // Assert the rendered result (opaque fill + visible border), not the
    // utility class names — class names are implementation detail and mergeable.
    expect(badgeStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(parseFloat(badgeStyles.borderTopWidth)).toBeGreaterThan(0);
  },
};

export const WithBothIconsSize: Story = {
  ...WithBothIcons,
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

export const IconOnlySize: Story = {
  ...IconOnly,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('img', { name: 'Approved' });
    const svg = badge.querySelector('svg');
    const rect = badge.getBoundingClientRect();

    if (!(svg instanceof SVGElement)) {
      throw new Error('Expected icon-only badge to render an SVG icon.');
    }

    const svgRect = svg.getBoundingClientRect();

    expect(Math.round(rect.height)).toBe(BADGE_SIZE_PX);
    expect(Math.round(rect.width)).toBeGreaterThanOrEqual(BADGE_SIZE_PX);
    expect(Math.round(svgRect.width)).toBe(BADGE_ICON_SIZE_PX);
    expect(Math.round(svgRect.height)).toBe(BADGE_ICON_SIZE_PX);
  },
};

export const WithSvgLoaderSize: Story = {
  ...WithSvgLoader,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Loading');
    const spinner = badge.querySelector('[data-slot="spinner"]');

    if (!(spinner instanceof SVGElement)) {
      throw new Error('Expected loader badge to render a Spinner SVG.');
    }

    const rect = spinner.getBoundingClientRect();

    expect(Math.round(rect.width)).toBe(BADGE_ICON_SIZE_PX);
    expect(Math.round(rect.height)).toBe(BADGE_ICON_SIZE_PX);
  },
};

export const NumberBadgeHighValueSize: Story = {
  ...NumberBadgeHighValue,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('99+');
    const rect = badge.getBoundingClientRect();

    expect(Math.round(rect.height)).toBe(BADGE_SIZE_PX);
    expect(Math.round(rect.width)).toBeGreaterThan(BADGE_SIZE_PX);
  },
};

const DENSITIES = DENSITY_OPTIONS.map((option) => option.value);

export const TextFitsAtEveryDensity: Story = {
  // Text is tallest at the Larger UI scale, so it fits at every smaller one.
  globals: { uiScale: 'larger' },
  render: () => (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-3">
      {DENSITIES.map((density) => (
        <div
          key={density}
          data-density={density}
          data-testid={`row-${density}`}
          className="nx:flex nx:gap-2"
        >
          <Badge>Beta</Badge>
          <Badge isCaps={false}>New</Badge>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const density of DENSITIES) {
      const row = within(canvas.getByTestId(`row-${density}`));
      // Caps and sentence-case text fit inside the border at every density.
      for (const element of [row.getByText('Beta'), row.getByText('New')]) {
        await expectTextFits(element);
      }
    }
  },
};
