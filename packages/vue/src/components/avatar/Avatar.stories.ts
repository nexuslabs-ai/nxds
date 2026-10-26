import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { IconUser } from '@tabler/icons-vue';
import { expect, waitFor, within } from 'storybook/test';
import type { PropType } from 'vue';

import { STARTER_AVATARS } from '../../stories/support/avatar-fixtures';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  AvatarStatus,
} from '.';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Avatar shows a person's profile image, with initials as the fallback. Use AvatarGroup to stack several people and AvatarStatus to show presence.",
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
      description: 'Diameter, from 20px (`2xs`) to 96px (`4xl`).',
    },
    shape: {
      control: 'select',
      options: ['circle', 'rounded'],
      description: 'Circle or rounded square.',
    },
    ring: {
      control: 'boolean',
      description: 'Adds a non-interactive emphasis ring.',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const AVATAR_SIZES = [
  '2xs',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
] as const;

const STATUS_VALUES = ['online', 'away', 'busy', 'offline'] as const;

// The 5 starter portraits double as the demo team roster.
const TEAM = STARTER_AVATARS;

// Default single-avatar fixture (Ada) for the shape / state stories.
const AVATAR_URL = STARTER_AVATARS[0].src;

// Deliberately wide (2:1) source so CroppedImage can demonstrate object-fit: cover.
const WIDE_AVATAR_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 90">
    <rect width="180" height="90" fill="#ddd6fe"/>
    <circle cx="45" cy="45" r="28" fill="#a78bfa"/>
    <rect x="88" y="16" width="68" height="58" rx="12" fill="#7c3aed"/>
  </svg>
`)}`;

function avatarLabel(size: (typeof AVATAR_SIZES)[number]) {
  if (size === '2xs') return '2X';
  if (size === 'xs') return 'XS';
  return size.toUpperCase();
}

const avatarComponents = {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  AvatarStatus,
};

const TeamAvatar = {
  components: avatarComponents,
  props: {
    person: {
      type: Object as PropType<{ name: string; initials: string; src: string }>,
      required: true,
    },
    status: {
      type: String as PropType<(typeof STATUS_VALUES)[number]>,
      default: undefined,
    },
  },
  template: `
    <Avatar>
      <AvatarImage :src="person.src" :alt="person.name" />
      <AvatarFallback>{{ person.initials }}</AvatarFallback>
      <AvatarStatus v-if="status" :status="status" />
    </Avatar>
  `,
};

// Docs stories: the docs site shows these, in this order.

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Avatar, AvatarFallback, AvatarImage },
    template: `
      <Avatar>
        <AvatarImage src="/avatars/ada.svg" alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    `,
  }),
};

export const StatusVariants: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show online, away, busy and offline presence dots.',
      },
    },
  },
  render: () => ({
    components: { Avatar, AvatarFallback, AvatarStatus },
    setup: () => ({
      people: [
        { initials: 'AL', status: 'online' },
        { initials: 'GH', status: 'away' },
        { initials: 'KJ', status: 'busy' },
        { initials: 'MJ', status: 'offline' },
      ] as const,
    }),
    template: `
      <div class="nx:flex nx:items-center nx:gap-4">
        <Avatar v-for="person in people" :key="person.status" size="lg">
          <AvatarFallback>{{ person.initials }}</AvatarFallback>
          <AvatarStatus :status="person.status" />
        </Avatar>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Each status carries a visually-hidden label, so presence is announced
    // rather than conveyed by colour alone (WCAG 1.4.1).
    for (const label of ['Online', 'Away', 'Busy', 'Offline']) {
      await expect(canvas.getByText(label)).toBeInTheDocument();
    }
  },
};

export const GroupWithMax: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Collapse extra avatars into a +N tile with `max`.',
      },
    },
  },
  render: () => ({
    components: {
      Avatar,
      AvatarFallback,
      AvatarGroup,
      AvatarImage,
      AvatarStatus,
    },
    setup: () => ({
      people: [
        {
          name: 'Ada Lovelace',
          initials: 'AL',
          src: '/avatars/ada.svg',
          status: 'online',
        },
        {
          name: 'Grace Hopper',
          initials: 'GH',
          src: '/avatars/grace.svg',
          status: 'away',
        },
        {
          name: 'Katherine Johnson',
          initials: 'KJ',
          src: '/avatars/katherine.svg',
          status: 'busy',
        },
        {
          name: 'Mary Jackson',
          initials: 'MJ',
          src: '/avatars/mary.svg',
          status: 'offline',
        },
        {
          name: 'Dorothy Vaughan',
          initials: 'DV',
          src: '/avatars/dorothy.svg',
          status: 'online',
        },
      ] as const,
    }),
    template: `
      <AvatarGroup :max="3" role="group" aria-label="Project team">
        <Avatar v-for="person in people" :key="person.name">
          <AvatarImage :src="person.src" :alt="person.name" />
          <AvatarFallback>{{ person.initials }}</AvatarFallback>
          <AvatarStatus :status="person.status" />
        </Avatar>
      </AvatarGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Project team' });
    const avatars = group.querySelectorAll('[data-slot="avatar"]');

    await expect(avatars).toHaveLength(4);
    await expect(canvas.getByText('+2')).toBeInTheDocument();
    // The overflow tile announces its count instead of a bare "+2" glyph.
    await expect(
      canvas.getByRole('img', { name: '2 more' })
    ).toBeInTheDocument();
  },
};

