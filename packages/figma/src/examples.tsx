/** @jsx h */
// Each card's example: what every recipe of the card draws, unless the
// recipe draws its own markup. Written as an app uses the components, with
// real props, so the capture page renders the app's own components from it.
import { h, handler, icon, type Markup } from './markup.ts';
import * as Nxds from './parts.ts';

export const EXAMPLES: Readonly<Record<string, Markup>> = {
  Accordion: (
    <Nxds.Accordion
      type="single"
      collapsible
      variant="stacked"
      className="nx:w-full nx:max-w-md"
    >
      <Nxds.AccordionItem value="item-1">
        <Nxds.AccordionTrigger>Is it accessible?</Nxds.AccordionTrigger>
        <Nxds.AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </Nxds.AccordionContent>
      </Nxds.AccordionItem>
      <Nxds.AccordionItem value="item-2">
        <Nxds.AccordionTrigger>Is it styled?</Nxds.AccordionTrigger>
        <Nxds.AccordionContent>
          Yes. It comes with default styles that match the nxds design system.
        </Nxds.AccordionContent>
      </Nxds.AccordionItem>
      <Nxds.AccordionItem value="item-3">
        <Nxds.AccordionTrigger>Is it animated?</Nxds.AccordionTrigger>
        <Nxds.AccordionContent>
          Yes. It has smooth open/close animations built-in.
        </Nxds.AccordionContent>
      </Nxds.AccordionItem>
    </Nxds.Accordion>
  ),
  Alert: (
    <Nxds.Alert
      layout="stack"
      presentation="card"
      variant="default"
      className="nx:max-w-md"
    >
      <Nxds.AlertIcon>
        <Nxds.Icon name="info" />
      </Nxds.AlertIcon>
      <Nxds.AlertTitle>Information</Nxds.AlertTitle>
      <Nxds.AlertDescription>
        This is an informational alert with an icon.
      </Nxds.AlertDescription>
    </Nxds.Alert>
  ),
  AlertDialog: (
    <Nxds.AlertDialog>
      <Nxds.AlertDialogTrigger asChild>
        <Nxds.Button variant="outline">Show dialog</Nxds.Button>
      </Nxds.AlertDialogTrigger>
      <Nxds.AlertDialogContent>
        <Nxds.AlertDialogHeader>
          <Nxds.AlertDialogTitle>
            Are you absolutely sure?
          </Nxds.AlertDialogTitle>
          <Nxds.AlertDialogDescription>
            This action cannot be undone. This will permanently update your
            account settings.
          </Nxds.AlertDialogDescription>
        </Nxds.AlertDialogHeader>
        <Nxds.AlertDialogFooter>
          <Nxds.AlertDialogCancel>Cancel</Nxds.AlertDialogCancel>
          <Nxds.AlertDialogAction>Continue</Nxds.AlertDialogAction>
        </Nxds.AlertDialogFooter>
      </Nxds.AlertDialogContent>
    </Nxds.AlertDialog>
  ),
  AspectRatio: (
    <div style={{ width: 'var(--nx-spacing-80)' }}>
      <Nxds.AspectRatio ratio={1.5}>
        <div
          className="typography-body-small"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            borderRadius: 'var(--nx-radius-md)',
            background: 'var(--nx-color-muted)',
            color: 'var(--nx-color-muted-foreground)',
          }}
        >
          Cover image
        </div>
      </Nxds.AspectRatio>
    </div>
  ),
  Attachment: (
    <Nxds.Attachment className="nx:w-80">
      <Nxds.AttachmentMedia variant="icon">
        <Nxds.Icon name="file-pdf" />
      </Nxds.AttachmentMedia>
      <Nxds.AttachmentContent>
        <Nxds.AttachmentTitle>report.pdf</Nxds.AttachmentTitle>
        <Nxds.AttachmentDescription>2.4 MB</Nxds.AttachmentDescription>
      </Nxds.AttachmentContent>
      <Nxds.AttachmentActions>
        <Nxds.Button variant="ghost" size="sm" iconOnly startIcon={icon('x')}>
          Remove report.pdf
        </Nxds.Button>
      </Nxds.AttachmentActions>
    </Nxds.Attachment>
  ),
  Avatar: (
    <Nxds.Avatar size="md" shape="circle" ring={false}>
      <Nxds.AvatarImage
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NjAgNTYwIiBmaWxsPSJub25lIiBzaGFwZS1yZW5kZXJpbmc9ImF1dG8iPjxtZXRhZGF0YSB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6ZGN0ZXJtcz0iaHR0cDovL3B1cmwub3JnL2RjL3Rlcm1zLyI+PHJkZjpSREY+PHJkZjpEZXNjcmlwdGlvbj48ZGM6dGl0bGU+Tm90aW9uaXN0czwvZGM6dGl0bGU+PGRjOmNyZWF0b3I+Wm9pc2g8L2RjOmNyZWF0b3I+PGRjOnNvdXJjZSB4c2k6dHlwZT0iZGN0ZXJtczpVUkkiPmh0dHBzOi8vaGV5em9pc2guZ3Vtcm9hZC5jb20vbC9ub3Rpb25pc3RzPC9kYzpzb3VyY2U+PGRjdGVybXM6bGljZW5zZSB4c2k6dHlwZT0iZGN0ZXJtczpVUkkiPmh0dHBzOi8vY3JlYXRpdmVjb21tb25zLm9yZy9wdWJsaWNkb21haW4vemVyby8xLjAvPC9kY3Rlcm1zOmxpY2Vuc2U+PGRjOnJpZ2h0cz5SZW1peCBvZiDigJ5Ob3Rpb25pc3Rz4oCdIChodHRwczovL2hleXpvaXNoLmd1bXJvYWQuY29tL2wvbm90aW9uaXN0cykgYnkg4oCeWm9pc2jigJ0sIGxpY2Vuc2VkIHVuZGVyIOKAnkNDMCAxLjDigJ0gKGh0dHBzOi8vY3JlYXRpdmVjb21tb25zLm9yZy9wdWJsaWNkb21haW4vemVyby8xLjAvKTwvZGM6cmlnaHRzPjwvcmRmOkRlc2NyaXB0aW9uPjwvcmRmOlJERj48L21ldGFkYXRhPjxtYXNrIGlkPSJ2aWV3Ym94TWFzayI+PHJlY3Qgd2lkdGg9IjU2MCIgaGVpZ2h0PSI1NjAiIHJ4PSIwIiByeT0iMCIgeD0iMCIgeT0iMCIgZmlsbD0iI2ZmZiIgLz48L21hc2s+PGcgbWFzaz0idXJsKCN2aWV3Ym94TWFzaykiPjxyZWN0IGZpbGw9IiNmZmM1Y2QiIHdpZHRoPSI1NjAiIGhlaWdodD0iNTYwIiB4PSIwIiB5PSIwIiAvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEzNiAzMjgpIj48cGF0aCBkPSJNODAuNyA2NS40Yy0xLjEtNC42LTIuOC04LjggMi0xMC44Qzg2LjcgNTMgOTAgNTUgOTMgNThhNzYgNzYgMCAwIDAgMzQuNCAyMWMyNyA2LjcgNTEtLjUgNzEuMi0xOS45IDMuNC0zLjIgNi43LTYuNSAxMC4yLTkuNSAyLjQtMiA1LjEtMy4yIDgtLjcgMyAyLjcgMS41IDUuNC0uMSA4LTEzLjYgMjEuNC0zMS43IDM1LjgtNTguMSAzNy04IC4zLTE2LjEgMS0yNC4xLjgtMjIuNC0uNi0zOC0xNC4zLTUzLjgtMjkuM1pNNDkuMyA1NC41Yy40LTE1LjUgOC0yNS40IDE5LjctMzMgNC43LTMgOS40LTQgMTQuNS0yLjcgMy4zIDEgNi41IDIuNyA3IDYuNi43IDQuMy0yLjQgNS42LTYgNi44YTMwLjUgMzAuNSAwIDAgMC0yMS40IDIyLjljLTEgNC4zLTIgOS03IDkuNC01LjkuNi01LjItNS40LTYuOC0xMFpNMjMwLjQgMzVjMC04LjggNS40LTcuNCA5LjctNiA3LjIgMi4zIDE2IDE4LjYgMTQuNyAyNi41LS40IDIuNS0uNCA1LjMtMy4zIDYuNC0zLjQgMS4zLTUuOC0uNC03LjUtMy4xYTcxMCA3MTAgMCAwIDEtMTMuNi0yMy45WiIgZmlsbD0iIzAwMCIvPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNDYgMTI1KSI+PHBhdGggZD0iTTQxLjIgMTk3LjZjLTUuNC00LjgtMTAuMi05LjQtNS41LTE1LjggNS02LjcgOS44LjEgMTQuNyAxLjQgMy4yLjkgNS42IDQuNCA5LjMgMy4zIDYuNS0xLjggMTQtMi41IDE1LTExLjQuOC04LjUtNi0xMC41LTExLjctMTMuMS00LjQtMi0xMyAxLTExLjMtOCAxLjUtOC4zIDkuMS03LjcgMTUuNi03LjFhMjUgMjUgMCAwIDEgMjQgMjVjLjUgMTYuMi04LjQgMjguNS0yMy4zIDMwLTguNyAxLTE4IDItMjYuOC00LjNaIiBmaWxsPSIjMDAwIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00NSAxMzcpIj48cGF0aCBkPSJNNDE5LjYgMTExYy00LjItOS41LTkuOS0xNS4yLTE5LjgtMTUuNy02LS4zLTctNS4xLTguOS05LjggMi0xLjUgMy41LTMuNyA1LjMtMy44IDIxLjEtMS43IDQyLjQtMS44IDYzLjUtLjEgNiAuNCA5LjMgOCAzLjIgMTAuNC0xMCA0LTEyLjUgMTMuMi0xOC41IDE5LjgtOC4yIDktMTUuMiA5LjEtMjQuOC0uOFpNMjI4LjYgODEuNGMxMi4yLjcgMjMuMSAxIDM0IDIgMy42LjMgOCAxLjggOCA2LjcgMCA1LjYtNC42IDUuMi04LjMgNS4xLTYuMyAwLTkuNyAyLjctMTIuNSA4LjYtMy40IDcuNC02LjkgMTUuMy0xOCAxNC44LTEwLjUtLjUtMTUuMS03LjItMTguMS0xNS4yLTIuMi01LjctNS04LjQtMTEtOC4yLTMuNC4xLTcuMS0uMi03LjUtNC45LS40LTUgMy02IDctNy4yYTY3LjkgNjcuOSAwIDAgMSAyNi40LTEuN1oiIGZpbGw9IiMwMDAiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTQ1IDEzNykiPjwvZz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMTkgMTE0KSI+PHBhdGggZD0iTTU3LjUgNDEuOEM1MS4zIDQxLjMgNDYgNDEgNDEgNDFjLTUuNy0uMi04LjUtMy40LTktOC44LS41LTUuMyAzLTcgNy41LTguNSA4LjYtMyAxNy4xLS41IDI1LjIuNyAxNS40IDIuMSAzMS41LS42IDQ2LjQgNi4zIDUgMi4zIDguMyA0LjcgNi40IDEwLjMtMS44IDUuMi02LjEgNS4yLTEwLjYgNC4xLTE2LTMuNy0zMi40LjktNDkuNC0zLjNaTTI1MS44IDMyYzE3LjIuOSAzMy4xLTUgNDkuMy0xLjIgNCAxIDkgLjcgOC44IDcgMCA2LjItNC43IDcuNC05LjUgOC0xOSAyLjItMzggNC01Ni45IDYuNC01LjcuNy0xMSAuMS0xMi42LTUuNi0xLjctNS43IDQtNy44IDgtMTAgMy41LTIuMSA3LjgtMy4xIDEyLjktNC43WiIgZmlsbD0iIzAwMCIvPjwvZz48L2c+PC9zdmc+"
        alt="Ada Lovelace"
      />
      <Nxds.AvatarFallback>AL</Nxds.AvatarFallback>
    </Nxds.Avatar>
  ),
  Badge: <Nxds.Badge>Badge</Nxds.Badge>,
  Breadcrumb: (
    <Nxds.Breadcrumb>
      <Nxds.BreadcrumbList>
        <Nxds.BreadcrumbItem>
          <Nxds.BreadcrumbLink href="#">Home</Nxds.BreadcrumbLink>
        </Nxds.BreadcrumbItem>
        <Nxds.BreadcrumbSeparator />
        <Nxds.BreadcrumbItem>
          <Nxds.BreadcrumbLink href="#">Components</Nxds.BreadcrumbLink>
        </Nxds.BreadcrumbItem>
        <Nxds.BreadcrumbSeparator />
        <Nxds.BreadcrumbItem>
          <Nxds.BreadcrumbPage>Breadcrumb</Nxds.BreadcrumbPage>
        </Nxds.BreadcrumbItem>
      </Nxds.BreadcrumbList>
    </Nxds.Breadcrumb>
  ),
  Bubble: (
    <Nxds.BubbleGroup className="nx:w-full nx:max-w-md">
      <Nxds.Bubble align="start">
        <Nxds.BubbleContent>
          Start-aligned turns hug the inline start.
        </Nxds.BubbleContent>
      </Nxds.Bubble>
      <Nxds.Bubble align="end" variant="primary">
        <Nxds.BubbleContent>
          End-aligned turns hug the inline end.
        </Nxds.BubbleContent>
      </Nxds.Bubble>
    </Nxds.BubbleGroup>
  ),
  Button: <Nxds.Button>Button</Nxds.Button>,
  ButtonGroup: (
    <Nxds.ButtonGroup>
      <Nxds.Button variant="outline">Day</Nxds.Button>
      <Nxds.Button variant="outline">Week</Nxds.Button>
      <Nxds.Button variant="outline">Month</Nxds.Button>
    </Nxds.ButtonGroup>
  ),
  Card: (
    <Nxds.Card className="nx:w-[350px]">
      <Nxds.CardHeader>
        <Nxds.CardTitle>Card Title</Nxds.CardTitle>
        <Nxds.CardDescription>Card description goes here.</Nxds.CardDescription>
      </Nxds.CardHeader>
      <Nxds.CardContent>
        <p>Card content goes here.</p>
      </Nxds.CardContent>
      <Nxds.CardFooter>
        <Nxds.Button variant="outline">Cancel</Nxds.Button>
        <Nxds.Button>Submit</Nxds.Button>
      </Nxds.CardFooter>
    </Nxds.Card>
  ),
  Carousel: (
    <div
      style={{
        width: 'var(--nx-spacing-80)',
        padding: '0 var(--nx-spacing-12)',
      }}
    >
      <Nxds.Carousel>
        <Nxds.CarouselContent>
          <Nxds.CarouselItem>
            <Nxds.Card>
              <div
                className="typography-heading-large"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  aspectRatio: '1',
                }}
              >
                Plan
              </div>
            </Nxds.Card>
          </Nxds.CarouselItem>
          <Nxds.CarouselItem>
            <Nxds.Card>
              <div
                className="typography-heading-large"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  aspectRatio: '1',
                }}
              >
                Build
              </div>
            </Nxds.Card>
          </Nxds.CarouselItem>
          <Nxds.CarouselItem>
            <Nxds.Card>
              <div
                className="typography-heading-large"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  aspectRatio: '1',
                }}
              >
                Ship
              </div>
            </Nxds.Card>
          </Nxds.CarouselItem>
        </Nxds.CarouselContent>
        <Nxds.CarouselPrevious />
        <Nxds.CarouselNext />
      </Nxds.Carousel>
    </div>
  ),
  Chart: (
    <div className="nx:w-[600px] nx:max-w-full">
      <Nxds.BarChart
        data={[
          { month: 'Jan', desktop: 186, mobile: 80 },
          { month: 'Feb', desktop: 305, mobile: 200 },
          { month: 'Mar', desktop: 237, mobile: 120 },
          { month: 'Apr', desktop: 173, mobile: 190 },
          { month: 'May', desktop: 209, mobile: 130 },
          { month: 'Jun', desktop: 264, mobile: 140 },
        ]}
        xKey="month"
        series={['desktop', 'mobile']}
      />
    </div>
  ),
  Checkbox: (
    <div className="nx:flex nx:items-center nx:gap-2">
      <Nxds.Checkbox id="terms" />
      <Nxds.Label htmlFor="terms">Accept terms and conditions</Nxds.Label>
    </div>
  ),
  ChoiceCard: (
    <div className="nx:w-96 nx:max-w-full">
      <Nxds.ChoiceCard htmlFor="choice-card-default" variant="bordered">
        <Nxds.Checkbox
          id="choice-card-default"
          aria-labelledby="choice-card-default-title"
          aria-describedby="choice-card-default-description"
        />
        <Nxds.ChoiceCardContent>
          <Nxds.ChoiceCardTitle id="choice-card-default-title">
            Product updates
          </Nxds.ChoiceCardTitle>
          <Nxds.ChoiceCardDescription id="choice-card-default-description">
            News about features and improvements.
          </Nxds.ChoiceCardDescription>
        </Nxds.ChoiceCardContent>
      </Nxds.ChoiceCard>
    </div>
  ),
  ChoiceRow: (
    <div className="nx:w-80">
      <Nxds.ChoiceRow htmlFor="choice-default">
        <Nxds.Checkbox
          id="choice-default"
          aria-labelledby="choice-default-title"
        />
        <Nxds.ChoiceRowTitle id="choice-default-title">
          Product updates
        </Nxds.ChoiceRowTitle>
      </Nxds.ChoiceRow>
    </div>
  ),
  CodeBlock: (
    <Nxds.CodeBlock className="nx:max-w-xl">
      <Nxds.CodeBlockContent>
        <Nxds.CodeBlockLine>
          npx nxds-cli@latest add code-block
        </Nxds.CodeBlockLine>
      </Nxds.CodeBlockContent>
      <Nxds.CodeBlockCopyButton />
    </Nxds.CodeBlock>
  ),
  Collapsible: (
    <Nxds.Collapsible className="nx:flex nx:w-72 nx:flex-col">
      <div className="nx:flex nx:flex-col nx:gap-2">
        <div className="nx:flex nx:items-center nx:justify-between nx:gap-4">
          <span className="nx:typography-label-default nx:text-foreground">
            @nxds starred 3 repositories
          </span>
          <Nxds.CollapsibleTrigger asChild>
            <Nxds.Button
              variant="ghost"
              size="sm"
              aria-label="Toggle repositories"
            >
              <Nxds.Icon name="caret-up-down" />
            </Nxds.Button>
          </Nxds.CollapsibleTrigger>
        </div>
        <div className="nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">
          @radix-ui/react-collapsible
        </div>
      </div>
      <Nxds.CollapsibleContent>
        <div className="nx:mt-2 nx:flex nx:flex-col nx:gap-2">
          <div className="nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">
            @radix-ui/react-toggle
          </div>
          <div className="nx:rounded-md nx:border-default nx:border-border-default nx:px-4 nx:py-2 nx:typography-label-default nx:text-foreground">
            @radix-ui/react-slider
          </div>
        </div>
      </Nxds.CollapsibleContent>
    </Nxds.Collapsible>
  ),
  Combobox: (
    <Nxds.Combobox>
      <Nxds.ComboboxTrigger className="nx:w-64">Astro</Nxds.ComboboxTrigger>
      <Nxds.ComboboxContent label="Framework">
        <Nxds.ComboboxInput placeholder="Search framework…" />
        <Nxds.ComboboxList>
          <Nxds.ComboboxEmpty>No framework found.</Nxds.ComboboxEmpty>
          <Nxds.ComboboxGroup>
            <Nxds.ComboboxItem value="next">Next.js</Nxds.ComboboxItem>
            <Nxds.ComboboxItem value="sveltekit">SvelteKit</Nxds.ComboboxItem>
            <Nxds.ComboboxItem value="nuxt">Nuxt</Nxds.ComboboxItem>
            <Nxds.ComboboxItem value="remix">Remix</Nxds.ComboboxItem>
            <Nxds.ComboboxItem value="astro" selected>
              Astro
            </Nxds.ComboboxItem>
          </Nxds.ComboboxGroup>
        </Nxds.ComboboxList>
      </Nxds.ComboboxContent>
    </Nxds.Combobox>
  ),
  Command: (
    <Nxds.Command
      label="Command menu"
      className="nx:w-[480px] nx:rounded-lg nx:border-default nx:border-border-default nx:shadow-md"
    >
      <Nxds.CommandInput placeholder="Type a command or search..." />
      <Nxds.CommandList>
        <Nxds.CommandEmpty>No results found.</Nxds.CommandEmpty>
        <Nxds.CommandGroup heading="Suggestions">
          <Nxds.CommandItem>Calendar</Nxds.CommandItem>
          <Nxds.CommandItem>Search Emoji</Nxds.CommandItem>
          <Nxds.CommandItem>Calculator</Nxds.CommandItem>
        </Nxds.CommandGroup>
      </Nxds.CommandList>
    </Nxds.Command>
  ),
  ContextMenu: (
    <Nxds.ContextMenu>
      <Nxds.ContextMenuTrigger className="nx:flex nx:h-[96px] nx:w-full nx:max-w-md nx:select-none nx:items-center nx:justify-center nx:rounded-md nx:border-default nx:border-dashed nx:border-border-default nx:typography-body-default nx:text-muted-foreground">
        Right click here
      </Nxds.ContextMenuTrigger>
      <Nxds.ContextMenuContent>
        <Nxds.ContextMenuItem>Back</Nxds.ContextMenuItem>
        <Nxds.ContextMenuItem>Forward</Nxds.ContextMenuItem>
        <Nxds.ContextMenuItem>Reload</Nxds.ContextMenuItem>
      </Nxds.ContextMenuContent>
    </Nxds.ContextMenu>
  ),
  DatePicker: (
    <Nxds.Card className="nx:w-fit">
      <Nxds.CardContent className="nx:p-0">
        <Nxds.DatePicker
          mode="single"
          defaultMonth={new Date(2025, 0, 1)}
          selected={new Date(2025, 0, 15)}
        />
      </Nxds.CardContent>
    </Nxds.Card>
  ),
  DescriptionList: (
    <Nxds.DescriptionList>
      <Nxds.DescriptionListItem>
        <Nxds.DescriptionListTerm>Filename</Nxds.DescriptionListTerm>
        <Nxds.DescriptionListDescription>
          Research findings.pdf
        </Nxds.DescriptionListDescription>
      </Nxds.DescriptionListItem>
      <Nxds.DescriptionListItem>
        <Nxds.DescriptionListTerm>Size</Nxds.DescriptionListTerm>
        <Nxds.DescriptionListDescription>
          2.4 MB
        </Nxds.DescriptionListDescription>
      </Nxds.DescriptionListItem>
      <Nxds.DescriptionListItem>
        <Nxds.DescriptionListTerm>Modified</Nxds.DescriptionListTerm>
        <Nxds.DescriptionListDescription>
          <time dateTime="2026-09-24">24 September 2026</time>
        </Nxds.DescriptionListDescription>
      </Nxds.DescriptionListItem>
    </Nxds.DescriptionList>
  ),
  Dialog: (
    <Nxds.Dialog>
      <Nxds.DialogTrigger asChild>
        <Nxds.Button variant="outline">Open Dialog</Nxds.Button>
      </Nxds.DialogTrigger>
      <Nxds.DialogContent>
        <Nxds.DialogHeader>
          <Nxds.DialogTitle>Dialog Title</Nxds.DialogTitle>
          <Nxds.DialogDescription>
            This is a basic dialog with a title and description.
          </Nxds.DialogDescription>
        </Nxds.DialogHeader>
        <Nxds.DialogBody>
          <p className="nx:typography-body-default nx:text-foreground">
            Dialog content goes here. You can add any content you need.
          </p>
        </Nxds.DialogBody>
        <Nxds.DialogFooter>
          <Nxds.DialogClose asChild>
            <Nxds.Button variant="outline">Cancel</Nxds.Button>
          </Nxds.DialogClose>
          <Nxds.Button>Save</Nxds.Button>
        </Nxds.DialogFooter>
      </Nxds.DialogContent>
    </Nxds.Dialog>
  ),
  Drawer: (
    <Nxds.Drawer>
      <Nxds.DrawerTrigger asChild>
        <Nxds.Button variant="outline">Open Drawer</Nxds.Button>
      </Nxds.DrawerTrigger>
      <Nxds.DrawerContent>
        <Nxds.DrawerHeader>
          <Nxds.DrawerTitle>Move goal</Nxds.DrawerTitle>
          <Nxds.DrawerDescription>
            Drag down or press Escape to dismiss this drawer.
          </Nxds.DrawerDescription>
        </Nxds.DrawerHeader>
        <Nxds.DrawerBody>
          <p className="nx:typography-body-default nx:text-foreground">
            Drawer content goes here. On touch devices it can be dragged to
            dismiss.
          </p>
        </Nxds.DrawerBody>
        <Nxds.DrawerFooter>
          <Nxds.Button>Submit</Nxds.Button>
          <Nxds.DrawerClose asChild>
            <Nxds.Button variant="outline">Cancel</Nxds.Button>
          </Nxds.DrawerClose>
        </Nxds.DrawerFooter>
      </Nxds.DrawerContent>
    </Nxds.Drawer>
  ),
  DropdownMenu: (
    <Nxds.DropdownMenu>
      <Nxds.DropdownMenuTrigger asChild>
        <Nxds.Button variant="outline">My Account</Nxds.Button>
      </Nxds.DropdownMenuTrigger>
      <Nxds.DropdownMenuContent className="nx:w-56">
        <Nxds.DropdownMenuLabel>My Account</Nxds.DropdownMenuLabel>
        <Nxds.DropdownMenuSeparator />
        <Nxds.DropdownMenuGroup>
          <Nxds.DropdownMenuItem>
            Profile
            <Nxds.DropdownMenuShortcut>⇧⌘P</Nxds.DropdownMenuShortcut>
          </Nxds.DropdownMenuItem>
          <Nxds.DropdownMenuItem>
            Billing
            <Nxds.DropdownMenuShortcut>⌘B</Nxds.DropdownMenuShortcut>
          </Nxds.DropdownMenuItem>
          <Nxds.DropdownMenuItem>
            Settings
            <Nxds.DropdownMenuShortcut>⌘S</Nxds.DropdownMenuShortcut>
          </Nxds.DropdownMenuItem>
        </Nxds.DropdownMenuGroup>
        <Nxds.DropdownMenuSeparator />
        <Nxds.DropdownMenuItem>
          Logout
          <Nxds.DropdownMenuShortcut>⇧⌘Q</Nxds.DropdownMenuShortcut>
        </Nxds.DropdownMenuItem>
      </Nxds.DropdownMenuContent>
    </Nxds.DropdownMenu>
  ),
  EmptyState: (
    <Nxds.EmptyState>
      <Nxds.EmptyStateHeader>
        <Nxds.EmptyStateMedia variant="icon">
          <Nxds.Icon name="users" aria-hidden />
        </Nxds.EmptyStateMedia>
        <Nxds.EmptyStateTitle>No contacts yet</Nxds.EmptyStateTitle>
        <Nxds.EmptyStateDescription>
          Add your first contact to start building your CRM.
        </Nxds.EmptyStateDescription>
      </Nxds.EmptyStateHeader>
      <Nxds.EmptyStateContent>
        <Nxds.Button>Add contact</Nxds.Button>
      </Nxds.EmptyStateContent>
    </Nxds.EmptyState>
  ),
  Field: (
    <div className="nx:w-80">
      <Nxds.Field>
        <Nxds.FieldLabel htmlFor="field-email">Email</Nxds.FieldLabel>
        <Nxds.Input
          id="field-email"
          type="email"
          placeholder="you@example.com"
        />
        <Nxds.FieldDescription>We never share it.</Nxds.FieldDescription>
      </Nxds.Field>
    </div>
  ),
  FilterBuilder: (
    <Nxds.FilterBuilder
      aria-label="Member filters"
      fields={[
        {
          id: 'status',
          label: 'Status',
          type: 'choice',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'invited', label: 'Invited' },
            { value: 'suspended', label: 'Suspended' },
          ],
        },
        { id: 'name', label: 'Name', type: 'text' },
        { id: 'projects', label: 'Projects', type: 'number' },
      ]}
      value={{
        kind: 'group',
        id: 'root',
        conjunction: 'all',
        children: [
          {
            kind: 'rule',
            id: 'r1',
            field: 'status',
            operator: 'is',
            value: 'active',
          },
        ],
      }}
      onValueChange={handler}
    />
  ),
  FilterChip: (
    <Nxds.FilterChip aria-label="Remove status filter: Active">
      Status: Active
    </Nxds.FilterChip>
  ),
  FilterCondition: (
    <Nxds.FilterCondition>
      <Nxds.FilterConditionField>Status</Nxds.FilterConditionField>
      <Nxds.FilterConditionSegment aria-label="Edit Status operator">
        is
      </Nxds.FilterConditionSegment>
      <Nxds.FilterConditionSegment aria-label="Edit Status value: Paid">
        Paid
      </Nxds.FilterConditionSegment>
      <Nxds.FilterConditionRemove aria-label="Remove Status filter" />
    </Nxds.FilterCondition>
  ),
  HoverCard: (
    <Nxds.HoverCard>
      <Nxds.HoverCardTrigger asChild>
        <Nxds.Button variant="link">@nxds</Nxds.Button>
      </Nxds.HoverCardTrigger>
      <Nxds.HoverCardContent>
        <div className="nx:flex nx:flex-col nx:gap-1">
          <p className="nx:typography-label-default nx:font-semibold nx:text-foreground">
            @nxds
          </p>
          <p className="nx:typography-body-default nx:text-muted-foreground">
            The AI-native design system. Joined March 2026.
          </p>
        </div>
      </Nxds.HoverCardContent>
    </Nxds.HoverCard>
  ),
  Input: (
    <div className="nx:w-[400px]">
      <Nxds.Input type="email" placeholder="email@example.com" />
    </div>
  ),
  InputGroup: (
    <Nxds.InputGroup className="nx:w-80">
      <Nxds.InputGroupAddon>
        <Nxds.Icon name="magnifying-glass" aria-hidden />
      </Nxds.InputGroupAddon>
      <Nxds.InputGroupInput aria-label="Search" placeholder="Search…" />
    </Nxds.InputGroup>
  ),
  InputOTP: (
    <Nxds.InputOTP maxLength={6} aria-label="One-time password">
      <Nxds.InputOTPGroup>
        <Nxds.InputOTPSlot index={0} />
        <Nxds.InputOTPSlot index={1} />
        <Nxds.InputOTPSlot index={2} />
      </Nxds.InputOTPGroup>
      <Nxds.InputOTPSeparator />
      <Nxds.InputOTPGroup>
        <Nxds.InputOTPSlot index={3} />
        <Nxds.InputOTPSlot index={4} />
        <Nxds.InputOTPSlot index={5} />
      </Nxds.InputOTPGroup>
    </Nxds.InputOTP>
  ),
  Item: (
    <Nxds.Item variant="outline" className="nx:w-96">
      <Nxds.ItemMedia variant="icon">
        <Nxds.Icon name="file" />
      </Nxds.ItemMedia>
      <Nxds.ItemContent>
        <Nxds.ItemTitle>Report.pdf</Nxds.ItemTitle>
        <Nxds.ItemDescription>2.4 MB · edited 3 days ago</Nxds.ItemDescription>
      </Nxds.ItemContent>
      <Nxds.ItemActions>
        <Nxds.Button variant="outline" size="sm">
          Open
        </Nxds.Button>
      </Nxds.ItemActions>
    </Nxds.Item>
  ),
  Kbd: (
    <div className="nx:flex nx:items-center nx:gap-4">
      <Nxds.Kbd>⌘</Nxds.Kbd>
      <Nxds.KbdGroup>
        <Nxds.Kbd>⌘</Nxds.Kbd>
        <Nxds.Kbd>K</Nxds.Kbd>
      </Nxds.KbdGroup>
    </div>
  ),
  Label: (
    <div className="nx:flex nx:flex-col nx:gap-2">
      <Nxds.Label htmlFor="email">Email</Nxds.Label>
      <Nxds.Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
  Marker: (
    <Nxds.Marker>
      <Nxds.MarkerContent>Edited 2 minutes ago</Nxds.MarkerContent>
    </Nxds.Marker>
  ),
  Menubar: (
    <Nxds.Menubar>
      <Nxds.MenubarMenu>
        <Nxds.MenubarTrigger>File</Nxds.MenubarTrigger>
        <Nxds.MenubarContent>
          <Nxds.MenubarItem>
            New Tab
            <Nxds.MenubarShortcut>⌘T</Nxds.MenubarShortcut>
          </Nxds.MenubarItem>
          <Nxds.MenubarItem>
            New Window
            <Nxds.MenubarShortcut>⌘N</Nxds.MenubarShortcut>
          </Nxds.MenubarItem>
          <Nxds.MenubarItem>New Incognito Window</Nxds.MenubarItem>
          <Nxds.MenubarSeparator />
          <Nxds.MenubarItem>Print</Nxds.MenubarItem>
        </Nxds.MenubarContent>
      </Nxds.MenubarMenu>
      <Nxds.MenubarMenu>
        <Nxds.MenubarTrigger>Edit</Nxds.MenubarTrigger>
        <Nxds.MenubarContent>
          <Nxds.MenubarItem>Undo</Nxds.MenubarItem>
          <Nxds.MenubarItem>Redo</Nxds.MenubarItem>
        </Nxds.MenubarContent>
      </Nxds.MenubarMenu>
      <Nxds.MenubarMenu>
        <Nxds.MenubarTrigger>View</Nxds.MenubarTrigger>
        <Nxds.MenubarContent>
          <Nxds.MenubarItem>Reload</Nxds.MenubarItem>
          <Nxds.MenubarItem>Toggle Fullscreen</Nxds.MenubarItem>
        </Nxds.MenubarContent>
      </Nxds.MenubarMenu>
    </Nxds.Menubar>
  ),
  Message: (
    <Nxds.MessageGroup className="nx:w-full nx:max-w-lg">
      <Nxds.Message>
        <Nxds.MessageAvatar>
          <Nxds.AvatarFallback>AB</Nxds.AvatarFallback>
        </Nxds.MessageAvatar>
        <Nxds.MessageContent>
          <Nxds.MessageHeader>Ana Bianchi</Nxds.MessageHeader>
          <Nxds.Bubble>
            <Nxds.BubbleContent>
              Can you take a look at the failing run?
            </Nxds.BubbleContent>
          </Nxds.Bubble>
          <Nxds.MessageFooter>09:14</Nxds.MessageFooter>
        </Nxds.MessageContent>
      </Nxds.Message>
    </Nxds.MessageGroup>
  ),
  MessageScroller: (
    <Nxds.MessageScrollerProvider>
      <Nxds.MessageScroller className="nx:h-80 nx:w-full nx:max-w-lg nx:rounded-md nx:border-default nx:border-border-default nx:bg-background">
        <Nxds.MessageScrollerViewport>
          <Nxds.MessageScrollerContent>
            <Nxds.EmptyState>
              <Nxds.EmptyStateHeader>
                <Nxds.EmptyStateMedia variant="icon">
                  <Nxds.Icon name="chat-text" />
                </Nxds.EmptyStateMedia>
                <Nxds.EmptyStateTitle>No messages yet</Nxds.EmptyStateTitle>
                <Nxds.EmptyStateDescription>
                  Send the first message to start this conversation.
                </Nxds.EmptyStateDescription>
              </Nxds.EmptyStateHeader>
            </Nxds.EmptyState>
          </Nxds.MessageScrollerContent>
        </Nxds.MessageScrollerViewport>
        <Nxds.MessageScrollerButton />
      </Nxds.MessageScroller>
    </Nxds.MessageScrollerProvider>
  ),
  MultiSelect: (
    <Nxds.MultiSelect defaultValues={['react']}>
      <Nxds.MultiSelectTrigger aria-label="Frameworks" className="nx:w-80">
        <Nxds.MultiSelectValue placeholder="Select frameworks" />
      </Nxds.MultiSelectTrigger>
      <Nxds.MultiSelectContent
        searchPlaceholder="Search frameworks…"
        emptyMessage="No frameworks found."
      >
        <Nxds.MultiSelectGroup heading="Libraries">
          <Nxds.MultiSelectItem value="react">React</Nxds.MultiSelectItem>
          <Nxds.MultiSelectItem value="solid">Solid</Nxds.MultiSelectItem>
        </Nxds.MultiSelectGroup>
        <Nxds.MultiSelectSeparator />
        <Nxds.MultiSelectGroup heading="Frameworks">
          <Nxds.MultiSelectItem value="vue">Vue</Nxds.MultiSelectItem>
          <Nxds.MultiSelectItem value="svelte">Svelte</Nxds.MultiSelectItem>
          <Nxds.MultiSelectItem value="angular">Angular</Nxds.MultiSelectItem>
        </Nxds.MultiSelectGroup>
      </Nxds.MultiSelectContent>
    </Nxds.MultiSelect>
  ),
  NativeSelect: (
    <Nxds.NativeSelect aria-label="Plan" defaultValue="pro">
      <Nxds.NativeSelectOption value="free">Free</Nxds.NativeSelectOption>
      <Nxds.NativeSelectOption value="pro">Pro</Nxds.NativeSelectOption>
      <Nxds.NativeSelectOption value="team">Team</Nxds.NativeSelectOption>
    </Nxds.NativeSelect>
  ),
  NavigationMenu: (
    <Nxds.NavigationMenu>
      <Nxds.NavigationMenuList>
        <Nxds.NavigationMenuItem>
          <Nxds.NavigationMenuTrigger>Products</Nxds.NavigationMenuTrigger>
          <Nxds.NavigationMenuContent>
            <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
              <li>
                <Nxds.NavigationMenuLink href="#analytics">
                  Analytics
                </Nxds.NavigationMenuLink>
              </li>
              <li>
                <Nxds.NavigationMenuLink href="#automation">
                  Automation
                </Nxds.NavigationMenuLink>
              </li>
              <li>
                <Nxds.NavigationMenuLink href="#reports">
                  Reports
                </Nxds.NavigationMenuLink>
              </li>
            </ul>
          </Nxds.NavigationMenuContent>
        </Nxds.NavigationMenuItem>
        <Nxds.NavigationMenuItem>
          <Nxds.NavigationMenuTrigger>Company</Nxds.NavigationMenuTrigger>
          <Nxds.NavigationMenuContent>
            <ul className="nx:grid nx:w-[320px] nx:gap-1 nx:p-2">
              <li>
                <Nxds.NavigationMenuLink href="#about">
                  About
                </Nxds.NavigationMenuLink>
              </li>
              <li>
                <Nxds.NavigationMenuLink href="#careers">
                  Careers
                </Nxds.NavigationMenuLink>
              </li>
            </ul>
          </Nxds.NavigationMenuContent>
        </Nxds.NavigationMenuItem>
      </Nxds.NavigationMenuList>
    </Nxds.NavigationMenu>
  ),
  PageHeader: (
    <main className="nx:w-full nx:max-w-5xl nx:p-4">
      <Nxds.PageHeader>
        <Nxds.PageHeaderContent>
          <Nxds.PageHeaderTitle className="nx:typography-heading-large">
            Workspace overview
          </Nxds.PageHeaderTitle>
          <Nxds.PageHeaderDescription>
            Track usage, members, and billing across your workspace.
          </Nxds.PageHeaderDescription>
        </Nxds.PageHeaderContent>
      </Nxds.PageHeader>
    </main>
  ),
  Pagination: (
    <Nxds.Pagination>
      <Nxds.PaginationContent>
        <Nxds.PaginationItem>
          <Nxds.PaginationPrevious href="#" />
        </Nxds.PaginationItem>
        <Nxds.PaginationItem>
          <Nxds.PaginationLink href="#">1</Nxds.PaginationLink>
        </Nxds.PaginationItem>
        <Nxds.PaginationItem>
          <Nxds.PaginationLink href="#" isActive>
            2
          </Nxds.PaginationLink>
        </Nxds.PaginationItem>
        <Nxds.PaginationItem>
          <Nxds.PaginationLink href="#">3</Nxds.PaginationLink>
        </Nxds.PaginationItem>
        <Nxds.PaginationItem>
          <Nxds.PaginationEllipsis />
        </Nxds.PaginationItem>
        <Nxds.PaginationItem>
          <Nxds.PaginationLink href="#">10</Nxds.PaginationLink>
        </Nxds.PaginationItem>
        <Nxds.PaginationItem>
          <Nxds.PaginationNext href="#" />
        </Nxds.PaginationItem>
      </Nxds.PaginationContent>
    </Nxds.Pagination>
  ),
  Popover: (
    <Nxds.Popover>
      <Nxds.PopoverTrigger asChild>
        <Nxds.Button variant="outline">Open popover</Nxds.Button>
      </Nxds.PopoverTrigger>
      <Nxds.PopoverContent>
        <p className="nx:typography-body-default nx:text-muted-foreground">
          Place content for the popover here.
        </p>
      </Nxds.PopoverContent>
    </Nxds.Popover>
  ),
  Progress: (
    <div className="nx:w-80">
      <Nxds.Progress aria-label="Progress" value={60} />
    </div>
  ),
  RadioGroup: (
    <Nxds.RadioGroup defaultValue="comfortable" aria-label="Density">
      <div className="nx:flex nx:items-center nx:gap-2">
        <Nxds.RadioGroupItem value="default" id="default-default" />
        <Nxds.Label htmlFor="default-default">Default</Nxds.Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Nxds.RadioGroupItem value="comfortable" id="default-comfortable" />
        <Nxds.Label htmlFor="default-comfortable">Comfortable</Nxds.Label>
      </div>
      <div className="nx:flex nx:items-center nx:gap-2">
        <Nxds.RadioGroupItem value="compact" id="default-compact" />
        <Nxds.Label htmlFor="default-compact">Compact</Nxds.Label>
      </div>
    </Nxds.RadioGroup>
  ),
  Resizable: (
    <div
      style={{
        width: 'var(--nx-spacing-96)',
        height: 'var(--nx-spacing-48)',
        border:
          'var(--nx-borderwidth-default) solid var(--nx-color-border-default)',
        borderRadius: 'var(--nx-radius-md)',
      }}
    >
      <Nxds.ResizablePanelGroup orientation="horizontal">
        <Nxds.ResizablePanel defaultSize={35}>
          <div
            className="typography-label-default"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            Folders
          </div>
        </Nxds.ResizablePanel>
        <Nxds.ResizableHandle withHandle />
        <Nxds.ResizablePanel defaultSize={65}>
          <div
            className="typography-label-default"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            Messages
          </div>
        </Nxds.ResizablePanel>
      </Nxds.ResizablePanelGroup>
    </div>
  ),
  ScrollArea: (
    <div
      style={{
        width: 'var(--nx-spacing-48)',
        border:
          'var(--nx-borderwidth-default) solid var(--nx-color-border-default)',
        borderRadius: 'var(--nx-radius-md)',
      }}
    >
      <Nxds.ScrollArea className="nx:h-48">
        <div
          className="typography-body-small"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--nx-spacing-2)',
            padding: 'var(--nx-spacing-4)',
          }}
        >
          <span className="typography-label-default">Releases</span>
          <span>v2.6.0</span>
          <span>v2.5.1</span>
          <span>v2.5.0</span>
          <span>v2.4.2</span>
          <span>v2.4.1</span>
          <span>v2.4.0</span>
          <span>v2.3.0</span>
          <span>v2.2.0</span>
          <span>v2.1.0</span>
          <span>v2.0.0</span>
        </div>
      </Nxds.ScrollArea>
    </div>
  ),
  Select: (
    <Nxds.Select>
      <Nxds.SelectTrigger className="nx:w-[180px]" aria-label="Select a fruit">
        <Nxds.SelectValue placeholder="Select a fruit" />
      </Nxds.SelectTrigger>
      <Nxds.SelectContent>
        <Nxds.SelectItem value="apple">Apple</Nxds.SelectItem>
        <Nxds.SelectItem value="banana">Banana</Nxds.SelectItem>
        <Nxds.SelectItem value="orange">Orange</Nxds.SelectItem>
        <Nxds.SelectItem value="grape">Grape</Nxds.SelectItem>
        <Nxds.SelectItem value="mango">Mango</Nxds.SelectItem>
      </Nxds.SelectContent>
    </Nxds.Select>
  ),
  Separator: (
    <div className="nx:max-w-xs nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container nx:p-4">
      <div className="nx:flex nx:flex-col nx:gap-1">
        <span className="nx:typography-label-default nx:text-container-foreground">
          Radix Primitives
        </span>
        <span className="nx:typography-label-default nx:text-muted-foreground">
          An open-source UI component library.
        </span>
      </div>
      <Nxds.Separator className="nx:my-4" />
      <div className="nx:flex nx:h-5 nx:items-center nx:gap-3 nx:typography-label-default nx:text-muted-foreground">
        <span>Blog</span>
        <Nxds.Separator orientation="vertical" />
        <span>Docs</span>
        <Nxds.Separator orientation="vertical" />
        <span>Source</span>
      </div>
    </div>
  ),
  Sheet: (
    <Nxds.Sheet>
      <Nxds.SheetTrigger asChild>
        <Nxds.Button variant="outline">Open Sheet</Nxds.Button>
      </Nxds.SheetTrigger>
      <Nxds.SheetContent>
        <Nxds.SheetHeader>
          <Nxds.SheetTitle>Sheet Title</Nxds.SheetTitle>
          <Nxds.SheetDescription>
            This panel slides in from the right edge by default.
          </Nxds.SheetDescription>
        </Nxds.SheetHeader>
        <Nxds.SheetBody>
          <p className="nx:typography-body-default nx:text-foreground">
            Sheet content goes here. You can add any content you need.
          </p>
        </Nxds.SheetBody>
        <Nxds.SheetFooter>
          <Nxds.SheetClose asChild>
            <Nxds.Button variant="outline">Cancel</Nxds.Button>
          </Nxds.SheetClose>
          <Nxds.Button>Save</Nxds.Button>
        </Nxds.SheetFooter>
      </Nxds.SheetContent>
    </Nxds.Sheet>
  ),
  Skeleton: (
    <div className="nx:flex nx:w-80 nx:flex-col nx:gap-4">
      <Nxds.Skeleton className="nx:h-40 nx:w-full nx:rounded-lg" />
      <div className="nx:flex nx:items-center nx:gap-3">
        <Nxds.Skeleton className="nx:size-10 nx:rounded-full" />
        <div className="nx:flex nx:flex-1 nx:flex-col nx:gap-2">
          <Nxds.Skeleton className="nx:h-4 nx:w-1/2" />
          <Nxds.Skeleton className="nx:h-3 nx:w-3/4" />
        </div>
      </div>
    </div>
  ),
  Slider: (
    <div className="nx:w-96">
      <Nxds.Slider defaultValue={[50]} max={100} step={1} aria-label="Volume" />
    </div>
  ),
  Spinner: <Nxds.Spinner />,
  Switch: (
    <div className="nx:flex nx:items-center nx:gap-2">
      <Nxds.Switch id="switch" />
      <Nxds.Label htmlFor="switch">Airplane mode</Nxds.Label>
    </div>
  ),
  Table: (
    <Nxds.Table aria-label="Invoices">
      <Nxds.TableHeader>
        <Nxds.TableRow>
          <Nxds.TableHead>Invoice</Nxds.TableHead>
          <Nxds.TableHead>Status</Nxds.TableHead>
          <Nxds.TableHead className="nx:text-end">Amount</Nxds.TableHead>
        </Nxds.TableRow>
      </Nxds.TableHeader>
      <Nxds.TableBody>
        <Nxds.TableRow>
          <Nxds.TableCell>INV-1042</Nxds.TableCell>
          <Nxds.TableCell>Paid</Nxds.TableCell>
          <Nxds.TableCell className="nx:text-end nx:tabular-nums">
            $1,250.00
          </Nxds.TableCell>
        </Nxds.TableRow>
        <Nxds.TableRow>
          <Nxds.TableCell>INV-1043</Nxds.TableCell>
          <Nxds.TableCell>Pending</Nxds.TableCell>
          <Nxds.TableCell className="nx:text-end nx:tabular-nums">
            $480.00
          </Nxds.TableCell>
        </Nxds.TableRow>
        <Nxds.TableRow>
          <Nxds.TableCell>INV-1044</Nxds.TableCell>
          <Nxds.TableCell>Overdue</Nxds.TableCell>
          <Nxds.TableCell className="nx:text-end nx:tabular-nums">
            $2,100.00
          </Nxds.TableCell>
        </Nxds.TableRow>
      </Nxds.TableBody>
    </Nxds.Table>
  ),
  Tabs: (
    <Nxds.Tabs defaultValue="account" className="nx:w-[400px]">
      <Nxds.TabsList>
        <Nxds.TabsTrigger value="account">Account</Nxds.TabsTrigger>
        <Nxds.TabsTrigger value="password">Password</Nxds.TabsTrigger>
      </Nxds.TabsList>
      <Nxds.TabsContent value="account">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          {"Make changes to your account here. Click save when you're done."}
        </p>
      </Nxds.TabsContent>
      <Nxds.TabsContent value="password">
        <p className="nx:typography-body-default nx:text-muted-foreground">
          {"Change your password here. After saving, you'll be logged out."}
        </p>
      </Nxds.TabsContent>
    </Nxds.Tabs>
  ),
  Textarea: (
    <div className="nx:w-[400px]">
      <Nxds.Textarea placeholder="Tell us about yourself..." />
    </div>
  ),
  Toggle: (
    <Nxds.Toggle aria-label="Bold">
      <Nxds.Icon name="text-b" />
    </Nxds.Toggle>
  ),
  ToggleGroup: (
    <Nxds.ToggleGroup type="single" defaultValue="left">
      <Nxds.ToggleGroupItem value="left" aria-label="Align left">
        <Nxds.Icon name="text-align-left" />
      </Nxds.ToggleGroupItem>
      <Nxds.ToggleGroupItem value="center" aria-label="Align center">
        <Nxds.Icon name="text-align-center" />
      </Nxds.ToggleGroupItem>
      <Nxds.ToggleGroupItem value="right" aria-label="Align right">
        <Nxds.Icon name="text-align-right" />
      </Nxds.ToggleGroupItem>
    </Nxds.ToggleGroup>
  ),
  Toolbar: (
    <Nxds.Toolbar orientation="vertical" aria-label="Drawing actions">
      <Nxds.ToolbarButton>Select</Nxds.ToolbarButton>
      <Nxds.ToolbarButton>Draw</Nxds.ToolbarButton>
      <Nxds.ToolbarSeparator />
      <Nxds.ToolbarButton>Erase</Nxds.ToolbarButton>
    </Nxds.Toolbar>
  ),
  Tooltip: (
    <Nxds.Tooltip>
      <Nxds.TooltipTrigger asChild>
        <Nxds.Button variant="outline">Hover me</Nxds.Button>
      </Nxds.TooltipTrigger>
      <Nxds.TooltipContent>
        <p>This is a tooltip</p>
      </Nxds.TooltipContent>
    </Nxds.Tooltip>
  ),
};
