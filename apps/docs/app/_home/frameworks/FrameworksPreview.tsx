'use client';

import { useState } from 'react';

import { ChapterCanvas } from '../ChapterPreview';

import { CoreChipChapter, type Framework, frameworks } from './CoreChipChapter';

/**
 * The Frameworks chapter's preview: the diagram, from tokens to frameworks.
 * It has no toolbar; a framework chip presses its framework.
 */
export function FrameworksPreview() {
  const [framework, setFramework] = useState<Framework>(frameworks[0]);
  return (
    <ChapterCanvas>
      <CoreChipChapter framework={framework} onSelect={setFramework} />
    </ChapterCanvas>
  );
}
