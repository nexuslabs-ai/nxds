import { REPO_URL } from '../_lib/site';

// Site header and footer links: Nexus link Buttons that keep the text-link
// size and position (no padding, natural height).
export const brandLinkClassName =
  'nx:h-auto nx:px-0 nx:font-semibold nx:text-foreground nx:hover:no-underline';

export const navLinkClassName =
  'nx:h-auto nx:px-0 nx:text-muted-foreground nx:hover:text-foreground';

export const navLinks = [
  { label: 'Components', href: '/components' },
  { label: 'Foundations', href: '/foundations' },
  { label: 'Themes', href: '/theming/appearance' },
  { label: 'Docs', href: '/getting-started/introduction' },
];

export const GITHUB_URL = REPO_URL;
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;
export const DISCORD_URL = 'https://discord.gg/EwZDDGfng';
export const X_URL = 'https://x.com/nxdsdev';
