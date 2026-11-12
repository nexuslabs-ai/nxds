'use client';

import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';

import { cn } from '../../lib/utils';
import { ButtonGroupSizeContext } from '../button-group/button-group-context';
import { Spinner } from '../spinner/spinner';

import { type ButtonVariants, buttonVariants } from './button-variants';

/** Button's props without its label and icon props. */
interface ButtonBaseProps
  extends
    Omit<React.ComponentProps<'button'>, 'children'>,
    Omit<ButtonVariants, 'iconOnly'> {
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

export { Button, type ButtonProps, buttonVariants };
