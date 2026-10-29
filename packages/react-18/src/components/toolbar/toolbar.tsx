'use client';

import * as React from 'react';

import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { buttonVariants } from '../button/button';
import { TooltipProvider } from '../tooltip/tooltip';
import { TooltipGroupContext } from '../tooltip/tooltip-group';

type ToolbarProps = React.ComponentProps<typeof ToolbarPrimitive.Root>;

/**
 * Label the toolbar with aria-label or aria-labelledby. Controls wrap in DOM
 * order. Its tooltips form one group, so moving across the buttons skips the
 * open delay. Inside a `TooltipProvider` it joins that group instead.
 */
const Toolbar = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ToolbarProps>
>(function Toolbar(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ToolbarProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const inGroup = React.useContext(TooltipGroupContext);
  const root = (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      className={cn(
        'nx:flex nx:w-fit nx:max-w-full nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-0.5 nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container nx:p-0.5 nx:shadow-sm nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
        className
      )}
      {...props}
    />
  );
  if (inGroup) return root;

  return <TooltipProvider>{root}</TooltipProvider>;
});

/**
 * Adds `iconOnly` to a toolbar part's props. With `iconOnly`, `children` must
 * be a string and `startIcon` must be set, and `asChild` is not allowed.
 */
type WithIconOnly<Props> =
  | (Props & {
      /**
       * Shows only `startIcon` in a square button. The text stays as the name
       * screen readers read, visually hidden.
       */
      iconOnly?: false;
      startIcon?: never;
    })
  | (Omit<Props, 'children' | 'asChild'> & {
      /**
       * Shows only `startIcon` in a square button. The text stays as the name
       * screen readers read, visually hidden.
       */
      iconOnly: true;
      /**
       * The button's name. Screen readers read it, and it stays visually hidden.
       */
      children: string;
      /**
       * Decorative icon that `iconOnly` shows.
       */
      startIcon: React.ReactNode;
      asChild?: false;
    });

/** The icon `iconOnly` shows, with the text as the hidden name. */
function ToolbarIconLabel({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <span aria-hidden="true" className="nx:inline-flex nx:shrink-0">
        {icon}
      </span>
      <span className="nx:sr-only">{children}</span>
    </>
  );
}

type ToolbarButtonProps = WithIconOnly<
  React.ComponentProps<typeof ToolbarPrimitive.Button> &
    Pick<VariantProps<typeof buttonVariants>, 'variant' | 'size'>
>;

const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<ToolbarButtonProps>
>(function ToolbarButton(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'ghost',
    size = 'sm',
    iconOnly = false,
    startIcon,
    children,
    ...props
  }: React.PropsWithoutRef<ToolbarButtonProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-button"
      data-variant={variant}
      data-size={size}
      data-icon-only={iconOnly || undefined}
      className={cn(buttonVariants({ variant, size, iconOnly }), className)}
      {...props}
    >
      {iconOnly ? (
        <ToolbarIconLabel icon={startIcon}>{children}</ToolbarIconLabel>
      ) : (
        children
      )}
    </ToolbarPrimitive.Button>
  );
});

type ToolbarLinkProps = React.ComponentProps<typeof ToolbarPrimitive.Link> &
  Pick<VariantProps<typeof buttonVariants>, 'variant' | 'size'>;

const ToolbarLink = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithoutRef<ToolbarLinkProps>
>(function ToolbarLink(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'ghost',
    size = 'sm',
    ...props
  }: React.PropsWithoutRef<ToolbarLinkProps> & {
    ref?: React.ForwardedRef<HTMLAnchorElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});

const ToolbarGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<'div'>>
>(function ToolbarGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<React.ComponentProps<'div'>> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      role="group"
      data-slot="toolbar-group"
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-0.5',
        className
      )}
      {...props}
    />
  );
});

type ToolbarToggleGroupProps = React.ComponentProps<
  typeof ToolbarPrimitive.ToggleGroup
>;

const ToolbarToggleGroup = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<ToolbarToggleGroupProps>
>(function ToolbarToggleGroup(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<ToolbarToggleGroupProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ToolbarPrimitive.ToggleGroup
      data-slot="toolbar-toggle-group"
      role={props.type === 'single' ? 'radiogroup' : 'group'}
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-0.5 nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
        className
      )}
      {...props}
    />
  );
});

type ToolbarToggleItemProps = WithIconOnly<
  React.ComponentProps<typeof ToolbarPrimitive.ToggleItem> &
    Pick<VariantProps<typeof buttonVariants>, 'size'>
>;

const ToolbarToggleItem = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<ToolbarToggleItemProps>
>(function ToolbarToggleItem(propsWithoutRef, forwardedRef) {
  const {
    className,
    size = 'sm',
    iconOnly = false,
    startIcon,
    children,
    ...props
  }: React.PropsWithoutRef<ToolbarToggleItemProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ToolbarPrimitive.ToggleItem
      data-slot="toolbar-toggle-item"
      data-size={size}
      data-icon-only={iconOnly || undefined}
      className={cn(
        buttonVariants({ variant: 'ghost', size, iconOnly }),
        'nx:data-[state=on]:bg-primary-subtle nx:data-[state=on]:text-primary-subtle-foreground nx:data-[state=on]:hover:bg-primary-subtle-hover nx:data-[state=on]:active:bg-primary-subtle-active',
        className
      )}
      {...props}
    >
      {iconOnly ? (
        <ToolbarIconLabel icon={startIcon}>{children}</ToolbarIconLabel>
      ) : (
        children
      )}
    </ToolbarPrimitive.ToggleItem>
  );
});

const ToolbarSeparator = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<React.ComponentProps<typeof ToolbarPrimitive.Separator>>
>(function ToolbarSeparator(propsWithoutRef, forwardedRef) {
  const {
    className,
    ...props
  }: React.PropsWithoutRef<
    React.ComponentProps<typeof ToolbarPrimitive.Separator>
  > & { ref?: React.ForwardedRef<HTMLDivElement> } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn(
        'nx:shrink-0 nx:bg-border-default nx:data-[orientation=vertical]:h-5 nx:data-[orientation=vertical]:w-px nx:data-[orientation=horizontal]:h-px nx:data-[orientation=horizontal]:w-full',
        className
      )}
      {...props}
    />
  );
});

export {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
};
export type {
  ToolbarButtonProps,
  ToolbarLinkProps,
  ToolbarProps,
  ToolbarToggleGroupProps,
  ToolbarToggleItemProps,
};
