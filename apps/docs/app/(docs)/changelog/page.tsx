import Link from 'next/link';

import { Breadcrumb } from '../../_components/Breadcrumb';
import { CHANGELOG_PACKAGES, readChangelog } from '../../_lib/changelog';
import { pageMetadata, SITE_IMAGE } from '../../_lib/site';

export const metadata = pageMetadata({
  title: 'Changelog',
  description:
    'Release notes for each nxds package, newest first, with its latest version.',
  route: '/changelog',
  image: SITE_IMAGE,
});

export default async function Changelog() {
  const packages = await Promise.all(
    CHANGELOG_PACKAGES.map(async (pkg) => ({
      ...pkg,
      ...(await readChangelog(pkg.slug)),
    }))
  );

  return (
    <div className="nx:max-w-[768px] nx:mx-auto nx:px-6 nx:py-8 nx:pb-16">
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Changelog' }]}
      />
      <h1 className="nx:typography-heading-large">Changelog</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-10 nx:max-w-[64ch]">
        Each nxds package has its own release notes. Pick a package to see every
        release, newest first.
      </p>

      <ul className="nx:list-none nx:p-0 nx:m-0 nx:flex nx:flex-col nx:gap-6">
        {packages.map((pkg) => (
          <li
            key={pkg.slug}
            className="nx:grid nx:grid-cols-1 nx:sm:grid-cols-[120px_minmax(0,1fr)] nx:gap-x-8 nx:gap-y-1"
          >
            <span className="nx:font-mono nx:typography-label-default nx:text-muted-foreground-subtle nx:sm:pt-0.5">
              {pkg.latest}
            </span>
            <div>
              <Link
                href={`/changelog/${pkg.slug}`}
                className="nx:typography-label-default nx:font-semibold nx:text-foreground nx:no-underline nx:hover:underline nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2 nx:rounded-sm"
              >
                {pkg.name}
              </Link>
              <p className="nx:typography-body-default nx:text-muted-foreground nx:m-0 nx:mt-1">
                {pkg.summary}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
