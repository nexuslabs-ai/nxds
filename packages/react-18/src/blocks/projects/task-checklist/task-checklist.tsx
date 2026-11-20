'use client';

import * as React from 'react';

import { Avatar, AvatarFallback } from '../../../components/avatar/avatar';
import { Badge } from '../../../components/badge/badge';
import { Checkbox } from '../../../components/checkbox/checkbox';
import {
  ChoiceRow,
  ChoiceRowTitle,
} from '../../../components/choice-row/choice-row';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '../../../components/item/item';
import { Progress } from '../../../components/progress/progress';
import { Separator } from '../../../components/separator/separator';
import { cn } from '../../../lib/utils';

export type TaskChecklistItem = {
  /** Stable key for the row and its ids. The index is used without one. */
  id?: string;
  label: string;
  done?: boolean;
};

export type TaskChecklistProps = React.ComponentProps<'div'> & {
  tasks: readonly TaskChecklistItem[];
  assignee: { name: string; detail?: string };
  /** Called with the task's position and its next checked state. */
  onTaskChange: (index: number, done: boolean) => void;
};

/** The assignee's initials, for the avatar. */
function initialsOf(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('');
}

/**
 * A short project checklist: how many tasks are done, a progress bar, the tasks
 * themselves and who owns them. Your app owns `tasks` and updates it in
 * `onTaskChange`.
 */
export const TaskChecklist = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<TaskChecklistProps>
>(function TaskChecklist(propsWithoutRef, forwardedRef) {
  const {
    tasks,
    assignee,
    onTaskChange,
    className,
    ...props
  }: React.PropsWithoutRef<TaskChecklistProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  const id = React.useId();
  const completed = tasks.filter((task) => task.done).length;
  const percent = tasks.length === 0 ? 0 : (completed / tasks.length) * 100;
  return (
    <div
      data-slot="task-checklist"
      className={cn('nx:flex nx:flex-col', className)}
      {...props}
    >
      <div className="nx:my-3 nx:flex nx:flex-wrap nx:items-center nx:gap-3.5">
        <strong
          data-slot="task-checklist-count"
          className="nx:typography-heading-large nx:tabular-nums"
        >
          {completed}
          <span className="nx:typography-heading-small nx:text-muted-foreground">
            {' '}
            / {tasks.length}
          </span>
        </strong>
        <Badge variant="secondary" fill="light">
          In progress
        </Badge>
      </div>
      <Progress
        value={percent}
        aria-label={`${completed} of ${tasks.length} tasks complete`}
      />
      <div className="nx:mt-4 nx:flex nx:flex-col">
        {tasks.map((task, index) => {
          const rowId = `${id}-${task.id ?? index}`;
          return (
            <ChoiceRow htmlFor={rowId} key={rowId}>
              <Checkbox
                id={rowId}
                checked={task.done === true}
                aria-labelledby={`${rowId}-label`}
                onCheckedChange={(checked) =>
                  onTaskChange(index, checked === true)
                }
              />
              <ChoiceRowTitle
                id={`${rowId}-label`}
                className={
                  task.done
                    ? 'nx:line-through nx:text-muted-foreground'
                    : undefined
                }
              >
                {task.label}
              </ChoiceRowTitle>
            </ChoiceRow>
          );
        })}
      </div>
      <Separator className="nx:my-6" />
      <Item size="sm" className="nx:p-0">
        <ItemMedia>
          <Avatar size="sm" aria-hidden="true">
            <AvatarFallback>{initialsOf(assignee.name)}</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{assignee.name}</ItemTitle>
          {assignee.detail && (
            <ItemDescription>{assignee.detail}</ItemDescription>
          )}
        </ItemContent>
      </Item>
    </div>
  );
});
