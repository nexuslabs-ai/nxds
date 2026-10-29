import { ICON_NAMES, iconComponent } from '@nxds/claude-design/icons';
import * as TablerIcons from '@tabler/icons-react';

import { CanvasIconSearch } from './_canvas-icons-search';

/**
 * Getting Started → Canvas icons. Server component: renders every icon the
 * Claude Design export ships, read from @nxds/claude-design's icon list, and
 * hands them to a client search.
 */

export const description =
  'Every icon a Claude Design canvas can name with nxds, and how to place one.';

const icons = TablerIcons as unknown as Record<
  string,
  TablerIcons.Icon | undefined
>;

export default function CanvasIcons() {
  const items = ICON_NAMES.map((name) => {
    const Icon = icons[iconComponent(name)];
    if (!Icon) {
      throw new Error(
        `Canvas icons: @tabler/icons-react has no ${iconComponent(name)}. Align its version with @nxds/react-18's.`
      );
    }
    return { name, icon: <Icon size={20} aria-hidden /> };
  });

  return (
    <>
      <h1 className="nx:typography-heading-large">Canvas icons</h1>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mt-2 nx:mb-6 nx:max-w-[64ch]">
        A Claude Design canvas places any of these icons by name. Write the name
        as it appears below.
      </p>
      <pre className="nx:typography-code-block nx:mb-4 nx:overflow-x-auto nx:rounded-md nx:bg-muted nx:p-4">
        <code>
          {[
            '<x-import component-from-global-scope="Nxds.Icon" name="plus"></x-import>',
            '<x-import component-from-global-scope="Nxds.Button" start-icon="plus">Create project</x-import>',
          ].join('\n')}
        </code>
      </pre>
      <p className="nx:typography-body-default nx:text-muted-foreground nx:mb-8 nx:max-w-[64ch]">
        <code>Nxds.Icon</code> places an icon on its own. Button, Badge and the
        other parts with an icon prop take the name in that prop. In an app,
        import the same icon from <code>@tabler/icons-react</code>.
      </p>
      <CanvasIconSearch icons={items} />
    </>
  );
}
