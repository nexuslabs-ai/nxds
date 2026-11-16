import type { ReactNode } from 'react';

import { Button } from './button/button';
import { Input } from './input/input';

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-4">
      {children}
    </div>
  );
}

/**
 * The Material look, live: the edited Button and the rewritten Input inside a
 * wrapper that sets Material's colors. It follows the page's light or dark
 * mode, density and corners.
 */
export function MaterialLookPreview() {
  return (
    <div
      data-md-skip
      data-look="material"
      className="nx:@container nx:mb-8 nx:flex nx:flex-col nx:gap-8 nx:rounded-lg nx:border nx:border-border-hairline nx:bg-background nx:p-6 nx:text-foreground"
    >
      <Row>
        <Button>Save</Button>
        <Button color="secondary">Share</Button>
        <Button color="error">Delete</Button>
        <Button disabled>Save</Button>
      </Row>
      <Row>
        <Button variant="outlined">Cancel</Button>
        <Button variant="outlined" color="secondary">
          Duplicate
        </Button>
        <Button variant="outlined" color="error">
          Remove
        </Button>
        <Button variant="text">Learn more</Button>
      </Row>
      <div className="nx:grid nx:grid-cols-1 nx:items-start nx:gap-x-4 nx:gap-y-6 nx:@md:grid-cols-2">
        <Input label="Email" type="email" />
        <Input label="Full name" defaultValue="Ada Lovelace" />
        <Input
          label="Email"
          type="email"
          defaultValue="ada@"
          aria-invalid
          helperText="Enter a full email address."
        />
        <Input variant="filled" label="Company" />
      </div>
    </div>
  );
}
