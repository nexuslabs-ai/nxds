import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'nx:inline-flex nx:box-border nx:cursor-pointer nx:items-center nx:bg-transparent nx:py-0 nx:no-underline nx:justify-center nx:rounded-base nx:border-default nx:border-transparent nx:whitespace-nowrap nx:uppercase nx:transition-[color,background-color,border-color,box-shadow] nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2 nx:disabled:pointer-events-none nx:disabled:cursor-default nx:disabled:opacity-100 nx:disabled:text-disabled-foreground nx:aria-disabled:pointer-events-none nx:aria-disabled:cursor-default nx:aria-disabled:opacity-100 nx:aria-disabled:text-disabled-foreground nx:[&_svg]:pointer-events-none nx:[&_svg]:shrink-0 nx:[&_svg]:size-icon-glyph-default nx:icon-stroke',
  {
    variants: {
      variant: {
        contained:
          'nx:shadow-sm nx:hover:shadow-md nx:active:shadow-lg nx:disabled:shadow-none nx:aria-disabled:shadow-none',
        outlined:
          'nx:disabled:border-border-disabled nx:aria-disabled:border-border-disabled',
        text: '',
      },
      color: {
        primary: '',
        secondary: '',
        error: '',
      },
      size: {
        sm: 'nx:h-fit nx:min-h-8',
        default: 'nx:h-fit nx:min-h-9',
        lg: 'nx:h-fit nx:min-h-11',
      },
      iconOnly: {
        false:
          'nx:min-w-16 nx:gap-2 nx:typography-label-default nx:tracking-[var(--nx-typography-letterspacing-wide)]',
        true: 'nx:px-0',
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
          'nx:border-primary-border nx:text-primary-subtle-foreground nx:hover:border-primary-border-active nx:hover:bg-primary-subtle-hover nx:active:bg-primary-subtle-active',
      },
      {
        variant: 'outlined',
        color: 'secondary',
        className:
          'nx:border-secondary-border nx:text-secondary-subtle-foreground nx:hover:border-secondary-border-active nx:hover:bg-secondary-subtle-hover nx:active:bg-secondary-subtle-active',
      },
      {
        variant: 'outlined',
        color: 'error',
        className:
          'nx:border-error-border nx:text-error-subtle-foreground nx:hover:border-border-error-active nx:hover:bg-error-subtle-hover nx:active:bg-error-subtle-active',
      },
      {
        variant: 'text',
        color: 'primary',
        className:
          'nx:text-primary-subtle-foreground nx:hover:bg-primary-subtle-hover nx:active:bg-primary-subtle-active',
      },
      {
        variant: 'text',
        color: 'secondary',
        className:
          'nx:text-secondary-subtle-foreground nx:hover:bg-secondary-subtle-hover nx:active:bg-secondary-subtle-active',
      },
      {
        variant: 'text',
        color: 'error',
        className:
          'nx:text-error-subtle-foreground nx:hover:bg-error-subtle-hover nx:active:bg-error-subtle-active',
      },
      { iconOnly: false, size: 'sm', className: 'nx:px-2.5' },
      { iconOnly: false, size: 'default', className: 'nx:px-4' },
      { iconOnly: false, size: 'lg', className: 'nx:px-5' },
      { iconOnly: true, size: 'sm', className: 'nx:w-8' },
      { iconOnly: true, size: 'default', className: 'nx:w-9' },
      { iconOnly: true, size: 'lg', className: 'nx:w-11' },
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
