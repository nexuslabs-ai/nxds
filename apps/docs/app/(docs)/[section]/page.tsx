import { notFound, redirect } from 'next/navigation';

import {
  getSection,
  PAGE_MANIFEST,
  sectionHomeRoute,
} from '../../_lib/manifest';

export function generateStaticParams() {
  return PAGE_MANIFEST.map((section) => ({ section: section.slug }));
}

export const dynamicParams = false;

export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const found = getSection(section);
  const home = found && sectionHomeRoute(found);
  if (!home) notFound();
  redirect(home);
}
