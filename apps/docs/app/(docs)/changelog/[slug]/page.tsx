import * as runtime from 'react/jsx-runtime';

import { evaluate } from '@mdx-js/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

import { useMDXComponents } from '../../../../mdx-components';
import { SHIKI_OPTIONS } from '../../../../mdx-options';
import { Breadcrumb } from '../../../_components/Breadcrumb';
import { PAGE_HEADING_CLASS } from '../../../_components/Heading';
import {
  CHANGELOG_PACKAGES,
  findChangelogPackage,
  readChangelog,
} from '../../../_lib/changelog';
import { pageMetadata, SITE_IMAGE } from '../../../_lib/site';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CHANGELOG_PACKAGES.map(({ slug }) => ({ slug }));
}

export const dynamicParams = false;

async function resolvePackage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = findChangelogPackage(slug);
  if (!pkg) notFound();
  return { pkg, changelog: await readChangelog(pkg.slug) };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { pkg, changelog } = await resolvePackage(props);
  return pageMetadata({
    title: `${changelog.name} changelog`,
    description: `Every ${changelog.name} release, newest first. ${pkg.summary}`,
    route: `/changelog/${pkg.slug}`,
    image: SITE_IMAGE,
  });
}

export default async function PackageChangelog(props: PageProps) {
  const { pkg, changelog } = await resolvePackage(props);
  const { default: Releases } = await evaluate(changelog.releases, {
    ...runtime,
    format: 'md',
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypePrettyCode, SHIKI_OPTIONS]],
    useMDXComponents,
  });

  return (
    <div className="nx:max-w-[768px] nx:mx-auto nx:px-6 nx:py-8 nx:pb-16">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Changelog', href: '/changelog' },
          { label: changelog.name },
        ]}
      />
      <h1 className={PAGE_HEADING_CLASS}>{changelog.name}</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-0 nx:mb-6 nx:max-w-[64ch]">
        {pkg.summary}
      </p>
      <Releases />
    </div>
  );
}
