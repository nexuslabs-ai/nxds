import type { ReactNode } from 'react';

import Link from 'next/link';

import { Button } from '@/components/button/button';
import { cn } from '@/lib/utils';

import { requireSection } from '../_lib/manifest';

const GET_STARTED_HREF = requireSection('getting-started').href;

/** The homepage section ids, each a link target such as `/#stories`. */
export type HomeSection =
  | 'explore'
  | 'customize'
  | 'coexist'
  | 'frameworks'
  | 'stories'
  | 'community';

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
  id: HomeSection;
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

/** The page's main call to action, in the first chapter only. */
export function GetStartedLink() {
  return (
    <Button asChild>
      <Link href={GET_STARTED_HREF}>Get started</Link>
    </Button>
  );
}

/** A chapter's link to the docs page that goes deeper. */
export function ChapterLink({ href, label }: { href: string; label: string }) {
  return (
    <Button variant="outline" asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
}
