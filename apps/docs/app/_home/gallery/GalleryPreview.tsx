'use client';

import { useState } from 'react';

import { ChapterPreview } from '../ChapterPreview';

import { type ShowcaseView, showcaseViews, ShowcaseWall } from './ShowcaseWall';

/** The Gallery chapter's preview: the showcase wall and its views. */
export function GalleryPreview({ chapter }: { chapter: string }) {
  const [view, setView] = useState<ShowcaseView>(showcaseViews[0]);
  return (
    <ChapterPreview
      chapter={chapter}
      label="Gallery"
      tools={showcaseViews}
      selected={view}
      onSelect={setView}
    >
      <ShowcaseWall view={view} />
    </ChapterPreview>
  );
}
