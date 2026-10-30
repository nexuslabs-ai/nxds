'use client';

import { useRef, useState } from 'react';

import { CaretDownIcon } from '@phosphor-icons/react/ssr';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/button/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/sheet/sheet';
import { cn } from '@/lib/utils';

import type { ManifestSection } from '../_lib/manifest';
import { isActive, NAV_LINKS } from '../_lib/nav-links';
import { REPO_URL, SITE_BRAND } from '../_lib/site';
import { GitHubMark, SiteMenuIcon } from '../_lib/site-icons';

import { SectionPageList } from './SectionPageList';

const ROW_BASE =
  'nx:flex nx:w-full nx:min-h-11 nx:items-center nx:justify-between nx:px-2 nx:py-0 nx:rounded-sm nx:border-0 nx:bg-transparent nx:text-foreground nx:typography-label-default nx:font-semibold nx:no-underline nx:cursor-pointer nx:hover:bg-container-hover nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default';

/** Below `lg`, every top-level page and section, and GitHub, in a sheet. */
export function SiteMenu() {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [expandedHref, setExpandedHref] = useState<string | null>(null);
  const currentLink = NAV_LINKS.find((link) => isActive(pathname, link.href));

  const changeOpen = (next: boolean) => {
    if (next) setExpandedHref(currentLink?.href ?? null);
    setOpen(next);
  };

  const close = () => setOpen(false);

  // Focusing the current page also scrolls it into view in a long section.
  const focusCurrentPage = (event: Event) => {
    const current =
      contentRef.current?.querySelector<HTMLElement>('[aria-current]');
    if (!current) return;
    event.preventDefault();
    current.focus();
  };

  return (
    <Sheet open={open} onOpenChange={changeOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label="Open menu">
          <SiteMenuIcon aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        ref={contentRef}
        side="right"
        aria-describedby={undefined}
        onOpenAutoFocus={focusCurrentPage}
      >
        <SheetHeader>
          <SheetTitle>{SITE_BRAND}</SheetTitle>
        </SheetHeader>
        <SheetBody className="nx:pb-6">
          <nav aria-label="Main navigation">
            <ul className="nx:list-none nx:m-0 nx:p-0 nx:flex nx:flex-col nx:gap-0.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {link.section ? (
                    <SectionDisclosure
                      section={link.section}
                      expanded={expandedHref === link.href}
                      onToggle={() =>
                        setExpandedHref((href) =>
                          href === link.href ? null : link.href
                        )
                      }
                      onNavigate={close}
                    />
                  ) : (
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={
                        isActive(pathname, link.href) ? 'page' : undefined
                      }
                      className={ROW_BASE}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(ROW_BASE, 'nx:justify-start nx:gap-2')}
                >
                  <GitHubMark aria-hidden="true" className="nx:size-4" />
                  GitHub
                  <span className="nx:sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </nav>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

function SectionDisclosure({
  section,
  expanded,
  onToggle,
  onNavigate,
}: {
  section: ManifestSection;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const listId = `site-menu-${section.slug}`;
  return (
    <>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={listId}
        onClick={onToggle}
        className={ROW_BASE}
      >
        {section.title}
        <CaretDownIcon
          aria-hidden="true"
          className={cn(
            'nx:size-4 nx:text-muted-foreground nx:transition-transform',
            expanded && 'nx:rotate-180'
          )}
        />
      </button>
      {expanded && (
        <div id={listId} className="nx:pl-3 nx:pt-1 nx:pb-2">
          <SectionPageList section={section} onNavigate={onNavigate} />
        </div>
      )}
    </>
  );
}
