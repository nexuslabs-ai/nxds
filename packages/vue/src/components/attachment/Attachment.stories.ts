import {
  PhArrowClockwise,
  PhCheckCircle,
  PhDownloadSimple,
  PhFile,
  PhFileDoc,
  PhFilePdf,
  PhFileTxt,
  PhFileZip,
  PhUploadSimple,
  PhWarning,
  PhX,
} from '@phosphor-icons/vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '../button';
import { Spinner } from '../spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';

import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentProgress,
  type AttachmentProps,
  AttachmentTitle,
  AttachmentTrigger,
} from '.';

const meta = {
  title: 'Components/Attachment',
  component: Attachment,
  parameters: {
    docs: {
      description: {
        component:
          'Attachment shows one file with its preview, name, size and upload state. Use it in upload queues and message composers. For a general list row, use Item.',
      },
    },
  },
} satisfies Meta<typeof Attachment>;

export default meta;
type Story = StoryObj<typeof meta>;
type ActionStory = StoryObj<
  AttachmentProps & { onOpen: () => void; onRemove: () => void }
>;

const attachmentComponents = {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
};

// A gray thumbnail rendered without a network request.
const THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23999'/%3E%3C/svg%3E";

// Docs stories: the docs site shows these, in this order.

// A settled attachment: icon media, name + size, and a remove action.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      Attachment,
      AttachmentActions,
      AttachmentContent,
      AttachmentDescription,
      AttachmentMedia,
      AttachmentTitle,
      Button,
      PhFilePdf,
      PhX,
    },
    template: `
      <Attachment class="nx:w-80">
        <AttachmentMedia variant="icon"><PhFilePdf /></AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>2.4 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <Button variant="ghost" size="sm" icon-only>
            <template #start-icon><PhX /></template>Remove report.pdf</Button>
        </AttachmentActions>
      </Attachment>
    `,
  }),
};

// Every lifecycle state, top to bottom.
export const States: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Show each upload state, from empty drop target to done.',
      },
    },
  },
  render: () => ({
    components: {
      Attachment,
      AttachmentActions,
      AttachmentContent,
      AttachmentDescription,
      AttachmentMedia,
      AttachmentProgress,
      AttachmentTitle,
      Button,
      PhWarning,
      PhCheckCircle,
      PhDownloadSimple,
      PhFilePdf,
      PhFileTxt,
      PhArrowClockwise,
      PhUploadSimple,
      PhX,
      Spinner,
    },
    template: `
      <div class="nx:flex nx:w-80 nx:flex-col nx:gap-3">
        <Attachment state="idle">
          <AttachmentMedia variant="icon"><PhUploadSimple /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Drop a file here</AttachmentTitle>
            <AttachmentDescription>PDF or PNG, up to 10 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <Button variant="ghost" size="sm" icon-only>
              <template #start-icon><PhX /></template>Dismiss</Button>
          </AttachmentActions>
        </Attachment>
        <Attachment state="uploading">
          <AttachmentMedia variant="icon"><PhFilePdf /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>report.pdf</AttachmentTitle>
            <AttachmentDescription>62% of 2.4 MB</AttachmentDescription>
            <AttachmentProgress :model-value="62" aria-label="Uploading report.pdf" />
          </AttachmentContent>
          <AttachmentActions>
            <Button variant="ghost" size="sm" icon-only>
              <template #start-icon><PhX /></template>Cancel upload of report.pdf</Button>
          </AttachmentActions>
        </Attachment>
        <Attachment state="processing">
          <AttachmentMedia variant="icon"><Spinner /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>scan.png</AttachmentTitle>
            <AttachmentDescription>Processing…</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <Button variant="ghost" size="sm" icon-only>
              <template #start-icon><PhX /></template>Cancel processing of scan.png</Button>
          </AttachmentActions>
        </Attachment>
        <Attachment state="error">
          <AttachmentMedia variant="icon"><PhWarning /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>archive.zip</AttachmentTitle>
            <AttachmentDescription>Upload failed — file too large</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <Button variant="ghost" size="sm" icon-only>
              <template #start-icon><PhArrowClockwise /></template>Retry upload of archive.zip</Button>
            <Button variant="ghost" size="sm" icon-only>
              <template #start-icon><PhX /></template>Dismiss archive.zip</Button>
          </AttachmentActions>
        </Attachment>
        <Attachment state="done">
          <AttachmentMedia variant="icon"><PhFileTxt /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>notes.txt<template #trailing>
                <PhCheckCircle weight="fill" class="nx:size-4 nx:text-success-subtle-foreground" />
              </template></AttachmentTitle>
            <AttachmentDescription>8 KB · Uploaded just now</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <Button variant="ghost" size="sm" icon-only>
              <template #start-icon><PhDownloadSimple /></template>Download notes.txt</Button>
            <Button variant="ghost" size="sm" icon-only>
              <template #start-icon><PhX /></template>Remove notes.txt</Button>
          </AttachmentActions>
        </Attachment>
      </div>
    `,
  }),
};

