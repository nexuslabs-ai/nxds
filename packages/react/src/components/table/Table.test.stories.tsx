import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Checkbox } from '../checkbox/checkbox';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  type TableProps,
  TableRow,
  TableRowHeader,
  TableSelectionCell,
  TableSelectionHead,
} from './table';
import tableMeta, {
  Borderless,
  ColumnPriority,
  Density,
  Grid,
  RowLink,
  StickyColumn,
  StickyHeader,
  Striped,
  TruncatedCells,
} from './Table.stories';

const meta: Meta<typeof Table> = {
  ...tableMeta,
  title: 'Tests/Table',
};

export default meta;
type Story = StoryObj<typeof Table>;

const densityCellSelector = (density: string) =>
  `[data-slot="table"][data-table-density="${density}"] [data-slot="table-cell"]`;

const invoices = [
  {
    invoice: 'INV001',
    status: 'Paid',
    method: 'Credit Card',
    amount: '$250.00',
  },
  { invoice: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  {
    invoice: 'INV003',
    status: 'Unpaid',
    method: 'Bank Transfer',
    amount: '$350.00',
  },
  {
    invoice: 'INV004',
    status: 'Paid',
    method: 'Credit Card',
    amount: '$450.00',
  },
  { invoice: 'INV005', status: 'Paid', method: 'PayPal', amount: '$550.00' },
];

const selectionInvoices = invoices.map((row) => ({ ...row, id: row.invoice }));

const selectionPartSelector =
  '[data-slot="table-selection-head"], [data-slot="table-selection-cell"]';

interface SelectionTableDemoProps extends TableProps {
  rows?: typeof selectionInvoices;
  disabled?: boolean;
}

// Consumer-owned selection state: INV001 and INV003 start selected, so the
// header checkbox opens in its mixed state.
function SelectionTableDemo({
  rows = selectionInvoices,
  disabled = false,
  ...props
}: SelectionTableDemoProps) {
  const [selected, setSelected] = useState(
    () =>
      new Set(
        disabled
          ? []
          : rows.filter((_, i) => i === 0 || i === 2).map((row) => row.id)
      )
  );
  const allSelected = rows.length > 0 && selected.size === rows.length;
  const checked = allSelected
    ? true
    : selected.size > 0
      ? 'indeterminate'
      : false;

  function toggleAll(value: boolean | 'indeterminate') {
    setSelected(
      value === true ? new Set(rows.map((row) => row.id)) : new Set()
    );
  }

  function toggleRow(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Table {...props}>
      <TableCaption>Recent invoices with row selection.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableSelectionHead>
            <Checkbox
              checked={checked}
              onCheckedChange={toggleAll}
              disabled={disabled || rows.length === 0}
              aria-label="Select all rows"
            />
          </TableSelectionHead>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="nx:text-end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4}>No invoices yet.</TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={selected.has(row.id) ? 'selected' : undefined}
            >
              <TableSelectionCell>
                <Checkbox
                  checked={selected.has(row.id)}
                  onCheckedChange={() => toggleRow(row.id)}
                  disabled={disabled}
                  aria-label={`Select ${row.id}`}
                />
              </TableSelectionCell>
              <TableRowHeader>{row.id}</TableRowHeader>
              <TableCell>{row.status}</TableCell>
              <TableCell className="nx:text-end nx:tabular-nums">
                {row.amount}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

// Every variant × density, in both directions: each selection cell shrinks to
// its checkbox, and the header and row checkboxes line up in one column.
export const SelectionLayoutMatrix: Story = {
  render: () => (
    <div className="nx:w-full nx:space-y-6">
      {(['ltr', 'rtl'] as const).map((dir) =>
        (['default', 'borderless', 'grid'] as const).map((variant) =>
          (['comfortable', 'compact'] as const).map((density) => (
            <div
              key={`${dir}-${variant}-${density}`}
              dir={dir}
              className="nx:w-full nx:overflow-hidden nx:border-default nx:border-border-default"
            >
              <SelectionTableDemo variant={variant} density={density} striped />
            </div>
          ))
        )
      )}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const containers = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="table-container"]'
    );
    await expect(containers).toHaveLength(12);
    for (const container of containers) {
      const cells = container.querySelectorAll<HTMLElement>(
        selectionPartSelector
      );
      await expect(cells).toHaveLength(invoices.length + 1);
      const columnStarts = new Set<number>();
      for (const cell of cells) {
        const control = cell.querySelector<HTMLElement>('[role="checkbox"]');
        if (!control) throw new Error('Selection control missing');
        const style = getComputedStyle(cell);
        const contentWidth =
          cell.clientWidth -
          parseFloat(style.paddingInlineStart) -
          parseFloat(style.paddingInlineEnd);
        const box = control.getBoundingClientRect();
        await expect(Math.abs(contentWidth - box.width)).toBeLessThanOrEqual(1);
        columnStarts.add(Math.round(box.left));
      }
      await expect(columnStarts.size).toBe(1);
    }
  },
};

export const StripedStyle: Story = {
  ...Striped,
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll(
      'tbody [data-slot="table-row"]'
    );
    const bg = (el: Element) => getComputedStyle(el).backgroundColor;
    const TRANSPARENT = 'rgba(0, 0, 0, 0)';

    // Even (unselected) rows are tinted; odd rows are bare.
    await expect(bg(rows[3] as Element)).not.toBe(TRANSPARENT); // even, striped
    await expect(bg(rows[0] as Element)).toBe(TRANSPARENT); // odd, no stripe
  },
};

