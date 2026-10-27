'use client';

import { useNxdsAppearance } from '@nxds/react/appearance';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/button/button';
import { Hide } from '@/components/hide/hide';
import { Show } from '@/components/show/show';

import { HEADER_LINKS, isActive } from '../_lib/nav-links';
import { REPO_URL } from '../_lib/site';
import { GitHubMark, SiteMoonIcon, SiteSunIcon } from '../_lib/site-icons';
import { brandLinkClassName, navLinkClassName } from '../_lib/site-links';

import { SiteMenu } from './SiteMenu';
import { SiteSearch } from './SiteSearch';

/** The sticky header on every page: brand, main navigation, search, theme and GitHub. */
export function SiteHeader() {
  const pathname = usePathname();
  const { resolvedMode, setState } = useNxdsAppearance();
  const light = resolvedMode === 'light';
  const ThemeIcon = light ? SiteMoonIcon : SiteSunIcon;

  function toggleTheme() {
    setState((current) => ({ ...current, mode: light ? 'dark' : 'light' }));
  }

  return (
    <header className="nx:sticky nx:top-0 nx:z-30 nx:h-(--site-header-h) nx:border-width-b-default nx:border-border-default nx:bg-background">
      <Button
        asChild
        size="sm"
        className="nx:fixed nx:left-4 nx:top-4 nx:z-50 nx:not-focus-visible:sr-only"
      >
        <a href="#main">Skip to main content</a>
      </Button>
      <div className="nx:site-column nx:flex nx:h-full nx:items-center nx:justify-between nx:gap-4">
        <Button asChild variant="link" size="sm" className={brandLinkClassName}>
          <Link href="/" aria-label="Nexus Design System home">
            <img
              src="/brand/nx-icon-light.svg"
              alt=""
              className="nx:size-6 nx:dark:hidden"
            />
            <img
              src="/brand/nx-icon-dark.svg"
              alt=""
              className="nx:hidden nx:size-6 nx:dark:block"
            />
            Nexus Design System
          </Link>
        </Button>
        <Show above="lg">
          <nav aria-label="Main navigation" className="nx:flex nx:gap-6">
            {HEADER_LINKS.map(({ label, href }) => (
              <Button
                asChild
                variant="link"
                size="sm"
                className={navLinkClassName}
                key={href}
              >
                <Link
                  href={href}
                  aria-current={isActive(pathname, href) ? 'page' : undefined}
                >
                  {label}
                </Link>
              </Button>
            ))}
          </nav>
        </Show>
        <div className="nx:flex nx:items-center nx:gap-2">
          <SiteSearch />
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={
              light ? 'Switch to dark theme' : 'Switch to light theme'
            }
            onClick={toggleTheme}
          >
            <ThemeIcon aria-hidden="true" />
          </Button>
          <Show above="lg">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="nx:max-xl:w-8 nx:max-xl:px-0"
            >
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Nexus repository on GitHub (opens in a new tab)"
              >
                <GitHubMark aria-hidden="true" />
                <span className="nx:hidden nx:xl:inline">GitHub</span>
              </a>
            </Button>
          </Show>
          <Hide above="lg">
            <SiteMenu />
          </Hide>
        </div>
      </div>
    </header>
  );
}
