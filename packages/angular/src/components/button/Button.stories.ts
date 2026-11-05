import {
  phosphorArrowRight,
  phosphorRocket,
  phosphorStar,
} from '@ng-icons/phosphor-icons/regular';
import {
  type Meta,
  moduleMetadata,
  type StoryObj,
} from '@storybook/angular-vite';
import { expect, fn, type Mock, userEvent, within } from 'storybook/test';

import { iconMarkup, NxIcon } from '../../lib/icon';
import { expectHeightPinned } from '../../stories/support/story-height-test-utils';

import { NxButton, NxButtonEndIcon, NxButtonStartIcon } from './button';

const VARIANTS = [
  'default',
  'error',
  'destructive',
  'outline',
  'dashed',
  'secondary',
  'ghost',
  'link',
] as const;

const icons = {
  arrowRight: iconMarkup(phosphorArrowRight),
  rocket: iconMarkup(phosphorRocket),
  star: iconMarkup(phosphorStar),
};

// `click` is the native element's event, so it is not a declared output.
type ButtonArgs = {
  variant: (typeof VARIANTS)[number];
  size: 'default' | 'sm' | 'lg' | 'icon-sm' | 'icon' | 'icon-lg';
  disabled: boolean;
  loading: boolean;
  onClick: Mock<(event: MouseEvent) => void>;
};

const meta: Meta<ButtonArgs> = {
  title: 'Components/Button',
  parameters: {
    docs: {
      description: {
        component:
          'Button triggers an action. Use it for short, visible labels.\n\n- Use one decorative icon at most: `nxButtonStartIcon` or `nxButtonEndIcon`.\n- A loading button shows only a spinner and hides its icons.\n- Icon-only buttons need `aria-label` or `aria-labelledby`.',
      },
    },
  },
  component: NxButton,
  decorators: [
    moduleMetadata({
      imports: [NxButton, NxButtonStartIcon, NxButtonEndIcon, NxIcon],
    }),
  ],
  args: {
    variant: 'default',
    size: 'default',
    disabled: false,
    loading: false,
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon-sm', 'icon', 'icon-lg'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  render: (args) => ({
    props: args,
    template:
      '<button nxButton [variant]="variant" [size]="size" [disabled]="disabled" [loading]="loading" (click)="onClick($event)">Save changes</button>',
  }),
};

export default meta;
type Story = StoryObj<ButtonArgs>;

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    template: `
      <button nxButton>Button</button>
    `,
  }),
};

export const IconOnlySizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show the three icon-only sizes, each named with `aria-label`.',
      },
    },
  },
  render: () => ({
    props: icons,
    template: `
      <div class="nx:flex nx:items-center nx:gap-2">
        <button nxButton size="icon-sm" aria-label="Small icon"><svg [nxIcon]="star"></svg></button>
        <button nxButton size="icon" aria-label="Default icon"><svg [nxIcon]="star"></svg></button>
        <button nxButton size="icon-lg" aria-label="Large icon"><svg [nxIcon]="star"></svg></button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Small icon' })
    ).toHaveClass('nx:size-8');
    await expect(
      canvas.getByRole('button', { name: 'Default icon' })
    ).toHaveClass('nx:size-10');
    await expect(
      canvas.getByRole('button', { name: 'Large icon' })
    ).toHaveClass('nx:size-12');
  },
};

export const StartIconSlot: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Add a decorative icon before the label with `nxButtonStartIcon`.',
      },
    },
  },
  render: () => ({
    props: icons,
    template: `
      <button nxButton><svg nxButtonStartIcon [nxIcon]="rocket" data-testid="start-icon"></svg>Launch</button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Launch' });
    const startIcon = button.querySelector('[data-slot="button-start-icon"]');

    await expect(startIcon).toBeInTheDocument();
    await expect(startIcon).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByTestId('start-icon')).toBeInTheDocument();
    await expect(button).toHaveAccessibleName('Launch');
  },
};

