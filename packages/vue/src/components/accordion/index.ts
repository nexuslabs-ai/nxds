import { cva, type VariantProps } from 'class-variance-authority';

export { default as Accordion, type AccordionProps } from './Accordion.vue';
export {
  default as AccordionContent,
  type AccordionContentProps,
} from './AccordionContent.vue';
export {
  default as AccordionItem,
  type AccordionItemProps,
} from './AccordionItem.vue';
export {
  default as AccordionTrigger,
  type AccordionTriggerProps,
} from './AccordionTrigger.vue';

export const accordionVariants = cva(
  'nx:group/accordion nx:flex nx:w-full nx:flex-col',
  {
    variants: {
      variant: {
        stacked: '',
        floating: 'nx:gap-2',
      },
    },
    defaultVariants: {
      variant: 'stacked',
    },
  }
);

export type AccordionVariants = VariantProps<typeof accordionVariants>;
