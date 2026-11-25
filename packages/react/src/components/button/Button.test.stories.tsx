import {
  ArrowRightIcon,
  DownloadSimpleIcon,
  StarIcon,
} from '@phosphor-icons/react/ssr';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { expectHeightPinned } from '../../stories/support/story-height-test-utils';

import { Button } from './button';
import buttonMeta, {
  DisabledAsLink,
  IconOnlyLoading,
  IconOnlyName,
  IconOnlySizes,
  KeyboardInteraction,
  Loading,
} from './Button.stories';

const meta: Meta<typeof Button> = {
  ...buttonMeta,
  title: 'Tests/Button',
};

export default meta;
type Story = StoryObj<typeof Button>;

export const LinkStyle: Story = {
  render: () => (
    <Button variant="link" data-testid="button-link">
      Link
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Link' });

    await expect(button).toHaveClass('nx:underline-offset-4');
    await expect(button).toHaveClass('nx:hover:underline');
    await expect(button).toHaveClass('nx:border-0');
    await expect(button).toHaveClass('nx:p-0!');
    await expect(button).not.toHaveClass('nx:hover:bg-primary-subtle-hover');
    await expectHeightPinned(canvas, 'button-link', 20);
  },
};

// The square each `size` gives an `iconOnly` button, in px.
const ICON_ONLY_SQUARES = [32, 40, 48];

export const IconOnlySizesSquare: Story = {
  ...IconOnlySizes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');

    await expect(buttons).toHaveLength(ICON_ONLY_SQUARES.length);
    for (const [index, button] of buttons.entries()) {
      const { width, height } = button.getBoundingClientRect();
      await expect(height).toBe(ICON_ONLY_SQUARES[index]);
      await expect(width).toBe(height);
    }
  },
};

export const IconOnlyNameHidden: Story = {
  ...IconOnlyName,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Download' });
    const label = within(button).getByText('Download');

    await expect(label).toHaveClass('nx:sr-only');
    const { width, height } = label.getBoundingClientRect();
    await expect(width).toBeLessThanOrEqual(1);
    await expect(height).toBeLessThanOrEqual(1);
  },
};

export const IconOnlyLoadingSquare: Story = {
  ...IconOnlyLoading,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Download' });
    const { width, height } = button.getBoundingClientRect();

    await expect(within(button).getByText('Download')).toHaveClass(
      'nx:sr-only'
    );
    await expect(width).toBe(height);
  },
};

// Each line must fail to compile: `iconOnly` needs a text name and a
// `startIcon`, and refuses `endIcon` and `asChild`.
const _rejectedIconOnlyButtons = [
  // @ts-expect-error An icon-only button needs a name.
  <Button key="no-name" iconOnly startIcon={<StarIcon />} />,
  // @ts-expect-error The name must be text.
  <Button key="node-name" iconOnly startIcon={<StarIcon />}>
    <span>Download</span>
  </Button>,
  // @ts-expect-error An icon-only button needs an icon.
  <Button key="no-icon" iconOnly>
    Download
  </Button>,
  // @ts-expect-error An icon-only button shows one icon.
  <Button
    key="end-icon"
    iconOnly
    startIcon={<StarIcon />}
    endIcon={<ArrowRightIcon />}
  >
    Download
  </Button>,
  // @ts-expect-error asChild can't render an icon-only button.
  <Button key="as-child" iconOnly asChild startIcon={<StarIcon />}>
    Download
  </Button>,
];

// A screen-size switch is one boolean prop.
function _ResponsiveDownload({ isNarrow }: { isNarrow: boolean }) {
  return (
    <Button iconOnly={isNarrow} startIcon={<DownloadSimpleIcon />}>
      Download
    </Button>
  );
}

export const IconSize: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-3">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Button size="sm" startIcon={<DownloadSimpleIcon />}>
          Download
        </Button>
        <Button size="sm" iconOnly startIcon={<StarIcon />}>
          Add to favorites
        </Button>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Button startIcon={<DownloadSimpleIcon />}>Download</Button>
        <Button iconOnly startIcon={<StarIcon />}>
          Add to favorites
        </Button>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Button size="lg" startIcon={<DownloadSimpleIcon />}>
          Download
        </Button>
        <Button size="lg" iconOnly startIcon={<StarIcon />}>
          Add to favorites
        </Button>
      </div>
      <div data-density="compact" className="nx:flex nx:items-center nx:gap-2">
        <Button startIcon={<DownloadSimpleIcon />}>Download</Button>
        <Button iconOnly startIcon={<StarIcon />}>
          Add to favorites
        </Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const iconToken = parseFloat(
      getComputedStyle(canvasElement).getPropertyValue(
        '--nx-icon-glyph-default'
      )
    );
    const icons = canvasElement.querySelectorAll('button svg');
    await expect(icons).toHaveLength(canvas.getAllByRole('button').length);
    for (const svg of icons) {
      const { width, height } = svg.getBoundingClientRect();
      await expect(width).toBe(iconToken);
      await expect(height).toBe(iconToken);
    }
  },
};

export const LoadingLabelHidden: Story = {
  ...Loading,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Submitting' });

    await expect(
      button.querySelector('[data-slot="button-loading-label"]')
    ).toHaveClass('nx:opacity-0');
  },
};

export const KeyboardInteractionFocusRing: Story = {
  ...KeyboardInteraction,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await userEvent.tab();
    await expect(button).toHaveFocus();

    // The ring is a real outline with a transparent 2px gap, so the gap shows
    // whatever surface the button sits on rather than an opaque page-background
    // band painted by a box-shadow.
    const focusStyles = getComputedStyle(button);
    await expect(focusStyles.outlineOffset).toBe('2px');
    await expect(focusStyles.outlineStyle).toBe('solid');
    await expect(focusStyles.outlineWidth).toBe('2px');
    await expect(focusStyles.boxShadow).toBe('none');
  },
};

export const DisabledAsLinkStyle: Story = {
  ...DisabledAsLink,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    // The `aria-disabled:pointer-events-none` class is what stops a click.
    await expect(link).toHaveClass('nx:aria-disabled:pointer-events-none');
    await expect(link).toHaveClass('nx:aria-disabled:opacity-100');
    await expect(link).toHaveClass('nx:aria-disabled:bg-primary-disabled');
  },
};
