import { ChapterCanvas } from '../ChapterPreview';

import { CoreChipChapter } from './CoreChipChapter';

/**
 * The Frameworks chapter's preview: the diagram, from tokens to frameworks.
 * It has no toolbar; a framework chip pins its framework's flow.
 */
export function FrameworksPreview() {
  return (
    <ChapterCanvas>
      <CoreChipChapter />
    </ChapterCanvas>
  );
}
