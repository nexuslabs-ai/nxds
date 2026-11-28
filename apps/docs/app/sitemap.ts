import type { MetadataRoute } from 'next';

import { CHANGELOG_PACKAGES } from './_lib/changelog';
import { PAGE_MANIFEST } from './_lib/manifest';
import { PLAYGROUND_VIEWS } from './_lib/playground-views';
import { SITE_URL } from './_lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '/',
    ...PAGE_MANIFEST.flatMap((section) =>
      section.pages.map((page) => page.route)
    ),
    ...PLAYGROUND_VIEWS.map((view) => view.href),
    '/changelog',
    ...CHANGELOG_PACKAGES.map((pkg) => `/changelog/${pkg.slug}`),
  ];
  return routes.map((route) => ({ url: `${SITE_URL}${route}` }));
}