// The two densities, each showing its file type through the leading icon.
export const Sizes: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Compare the default and small sizes.',
      },
    },
  },
  render: () => ({
    components: {
      Attachment,
      AttachmentActions,
      AttachmentContent,
      AttachmentDescription,
      AttachmentMedia,
      AttachmentTitle,
      Button,
      PhFilePdf,
      PhFileTxt,
      PhX,
    },
    template: `
      <div class="nx:flex nx:w-80 nx:flex-col nx:gap-3">
        <Attachment size="default">
          <AttachmentMedia variant="icon"><PhFilePdf /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>report.pdf</AttachmentTitle>
            <AttachmentDescription>2.4 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <Button variant="ghost" size="sm" icon-only>
              <template #start-icon><PhX /></template>Remove report.pdf</Button>
          </AttachmentActions>
        </Attachment>
        <Attachment size="sm">
          <AttachmentMedia variant="icon"><PhFileTxt /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>notes.txt</AttachmentTitle>
            <AttachmentDescription>8 KB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <Button variant="ghost" size="sm" icon-only>
              <template #start-icon><PhX /></template>Remove notes.txt</Button>
          </AttachmentActions>
        </Attachment>
      </div>
    `,
  }),
};

// A composer strip — mixed file types scrolling horizontally.
export const Grouped: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Scroll several attachments sideways in an AttachmentGroup.',
      },
    },
  },
  render: () => ({
    components: {
      Attachment,
      AttachmentContent,
      AttachmentDescription,
      AttachmentGroup,
      AttachmentMedia,
      AttachmentTitle,
      PhFileDoc,
      PhFilePdf,
      PhFileTxt,
      PhFileZip,
    },
    setup: () => ({
      thumb:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23999'/%3E%3C/svg%3E",
      files: [
        { name: 'cover.png', size: '412 KB' },
        { name: 'report.pdf', size: '2.4 MB' },
        { name: 'notes.txt', size: '8 KB' },
        { name: 'archive.zip', size: '18 MB' },
        { name: 'brief.docx', size: '96 KB' },
      ],
    }),
    template: `
      <AttachmentGroup aria-label="Attached files" class="nx:w-80">
        <Attachment v-for="file in files" :key="file.name" orientation="vertical">
          <AttachmentMedia :variant="file.name.endsWith('.png') ? 'image' : 'icon'">
            <img v-if="file.name.endsWith('.png')" :src="thumb" alt="" />
            <PhFilePdf v-else-if="file.name.endsWith('.pdf')" />
            <PhFileTxt v-else-if="file.name.endsWith('.txt')" />
            <PhFileZip v-else-if="file.name.endsWith('.zip')" />
            <PhFileDoc v-else />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{{ file.name }}</AttachmentTitle>
            <AttachmentDescription>{{ file.size }}</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      </AttachmentGroup>
    `,
  }),
};

// Behaviour stories: play-function coverage, not shown on the docs site.

