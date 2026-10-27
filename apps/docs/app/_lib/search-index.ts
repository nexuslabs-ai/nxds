import { PAGE_MANIFEST } from './manifest';
import { PLAYGROUND_VIEWS } from './playground-views';

/**
 * What ⌘K search lists: the Playground routes and every page in the generated
 * manifest (the same source the nav and routes read), so it stays in sync as
 * pages are added.
 */
export const SEARCH_INDEX = [
  {
    title: 'Playground',
    items: PLAYGROUND_VIEWS,
  },
  ...PAGE_MANIFEST.map((section) => ({
    title: section.title,
    items: section.pages.map((page) => ({
      label: page.label,
      href: page.route,
    })),
  })),
];
