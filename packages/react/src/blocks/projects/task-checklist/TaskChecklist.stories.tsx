import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import { TaskChecklist } from './task-checklist';
import blockSource from './task-checklist.tsx?raw';
import { TaskChecklistExample } from './task-checklist-example';
import exampleSource from './task-checklist-example.tsx?raw';

const meta: Meta<typeof TaskChecklist> = {
  title: 'Blocks/Projects/TaskChecklist',
  component: TaskChecklist,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'TaskChecklist shows a short project checklist: how many tasks are done, a progress bar, the tasks and their assignee. Use it on a project or card overview. For one item use a Checkbox, and for a long backlog use Table.',
      },
      page: () => (
        <>
          <Title />
          <p>
            Track a handful of tasks in one card. The count and the progress bar
            follow the tasks you pass, and the assignee sits at the foot of the
            list.
          </p>
          <h2>When to use it</h2>
          <p>
            Use it for a short checklist that belongs to one project or card,
            where progress matters more than the list itself. For a single
            choice use a Checkbox, for a long list use Table, and for several
            checklists across projects, render one block per project.
          </p>
          <h2>Minimal composition</h2>
          <Canvas of={Default} />
          <Source code={exampleSource} language="tsx" />
          <h2>Tasks and changes</h2>
          <p>
            <code>tasks</code> is controlled: each item carries its{' '}
            <code>label</code>, a <code>done</code> flag and an optional{' '}
            <code>id</code>. Checking a row calls <code>onTaskChange</code> with
            the task&apos;s position and its next state, and your app writes
            that back.
          </p>
          <ul>
            <li>
              The count and the progress bar are derived, so they never drift
              from <code>tasks</code>.
            </li>
            <li>
              The progress bar is named <q>2 of 4 tasks complete</q> for
              assistive technology, and the count repeats it visually.
            </li>
            <li>
              A done task is struck through, and its row stays clickable so it
              can be reopened.
            </li>
          </ul>
          <p>
            Pass a stable <code>id</code> per task when the list can be
            reordered, so the checkbox keeps its identity. Without one the
            position is used.
          </p>
          <h2>Assignee</h2>
          <p>
            <code>assignee</code> takes the person&apos;s <code>name</code> and
            an optional <code>detail</code>, such as a due date. The avatar
            shows their initials.
          </p>
          <h2>Behaviour</h2>
          <h3>Checking a task</h3>
          <Canvas of={ChecksATask} />
          <h3>Reopening a task</h3>
          <Canvas of={UnchecksATask} />
          <h2>Delivery</h2>
          <p>
            Manual guidance until the generated catalog lands (#798). This is
            copy-source, not a package export.
          </p>
          <ul>
            <li>
              Copy{' '}
              <code>blocks/projects/task-checklist/task-checklist.tsx</code>.
            </li>
            <li>
              It needs these nxds component folders, including the ones those
              folders import: <code>avatar</code>, <code>badge</code>,{' '}
              <code>checkbox</code>, <code>choice-row</code>, <code>item</code>,{' '}
              <code>label</code>, <code>progress</code>, <code>separator</code>{' '}
              and <code>lib/</code>. If your copy lives elsewhere, update the
              relative imports.
            </li>
            <li>
              Include the copied file in your Tailwind source scan and use the
              nxds theme and styles setup.
            </li>
            <li>
              Your application owns the tasks, their persistence and who may
              change them.
            </li>
          </ul>
          <h2>Evidence and support boundary</h2>
          <p>The stories on this page test each behaviour above.</p>
          <p>
            Not supported: per-task assignees, due dates per task, nested
            subtasks, and reordering or adding tasks. Model those in your app
            and render a richer row yourself.
          </p>
          <h2>Implementation</h2>
          <details>
            <summary>blocks/projects/task-checklist/task-checklist.tsx</summary>
            <Source code={blockSource} language="tsx" />
          </details>
        </>
      ),
    },
  },
};
export default meta;

type Story = StoryObj<typeof TaskChecklist>;

export const Default: Story = {
  tags: ['docs'],
  render: () => <TaskChecklistExample />,
  parameters: { docs: { source: { code: exampleSource } } },
};

export const ChecksATask: Story = {
  render: () => <TaskChecklistExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole('progressbar');
    const count = canvasElement.querySelector<HTMLElement>(
      '[data-slot="task-checklist-count"]'
    );
    await expect(progress).toHaveAccessibleName('1 of 4 tasks complete');
    await expect(count).toHaveTextContent(/1\s*\/\s*4/);
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Review the components' })
    );
    await expect(progress).toHaveAccessibleName('2 of 4 tasks complete');
    await expect(progress).toHaveAttribute('aria-valuenow', '50');
    await expect(count).toHaveTextContent(/2\s*\/\s*4/);
  },
};

export const UnchecksATask: Story = {
  render: () => <TaskChecklistExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole('progressbar');
    const count = canvasElement.querySelector<HTMLElement>(
      '[data-slot="task-checklist-count"]'
    );
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Explore the direction' })
    );
    await expect(progress).toHaveAccessibleName('0 of 4 tasks complete');
    await expect(progress).toHaveAttribute('aria-valuenow', '0');
    await expect(count).toHaveTextContent(/0\s*\/\s*4/);
  },
};
