'use client';

import { useState } from 'react';

import { ChapterPreview } from '../ChapterPreview';

import { CoexistLanes, type HostTab, hostTabs } from './CoexistLanes';

/** The Coexist chapter's preview: one host app, and the app it picks. */
export function CoexistPreview({ chapter }: { chapter: string }) {
  const [host, setHost] = useState<HostTab>(hostTabs[0]);
  return (
    <ChapterPreview
      chapter={chapter}
      label="Coexist"
      tools={hostTabs}
      selected={host}
      onSelect={setHost}
      grows
    >
      <CoexistLanes host={host} />
    </ChapterPreview>
  );
}
