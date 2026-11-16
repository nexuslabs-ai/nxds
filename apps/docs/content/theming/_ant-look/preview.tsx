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

/**
 * The Ant Design look, live: an admin page inside a wrapper that sets Ant's
 * colors and corners. Sidebar, Button, Badge and Label are the stock nxds
 * parts. The preview follows the page's light or dark mode and density.
 */
export function AntLookPreview() {
  const id = useId();

  return (
    <div
      data-md-skip
      data-look="ant"
      className="nx:mb-8 nx:overflow-x-auto nx:rounded-lg nx:border nx:border-border-hairline nx:bg-background nx:text-foreground"
    >
      <SidebarProvider style={siderStyle} className="nx:min-w-2xl">
        <Sidebar collapsible="none" className="nx:h-auto">
          <SidebarHeader>
            <p className="nx:m-0 nx:px-2 nx:py-1 nx:typography-label-default nx:text-nav-foreground">
              Acme admin
            </p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <span>Orders</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <span>Customers</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
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
            <p className="nx:m-0 nx:typography-heading-xsmall">Order 20418</p>
            <Badge variant="success" fill="outline">
              Paid
            </Badge>
            <Button size="sm" className="nx:ms-auto">
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
            <AccordionItem value="notes">
              <AccordionTrigger>Notes</AccordionTrigger>
              <AccordionContent>
                Leave the parcel with reception.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="nx:flex nx:flex-col nx:gap-1">
            <Label id={`${id}-refund`}>Refund share</Label>
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
