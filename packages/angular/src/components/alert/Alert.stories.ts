import {
  phosphorCheckCircle,
  phosphorInfo,
  phosphorWarning,
  phosphorWarningCircle,
} from '@ng-icons/phosphor-icons/regular';
import {
  type Meta,
  moduleMetadata,
  type StoryObj,
} from '@storybook/angular-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { NxIcon, trustIconMarkup } from '../../lib/icon';
import { NxButton } from '../button/button';

import {
  NxAlert,
  NxAlertActions,
  NxAlertClose,
  NxAlertContent,
  NxAlertDescription,
  NxAlertIcon,
  NxAlertTitle,
} from './alert';

const VARIANTS = [
  'default',
  'destructive',
  'success',
  'information',
  'warning',
] as const;

const icons = {
  phCheckCircle: trustIconMarkup(phosphorCheckCircle),
  phInfo: trustIconMarkup(phosphorInfo),
  phWarning: trustIconMarkup(phosphorWarning),
  phWarningCircle: trustIconMarkup(phosphorWarningCircle),
};

type AlertArgs = {
  variant: (typeof VARIANTS)[number];
  presentation: 'card' | 'banner';
  layout: 'stack' | 'inline';
};

const meta: Meta<AlertArgs> = {
  title: 'Components/Alert',
  parameters: {
    docs: {
      description: {
        component:
          'Alert shows a status message inside the page. Use it for information, success, warning and error messages. Compose the icon, text, actions and close button as children.',
      },
    },
  },
  component: NxAlert,
  decorators: [
    moduleMetadata({
      imports: [
        NxAlert,
        NxAlertActions,
        NxAlertClose,
        NxAlertContent,
        NxAlertDescription,
        NxAlertIcon,
        NxAlertTitle,
        NxButton,
        NxIcon,
      ],
    }),
  ],
  args: {
    variant: 'default',
    presentation: 'card',
    layout: 'stack',
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    presentation: { control: 'select', options: ['card', 'banner'] },
    layout: { control: 'select', options: ['stack', 'inline'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div nxAlert [variant]="variant" [presentation]="presentation" [layout]="layout" class="nx:max-w-lg">
        <div nxAlertTitle>Heads up</div>
        <div nxAlertDescription>Your trial ends in three days.</div>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<AlertArgs>;

// Docs stories: the docs site shows these, in this order.

export const WithIcon: Story = {
  tags: ['docs'],
  render: () => ({
    props: icons,
    template: `
      <div nxAlert class="nx:max-w-md">
        <span nxAlertIcon><svg [nxIcon]="phInfo"></svg></span>
        <div nxAlertTitle>Information</div>
        <div nxAlertDescription>This is an informational alert with an icon.</div>
      </div>
    `,
  }),
};

export const BannerPresentation: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Show a full-width banner with square corners and a bottom border.',
      },
    },
  },
  render: () => ({
    props: icons,
    template: `
      <div nxAlert variant="information" presentation="banner" class="nx:max-w-md">
        <span nxAlertIcon><svg [nxIcon]="phInfo"></svg></span>
        <div nxAlertTitle>Information</div>
        <div nxAlertDescription>New workspace invitations are available for review.</div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-variant', 'information');
    await expect(alert).toHaveAttribute('data-presentation', 'banner');
  },
};

export const DismissibleCloseButton: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Remove the alert from state when the reader clicks `nxAlertClose`.',
      },
    },
  },
  render: () => ({
    props: { ...icons, visible: true },
    template: `
      @if (visible) {
      <div nxAlert variant="information" layout="inline" class="nx:max-w-xl">
        <span nxAlertIcon><svg [nxIcon]="phInfo"></svg></span>
        <div nxAlertContent>
          <div nxAlertTitle>Invite ready</div>
          <div nxAlertDescription>The workspace invitation can now be sent.</div>
        </div>
        <div nxAlertActions>
          <button nxAlertClose (click)="visible = false"></button>
        </div>
      </div>
      } @else {
      <div data-testid="dismissed-alert"></div>
      }
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvasElement.querySelector('[data-slot="alert"]');
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-layout', 'inline');
    await userEvent.click(close);
    await waitFor(() => {
      expect(
        canvasElement.querySelector('[data-slot="alert"]')
      ).not.toBeInTheDocument();
    });
  },
};

export const ActionsBelowDescription: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Place two Button actions under the message in the stack layout.',
      },
    },
  },
  render: () => ({
    props: icons,
    template: `
      <div nxAlert variant="warning" class="nx:max-w-md">
        <span nxAlertIcon><svg [nxIcon]="phWarning"></svg></span>
        <div nxAlertContent>
          <div nxAlertTitle>Plan limit reached</div>
          <div nxAlertDescription>Upgrade the workspace or remove unused seats before inviting more members.</div>
        </div>
        <div nxAlertActions>
          <button nxButton>Upgrade</button>
          <button nxButton variant="outline">View usage</button>
        </div>
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
        story: 'Compare the five status variants side by side.',
      },
    },
  },
  render: () => ({
    props: icons,
    template: `
      <div class="nx:flex nx:flex-col nx:gap-6">
        <div>
          <div class="nx:mb-4 nx:typography-label-default nx:text-foreground">Default</div>
          <div nxAlert class="nx:max-w-md">
            <span nxAlertIcon><svg [nxIcon]="phInfo"></svg></span>
            <div nxAlertTitle>Default Alert</div>
            <div nxAlertDescription>This is a default informational alert.</div>
          </div>
        </div>
        <div>
          <div class="nx:mb-4 nx:typography-label-default nx:text-foreground">Information</div>
          <div nxAlert variant="information" class="nx:max-w-md">
            <span nxAlertIcon><svg [nxIcon]="phInfo"></svg></span>
            <div nxAlertTitle>Information Alert</div>
            <div nxAlertDescription>This is an informational alert.</div>
          </div>
        </div>
        <div>
          <div class="nx:mb-4 nx:typography-label-default nx:text-foreground">Destructive</div>
          <div nxAlert variant="destructive" class="nx:max-w-md">
            <span nxAlertIcon><svg [nxIcon]="phWarningCircle"></svg></span>
            <div nxAlertTitle>Destructive Alert</div>
            <div nxAlertDescription>This is a destructive/error alert.</div>
          </div>
        </div>
        <div>
          <div class="nx:mb-4 nx:typography-label-default nx:text-foreground">Success</div>
          <div nxAlert variant="success" class="nx:max-w-md">
            <span nxAlertIcon><svg [nxIcon]="phCheckCircle"></svg></span>
            <div nxAlertTitle>Success Alert</div>
            <div nxAlertDescription>This is a success alert.</div>
          </div>
        </div>
        <div>
          <div class="nx:mb-4 nx:typography-label-default nx:text-foreground">Warning</div>
          <div nxAlert variant="warning" class="nx:max-w-md">
            <span nxAlertIcon><svg [nxIcon]="phWarning"></svg></span>
            <div nxAlertTitle>Warning Alert</div>
            <div nxAlertDescription>This is a warning alert.</div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const Default: Story = {};

const dataAttribute = (name: string) => `data-${name}`;
const DATA_DENSITY_ATTRIBUTE = dataAttribute('density');

export const DisabledClose: Story = {
  render: () => ({
    props: icons,
    template: `
      <div nxAlert variant="success" layout="inline" class="nx:max-w-2xl">
        <span nxAlertIcon><svg [nxIcon]="phCheckCircle"></svg></span>
        <div nxAlertContent>
          <div nxAlertTitle>Deployment complete</div>
          <div nxAlertDescription>Version 2.4.0 is live in the production environment.</div>
        </div>
        <div nxAlertActions>
          <button nxButton variant="outline">View release</button>
          <button nxAlertClose disabled></button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    await expect(close).toBeDisabled();

    // Disabled close uses a semantic text token at full opacity (not a fade).
    await expect(close).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(close).opacity).toBe('1');
  },
};

export const HelperBanner: Story = {
  render: () => ({
    props: icons,
    template: `
      <div nxAlert variant="information" layout="inline" presentation="banner" class="nx:max-w-3xl">
        <span nxAlertIcon><svg [nxIcon]="phInfo"></svg></span>
        <div nxAlertContent>
          <div nxAlertDescription>
            Scheduled maintenance begins at 9 PM.
            <a class="nx:font-medium nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline" href="/status">View status</a>
          </div>
        </div>
        <div nxAlertActions>
          <button nxAlertClose ></button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveAttribute('data-layout', 'inline');
  },
};

export const TextCloseLabel: Story = {
  render: () => ({
    props: icons,
    template: `
      <div nxAlert variant="information" layout="inline" class="nx:max-w-xl">
        <span nxAlertIcon><svg [nxIcon]="phInfo"></svg></span>
        <div nxAlertContent>
          <div nxAlertTitle>Text close control</div>
          <div nxAlertDescription>Text children self-label, so the button keeps its visible name.</div>
        </div>
        <div nxAlertActions>
          <button nxAlertClose class="nx:size-auto nx:px-2 nx:typography-label-small">Close</button>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Close' });

    await expect(close).toBeInTheDocument();
    await expect(close).not.toHaveAttribute('aria-label');
  },
};

export const TitleAsHeading: Story = {
  render: () => ({
    template: `
      <div nxAlert class="nx:max-w-md">
        <h2 nxAlertTitle>Semantic heading</h2>
        <div nxAlertDescription>Use this pattern when the alert title belongs in the page outline.</div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {
      name: 'Semantic heading',
    });

    await expect(heading).toBeInTheDocument();
    await expect(heading).toHaveAttribute('data-slot', 'alert-title');
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    props: icons,
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <div nxAlert variant="destructive" class="nx:max-w-md">
          <div nxAlertTitle>Test Alert</div>
          <div nxAlertDescription>Testing data attributes.</div>
        </div>
        <div nxAlert variant="warning" layout="inline" class="nx:max-w-xl">
          <span nxAlertIcon><svg [nxIcon]="phWarning"></svg></span>
          <div nxAlertContent>
            <div nxAlertTitle>Storage almost full</div>
            <div nxAlertDescription>Uploads may fail soon.</div>
          </div>
          <div nxAlertActions>
            <button nxButton variant="outline">Manage</button>
            <button nxAlertClose ></button>
          </div>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const [alert, inlineAlert] = canvasElement.querySelectorAll(
      '[data-slot="alert"]'
    );
    const title = canvasElement.querySelector('[data-slot="alert-title"]');
    const description = canvasElement.querySelector(
      '[data-slot="alert-description"]'
    );
    const content = canvasElement.querySelector('[data-slot="alert-content"]');
    const actions = canvasElement.querySelector('[data-slot="alert-actions"]');
    const close = canvasElement.querySelector('[data-slot="alert-close"]');

    await expect(alert).toHaveAttribute('data-variant', 'destructive');
    await expect(alert).toHaveAttribute('data-presentation', 'card');
    await expect(alert).toHaveAttribute('data-layout', 'stack');
    await expect(alert).not.toHaveAttribute(DATA_DENSITY_ATTRIBUTE);
    await expect(alert).not.toHaveAttribute('role');
    await expect(title).toBeInTheDocument();
    await expect(description).toBeInTheDocument();
    await expect(inlineAlert).toHaveAttribute('data-layout', 'inline');
    await expect(content).toBeInTheDocument();
    await expect(actions).toBeInTheDocument();
    await expect(close).toHaveAttribute('type', 'button');
  },
};

export const KeyboardInteraction: Story = {
  render: () => ({
    props: { open: true },
    template: `
      @if (open) {
      <div nxAlert layout="inline" class="nx:max-w-lg">
        <div nxAlertContent><div nxAlertTitle>Saved</div></div>
        <div nxAlertActions><button nxAlertClose (click)="open = false"></button></div>
      </div>
      }
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    await userEvent.tab();
    await expect(close).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.queryByText('Saved')).toBeNull();
  },
};
