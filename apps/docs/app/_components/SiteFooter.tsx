import { cn } from '@nxds/react/utils';
import Link from 'next/link';

import { Button } from '@/components/button/button';

import { PAGE_MANIFEST } from '../_lib/manifest';
import { NPM_CORE_URL, REPO_URL, STORYBOOK_URL } from '../_lib/site';
import {
  brandLinkClassName,
  DISCORD_URL,
  LICENSE_URL,
  navLinkClassName,
  X_URL,
} from '../_lib/site-links';

/** `file` marks a file the build writes, which gets a plain link, not a page link. */
type FooterLink = { label: string; href: string; file?: boolean };

const footerGroups: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Docs',
    links: PAGE_MANIFEST.map((section) => ({
      label: section.title,
      href: section.href,
    })),
  },
  {
    title: 'Resources',
    links: [
      { label: 'Playground', href: '/playground' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Storybook', href: STORYBOOK_URL },
      { label: 'npm', href: NPM_CORE_URL },
      { label: 'llms.txt', href: '/llms.txt', file: true },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: REPO_URL },
      { label: 'Discord', href: DISCORD_URL },
      { label: 'X', href: X_URL },
    ],
  },
];

function FooterLinkItem({ label, href, file }: FooterLink) {
  const external = href.startsWith('http');
  return (
    <Button asChild variant="link" size="sm" className={navLinkClassName}>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {label}
          <span className="nx:sr-only"> (opens in a new tab)</span>
        </a>
      ) : file ? (
        <a href={href}>{label}</a>
      ) : (
        <Link href={href}>{label}</Link>
      )}
    </Button>
  );
}

/** The footer on every page: the brand and a map of the whole site. */
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        'nx:border-width-t-default nx:border-border-default',
        className
      )}
    >
      <div className="nx:site-column nx:flex nx:flex-col nx:gap-8 nx:py-8 nx:md:flex-row nx:md:justify-between">
        <div className="nx:flex nx:flex-col nx:gap-1">
          <Button
            asChild
            variant="link"
            size="sm"
            className={cn(brandLinkClassName, 'nx:self-start')}
          >
            <Link href="/">Nexus Design System</Link>
          </Button>
          <p className="nx:m-0 nx:typography-body-small nx:text-muted-foreground">
            © 2026 Nexus Labs ·{' '}
            <a
              href={LICENSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nx:text-inherit nx:hover:text-foreground"
            >
              MIT License
              <span className="nx:sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="nx:grid nx:grid-cols-[repeat(3,auto)] nx:justify-start nx:gap-x-3 nx:gap-y-8 nx:sm:gap-x-8 nx:md:gap-x-16"
        >
          {footerGroups.map(({ title, links }) => (
            <div key={title}>
              <h2 className="nx:m-0 nx:mb-3 nx:typography-label-default nx:text-foreground">
                {title}
              </h2>
              <ul className="nx:m-0 nx:flex nx:list-none nx:flex-col nx:gap-2 nx:p-0">
                {links.map((link) => (
                  <li key={link.href}>
                    <FooterLinkItem {...link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
