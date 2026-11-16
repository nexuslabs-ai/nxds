import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'nx:inline-flex nx:box-border nx:cursor-pointer nx:items-center nx:justify-center nx:border-0 nx:bg-transparent nx:no-underline nx:whitespace-nowrap nx:uppercase nx:transition-[color,background-color,box-shadow] nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2 nx:disabled:pointer-events-none nx:disabled:cursor-default nx:disabled:opacity-100 nx:disabled:text-disabled-foreground nx:aria-disabled:pointer-events-none nx:aria-disabled:cursor-default nx:aria-disabled:opacity-100 nx:aria-disabled:text-disabled-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:shrink-0 nx:icon-stroke',
  {
    variants: {
      variant: {
        contained:
          'nx:shadow-sm nx:hover:shadow-base nx:active:shadow-lg nx:disabled:shadow-none nx:aria-disabled:shadow-none',
        outlined:
          'nx:inset-ring-[length:var(--nx-borderwidth-default)] nx:disabled:inset-ring-disabled nx:aria-disabled:inset-ring-disabled',
        text: '',
      },
      color: {
        primary: '',
        secondary: '',
        error: '',
      },
      size: {
        sm: '',
        default: '',
        lg: '',
      },
      iconOnly: {
        false:
          'nx:min-w-16 nx:gap-2 nx:rounded-base nx:typography-label-default nx:leading-[1.75] nx:tracking-[var(--nx-typography-letterspacing-wide)] nx:[&_svg]:size-5',
        true: 'nx:rounded-full nx:p-0 nx:[&_svg]:size-6',
      },
    },
    compoundVariants: [
      {
        variant: 'contained',
        color: 'primary',
        className:
          'nx:bg-primary-background nx:text-primary-foreground nx:hover:bg-primary-background-hover nx:active:bg-primary-background-active nx:disabled:bg-primary-disabled nx:aria-disabled:bg-primary-disabled',
      },
      {
        variant: 'contained',
        color: 'secondary',
        className:
          'nx:bg-secondary-background nx:text-secondary-foreground nx:hover:bg-secondary-background-hover nx:active:bg-secondary-background-active nx:disabled:bg-secondary-disabled nx:aria-disabled:bg-secondary-disabled',
      },
      {
        variant: 'contained',
        color: 'error',
        className:
          'nx:bg-error-background nx:text-error-foreground nx:hover:bg-error-background-hover nx:active:bg-error-background-active nx:disabled:bg-error-disabled nx:aria-disabled:bg-error-disabled',
      },
      {
        variant: 'outlined',
        color: 'primary',
        className:
          'nx:inset-ring-primary-border nx:text-primary-subtle-foreground nx:hover:inset-ring-primary-border-active nx:hover:bg-primary-background/4 nx:active:bg-primary-subtle-active',
      },
      {
        variant: 'outlined',
        color: 'secondary',
        className:
          'nx:inset-ring-secondary-border nx:text-secondary-subtle-foreground nx:hover:inset-ring-secondary-border-active nx:hover:bg-secondary-background/4 nx:active:bg-secondary-subtle-active',
      },
      {
        variant: 'outlined',
        color: 'error',
        className:
          'nx:inset-ring-error-border nx:text-error-subtle-foreground nx:hover:inset-ring-border-error-active nx:hover:bg-error-background/4 nx:active:bg-error-subtle-active',
      },
      {
        variant: 'text',
        color: 'primary',
        className:
          'nx:text-primary-subtle-foreground nx:hover:bg-primary-background/4 nx:active:bg-primary-subtle-active',
      },
      {
        variant: 'text',
        color: 'secondary',
        className:
          'nx:text-secondary-subtle-foreground nx:hover:bg-secondary-background/4 nx:active:bg-secondary-subtle-active',
      },
      {
        variant: 'text',
        color: 'error',
        className:
          'nx:text-error-subtle-foreground nx:hover:bg-error-background/4 nx:active:bg-error-subtle-active',
      },
      {
        iconOnly: false,
        size: 'sm',
        className:
          'nx:px-2.5 nx:py-1 nx:text-[length:calc(var(--nx-typography-size-sm)-1px)]',
      },
      { iconOnly: false, size: 'default', className: 'nx:px-4 nx:py-1.5' },
      {
        iconOnly: false,
        size: 'lg',
        className:
          'nx:px-[22px] nx:py-2 nx:text-[length:calc(var(--nx-typography-size-sm)+1px)]',
      },
      {
        variant: 'text',
        iconOnly: false,
        size: 'sm',
        className: 'nx:px-[5px]',
      },
      {
        variant: 'text',
        iconOnly: false,
        size: 'default',
        className: 'nx:px-2',
      },
      {
        variant: 'text',
        iconOnly: false,
        size: 'lg',
        className: 'nx:px-[11px]',
      },
      { iconOnly: true, size: 'sm', className: 'nx:size-10' },
      { iconOnly: true, size: 'default', className: 'nx:size-12' },
      { iconOnly: true, size: 'lg', className: 'nx:size-14' },
      {
        variant: 'contained',
        iconOnly: true,
        className: 'nx:shadow-md nx:hover:shadow-md nx:active:shadow-xl',
      },
    ],
    defaultVariants: {
      variant: 'contained',
      color: 'primary',
      size: 'default',
      iconOnly: false,
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
