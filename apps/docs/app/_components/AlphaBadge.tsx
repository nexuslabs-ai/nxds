import Link from 'next/link';

import { Badge } from '@/components/badge/badge';
import { Button } from '@/components/button/button';

/** The alpha label beside the site name. It links to what alpha means. */
export function AlphaBadge({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      asChild
      variant="link"
      size="sm"
      className="nx:h-auto nx:px-0 nx:hover:no-underline"
    >
      <Link
        href="/getting-started/introduction#alpha"
        aria-label="Alpha: what this means for your app"
        onClick={onClick}
      >
        <Badge variant="secondary" fill="light">
          Alpha
        </Badge>
      </Link>
    </Button>
  );
}
