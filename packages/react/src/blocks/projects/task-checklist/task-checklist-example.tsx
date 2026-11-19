'use client';

import { useState } from 'react';

import { TaskChecklist, type TaskChecklistItem } from './task-checklist';

const initialTasks: TaskChecklistItem[] = [
  { label: 'Explore the direction', done: true },
  { label: 'Review the components' },
  { label: 'Polish the interactions' },
  { label: 'Share with the team' },
];

export function TaskChecklistExample() {
  const [tasks, setTasks] = useState(initialTasks);
  return (
    <div className="nx:w-full nx:max-w-sm">
      <TaskChecklist
        tasks={tasks}
        assignee={{ name: 'Alex Morgan', detail: 'Due November 12' }}
        onTaskChange={(index, done) =>
          setTasks((current) =>
            current.map((task, i) => (i === index ? { ...task, done } : task))
          )
        }
      />
    </div>
  );
}
