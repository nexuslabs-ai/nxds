import { cva, type VariantProps } from 'class-variance-authority';

export { codeBlockTheme } from './code-block-theme';
export { default as CodeBlock, type CodeBlockProps } from './CodeBlock.vue';
export {
  default as CodeBlockContent,
  type CodeBlockContentProps,
} from './CodeBlockContent.vue';
export {
  default as CodeBlockCopyButton,
  type CodeBlockCopyButtonProps,
} from './CodeBlockCopyButton.vue';
export {
  default as CodeBlockLine,
  type CodeBlockLineProps,
} from './CodeBlockLine.vue';

export const codeBlockVariants = cva(
  'nx:group/code-block nx:relative nx:overflow-hidden nx:bg-container nx:text-foreground',
  {
    variants: {
      variant: {
        default:
          'nx:rounded-md nx:border-width-default nx:border-color-default',
        flush: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const codeBlockDiffClasses = {
  added: "nx:text-success-subtle-foreground nx:before:content-['+']",
  removed: "nx:text-error-subtle-foreground nx:before:content-['−']",
};

export type CodeBlockVariants = VariantProps<typeof codeBlockVariants>;
