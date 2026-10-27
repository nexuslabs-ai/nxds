import { Button } from '@/components/button/button';

import { REPO_URL } from '../_lib/site';
import { DiscordMark, GitHubMark, XMark } from '../_lib/site-icons';
import { DISCORD_URL, X_URL } from '../_lib/site-links';

const communityLinks = [
  { name: 'GitHub', href: REPO_URL, Mark: GitHubMark },
  { name: 'Discord', href: DISCORD_URL, Mark: DiscordMark },
  { name: 'X', href: X_URL, Mark: XMark },
];

/** The last stage of the story, above the site footer: the community links. */
export function Community() {
  return (
    <section
      className="nx:story-community nx:mx-auto nx:w-full nx:max-w-4xl nx:px-4 nx:md:px-8"
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
  );
}
