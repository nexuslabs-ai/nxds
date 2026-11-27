import { SiteFooter } from '../_components/SiteFooter';
import { SiteHeader } from '../_components/SiteHeader';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
