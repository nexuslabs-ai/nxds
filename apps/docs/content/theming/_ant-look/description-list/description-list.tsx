import * as React from 'react';

import { cn } from '@/lib/utils';

/** Shows metadata as a bordered grid of term and value cells. Put actions inside the description. */
function DescriptionList({ className, ...props }: React.ComponentProps<'dl'>) {
  return (
    <dl
      data-slot="description-list"
      className={cn(
        'nx:@container/description-list nx:m-0 nx:grid nx:w-full nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-hairline nx:bg-container',
        className
      )}
      {...props}
    />
  );
}

/** Groups one term and its description. Stacks until the list has room for two columns. */
function DescriptionListItem({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="description-list-item"
      className={cn(
        'nx:flex nx:min-w-0 nx:flex-col nx:border-b-default nx:border-border-hairline nx:last:border-b-0 nx:@md/description-list:flex-row',
        className
      )}
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
        'nx:min-w-0 nx:bg-muted nx:px-6 nx:py-4 nx:wrap-anywhere nx:typography-body-default nx:text-muted-foreground nx:@md/description-list:w-40 nx:@md/description-list:shrink-0 nx:@md/description-list:border-e-default nx:@md/description-list:border-border-hairline',
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
        'nx:m-0 nx:min-w-0 nx:flex-1 nx:px-6 nx:py-4 nx:wrap-anywhere nx:typography-body-default nx:text-foreground',
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
