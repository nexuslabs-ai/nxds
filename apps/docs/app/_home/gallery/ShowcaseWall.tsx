'use client';

import type { ComponentType, FocusEvent } from 'react';

import { cn } from '@nxds/react/utils';

import {
  ActivityCard,
  BillingCard,
  ComposeCard,
  ContactCard,
  ConversationCard,
  FilesCard,
  InboxCard,
  NotesCard,
  PipelineCard,
  PreferencesCard,
  ProjectCard,
  TasksCard,
  TeamCard,
  TransactionsCard,
} from './ShowcaseCards';

export type ShowcaseView =
  | 'Components'
  | 'Dashboard'
  | 'Mail'
  | 'Chat'
  | 'Finances'
  | 'CRM';

// Four columns per view, using every card once. The first card of each column
// is the one above the fold; the short columns get a fourth card so no column
// ends above the bottom fade.
const views: Record<ShowcaseView, ComponentType[][]> = {
  Components: [
    [ProjectCard, PreferencesCard, InboxCard],
    [ActivityCard, ConversationCard, NotesCard, ComposeCard],
    [TeamCard, TasksCard, ContactCard],
    [BillingCard, PipelineCard, TransactionsCard, FilesCard],
  ],
  Dashboard: [
    [TasksCard, TeamCard, InboxCard],
    [ActivityCard, TransactionsCard, FilesCard, NotesCard],
    [BillingCard, PreferencesCard, ConversationCard, ComposeCard],
    [PipelineCard, ContactCard, ProjectCard],
  ],
  Mail: [
    [InboxCard, FilesCard, NotesCard],
    [ComposeCard, ProjectCard, TasksCard],
    [ConversationCard, TeamCard, ActivityCard, PreferencesCard],
    [ContactCard, PipelineCard, BillingCard, TransactionsCard],
  ],
  Chat: [
    [ConversationCard, ContactCard, TasksCard],
    [TeamCard, NotesCard, ActivityCard, ProjectCard],
    [ComposeCard, PreferencesCard, BillingCard, TransactionsCard],
    [InboxCard, PipelineCard, FilesCard],
  ],
  Finances: [
    [BillingCard, TasksCard, InboxCard],
    [ActivityCard, PipelineCard, NotesCard, TeamCard],
    [TransactionsCard, PreferencesCard, FilesCard, ComposeCard],
    [ContactCard, ConversationCard, ProjectCard],
  ],
  CRM: [
    [ContactCard, NotesCard, FilesCard],
    [PipelineCard, TeamCard, PreferencesCard, ProjectCard],
    [TasksCard, TransactionsCard, InboxCard],
    [ActivityCard, ConversationCard, BillingCard, ComposeCard],
  ],
};

// Each column joins the wall at the next Nexus breakpoint.
const columnVisibility = [
  'nx:flex',
  'nx:hidden nx:md:flex',
  'nx:hidden nx:lg:flex',
  'nx:hidden nx:2xl:flex',
];

// On a phone the wall swipes between columns. Chrome leaves a control unscrolled
// when a sliver of it shows in the peek, so snap to the column that takes focus.
function revealFocusedColumn(event: FocusEvent<HTMLDivElement>) {
  const wall = event.currentTarget;
  const column = Array.from(wall.children).find((child) =>
    child.contains(event.target)
  );
  if (!column) return;
  wall.scrollLeft +=
    column.getBoundingClientRect().left - wall.getBoundingClientRect().left;
}

/**
 * The Gallery canvas: columns of example cards that join at each breakpoint,
 * clipped under the canvas's bottom fade. On phones the columns swipe.
 */
export function ShowcaseWall({ view }: { view: ShowcaseView }) {
  return (
    <div
      key={view}
      className="nx:story-box-grid nx:showcase-wall"
      role="group"
      aria-label={`${view} examples`}
      onFocus={revealFocusedColumn}
    >
      {views[view].map((cards, column) => (
        <div
          key={column}
          className={cn(
            'nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-6',
            columnVisibility[column]
          )}
        >
          {cards.map((Example, index) => (
            <Example key={index} />
          ))}
        </div>
      ))}
    </div>
  );
}
