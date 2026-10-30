import { Button } from '@/components/button/button';

import { STORYBOOK_URL } from '../../_lib/site';

/** The Stories chapter's link to the published Storybook. */
export function StorybookLink() {
  return (
    <Button variant="outline" asChild>
      <a
        href={STORYBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Storybook (opens in a new tab)"
      >
        <img src="/brand/storybook.svg" alt="" className="nx:size-3.5" />
        Open Storybook
      </a>
    </Button>
  );
}
