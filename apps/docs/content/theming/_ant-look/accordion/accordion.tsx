import * as React from 'react';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cva, type VariantProps } from 'class-variance-authority';

import { IconChevronRight } from '@/lib/icons';
import { cn } from '@/lib/utils';

const accordionVariants = cva(
  'nx:group/accordion nx:flex nx:w-full nx:flex-col',
  {
    variants: {
      variant: {
        stacked:
          'nx:overflow-hidden nx:rounded-lg nx:border-default nx:border-border-default',
        floating: 'nx:gap-2',
      },
    },
    defaultVariants: {
      variant: 'stacked',
    },
  }
);

type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root> &
  VariantProps<typeof accordionVariants>;

/**
 * Stacks sections that expand and collapse. `type` sets whether one or several open at once.
 */
function Accordion({
  className,
  variant = 'stacked',
  ...props
}: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-variant={variant}
      className={cn(accordionVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * One section, holding an AccordionTrigger and an AccordionContent.
 */
type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>;

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        'nx:border-color-default nx:bg-muted nx:data-disabled:border-color-disabled nx:data-disabled:text-disabled-foreground',
        'nx:group-data-[variant=stacked]/accordion:border-b-default nx:group-data-[variant=stacked]/accordion:last:border-b-0',
        'nx:group-data-[variant=floating]/accordion:overflow-hidden nx:group-data-[variant=floating]/accordion:rounded-lg nx:group-data-[variant=floating]/accordion:border-width-default',
        className
      )}
      {...props}
    />
  );
}

/**
 * Button that opens and closes its item. Its arrow sits before the label, and turns down when the item is open.
 */
type AccordionTriggerProps = React.ComponentProps<
  typeof AccordionPrimitive.Trigger
>;

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="nx:m-0 nx:flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'nx:flex nx:w-full nx:flex-1 nx:items-center nx:gap-3 nx:border-0 nx:bg-transparent nx:px-4 nx:py-3 nx:typography-body-default nx:text-foreground nx:transition-control nx:duration-fast nx:focus-visible:outline-2 nx:focus-visible:-outline-offset-2 nx:focus-visible:outline-focus-default nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:disabled:[&>svg]:text-disabled-foreground nx:[&[data-state=open]>svg]:rotate-90 nx:icon-stroke',
          className
        )}
        {...props}
      >
        <IconChevronRight
          className="nx:size-icon-glyph-sm nx:shrink-0 nx:transition-transform nx:duration-default"
          aria-hidden="true"
        />
        <span
          data-slot="accordion-trigger-label"
          className="nx:min-w-0 nx:flex-1 nx:truncate nx:text-left"
        >
          {children}
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * Content of an item. Its height animates as the item opens and closes.
 */
type AccordionContentProps = React.ComponentProps<
  typeof AccordionPrimitive.Content
>;

function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="nx:overflow-hidden nx:typography-body-default nx:text-foreground nx:duration-default nx:data-[state=closed]:animate-accordion-up nx:data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div
        className={cn(
          'nx:border-t-default nx:border-border-default nx:bg-container nx:p-4',
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export {
  Accordion,
  AccordionContent,
  type AccordionContentProps,
  AccordionItem,
  type AccordionItemProps,
  type AccordionProps,
  AccordionTrigger,
  type AccordionTriggerProps,
};