export const AllSizes: Story = {
  tags: ['docs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Compare every size, both shapes and the fallback states.',
      },
    },
  },
  render: () => ({
    components: {
      Avatar,
      AvatarFallback,
      AvatarGroup,
      AvatarImage,
      AvatarStatus,
      IconUser,
    },
    setup: () => ({
      sizes: [
        '2xs',
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
        '2xl',
        '3xl',
        '4xl',
      ] as const,
      people: [
        {
          name: 'Ada Lovelace',
          initials: 'AL',
          src: '/avatars/ada.svg',
          status: 'online',
        },
        {
          name: 'Grace Hopper',
          initials: 'GH',
          src: '/avatars/grace.svg',
          status: 'away',
        },
        {
          name: 'Katherine Johnson',
          initials: 'KJ',
          src: '/avatars/katherine.svg',
          status: 'busy',
        },
        {
          name: 'Mary Jackson',
          initials: 'MJ',
          src: '/avatars/mary.svg',
          status: 'offline',
        },
        {
          name: 'Dorothy Vaughan',
          initials: 'DV',
          src: '/avatars/dorothy.svg',
          status: 'online',
        },
      ] as const,
    }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-8">
        <div>
          <h3 class="nx:mb-4 nx:typography-label-default nx:text-foreground">All Sizes (Circle)</h3>
          <div class="nx:flex nx:items-end nx:gap-4">
            <div v-for="size in sizes" :key="size" class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Avatar :size="size">
                <AvatarImage src="/avatars/ada.svg" :alt="'Ada Lovelace ' + size" />
                <AvatarFallback>{{ size === '2xs' ? '2X' : size.toUpperCase() }}</AvatarFallback>
              </Avatar>
              <span class="nx:typography-label-small nx:text-muted-foreground">{{ size }}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="nx:mb-4 nx:typography-label-default nx:text-foreground">Shapes</h3>
          <div class="nx:flex nx:items-center nx:gap-4">
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Avatar size="xl" shape="circle">
                <AvatarImage src="/avatars/ada.svg" alt="Ada Lovelace circle" />
                <AvatarFallback>AL</AvatarFallback>
              </Avatar>
              <span class="nx:typography-label-small nx:text-muted-foreground">circle</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Avatar size="xl" shape="rounded">
                <AvatarImage src="/avatars/ada.svg" alt="Ada Lovelace rounded" />
                <AvatarFallback>AL</AvatarFallback>
              </Avatar>
              <span class="nx:typography-label-small nx:text-muted-foreground">rounded</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="nx:mb-4 nx:typography-label-default nx:text-foreground">Fallback States</h3>
          <div class="nx:flex nx:items-center nx:gap-4">
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Avatar size="xl" role="img" aria-label="Ada Lovelace">
                <AvatarFallback aria-hidden="true">AL</AvatarFallback>
              </Avatar>
              <span class="nx:typography-label-small nx:text-muted-foreground">Initials</span>
            </div>
            <div class="nx:flex nx:flex-col nx:items-center nx:gap-2">
              <Avatar size="xl" role="img" aria-label="Unknown user">
                <AvatarFallback aria-hidden="true">
                  <IconUser aria-hidden="true" class="nx:size-6" />
                </AvatarFallback>
              </Avatar>
              <span class="nx:typography-label-small nx:text-muted-foreground">Icon</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="nx:mb-4 nx:typography-label-default nx:text-foreground">Status, Ring, and Group</h3>
          <div class="nx:flex nx:flex-wrap nx:items-center nx:gap-6">
            <Avatar size="xl" ring>
              <AvatarImage src="/avatars/ada.svg" alt="Ada Lovelace selected" />
              <AvatarFallback>AL</AvatarFallback>
              <AvatarStatus status="online" />
            </Avatar>
            <AvatarGroup :max="3">
              <Avatar v-for="person in people" :key="person.name">
                <AvatarImage :src="person.src" :alt="person.name" />
                <AvatarFallback>{{ person.initials }}</AvatarFallback>
                <AvatarStatus :status="person.status" />
              </Avatar>
            </AvatarGroup>
          </div>
        </div>
      </div>
    `,
  }),
};

// Behaviour stories: tests and Storybook only.

export const WithFallback: Story = {
  render: () => ({
    components: avatarComponents,
    template: `
      <Avatar role="img" aria-label="Ada Lovelace">
        <AvatarImage src="/broken-image.jpg" alt="" />
        <AvatarFallback aria-hidden="true">AL</AvatarFallback>
      </Avatar>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    components: { ...avatarComponents, IconUser },
    template: `
      <Avatar role="img" aria-label="Unknown user">
        <AvatarFallback aria-hidden="true">
          <IconUser aria-hidden="true" class="nx:size-5" />
        </AvatarFallback>
      </Avatar>
    `,
  }),
};

