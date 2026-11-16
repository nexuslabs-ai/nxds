import * as React from 'react';

import { cn } from '@/lib/utils';

const cellClassName =
  'nx:min-w-0 nx:border-e-default nx:border-b-default nx:border-border-hairline nx:px-6 nx:py-4 nx:wrap-anywhere nx:typography-body-default';

/**
 * Shows metadata as a bordered grid of term and value cells, two pairs to a row when the list has room. Put actions inside the description.
 *
 * The wrapper draws the outer border and clips the last row's and the last column's lines.
 */
function DescriptionList({ className, ...props }: React.ComponentProps<'dl'>) {
  return (
    <div className="nx:@container/description-list nx:w-full nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-hairline">
      <dl
        data-slot="description-list"
        className={cn(
          'nx:m-0 nx:-mr-px nx:-mb-px nx:grid nx:grid-cols-1 nx:@md/description-list:grid-cols-[repeat(4,auto)]',
          className
        )}
        {...props}
      />
    </div>
  );
}

/** Groups one term and its description. Its two cells sit in the list's grid. */
function DescriptionListItem({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="description-list-item"
      className={cn('nx:contents', className)}
      {...props}
    />
  );
}

function DescriptionListTerm({
  className,
  ...props
}: React.ComponentProps<'dt'>) {
  return (
    <dt
      data-slot="description-list-term"
      className={cn(
        cellClassName,
        'nx:bg-muted nx:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function DescriptionListDescription({
  className,
  ...props
}: React.ComponentProps<'dd'>) {
  return (
    <dd
      data-slot="description-list-description"
      className={cn(
        cellClassName,
        'nx:m-0 nx:bg-container nx:text-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
};
