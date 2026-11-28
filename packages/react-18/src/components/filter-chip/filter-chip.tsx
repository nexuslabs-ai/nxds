import * as React from 'react';

import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { buttonVariants } from '../button/button-variants';

interface FilterChipProps extends Omit<
  React.ComponentProps<'button'>,
  'children' | 'type' | 'aria-label'
> {
  children: string;
  /** What activating the chip does. Screen readers read it before the chip's text, such as "Remove filter: Status: Active". */
  action?: string;
}

/** An applied filter that is removed when activated. Your app owns the filter state and where focus goes next. */
const FilterChip = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<FilterChipProps>
>(function FilterChip(propsWithoutRef, forwardedRef) {
  const {
    action = 'Remove filter',
    children,
    className,
    ...props
  }: React.PropsWithoutRef<FilterChipProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <button
      {...props}
      type="button"
      data-slot="filter-chip"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'nx:h-(--nx-spacing-8) nx:max-w-full nx:min-w-0 nx:justify-start nx:active:scale-100',
        className
      )}
    >
      <span className="nx:sr-only">{`${action}: `}</span>
      <span data-slot="filter-chip-label" className="nx:min-w-0 nx:truncate">
        {children}
      </span>
      <IconX aria-hidden="true" />
    </button>
  );
});

export { FilterChip, type FilterChipProps };
