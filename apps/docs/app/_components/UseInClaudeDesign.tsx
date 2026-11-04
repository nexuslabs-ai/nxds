'use client';

import * as React from 'react';

import {
  formatThemeFlags,
  isExportThemeFlag,
} from '@nxds/claude-design/theme-fields';
import {
  DEFAULT_ICON_LIBRARY,
  NXDS_THEME_FIELDS,
  type NxdsTheme,
  nxdsThemeFlags,
} from '@nxds/core';
import { useNxdsAppearance } from '@nxds/react/appearance';

import { claudeDesignPrompt } from '../_lib/claude-design-prompt';
import { useIconLibrary } from '../_lib/icon-library';
import { IconCheck, IconCopy, IconX } from '../_lib/switchable-icons';
import { useCopyFeedback } from '../_lib/use-copy-feedback';

import { Button, Textarea } from './nxds';

const COPY_STATES = {
  idle: { icon: IconCopy, label: 'Use in Claude Design', message: '' },
  copied: {
    icon: IconCheck,
    label: 'Prompt copied',
    message: 'Prompt copied. Paste it into a new Claude chat.',
  },
  failed: {
    icon: IconX,
    label: 'Failed',
    message: 'Could not copy the prompt. Select it below and copy it.',
  },
};

/** The parts of `theme` a Claude Design system can't carry, as sentences. */
function leftOut(theme: NxdsTheme) {
  const notes: string[] = [];
  const fonts = NXDS_THEME_FIELDS.filter(
    (field) => field.kind === 'font' && field.read(theme) === undefined
  );
  if (fonts.length > 0) {
    notes.push(
      'Claude Design takes only the fonts the pickers list, so a custom font stays the default.'
    );
  }
  if (theme.iconLibrary !== DEFAULT_ICON_LIBRARY) {
    notes.push('Icons stay Phosphor on a canvas.');
  }
  return notes;
}

/** Copies the Claude Design setup prompt, with the docs theme as its theme flags. */
export function UseInClaudeDesign({ className }: { className?: string }) {
  const { state } = useNxdsAppearance();
  const iconLibrary = useIconLibrary();
  const copy = useCopyFeedback();
  const [copyFailed, setCopyFailed] = React.useState(false);
  const theme: NxdsTheme = { appearance: state, iconLibrary };
  const prompt = claudeDesignPrompt(
    formatThemeFlags(
      nxdsThemeFlags(theme).filter(({ flag }) => isExportThemeFlag(flag))
    )
  );
  const notes = leftOut(theme);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      copy.settle('copied');
    } catch {
      copy.settle('failed');
      setCopyFailed(true);
    }
  };

  const { icon: Icon, label, message } = COPY_STATES[copy.state];

  return (
    <div className="nx:flex nx:flex-col nx:gap-1">
      <Button
        variant="outline"
        className={className}
        data-state={copy.state}
        startIcon={<Icon />}
        onClick={handleCopy}
      >
        {label}
      </Button>
      {copyFailed && (
        <Textarea
          readOnly
          aria-label="Claude Design prompt"
          rows={6}
          value={prompt}
          onFocus={(event) => event.currentTarget.select()}
        />
      )}
      {notes.length > 0 && (
        <p className="nx:m-0 nx:typography-body-small nx:text-muted-foreground">
          {notes.join(' ')}
        </p>
      )}
      <span role="status" className="nx:sr-only">
        <span key={copy.seq}>{message}</span>
      </span>
    </div>
  );
}
