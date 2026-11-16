import type { ReactNode } from 'react';

function Pane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="nx:m-0 nx:flex nx:flex-col nx:gap-2">
      <figcaption className="nx:typography-label-small nx:text-muted-foreground">
        {label}
      </figcaption>
      {children}
    </figure>
  );
}

/**
 * A look's two previews, one over the other: the screen built with nxds, then
 * the same screen built with the library itself.
 */
export function LookComparison({
  library,
  nxds,
  reference,
}: {
  library: string;
  nxds: ReactNode;
  reference: ReactNode;
}) {
  return (
    <div data-md-skip className="nx:mb-8 nx:flex nx:flex-col nx:gap-6">
      <Pane label="Built with nxds">{nxds}</Pane>
      <Pane label={`Built with ${library}`}>{reference}</Pane>
    </div>
  );
}
