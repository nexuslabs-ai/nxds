'use client';

import * as React from 'react';

import { Input } from '@nxds/react';

export interface CanvasIcon {
  name: string;
  icon: React.ReactNode;
}

function matches(name: string, query: string) {
  return query
    .toLowerCase()
    .split(/[\s-]+/)
    .filter(Boolean)
    .every((word) => name.includes(word));
}

export function CanvasIconSearch({ icons }: { icons: CanvasIcon[] }) {
  const [query, setQuery] = React.useState('');
  const shown = icons.filter(({ name }) => matches(name, query));

  return (
    <div className="nx:flex nx:flex-col nx:gap-4">
      <Input
        type="search"
        aria-label="Search icons"
        placeholder={`Search ${icons.length} icons`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="nx:max-w-sm"
      />
      <p
        className="nx:typography-body-small nx:text-muted-foreground"
        aria-live="polite"
      >
        {shown.length === icons.length
          ? `${icons.length} icons`
          : `${shown.length} of ${icons.length} icons`}
      </p>
      <ul className="nx:m-0 nx:grid nx:list-none nx:grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] nx:gap-2 nx:p-0">
        {shown.map(({ name, icon }) => (
          <li
            key={name}
            className="nx:flex nx:flex-col nx:items-center nx:gap-2 nx:rounded-md nx:border-default nx:border-border-hairline nx:px-2 nx:py-3 nx:text-foreground"
          >
            {icon}
            <code className="nx:typography-code-inline nx:text-center nx:break-all nx:text-muted-foreground">
              {name}
            </code>
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="nx:typography-body-default nx:text-muted-foreground">
          No icon matches “{query}”. Search phosphoricons.com for its name, then
          ask for it to be added.
        </p>
      )}
    </div>
  );
}
