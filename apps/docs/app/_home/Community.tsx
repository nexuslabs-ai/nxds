'use client';

import { buttonVariants } from '@/components/button/button';
import { cn } from '@/lib/utils';

import { DISCORD_URL, REPO_URL, X_URL } from '../_lib/site';
import { DiscordMark, GitHubMark, XMark } from '../_lib/site-icons';

import type { HomeSection } from './ChapterSection';

const communityLinks = [
  { name: 'GitHub', href: REPO_URL, Mark: GitHubMark },
  { name: 'Discord', href: DISCORD_URL, Mark: DiscordMark },
  { name: 'X', href: X_URL, Mark: XMark },
];

const SECTION: HomeSection = 'community';

/** The last section of the homepage, above the site footer: the community links. */
export function Community() {
  return (
    <section
      id={SECTION}
      className="nx:site-column nx:home-section"
      aria-labelledby={`${SECTION}-title`}
    >
      <div className="nx:chapter-heading">
        <h2 id={`${SECTION}-title`}>Build Nexus with us.</h2>
        <p className="nx:m-0 nx:typography-body-default nx:text-muted-foreground">
          Join the community. Ask, share and help shape what comes next.
        </p>
      </div>
      <div className="nx:flex nx:justify-center nx:gap-3">
        {communityLinks.map(({ name, href, Mark }) => (
          <a
            key={name}
            className={cn(
              buttonVariants({
                variant: 'outline',
                size: 'lg',
                iconOnly: true,
              }),
              'nx:[&_svg]:size-5'
            )}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} (opens in a new tab)`}
          >
            <Mark aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}
