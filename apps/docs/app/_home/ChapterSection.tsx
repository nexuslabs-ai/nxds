import type { ReactNode } from 'react';

import Link from 'next/link';

import { Button } from '@/components/button/button';
import { cn } from '@/lib/utils';

import { requireSection } from '../_lib/manifest';

const GET_STARTED_HREF = requireSection('getting-started').href;

/** One homepage chapter: its title block, then its preview as `children`. */
export function ChapterSection({
  id,
  title,
  level = 2,
  subtitle,
  actions,
  className,
  children,
}: {
  id: string;
  title: string;
  /** The page's first chapter title is its `h1`. */
  level?: 1 | 2;
  subtitle?: string;
  actions: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const Title = level === 1 ? 'h1' : 'h2';
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      data-home-section
      aria-labelledby={titleId}
      className={cn('nx:site-column nx:home-section', className)}
    >
      <div className="nx:chapter-heading">
        <Title id={titleId}>{title}</Title>
        {subtitle && (
          <p className="nx:chapter-subtitle nx:typography-body-default">
            {subtitle}
          </p>
        )}
        <div className="nx:chapter-ctas">{actions}</div>
      </div>
      {children}
    </section>
  );
}

/** Get started, then the chapter's own link. */
export function ChapterLinks({ href, label }: { href: string; label: string }) {
  return (
    <>
      <Button asChild>
        <Link href={GET_STARTED_HREF}>Get started</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href={href}>{label}</Link>
      </Button>
    </>
  );
}
