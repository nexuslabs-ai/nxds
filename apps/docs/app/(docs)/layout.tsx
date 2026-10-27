import { SiteFooter } from '../_components/SiteFooter';
import { SiteHeader } from '../_components/SiteHeader';
import { ThemePicker } from '../_components/ThemePicker';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <ThemePicker />
      <SiteFooter className="nx:mt-16 nx:pb-(--docs-panel-offset)" />
    </>
  );
}
