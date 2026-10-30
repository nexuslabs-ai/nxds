'use client';

import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { ButtonGroupSizeContext } from '../button-group/button-group-context';
import { Spinner } from '../spinner/spinner';

const buttonVariants = cva(
  'nx:inline-flex nx:box-border nx:cursor-pointer nx:items-center nx:bg-transparent nx:py-0 nx:no-underline nx:justify-center nx:rounded-base nx:border-default nx:border-transparent nx:whitespace-nowrap nx:transition-[color,background-color,border-color,scale] nx:active:scale-[0.96] nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2 nx:disabled:pointer-events-none nx:disabled:cursor-default nx:disabled:opacity-100 nx:aria-disabled:pointer-events-none nx:aria-disabled:cursor-default nx:aria-disabled:opacity-100 nx:[&_svg]:pointer-events-none nx:[&_svg]:shrink-0 nx:[&_svg]:size-icon-glyph-default nx:icon-stroke',
  {
    variants: {
      variant: {
        default:
          'nx:bg-primary-background nx:text-primary-foreground nx:hover:bg-primary-background-hover nx:active:bg-primary-background-active nx:disabled:bg-primary-disabled nx:aria-disabled:bg-primary-disabled',
        error:
          'nx:text-error-subtle-foreground nx:hover:bg-error-subtle-hover nx:active:bg-error-subtle-active nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
        destructive:
          'nx:bg-error-background nx:text-error-foreground nx:hover:bg-error-background-hover nx:active:bg-error-background-active nx:disabled:bg-error-disabled nx:aria-disabled:bg-error-disabled',
        outline:
          'nx:border-default nx:border-border-default nx:bg-container nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:border-border-disabled nx:disabled:bg-secondary-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:border-border-disabled nx:aria-disabled:bg-secondary-disabled nx:aria-disabled:text-disabled-foreground',
        dashed:
          'nx:border-default nx:border-dashed nx:border-border-default nx:bg-container nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:border-border-disabled nx:disabled:bg-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:border-border-disabled nx:aria-disabled:bg-disabled nx:aria-disabled:text-disabled-foreground',
        secondary:
          'nx:bg-secondary-background nx:text-secondary-foreground nx:hover:bg-secondary-background-hover nx:active:bg-secondary-background-active nx:disabled:bg-secondary-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:bg-secondary-disabled nx:aria-disabled:text-disabled-foreground',
        ghost:
          'nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
        link: 'nx:border-0 nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline nx:active:scale-100 nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
      },
      size: {
        sm: 'nx:h-8',
        default: 'nx:h-10',
        lg: 'nx:h-12',
      },
      iconOnly: {
        false: 'nx:gap-2 nx:typography-label-default',
        true: 'nx:px-0',
      },
    },
    compoundVariants: [
      { iconOnly: false, size: 'sm', className: 'nx:px-2.5' },
      { iconOnly: false, size: 'default', className: 'nx:px-3' },
      { iconOnly: false, size: 'lg', className: 'nx:px-3.5' },
      { iconOnly: true, size: 'sm', className: 'nx:w-8' },
      { iconOnly: true, size: 'default', className: 'nx:w-10' },
      { iconOnly: true, size: 'lg', className: 'nx:w-12' },
      { variant: 'link', iconOnly: false, className: 'nx:h-auto nx:p-0!' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      iconOnly: false,
    },
  }
);

/** Button's props without its label and icon props. */
interface ButtonBaseProps
  extends
    Omit<React.ComponentProps<'button'>, 'children'>,
    Omit<VariantProps<typeof buttonVariants>, 'iconOnly'> {
  /**
   * Disables the button and shows a spinner in place of its content.
   */
  loading?: boolean;
}

interface ButtonWithTextProps extends ButtonBaseProps {
  /**
   * Shows only `startIcon` in a square button. The text stays as the name
   * screen readers read, visually hidden.
   */
  iconOnly?: false;

  /**
   * Renders the child, such as an `<a>`, with button styles.
   * The `loading` spinner and icon slots then don't render.
   */
  asChild?: boolean;

  /**
   * Decorative icon before the label. Use `startIcon` or `endIcon`, not both.
   */
  startIcon?: React.ReactNode;

  /**
   * Decorative icon after the label. Use `endIcon` or `startIcon`, not both.
   */
  endIcon?: React.ReactNode;

  children?: React.ReactNode;
}

interface ButtonIconOnlyProps extends ButtonBaseProps {
  /**
   * Shows only `startIcon` in a square button. The text stays as the name
   * screen readers read, visually hidden.
   */
  iconOnly: true;

  /**
   * Renders the child, such as an `<a>`, with button styles.
   * The `loading` spinner and icon slots then don't render.
   */
  asChild?: false;

  /**
   * The button's name. Screen readers read it, and it stays visually hidden.
   */
  children: string;

  /**
   * Decorative icon before the label. Use `startIcon` or `endIcon`, not both.
   */
  startIcon: React.ReactNode;

  endIcon?: never;
}

/**
 * With `iconOnly`, `children` must be a string and `startIcon` must be set,
 * and `asChild` is not allowed.
 */
type ButtonProps = ButtonWithTextProps | ButtonIconOnlyProps;

function hasIconSlot(icon: React.ReactNode) {
  return icon !== undefined && icon !== null && icon !== false;
}

function ButtonIcon({
  position,
  children,
}: {
  position: 'start' | 'end';
  children: React.ReactNode;
}) {
  if (!hasIconSlot(children)) return null;
  return (
    <span
      aria-hidden="true"
      data-slot={`button-${position}-icon`}
      className="nx:inline-flex nx:shrink-0"
    >
      {children}
    </span>
  );
}

/** Icon slots and label content; loading renders spinner-only visually. */
function ButtonContent({
  loading,
  iconOnly,
  startIcon,
  endIcon,
  children,
}: {
  loading: boolean;
  iconOnly: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const label = iconOnly ? (
    <span className="nx:sr-only">{children}</span>
  ) : (
    children
  );

  if (loading)
    return (
      <span
        data-slot="button-loading-content"
        className="nx:relative nx:inline-flex nx:items-center nx:justify-center"
      >
        <span data-slot="button-loading-label" className="nx:opacity-0">
          {label}
        </span>
        <Spinner
          aria-hidden="true"
          className="nx:absolute nx:left-1/2 nx:top-1/2 nx:-translate-x-1/2 nx:-translate-y-1/2"
        />
      </span>
    );

  return (
    <>
      <ButtonIcon position="start">{startIcon}</ButtonIcon>
      {label}
      <ButtonIcon position="end">{endIcon}</ButtonIcon>
    </>
  );
}

/**
 * Triggers an action. Renders a native `<button>`, or the child element with `asChild`.
 * A non-button child ignores `disabled`, so Button sets `aria-disabled` and removes it from the tab order.
 */
function Button({
  asChild = false,
  className,
  variant = 'default',
  size,
  iconOnly = false,
  loading = false,
  disabled,
  children,
  startIcon,
  endIcon,
  type = 'button',
  tabIndex,
  'aria-busy': ariaBusy,
  'aria-disabled': ariaDisabled,
  ...props
}: ButtonProps) {
  // Inherit the enclosing ButtonGroup's size when no explicit size is set, so a
  // Button nested inside a trigger wrapper (a split button) still picks it up.
  const groupSize = React.useContext(ButtonGroupSizeContext);
  const semanticSize = size ?? groupSize ?? 'default';
  const isDisabled = disabled || loading;

  const sharedProps = {
    'data-slot': 'button',
    'data-variant': variant,
    'data-size': semanticSize,
    'data-icon-only': iconOnly || undefined,
    'data-loading': loading || undefined,
    className: cn(
      buttonVariants({ variant, size: semanticSize, iconOnly, className })
    ),
    'aria-busy': loading || ariaBusy || undefined,
    'aria-disabled': isDisabled || ariaDisabled || undefined,
  };

  if (asChild && React.isValidElement(children))
    return (
      <Slot {...sharedProps} {...props} tabIndex={isDisabled ? -1 : tabIndex}>
        {children}
      </Slot>
    );

  return (
    <button
      {...sharedProps}
      {...props}
      type={type}
      disabled={isDisabled}
      tabIndex={tabIndex}
    >
      <ButtonContent
        loading={loading}
        iconOnly={iconOnly}
        startIcon={startIcon}
        endIcon={endIcon}
      >
        {children}
      </ButtonContent>
    </button>
  );
}

export { Button, type ButtonProps, buttonVariants, type ButtonWithTextProps };
