import { cva } from 'class-variance-authority';

export { default as Toolbar, type ToolbarProps } from './Toolbar.vue';
export {
  default as ToolbarButton,
  type ToolbarButtonProps,
} from './ToolbarButton.vue';
export {
  default as ToolbarGroup,
  type ToolbarGroupProps,
} from './ToolbarGroup.vue';
export {
  default as ToolbarLink,
  type ToolbarLinkProps,
} from './ToolbarLink.vue';
export {
  default as ToolbarSeparator,
  type ToolbarSeparatorProps,
} from './ToolbarSeparator.vue';
export {
  default as ToolbarToggleGroup,
  type ToolbarToggleGroupProps,
} from './ToolbarToggleGroup.vue';
export {
  default as ToolbarToggleItem,
  type ToolbarToggleItemProps,
} from './ToolbarToggleItem.vue';
export {
  default as ToolbarTool,
  type ToolbarToolProps,
} from './ToolbarTool.vue';
export {
  default as ToolbarToolGroup,
  type ToolbarToolGroupProps,
} from './ToolbarToolGroup.vue';
export {
  default as ToolbarToolPanel,
  type ToolbarToolPanelProps,
} from './ToolbarToolPanel.vue';

export const toolbarVariants = cva(
  'nx:group/toolbar nx:flex nx:w-fit nx:max-w-full nx:min-w-0 nx:flex-wrap nx:items-center nx:border-default nx:border-border-default nx:bg-container nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
  {
    variants: {
      variant: {
        default: 'nx:gap-0.5 nx:rounded-lg nx:p-0.5 nx:shadow-sm',
        floating: 'nx:gap-2 nx:rounded-2xl nx:p-2 nx:shadow-lg',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export const toolbarGroupLayout =
  'nx:flex nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-[inherit] nx:group-data-[orientation=vertical]/toolbar:flex-col nx:group-data-[orientation=vertical]/toolbar:items-stretch';