export const CroppedImage: Story = {
  render: () => ({
    components: avatarComponents,
    setup: () => ({ src: WIDE_AVATAR_URL }),
    template: `
      <Avatar size="4xl" shape="rounded">
        <AvatarImage :src="src" alt="Wide portrait crop" />
        <AvatarFallback>WC</AvatarFallback>
      </Avatar>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByAltText('Wide portrait crop');

    // Reka mounts the <img> hidden until it loads.
    await waitFor(() => expect(image).toBeVisible());
    await expect(getComputedStyle(image).objectFit).toBe('cover');
  },
};

export const ShapeRounded: Story = {
  render: () => ({
    components: avatarComponents,
    setup: () => ({ src: AVATAR_URL }),
    template: `
      <Avatar shape="rounded">
        <AvatarImage :src="src" alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    `,
  }),
};

export const WithStatus: Story = {
  render: () => ({
    components: avatarComponents,
    setup: () => ({ sizes: AVATAR_SIZES, src: AVATAR_URL, avatarLabel }),
    template: `
      <div class="nx:flex nx:items-end nx:gap-4">
        <Avatar v-for="size in sizes" :key="size" :size="size">
          <AvatarImage :src="src" :alt="'Ada Lovelace ' + size" />
          <AvatarFallback>{{ avatarLabel(size) }}</AvatarFallback>
          <AvatarStatus />
        </Avatar>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const statuses = canvasElement.querySelectorAll(
      '[data-slot="avatar-status"]'
    );

    await expect(statuses).toHaveLength(AVATAR_SIZES.length);
    await expect(statuses[0]).toHaveAttribute('data-status', 'online');
    // The dot is announced (not aria-hidden): it carries a visually-hidden label.
    await expect(statuses[0]).not.toHaveAttribute('aria-hidden');
    await expect(statuses[0]).toHaveTextContent('Online');
  },
};

export const WithRing: Story = {
  render: () => ({
    components: avatarComponents,
    setup: () => ({ src: AVATAR_URL }),
    template: `
      <Avatar ring>
        <AvatarImage :src="src" alt="Ada Lovelace" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    `,
  }),
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[data-slot="avatar"]');

    await expect(avatar).toHaveAttribute('data-ring', 'true');
  },
};

