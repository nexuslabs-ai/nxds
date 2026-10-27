import { Footer } from '../_components/Footer';
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
      <Footer />
    </>
  );
}
