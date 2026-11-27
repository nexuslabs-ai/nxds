import type { ReactNode } from 'react';

import Link from 'next/link';

export function Breadcrumb({
  items,
  children,
}: {
  items: { label: string; href?: string }[];
  /** Page actions, shown at the end of the breadcrumb row. */
  children?: ReactNode;
}) {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-x-4 nx:gap-y-2 nx:typography-label-small nx:text-muted-foreground-subtle nx:mb-3">
      <nav aria-label="Breadcrumb" className="nx:me-auto">
        {items.map((item, i) => (
          <Crumb key={i} item={item} last={i === items.length - 1} />
        ))}
      </nav>
      {children}
    </div>
  );
}

function Crumb({
  item,
  last,
}: {
  item: { label: string; href?: string };
  last: boolean;
}) {
  return (
    <span>
      {item.href ? (
        <Link
          href={item.href}
          className="nx:text-muted-foreground-subtle nx:no-underline nx:hover:text-muted-foreground"
        >
          {item.label}
        </Link>
      ) : (
        <span>{item.label}</span>
      )}
      {!last && <span className="nx:mx-2">›</span>}
    </span>
  );
}