export const EndIconSlot: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Add a decorative icon after the label with `nxButtonEndIcon`.',
      },
    },
  },
  render: () => ({
    props: icons,
    template: `
      <button nxButton>Continue<svg nxButtonEndIcon [nxIcon]="arrowRight" data-testid="end-icon"></svg></button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Continue' });
    const endIcon = button.querySelector('[data-slot="button-end-icon"]');

    await expect(endIcon).toBeInTheDocument();
    await expect(endIcon).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByTestId('end-icon')).toBeInTheDocument();
    await expect(button).toHaveAccessibleName('Continue');
  },
};

export const AllVariants: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Compare every variant, size, icon slot, disabled and loading state.',
      },
    },
  },
  render: () => ({
    props: icons,
    template: `
      <div class="nx:flex nx:flex-col nx:gap-6">
        <div>
          <h3 class="nx:text-foreground nx:mb-2 nx:typography-label-default">Variants</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <button nxButton variant="default">Default</button>
            <button nxButton variant="secondary">Secondary</button>
            <button nxButton variant="error">Error</button>
            <button nxButton variant="destructive">Destructive</button>
            <button nxButton variant="outline">Outline</button>
            <button nxButton variant="dashed">Dashed</button>
            <button nxButton variant="ghost">Ghost</button>
            <button nxButton variant="link">Link</button>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-2 nx:typography-label-default">Sizes</h3>
          <div class="nx:flex nx:items-center nx:gap-2">
            <button nxButton size="sm">Small</button>
            <button nxButton size="default">Default</button>
            <button nxButton size="lg">Large</button>
            <button nxButton size="icon-sm" aria-label="Small icon"><svg [nxIcon]="star"></svg></button>
            <button nxButton size="icon" aria-label="Icon"><svg [nxIcon]="star"></svg></button>
            <button nxButton size="icon-lg" aria-label="Large icon"><svg [nxIcon]="star"></svg></button>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-2 nx:typography-label-default">Icon slots</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <button nxButton><svg nxButtonStartIcon [nxIcon]="rocket"></svg>Start icon</button>
            <button nxButton>End icon<svg nxButtonEndIcon [nxIcon]="arrowRight"></svg></button>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-2 nx:typography-label-default">Disabled</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <button nxButton variant="default" disabled>Default</button>
            <button nxButton variant="secondary" disabled>Secondary</button>
            <button nxButton variant="error" disabled>Error</button>
            <button nxButton variant="destructive" disabled>Destructive</button>
            <button nxButton variant="outline" disabled>Outline</button>
            <button nxButton variant="dashed" disabled>Dashed</button>
            <button nxButton variant="ghost" disabled>Ghost</button>
            <button nxButton variant="link" disabled>Link</button>
          </div>
        </div>
        <div>
          <h3 class="nx:text-foreground nx:mb-2 nx:typography-label-default">Loading</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-2">
            <button nxButton variant="default" loading>Default</button>
            <button nxButton variant="secondary" loading>Secondary</button>
            <button nxButton variant="error" loading>Error</button>
            <button nxButton variant="destructive" loading>Destructive</button>
            <button nxButton variant="outline" loading>Outline</button>
            <button nxButton variant="dashed" loading>Dashed</button>
          </div>
        </div>
      </div>
    `,
  }),
};

/** A story render that binds the story args, so `args.onClick` stays a spy. */
const labelled = (template: string) => (args: ButtonArgs) => ({
  props: { ...args, ...icons },
  template,
});

export const Link: Story = {
  render: () => ({
    template:
      '<button nxButton variant="link" data-testid="button-link">Link</button>',
  }),
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

export const Disabled: Story = {
  render: labelled(
    '<button nxButton disabled (click)="onClick($event)">Disabled</button>'
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Verify disabled state
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('disabled');

    // Verify onClick was not attached or callable
    // Note: Can't test click with pointer-events: none, disabled state is sufficient
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  render: labelled(`
    <button nxButton loading (click)="onClick($event)"><svg nxButtonStartIcon [nxIcon]="rocket"></svg>Submitting<svg nxButtonEndIcon [nxIcon]="arrowRight"></svg></button>
  `),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Submitting' });
    const loadingLabel = button.querySelector(
      '[data-slot="button-loading-label"]'
    );

    // Loading button should be disabled
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).toHaveAttribute('data-loading', 'true');
    await expect(
      button.querySelector('[data-slot="button-start-icon"]')
    ).not.toBeInTheDocument();
    await expect(
      button.querySelector('[data-slot="button-end-icon"]')
    ).not.toBeInTheDocument();
    await expect(
      button.querySelector('[data-slot="spinner"]')
    ).toBeInTheDocument();
    await expect(loadingLabel).toBeInTheDocument();
    await expect(loadingLabel).toHaveClass('nx:opacity-0');
    await expect(loadingLabel).toHaveTextContent('Submitting');
    await expect(button).toHaveAccessibleName('Submitting');

    // Click should not trigger onClick
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const ClickInteraction: Story = {
  render: labelled(
    '<button nxButton (click)="onClick($event)">Click me</button>'
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Button should be clickable
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Multiple clicks should increment
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const KeyboardInteraction: Story = {
  render: labelled(
    '<button nxButton (click)="onClick($event)">Press Enter</button>'
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).not.toHaveFocus();

    // Tab to focus
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

    // Enter triggers click
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // Space triggers click
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);

    // Shift+Tab should blur
    await userEvent.tab({ shift: true });
    await expect(button).not.toHaveFocus();
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    template: `
      <div class="nx:flex nx:flex-wrap nx:gap-2">
        <button nxButton>Default attrs</button>
        <button nxButton variant="secondary" size="lg">Explicit attrs</button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const defaultButton = canvas.getByRole('button', {
      name: 'Default attrs',
    });
    const explicitButton = canvas.getByRole('button', {
      name: 'Explicit attrs',
    });

    await expect(defaultButton).toHaveAttribute('data-slot', 'button');
    await expect(defaultButton).toHaveAttribute('data-variant', 'default');
    await expect(defaultButton).toHaveAttribute('data-size', 'default');
    await expect(defaultButton).toHaveAttribute('type', 'button');
    await expect(explicitButton).toHaveAttribute('data-slot', 'button');
    await expect(explicitButton).toHaveAttribute('data-variant', 'secondary');
    await expect(explicitButton).toHaveAttribute('data-size', 'lg');
  },
};

export const AsLink: Story = {
  render: labelled(
    '<a nxButton href="https://example.com" (click)="onClick($event)">Visit Website</a>'
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).toHaveAttribute('href', 'https://example.com');
    await expect(link).toHaveAttribute('data-slot', 'button');
  },
};

export const DisabledAsLink: Story = {
  render: labelled(
    '<a nxButton disabled href="#disabled-as-link">Disabled link</a>'
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    // A disabled link is best-effort: an <a> ignores native `disabled`, so
    // non-interactivity comes from aria-disabled + tabIndex=-1 + the
    // aria-disabled:pointer-events-none class (no JS click guard).
    await expect(link).not.toHaveAttribute('disabled');
    await expect(link).not.toHaveAttribute('type');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).toHaveAttribute('tabindex', '-1');
    await expect(link).toHaveClass('nx:aria-disabled:pointer-events-none');
    await expect(link).toHaveClass('nx:aria-disabled:opacity-100');
    await expect(link).toHaveClass('nx:aria-disabled:bg-primary-disabled');
  },
};