export const BorderlessStyle: Story = {
  ...Borderless,
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('[data-slot="table-row"]');

    await expect(row).not.toHaveClass('nx:border-b-default');
  },
};

export const GridStyle: Story = {
  ...Grid,
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('[data-slot="table-row"]');
    const cell = canvasElement.querySelector('[data-slot="table-cell"]');

    if (!cell) throw new Error('Grid cell missing');

    await expect(row).toHaveClass(
      'nx:border-b-default',
      'nx:border-border-default-alpha'
    );
    await expect(
      parseFloat(getComputedStyle(cell).borderInlineEndWidth)
    ).toBeGreaterThan(0);
  },
};

export const DensityStyle: Story = {
  ...Density,
  play: async ({ canvasElement }) => {
    const comfyCell = canvasElement.querySelector(
      densityCellSelector('comfortable')
    );
    const compactCell = canvasElement.querySelector(
      densityCellSelector('compact')
    );

    await expect(comfyCell).toHaveClass('nx:py-3');
    await expect(compactCell).toHaveClass('nx:py-2');
  },
};

export const StickyHeaderStyle: Story = {
  ...StickyHeader,
  play: async ({ canvasElement }) => {
    const head = canvasElement.querySelector('[data-slot="table-head"]');

    await expect(head).toHaveClass('nx:sticky', 'nx:top-0', 'nx:bg-container');
    await expect(getComputedStyle(head as Element).position).toBe('sticky');
  },
};

export const TruncatedCellsGeometry: Story = {
  ...TruncatedCells,
  play: async ({ canvasElement }) => {
    const clip = canvasElement.querySelector('[data-slot="table-cell"] div');
    // The text genuinely overflows its box — proves real clipping, not just the class.
    await expect((clip as Element).scrollWidth).toBeGreaterThan(
      (clip as Element).clientWidth
    );
  },
};

export const StickyColumnStyle: Story = {
  ...StickyColumn,
  play: async ({ canvasElement }) => {
    const selectedRow = canvasElement.querySelector(
      'tbody [data-slot="table-row"][data-state="selected"]'
    );
    const stickyCell = selectedRow?.querySelector('[data-sticky="start"]');

    // The column is actually pinned.
    await expect(getComputedStyle(stickyCell as Element).position).toBe(
      'sticky'
    );
    // bg-inherit makes the sticky cell resolve to its row's bg — the selection
    // tint here, not a flat fill that would show a mismatched stripe.
    await expect(getComputedStyle(stickyCell as Element).backgroundColor).toBe(
      getComputedStyle(selectedRow as Element).backgroundColor
    );
  },
};

export const ColumnPriorityStyle: Story = {
  ...ColumnPriority,
  play: async ({ canvasElement }) => {
    const heads = canvasElement.querySelectorAll('[data-slot="table-head"]');
    const methodHead = heads[1]; // the @max-md:hidden Method column header
    // At a 20rem container (< md) the low-priority column is hidden.
    await expect(getComputedStyle(methodHead as Element).display).toBe('none');
  },
};

export const RowLinkStyle: Story = {
  ...RowLink,
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector('a[href^="#/invoices/"]');
    // after:content-[''] is required for ::after to generate a box at all.
    const overlay = getComputedStyle(link as Element, '::after');
    await expect(overlay.content).not.toBe('none');
    await expect(overlay.position).toBe('absolute');
  },
};
