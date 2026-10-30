import { SiteHeader } from '../_components/SiteHeader';

export default function WorkspaceGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
    </>
  );
}
