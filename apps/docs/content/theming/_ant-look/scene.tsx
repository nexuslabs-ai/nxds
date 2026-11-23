import { type CSSProperties, useId } from 'react';

import { Badge } from '@/components/badge/badge';
import { Button } from '@/components/button/button';
import { Label } from '@/components/label/label';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/sidebar/sidebar';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion/accordion';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from './description-list/description-list';
import { Slider } from './slider/slider';

type SiderStyle = CSSProperties & { '--sidebar-width': string };

// The provider fills the viewport by default. Here it fits the preview.
const siderStyle: SiderStyle = {
  '--sidebar-width': '11rem',
  minHeight: 'unset',
};

// Ant's sizes for two stock parts, set where the parts are used.
const menuItemClass = 'nx:h-10 nx:rounded-lg nx:px-6';
const tagClass =
  'nx:min-h-[22px] nx:rounded-sm nx:px-[7px] nx:typography-body-small nx:normal-case';

/**
 * The admin page of the Ant Design look page, built with nxds parts inside a
 * wrapper that sets Ant's colors and corners. Sidebar, Button, Badge and Label
 * are the stock nxds parts. It follows the page's light or dark mode and
 * density.
 */
export function AntScene() {
  const id = useId();

  return (
    <div
      data-look="ant"
      className="nx:overflow-x-auto nx:rounded-lg nx:border nx:border-border-hairline nx:bg-background nx:text-foreground"
    >
      <SidebarProvider style={siderStyle} className="nx:min-w-2xl">
        <Sidebar collapsible="none" className="nx:h-auto">
          <SidebarHeader>
            <p className="nx:m-0 nx:px-2 nx:py-1 nx:typography-body-default nx:text-nav-foreground">
              Acme admin
            </p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="nx:p-1">
              <SidebarGroupContent>
                <SidebarMenu className="nx:gap-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton className={menuItemClass}>
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive className={menuItemClass}>
                      <span>Orders</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className={menuItemClass}>
                      <span>Customers</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className={menuItemClass}>
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-6 nx:p-6">
          <div className="nx:flex nx:items-center nx:gap-3">
            <p className="nx:m-0 nx:typography-heading-xxsmall nx:tracking-normal">
              Order 20418
            </p>
            <Badge variant="success" fill="outline" className={tagClass}>
              Paid
            </Badge>
            <Button
              size="sm"
              className="nx:ms-auto nx:px-[15px] nx:font-normal"
            >
              Edit order
            </Button>
          </div>

          <DescriptionList>
            <DescriptionListItem>
              <DescriptionListTerm>Customer</DescriptionListTerm>
              <DescriptionListDescription>
                Ada Lovelace
              </DescriptionListDescription>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Email</DescriptionListTerm>
              <DescriptionListDescription>
                ada@example.com
              </DescriptionListDescription>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Placed</DescriptionListTerm>
              <DescriptionListDescription>
                12 March 2026
              </DescriptionListDescription>
            </DescriptionListItem>
            <DescriptionListItem>
              <DescriptionListTerm>Total</DescriptionListTerm>
              <DescriptionListDescription>$1,280.00</DescriptionListDescription>
            </DescriptionListItem>
          </DescriptionList>

          <Accordion type="single" collapsible defaultValue="shipping">
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping</AccordionTrigger>
              <AccordionContent>
                Express, two business days. Sent to 12 Analytical Row, London.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="payment">
              <AccordionTrigger>Payment</AccordionTrigger>
              <AccordionContent>
                Card ending 4242, charged on 12 March 2026.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="nx:flex nx:flex-col nx:gap-1">
            <Label id={`${id}-refund`} className="nx:font-normal">
              Refund share
            </Label>
            <Slider
              defaultValue={[30]}
              markers={[25, 50, 75]}
              aria-labelledby={`${id}-refund`}
            />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
