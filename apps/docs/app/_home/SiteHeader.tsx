'use client';

import type { Ref } from 'react';

import type { NxdsResolvedAppearanceMode } from '@nxds/core';

import { Button } from '@/components/button/button';
import { Hide } from '@/components/hide/hide';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/sheet/sheet';
import { Show } from '@/components/show/show';

import {
  GitHubMark,
  SiteMenuIcon,
  SiteMoonIcon,
  SiteSunIcon,
} from './site-icons';
import {
  brandLinkClassName,
  GITHUB_URL,
  navLinkClassName,
  navLinks,
} from './site-links';
import { SiteSearch } from './SiteSearch';

/** The sticky site header: brand, main navigation, search, theme and GitHub. */
export function SiteHeader({
  ref,
  mode,
  onThemeToggle,
}: {
  ref: Ref<HTMLElement>;
  mode: NxdsResolvedAppearanceMode;
  onThemeToggle: () => void;
}) {
  const ThemeIcon = mode === 'light' ? SiteMoonIcon : SiteSunIcon;
  return (
    <header
      ref={ref}
      className="nx:sticky nx:top-0 nx:z-30 nx:flex nx:items-center nx:justify-between nx:gap-4 nx:border-width-b-default nx:border-border-default nx:bg-background nx:px-4 nx:py-4 nx:md:px-8"
    >
      <Button
        asChild
        size="sm"
        className="nx:fixed nx:left-4 nx:top-4 nx:z-50 nx:not-focus-visible:sr-only"
      >
        <a href="#top">Skip to main content</a>
      </Button>
      <Button asChild variant="link" size="sm" className={brandLinkClassName}>
        <a href="#top" aria-label="Nexus Design System home">
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
        </a>
      </Button>
      <Show above="lg">
        <nav aria-label="Main navigation" className="nx:flex nx:gap-6">
          {navLinks.map(({ label, href }) => (
            <Button
              asChild
              variant="link"
              size="sm"
              className={navLinkClassName}
              key={href}
            >
              <a href={href}>{label}</a>
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
            mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
          }
          onClick={onThemeToggle}
        >
          <ThemeIcon aria-hidden="true" />
        </Button>
        <Show above="lg">
          <Button variant="outline" size="sm" asChild>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nexus repository on GitHub (opens in a new tab)"
            >
              <GitHubMark aria-hidden="true" />
              GitHub
            </a>
          </Button>
        </Show>
        <Hide above="lg">
          <SiteMenu />
        </Hide>
      </div>
    </header>
  );
}

const menuLinkClassName = 'nx:w-full nx:justify-start';

/** Below lg, the main navigation and GitHub move into a sheet. */
function SiteMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label="Open menu">
          <SiteMenuIcon aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Nexus Design System</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <nav aria-label="Main navigation">
            <ul className="nx:m-0 nx:flex nx:list-none nx:flex-col nx:gap-1 nx:p-0">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Button asChild variant="ghost" className={menuLinkClassName}>
                    <a href={href}>{label}</a>
                  </Button>
                </li>
              ))}
              <li>
                <Button asChild variant="ghost" className={menuLinkClassName}>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GitHubMark aria-hidden="true" />
                    GitHub
                    <span className="nx:sr-only"> (opens in a new tab)</span>
                  </a>
                </Button>
              </li>
            </ul>
          </nav>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