// The strip is its own tab stop, so it can be scrolled by keyboard even when
// no card inside it is focusable.
export const GroupKeyboardInteraction: Story = {
  render: () => ({
    components: { ...attachmentComponents, AttachmentGroup, PhFile },
    setup: () => ({
      names: ['cover.png', 'report.pdf', 'notes.txt', 'archive.zip'],
    }),
    template: `
      <AttachmentGroup aria-label="Attached files" class="nx:w-80">
        <Attachment v-for="name in names" :key="name" orientation="vertical">
          <AttachmentMedia variant="icon"><PhFile /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{{ name }}</AttachmentTitle>
          </AttachmentContent>
        </Attachment>
      </AttachmentGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Attached files' });

    await userEvent.tab();
    await expect(group).toHaveFocus();
    await expect(group).toHaveAttribute('data-slot', 'attachment-group');

    // A tab stop that cannot scroll would make the focus pointless.
    await expect(group.scrollWidth).toBeGreaterThan(group.clientWidth);
  },
};

const LONG_NAME = 'quarterly-financial-report-with-appendices-final-v12.pdf';

// Long names truncate rather than widening the card, with a tooltip on the
// card trigger revealing the full name.
export const LongFileName: Story = {
  render: () => ({
    components: {
      ...attachmentComponents,
      AttachmentTrigger,
      Button,
      PhFilePdf,
      PhX,
      Tooltip,
      TooltipContent,
      TooltipProvider,
      TooltipTrigger,
    },
    setup: () => ({ name: LONG_NAME }),
    template: `
      <TooltipProvider>
        <Attachment class="nx:w-80">
          <Tooltip>
            <TooltipTrigger as-child>
              <AttachmentTrigger>
                <span class="nx:sr-only">Open {{ name }}</span>
              </AttachmentTrigger>
            </TooltipTrigger>
            <TooltipContent>{{ name }}</TooltipContent>
          </Tooltip>
          <AttachmentMedia variant="icon"><PhFilePdf /></AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{{ name }}</AttachmentTitle>
            <AttachmentDescription>2.4 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <Button variant="ghost" size="sm" icon-only>
              <template #start-icon><PhX /></template>Remove {{ name }}</Button>
          </AttachmentActions>
        </Attachment>
      </TooltipProvider>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText(LONG_NAME);

    await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
  },
};

// The remove action fires, and is not blocked by the full-card trigger overlay.
export const ClickInteraction: ActionStory = {
  args: { onOpen: fn(), onRemove: fn() },
  render: (args) => ({
    components: {
      ...attachmentComponents,
      AttachmentTrigger,
      Button,
      PhFilePdf,
      PhX,
    },
    setup: () => ({ args }),
    template: `
      <Attachment class="nx:w-80">
        <AttachmentTrigger @click="args.onOpen">
          <span class="nx:sr-only">Open report.pdf</span>
        </AttachmentTrigger>
        <AttachmentMedia variant="icon"><PhFilePdf /></AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>2.4 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <Button variant="ghost" size="sm" icon-only @click="args.onRemove">
            <template #start-icon><PhX /></template>Remove report.pdf</Button>
        </AttachmentActions>
      </Attachment>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: 'Open report.pdf' });
    await userEvent.click(trigger);
    await expect(args.onOpen).toHaveBeenCalledTimes(1);

    const remove = canvas.getByRole('button', { name: 'Remove report.pdf' });
    await userEvent.click(remove);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
  },
};

// The card trigger is reachable and activates from the keyboard.
export const KeyboardInteraction: ActionStory = {
  args: { onOpen: fn() },
  render: (args) => ({
    components: { ...attachmentComponents, AttachmentTrigger },
    setup: () => ({ args }),
    template: `
      <Attachment class="nx:w-80">
        <AttachmentTrigger @click="args.onOpen">
          <span class="nx:sr-only">Open report.pdf</span>
        </AttachmentTrigger>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
        </AttachmentContent>
      </Attachment>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open report.pdf' });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
  },
};

// A disabled remove action does not fire.
export const Disabled: ActionStory = {
  args: { onRemove: fn() },
  render: (args) => ({
    components: { ...attachmentComponents, Button, PhX },
    setup: () => ({ args }),
    template: `
      <Attachment state="uploading" class="nx:w-80">
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>Uploading…</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <Button variant="ghost" size="sm" icon-only disabled @click="args.onRemove">
            <template #start-icon><PhX /></template>Remove report.pdf</Button>
        </AttachmentActions>
      </Attachment>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const remove = canvas.getByRole('button', { name: 'Remove report.pdf' });

    await expect(remove).toBeDisabled();

    // pointerEventsCheck: 0 dispatches the click at a disabled control that
    // would otherwise be unclickable, so the assertion can actually fail.
    await userEvent.click(remove, { pointerEventsCheck: 0 });
    await expect(args.onRemove).not.toHaveBeenCalled();
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: {
      ...attachmentComponents,
      AttachmentTrigger,
      Button,
      PhFilePdf,
      PhX,
    },
    template: `
      <Attachment state="uploading" orientation="vertical">
        <AttachmentTrigger as-child>
          <a href="#report"><span class="nx:sr-only">Open report.pdf</span></a>
        </AttachmentTrigger>
        <AttachmentMedia variant="icon"><PhFilePdf /></AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>report.pdf</AttachmentTitle>
          <AttachmentDescription>2.4 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <Button variant="ghost" size="sm" icon-only>
            <template #start-icon><PhX /></template>Remove report.pdf</Button>
        </AttachmentActions>
      </Attachment>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector('[data-slot="attachment"]');

    await expect(root).toHaveAttribute('data-state', 'uploading');
    await expect(root).toHaveAttribute('data-orientation', 'vertical');
    // Attachment pins Item's variant, so it must not advertise a variant API.
    await expect(root).not.toHaveAttribute('data-variant');

    // Each part replaces the underlying item-* slot rather than adding one.
    for (const slot of [
      'attachment-media',
      'attachment-content',
      'attachment-title',
      'attachment-description',
      'attachment-actions',
    ]) {
      await expect(
        canvasElement.querySelector(`[data-slot="${slot}"]`)
      ).toBeInTheDocument();
    }
    await expect(
      canvasElement.querySelector('[data-slot^="item-"]')
    ).toBeNull();

    // ...but the structural hook Item's own CSS keys off must survive the
    // rename, or ItemMedia silently loses its alignment nudge.
    await expect(
      canvasElement.querySelector('[data-slot="attachment-content"]')
    ).toHaveAttribute('data-item-part', 'content');
    await expect(
      canvasElement.querySelector('[data-slot="attachment-description"]')
    ).toHaveAttribute('data-item-part', 'description');

    await expect(canvas.getByRole('status')).toHaveTextContent('Uploading');

    // The trigger composes as a link via as-child.
    const link = canvas.getByRole('link', { name: 'Open report.pdf' });
    await expect(link).toHaveAttribute('href', '#report');
    await expect(link).toHaveAttribute('data-slot', 'attachment-trigger');
  },
};

// Visual grid reference.
export const AllVariants: Story = {
  render: () => ({
    components: { ...attachmentComponents, AttachmentGroup, PhFile },
    setup: () => ({
      thumb: THUMB,
      states: ['idle', 'uploading', 'processing', 'error', 'done'],
      names: ['one.png', 'two.png', 'three.png'],
    }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-6">
        <div class="nx:flex nx:w-80 nx:flex-col nx:gap-3">
          <Attachment v-for="state in states" :key="state" :state="state">
            <AttachmentMedia variant="icon"><PhFile /></AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{{ state }}</AttachmentTitle>
              <AttachmentDescription>2.4 MB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </div>
        <AttachmentGroup aria-label="Attached files" class="nx:w-80">
          <Attachment v-for="name in names" :key="name" orientation="vertical">
            <AttachmentMedia variant="image"><img :src="thumb" alt="" /></AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{{ name }}</AttachmentTitle>
            </AttachmentContent>
          </Attachment>
        </AttachmentGroup>
      </div>
    `,
  }),
};
