import {
  type ManifestSection,
  PAGE_MANIFEST,
  requireSection,
} from './manifest';

type NavLink = { href: string; label: string; section?: ManifestSection };

/** Every top-level page, in the order the site menu lists them. */
export const NAV_LINKS: NavLink[] = [
  { href: '/playground', label: 'Playground' },
  ...PAGE_MANIFEST.map((section) => ({
    href: section.href,
    label: section.title,
    section,
  })),
  { href: '/changelog', label: 'Changelog' },
];

/** The links the site header shows from `lg` up; the menu lists the rest. */
export const HEADER_LINKS: NavLink[] = [
  { href: requireSection('getting-started').href, label: 'Docs' },
  { href: requireSection('components').href, label: 'Components' },
  { href: requireSection('blocks').href, label: 'Blocks' },
  { href: requireSection('patterns').href, label: 'Patterns' },
  { href: requireSection('foundations').href, label: 'Foundations' },
  { href: requireSection('theming').href, label: 'Theming' },
  { href: requireSection('integrations').href, label: 'Integrations' },
  { href: '/playground', label: 'Playground' },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}