export const GroupSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Set `size` on AvatarGroup to size every member and the +N tile together.',
      },
    },
  },
  render: () => ({
    components: { AvatarGroup, TeamAvatar },
    setup: () => ({ sizes: ['sm', 'md', 'lg'] as const, team: TEAM }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-6">
        <AvatarGroup
          v-for="size in sizes"
          :key="size"
          :size="size"
          :max="3"
          role="group"
          :aria-label="'Project team ' + size"
        >
          <TeamAvatar v-for="person in team" :key="person.name" :person="person" />
        </AvatarGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lgGroup = canvas.getByRole('group', { name: 'Project team lg' });
    const avatars = lgGroup.querySelectorAll('[data-slot="avatar"]');

    // Members inherit the group size through the TeamAvatar wrapper (inject).
    await expect(avatars[0]).toHaveAttribute('data-size', 'lg');
    // The +N overflow tile inherits it too — no hardcoded md mismatch.
    const overflow = within(lgGroup)
      .getByText('+2')
      .closest('[data-slot="avatar"]');
    await expect(overflow).toHaveAttribute('data-size', 'lg');
  },
};

export const OnContainerSurface: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'On a card in dark mode, `surface-container` makes the avatar rings match the card instead of the page.',
      },
    },
  },
  globals: { mode: 'dark' },
  render: () => ({
    components: { Avatar, AvatarFallback, AvatarGroup, TeamAvatar },
    setup: () => ({ team: TEAM, statuses: STATUS_VALUES }),
    template: `
      <div data-testid="page" class="nx:bg-background nx:p-6">
        <div
          data-testid="card"
          class="nx:flex nx:items-center nx:gap-6 nx:rounded-xl nx:bg-container nx:p-6 nx:surface-container"
        >
          <AvatarGroup :max="4" role="group" aria-label="Team on a card">
            <TeamAvatar
              v-for="(person, index) in team"
              :key="person.name"
              :person="person"
              :status="statuses[index % statuses.length]"
            />
          </AvatarGroup>
          <Avatar ring data-testid="ring-avatar">
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('card');
    const styleOf = (element: Element) => window.getComputedStyle(element);

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    const surface = styleOf(card).backgroundColor;
    // Only a surface that differs from `background` can catch a ring that
    // fell back to `background`.
    await expect(surface).not.toBe(
      styleOf(canvas.getByTestId('page')).backgroundColor
    );

    const rings = card.querySelectorAll<HTMLElement>(
      '[data-slot="avatar"]:not([data-ring]), [data-slot="avatar-status"]'
    );
    await expect(rings.length).toBeGreaterThan(0);
    for (const ring of rings) {
      await expect(styleOf(ring).getPropertyValue('--tw-ring-color')).toBe(
        surface
      );
    }

    await expect(
      styleOf(canvas.getByTestId('ring-avatar')).getPropertyValue(
        '--tw-ring-offset-color'
      )
    ).toBe(surface);
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: avatarComponents,
    setup: () => ({ src: AVATAR_URL }),
    template: `
      <div class="nx:flex nx:items-center nx:gap-4">
        <Avatar size="lg" shape="rounded" ring data-testid="configured-avatar">
          <AvatarImage :src="src" alt="Ada Lovelace" />
          <AvatarFallback>AL</AvatarFallback>
          <AvatarStatus status="busy" />
        </Avatar>
        <Avatar role="img" aria-label="Default avatar">
          <AvatarFallback aria-hidden="true">AL</AvatarFallback>
        </Avatar>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByAltText('Ada Lovelace');
    const avatar = canvas.getByTestId('configured-avatar');
    const defaultAvatar = canvas.getByRole('img', { name: 'Default avatar' });
    const status = canvasElement.querySelector('[data-slot="avatar-status"]');

    // Reka mounts the <img> hidden until it loads.
    await waitFor(() => expect(image).toBeVisible());
    await expect(avatar).toBeInTheDocument();
    await expect(avatar).toHaveAttribute('data-size', 'lg');
    await expect(avatar).toHaveAttribute('data-shape', 'rounded');
    await expect(avatar).toHaveAttribute('data-ring', 'true');
    await expect(image).toHaveAttribute('data-slot', 'avatar-image');
    await expect(image).toHaveAttribute('decoding', 'async');
    await expect(status).toHaveAttribute('data-status', 'busy');

    // With size/shape omitted, the cva defaults still surface on the data hooks.
    await expect(defaultAvatar).toHaveAttribute('data-size', 'md');
    await expect(defaultAvatar).toHaveAttribute('data-shape', 'circle');
    // Initials scale with the avatar diameter, so md renders at the base size.
    await expect(defaultAvatar).toHaveStyle({
      fontSize: getComputedStyle(document.documentElement)
        .getPropertyValue('--nx-typography-size-base')
        .trim(),
    });
  },
};
