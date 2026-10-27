import { Button } from '@/components/button/button';

import { NPM_CORE_URL, REPO_URL } from '../_lib/site';
import { DiscordMark, GitHubMark, XMark } from '../_lib/site-icons';
import {
  brandLinkClassName,
  DISCORD_URL,
  LICENSE_URL,
  navLinkClassName,
  X_URL,
} from '../_lib/site-links';

const communityLinks = [
  { name: 'GitHub', href: REPO_URL, Mark: GitHubMark },
  { name: 'Discord', href: DISCORD_URL, Mark: DiscordMark },
  { name: 'X', href: X_URL, Mark: XMark },
];

const footerLinks = [
  { label: 'Documentation', href: '/getting-started/introduction' },
  { label: 'npm', href: NPM_CORE_URL, external: true },
  { label: 'MIT License', href: LICENSE_URL, external: true },
  { label: 'GitHub', href: REPO_URL, external: true },
];

/** The last stage of the story: the community links, then the site footer. */
export function SiteFooter() {
  return (
    <>
      <section
        className="nx:story-community nx:mx-auto nx:w-full nx:max-w-4xl"
        aria-labelledby="story-community-title"
      >
        <div className="nx:chapter-heading">
          <h1 id="story-community-title">Build Nexus with us.</h1>
          <p className="nx:m-0 nx:typography-body-default nx:text-muted-foreground">
            Join the community. Ask, share and help shape what comes next.
          </p>
        </div>
        <div className="nx:flex nx:justify-center nx:gap-3">
          {communityLinks.map(({ name, href, Mark }) => (
            <Button
              key={name}
              asChild
              variant="outline"
              size="icon-lg"
              className="nx:[&_svg]:size-5"
            >
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} (opens in a new tab)`}
              >
                <Mark aria-hidden="true" />
              </a>
            </Button>
          ))}
        </div>
      </section>
      <footer className="nx:story-footer">
        <div className="nx:flex nx:flex-col nx:gap-1">
          <Button
            asChild
            variant="link"
            size="sm"
            className={brandLinkClassName}
          >
            <a href="/">Nexus Design System</a>
          </Button>
          <p className="nx:m-0 nx:typography-body-small nx:text-muted-foreground">
            © 2026 Nexus Labs
          </p>
        </div>
        <nav aria-label="Footer navigation">
          {footerLinks.map(({ label, href, external }) => (
            <Button
              asChild
              variant="link"
              size="sm"
              className={navLinkClassName}
              key={label}
            >
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
              >
                {label}
                {external && (
                  <span className="nx:sr-only"> (opens in a new tab)</span>
                )}
              </a>
            </Button>
          ))}
        </nav>
      </footer>
    </>
  );
}
