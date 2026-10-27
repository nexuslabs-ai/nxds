import { cva } from 'class-variance-authority';
import type { InjectionKey } from 'vue';

export { default as Table, type TableProps } from './Table.vue';
export { default as TableBody, type TableBodyProps } from './TableBody.vue';
export {
  default as TableCaption,
  type TableCaptionProps,
} from './TableCaption.vue';
export { default as TableCell, type TableCellProps } from './TableCell.vue';
export {
  default as TableFooter,
  type TableFooterProps,
} from './TableFooter.vue';
export { default as TableHead, type TableHeadProps } from './TableHead.vue';
export {
  default as TableHeader,
  type TableHeaderProps,
} from './TableHeader.vue';
export { default as TableRow, type TableRowProps } from './TableRow.vue';
export {
  default as TableRowHeader,
  type TableRowHeaderProps,
} from './TableRowHeader.vue';
export {
  default as TableSelectionCell,
  type TableSelectionCellProps,
} from './TableSelectionCell.vue';
export {
  default as TableSelectionHead,
  type TableSelectionHeadProps,
} from './TableSelectionHead.vue';

export type TableVariant = 'default' | 'borderless' | 'grid';
export type TableDensity = 'comfortable' | 'compact';

interface TableContext {
  variant: TableVariant;
  density: TableDensity;
  stickyHeader: boolean;
}

export const TableKey: InjectionKey<TableContext> = Symbol('table');

export const tableContextDefaults: TableContext = {
  variant: 'default',
  density: 'comfortable',
  stickyHeader: false,
};

export const tableFooterVariants = cva(
  'nx:bg-muted nx:typography-label-default nx:[&>tr]:last:border-b-0',
  {
    variants: {
      variant: {
        default: 'nx:border-t-default nx:border-border-default-alpha',
        borderless: '',
        grid: 'nx:border-t-default nx:border-border-default-alpha',
      } satisfies Record<TableVariant, string>,
    },
    defaultVariants: { variant: 'default' },
  }
);

export const tableRowVariants = cva(
  'nx:transition-colors nx:hover:bg-background-hover nx:data-[state=selected]:bg-control-background nx:data-[state=selected]:hover:bg-control-background-hover',
  {
    variants: {
      variant: {
        default: 'nx:border-b-default nx:border-border-default-alpha',
        borderless: '',
        grid: 'nx:border-b-default nx:border-border-default-alpha',
      } satisfies Record<TableVariant, string>,
    },
    defaultVariants: { variant: 'default' },
  }
);

export const tableHeadVariants = cva(
  'nx:px-2 nx:text-start nx:align-middle nx:typography-label-default nx:whitespace-nowrap nx:text-muted-foreground nx:[&[aria-sort=ascending]]:text-foreground nx:[&[aria-sort=descending]]:text-foreground',
  {
    variants: {
      variant: {
        default: '',
        borderless: '',
        grid: 'nx:border-e-default nx:border-border-default-alpha nx:last:border-e-0',
      } satisfies Record<TableVariant, string>,
      density: {
        comfortable: 'nx:py-3',
        compact: 'nx:py-2.5',
      } satisfies Record<TableDensity, string>,
    },
    defaultVariants: {
      variant: 'default',
      density: 'comfortable',
    },
  }
);

export const tableCellVariants = cva(
  'nx:px-2 nx:align-middle nx:whitespace-nowrap',
  {
    variants: {
      variant: {
        default: '',
        borderless: '',
        grid: 'nx:border-e-default nx:border-border-default-alpha nx:last:border-e-0',
      } satisfies Record<TableVariant, string>,
      density: {
        comfortable: 'nx:py-3',
        compact: 'nx:py-2',
      } satisfies Record<TableDensity, string>,
    },
    defaultVariants: { variant: 'default', density: 'comfortable' },
  }
);

export const tableSelectionCellClassName =
  'nx:w-0 nx:pe-0 nx:*:[[role=checkbox]]:translate-y-0.5';
