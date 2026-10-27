'use client';

import { useState } from 'react';

import { ChapterPreview } from '../ChapterPreview';

import { AppearanceActions } from './AppearanceActions';
import {
  AppearanceControls,
  type CustomizeTool,
  customizeTools,
} from './AppearanceControls';
import { ComponentWall } from './ComponentWall';

/**
 * The Customize chapter's preview: the component wall, in the page's own
 * appearance, and the toolbar that edits it.
 */
export function CustomizePreview({ chapter }: { chapter: string }) {
  const [tool, setTool] = useState<CustomizeTool>(customizeTools[0]);
  return (
    <ChapterPreview
      chapter={chapter}
      label="Customize"
      tools={customizeTools}
      selected={tool}
      onSelect={setTool}
      actions={<AppearanceActions />}
      toolsAbove="sm"
      panel={<AppearanceControls tool={tool} />}
    >
      <div className="nx:preview-fade">
        <ComponentWall />
      </div>
    </ChapterPreview>
  );
}
