import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey } from 'vue';

import type { AvatarGroupProps } from './AvatarGroup.vue';

export { default as Avatar, type AvatarProps } from './Avatar.vue';
export {
  default as AvatarFallback,
  type AvatarFallbackProps,
} from './AvatarFallback.vue';
export {
  default as AvatarGroup,
  type AvatarGroupProps,
} from './AvatarGroup.vue';
export {
  default as AvatarImage,
  type AvatarImageProps,
} from './AvatarImage.vue';
export {
  default as AvatarStatus,
  type AvatarStatusProps,
} from './AvatarStatus.vue';

// Avatar falls back to this for `size`/`shape` when its own prop is unset.
export const AvatarGroupKey: InjectionKey<
  Pick<AvatarGroupProps, 'size' | 'shape'>
> = Symbol('avatar-group');

export const avatarVariants = cva(
  'nx:relative nx:flex nx:shrink-0 nx:after:pointer-events-none nx:after:absolute nx:after:inset-0 nx:after:rounded-[inherit] nx:after:outline nx:after:outline-1 nx:after:-outline-offset-1 nx:after:outline-border-hairline',
  {
    variants: {
      size: {
        '2xs':
          'nx:size-5 nx:text-[length:calc(var(--nx-typography-size-base)*0.625)]',
        xs: 'nx:size-6 nx:text-[length:calc(var(--nx-typography-size-base)*0.6875)]',
        sm: 'nx:size-8 nx:text-[length:calc(var(--nx-typography-size-base)*0.75)]',
        md: 'nx:size-10 nx:text-[length:calc(var(--nx-typography-size-base)*1)]',
        lg: 'nx:size-12 nx:text-[length:calc(var(--nx-typography-size-base)*1.125)]',
        xl: 'nx:size-14 nx:text-[length:calc(var(--nx-typography-size-base)*1.25)]',
        '2xl':
          'nx:size-16 nx:text-[length:calc(var(--nx-typography-size-base)*1.5)]',
        '3xl':
          'nx:size-20 nx:text-[length:calc(var(--nx-typography-size-base)*1.875)]',
        '4xl':
          'nx:size-24 nx:text-[length:calc(var(--nx-typography-size-base)*2.25)]',
      },
      shape: {
        circle: 'nx:rounded-full',
        rounded: 'nx:rounded-lg',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'circle',
    },
  }
);

export const avatarStatusVariants = cva(
  'nx:absolute nx:right-[0.04em] nx:bottom-[0.04em] nx:size-[0.6em] nx:rounded-full nx:ring-[0.1em] nx:ring-surface',
  {
    variants: {
      status: {
        online: 'nx:bg-success-background',
        away: 'nx:bg-warning-background',
        busy: 'nx:bg-error-background',
        offline: 'nx:bg-muted',
      },
    },
    defaultVariants: {
      status: 'online',
    },
  }
);

export const STATUS_LABELS = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
} as const satisfies Record<
  NonNullable<VariantProps<typeof avatarStatusVariants>['status']>,
  string
>;

export type AvatarVariants = VariantProps<typeof avatarVariants>;
export type AvatarStatusVariants = VariantProps<typeof avatarStatusVariants>;
