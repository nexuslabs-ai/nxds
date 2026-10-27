'use client';

import { useState } from 'react';

import { ChapterPreview } from '../ChapterPreview';

import {
  CoreChipChapter,
  type Framework,
  frameworkTabs,
} from './CoreChipChapter';

/** The Frameworks chapter's preview: the diagram, from tokens to frameworks. */
export function FrameworksPreview({ chapter }: { chapter: string }) {
  const [framework, setFramework] = useState<Framework>(frameworkTabs[0]);
  return (
    <ChapterPreview
      chapter={chapter}
      label="Frameworks"
      tools={frameworkTabs}
      selected={framework}
      onSelect={setFramework}
    >
      <CoreChipChapter framework={framework} onSelect={setFramework} />
    </ChapterPreview>
  );
}
