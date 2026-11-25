import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Button } from '../button/button';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card';
import cardMeta from './Card.stories';

const meta: Meta<typeof Card> = {
  ...cardMeta,
  title: 'Tests/Card',
};

export default meta;
type Story = StoryObj<typeof Card>;

export const LongTitleWithAction: Story = {
  render: () => (
    <Card className="nx:w-[320px]">
      <CardHeader>
        <CardTitle>
          Quarterly revenue operations review with customer expansion notes
        </CardTitle>
        <CardDescription>
          The action should keep its own reserved column.
        </CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Header text wraps before it reaches the action.</p>
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    await document.fonts.ready;

    const title = canvasElement.querySelector<HTMLElement>(
      '[data-slot="card-title"]'
    );
    const action = canvasElement.querySelector<HTMLElement>(
      '[data-slot="card-action"]'
    );

    if (!title || !action) {
      throw new Error('Expected card title and action to render.');
    }

    const titleRect = title.getBoundingClientRect();
    const actionRect = action.getBoundingClientRect();

    await expect(titleRect.right).toBeLessThanOrEqual(actionRect.left + 0.5);
  },
};
