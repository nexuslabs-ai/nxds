'use client';

import { type ReactNode, useId, useState } from 'react';

import { Bar, BarChart, XAxis } from 'recharts';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/accordion/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/alert/alert';
import { Avatar, AvatarFallback } from '@/components/avatar/avatar';
import { Badge } from '@/components/badge/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/breadcrumb/breadcrumb';
import { Bubble, BubbleContent } from '@/components/bubble/bubble';
import { Button } from '@/components/button/button';
import { ButtonGroup } from '@/components/button-group/button-group';
import { Card, CardContent, CardHeader } from '@/components/card/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/carousel/carousel';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/chart/chart';
import { Checkbox } from '@/components/checkbox/checkbox';
import {
  ChoiceCard,
  ChoiceCardContent,
  ChoiceCardDescription,
  ChoiceCardTitle,
} from '@/components/choice-card/choice-card';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/combobox/combobox';
import { DatePicker } from '@/components/date-picker/date-picker';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListItem,
  DescriptionListTerm,
} from '@/components/description-list/description-list';
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateHeader,
  EmptyStateMedia,
  EmptyStateTitle,
} from '@/components/empty-state/empty-state';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@/components/field/field';
import { FilterChip } from '@/components/filter-chip/filter-chip';
import { Input } from '@/components/input/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/input-otp/input-otp';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/item/item';
import { Kbd, KbdGroup } from '@/components/kbd/kbd';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/menubar/menubar';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from '@/components/message/message';
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from '@/components/multi-select/multi-select';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/navigation-menu/navigation-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/pagination/pagination';
import { Progress } from '@/components/progress/progress';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/radio-group/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select/select';
import { Skeleton } from '@/components/skeleton/skeleton';
import { Slider } from '@/components/slider/slider';
import { Spinner } from '@/components/spinner/spinner';
import { Switch } from '@/components/switch/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/table/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/tabs/tabs';
import { Textarea } from '@/components/textarea/textarea';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/toggle-group/toggle-group';

import {
  IconChevronLeft,
  IconChevronRight,
  IconDots,
  IconList,
  IconPencil,
  IconPlus,
} from '../../_lib/switchable-icons';

const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
];
const FILTERS = ['Status: Active', 'Owner: Alex', 'Due: This week'];
const SHORTCUTS = [
  { action: 'Search', keys: ['⌘', 'K'] },
  { action: 'Save', keys: ['⌘', 'S'] },
  { action: 'New issue', keys: ['C'] },
];
const NOTIFICATIONS = [
  { value: 'updates', label: 'Product updates', checked: true },
  { value: 'digest', label: 'Weekly digest', checked: true },
  { value: 'offers', label: 'Offers', checked: false },
];
const NOTIFY_ABOUT = [
  { value: 'all', label: 'All activity' },
  { value: 'mentions', label: 'Mentions only' },
  { value: 'none', label: 'Nothing' },
];
const SETTINGS = [
  {
    value: 'sync',
    label: 'Auto-sync',
    description: 'Keep files up to date.',
    checked: true,
  },
  {
    value: '2fa',
    label: 'Two-factor sign-in',
    description: 'Ask for a code on new devices.',
    checked: false,
  },
];
const PLANS = [
  { value: 'starter', title: 'Starter', detail: 'For one person. Free.' },
  { value: 'pro', title: 'Pro', detail: 'For teams. $12 per seat.' },
];
const PROJECT_TABS = [
  { value: 'issues', text: 'Three issues are due this week.' },
  { value: 'activity', text: 'Sam closed two issues today.' },
  { value: 'docs', text: 'Two docs need a review.' },
];
const USAGE_LIMITS = [
  { label: 'Storage', value: 64 },
  { label: 'Monthly uploads', value: 30 },
];
const INVOICES = [
  { invoice: '#1042', status: 'Paid', variant: 'success', amount: '$1,250' },
  { invoice: '#1043', status: 'Due', variant: 'warning', amount: '$840' },
  { invoice: '#1044', status: 'Late', variant: 'error', amount: '$2,300' },
] as const;
const USAGE = [
  { month: 'May', usage: 42 },
  { month: 'Jun', usage: 58 },
  { month: 'Jul', usage: 51 },
  { month: 'Aug', usage: 74 },
  { month: 'Sep', usage: 66 },
  { month: 'Oct', usage: 88 },
];
const PLAN_DETAILS = [
  { term: 'Plan', value: 'Pro' },
  { term: 'Seats', value: '12 of 20' },
  { term: 'Renews', value: 'November 1' },
];
const PEOPLE = [
  { initials: 'AL', name: 'Alex Lee', role: 'Designer' },
  { initials: 'SR', name: 'Sam Rivera', role: 'Engineer' },
];
const TEAM = ['AL', 'SR', 'JK', 'MP'];
const FAQ = [
  {
    value: 'access',
    question: 'Is it accessible?',
    answer: 'Yes. It follows the WAI-ARIA pattern.',
  },
  {
    value: 'themes',
    question: 'Is it themeable?',
    answer: 'Yes. Every token changes with the theme.',
  },
  {
    value: 'frameworks',
    question: 'Which frameworks?',
    answer: 'React and Vue today.',
  },
];

function Tile({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Card className="nx:component-wall-tile">
      <CardHeader>
        <h2 className="nx:m-0 nx:typography-label-small nx:text-muted-foreground">
          {name}
        </h2>
      </CardHeader>
      <CardContent className="nx:flex nx:min-w-0 nx:flex-col nx:gap-3">
        {children}
      </CardContent>
    </Card>
  );
}

function ButtonTile() {
  return (
    <Tile name="Button">
      <div className="nx:flex nx:flex-wrap nx:gap-2">
        <Button>
          <IconPlus aria-hidden="true" />
          Create
        </Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="outline" size="icon" aria-label="Edit">
          <IconPencil aria-hidden="true" />
        </Button>
      </div>
    </Tile>
  );
}

function ButtonGroupTile() {
  return (
    <Tile name="Button group">
      <ButtonGroup>
        <Button variant="outline">Day</Button>
        <Button variant="outline">Week</Button>
        <Button variant="outline">Month</Button>
      </ButtonGroup>
    </Tile>
  );
}

function ToggleGroupTile() {
  return (
    <Tile name="Toggle group">
      <ToggleGroup type="single" defaultValue="board" aria-label="Layout">
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="board">Board</ToggleGroupItem>
        <ToggleGroupItem value="timeline">Timeline</ToggleGroupItem>
      </ToggleGroup>
    </Tile>
  );
}

function KbdTile() {
  return (
    <Tile name="Kbd">
      {SHORTCUTS.map(({ action, keys }) => (
        <div
          key={action}
          className="nx:flex nx:items-center nx:justify-between nx:typography-body-small"
        >
          {action}
          <KbdGroup>
            {keys.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
          </KbdGroup>
        </div>
      ))}
    </Tile>
  );
}

function InputTile() {
  const id = useId();
  return (
    <Tile name="Input">
      <Field>
        <FieldLabel htmlFor={id}>Email</FieldLabel>
        <Input id={id} type="email" placeholder="you@company.com" />
        <FieldDescription>We only use it for sign-in.</FieldDescription>
      </Field>
    </Tile>
  );
}

function InputOtpTile() {
  return (
    <Tile name="Input OTP">
      <InputOTP maxLength={6} aria-label="Verification code">
        <InputOTPGroup>
          {Array.from({ length: 6 }, (_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </Tile>
  );
}

function TextareaTile() {
  const id = useId();
  return (
    <Tile name="Textarea">
      <Field>
        <FieldLabel htmlFor={id}>Notes</FieldLabel>
        <Textarea id={id} rows={3} placeholder="Add a note for the team" />
      </Field>
    </Tile>
  );
}

function SelectTile() {
  const id = useId();
  return (
    <Tile name="Select">
      <Field>
        <FieldLabel htmlFor={id}>Time zone</FieldLabel>
        <Select defaultValue="london">
          <SelectTrigger id={id} className="nx:w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new-york">New York (ET)</SelectItem>
            <SelectItem value="london">London (GMT)</SelectItem>
            <SelectItem value="berlin">Berlin (CET)</SelectItem>
            <SelectItem value="mumbai">Mumbai (IST)</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </Tile>
  );
}

function ComboboxTile() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('react');
  const label = FRAMEWORKS.find(
    (framework) => framework.value === value
  )?.label;
  function select(next: string) {
    setValue(next === value ? '' : next);
    setOpen(false);
  }
  return (
    <Tile name="Combobox">
      <Combobox open={open} onOpenChange={setOpen}>
        <ComboboxTrigger className="nx:w-full">
          <span className="nx:min-w-0 nx:flex-1 nx:truncate nx:text-left">
            {label ?? 'Select framework'}
          </span>
        </ComboboxTrigger>
        <ComboboxContent label="Framework">
          <ComboboxInput placeholder="Search framework…" />
          <ComboboxList>
            <ComboboxEmpty>No framework found.</ComboboxEmpty>
            <ComboboxGroup>
              {FRAMEWORKS.map((framework) => (
                <ComboboxItem
                  key={framework.value}
                  value={framework.value}
                  keywords={[framework.label]}
                  selected={value === framework.value}
                  onSelect={select}
                >
                  {framework.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Tile>
  );
}

function MultiSelectTile() {
  return (
    <Tile name="Multi-select">
      <MultiSelect defaultValues={['react', 'vue']}>
        <MultiSelectTrigger aria-label="Frameworks" className="nx:w-full">
          <MultiSelectValue placeholder="Select frameworks" />
        </MultiSelectTrigger>
        <MultiSelectContent
          searchPlaceholder="Search frameworks…"
          emptyMessage="No frameworks found."
        >
          {FRAMEWORKS.map((framework) => (
            <MultiSelectItem key={framework.value} value={framework.value}>
              {framework.label}
            </MultiSelectItem>
          ))}
        </MultiSelectContent>
      </MultiSelect>
    </Tile>
  );
}

function DatePickerTile() {
  const [date, setDate] = useState<Date | undefined>(() => new Date());
  return (
    <Tile name="Date picker">
      <DatePicker
        mode="single"
        defaultMonth={date}
        selected={date}
        onSelect={setDate}
        className="nx:self-center"
      />
    </Tile>
  );
}

function CheckboxTile() {
  const id = useId();
  return (
    <Tile name="Checkbox">
      {NOTIFICATIONS.map(({ value, label, checked }) => (
        <Field key={value} orientation="horizontal">
          <Checkbox id={`${id}-${value}`} defaultChecked={checked} />
          <FieldLabel htmlFor={`${id}-${value}`}>{label}</FieldLabel>
        </Field>
      ))}
    </Tile>
  );
}

function RadioGroupTile() {
  const id = useId();
  return (
    <Tile name="Radio group">
      <RadioGroup defaultValue="mentions" aria-label="Notify me about">
        {NOTIFY_ABOUT.map(({ value, label }) => (
          <Field key={value} orientation="horizontal">
            <RadioGroupItem id={`${id}-${value}`} value={value} />
            <FieldLabel htmlFor={`${id}-${value}`}>{label}</FieldLabel>
          </Field>
        ))}
      </RadioGroup>
    </Tile>
  );
}

function SwitchTile() {
  const id = useId();
  return (
    <Tile name="Switch">
      {SETTINGS.map(({ value, label, description, checked }) => (
        <Field key={value} orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-${value}`}>{label}</FieldLabel>
            <FieldDescription>{description}</FieldDescription>
          </FieldContent>
          <Switch id={`${id}-${value}`} defaultChecked={checked} />
        </Field>
      ))}
    </Tile>
  );
}

function SliderTile() {
  const id = useId();
  const [volume, setVolume] = useState([64]);
  return (
    <Tile name="Slider">
      <Field>
        <div className="nx:flex nx:items-center nx:justify-between">
          <FieldLabel id={id}>Volume</FieldLabel>
          <span className="nx:typography-body-small nx:text-muted-foreground nx:tabular-nums">
            {volume[0]}%
          </span>
        </div>
        <Slider aria-labelledby={id} value={volume} onValueChange={setVolume} />
      </Field>
    </Tile>
  );
}

function ChoiceCardTile() {
  const id = useId();
  return (
    <Tile name="Choice card">
      <RadioGroup defaultValue="pro" aria-label="Plan">
        {PLANS.map(({ value, title, detail }) => (
          <ChoiceCard key={value} htmlFor={`${id}-${value}`}>
            <RadioGroupItem
              value={value}
              id={`${id}-${value}`}
              aria-labelledby={`${id}-${value}-label`}
              aria-describedby={`${id}-${value}-description`}
            />
            <ChoiceCardContent>
              <ChoiceCardTitle id={`${id}-${value}-label`}>
                {title}
              </ChoiceCardTitle>
              <ChoiceCardDescription id={`${id}-${value}-description`}>
                {detail}
              </ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
        ))}
      </RadioGroup>
    </Tile>
  );
}

function FilterChipTile() {
  const [filters, setFilters] = useState(FILTERS);
  function remove(filter: string) {
    setFilters((current) => current.filter((item) => item !== filter));
  }
  return (
    <Tile name="Filter chip">
      <div className="nx:flex nx:flex-wrap nx:gap-2">
        {filters.map((filter) => (
          <FilterChip
            key={filter}
            aria-label={`Remove filter ${filter}`}
            onClick={() => remove(filter)}
          >
            {filter}
          </FilterChip>
        ))}
        {filters.length === 0 && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(FILTERS)}>
            Restore filters
          </Button>
        )}
      </div>
    </Tile>
  );
}

function TabsTile() {
  return (
    <Tile name="Tabs">
      <Tabs defaultValue="issues">
        <TabsList aria-label="Project">
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
        </TabsList>
        {PROJECT_TABS.map(({ value, text }) => (
          <TabsContent
            key={value}
            value={value}
            className="nx:typography-body-small nx:text-muted-foreground"
          >
            {text}
          </TabsContent>
        ))}
      </Tabs>
    </Tile>
  );
}

function BreadcrumbTile() {
  return (
    <Tile name="Breadcrumb">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Nexus</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </Tile>
  );
}

function PaginationTile() {
  return (
    <Tile name="Pagination">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" size="icon">
              <IconChevronLeft aria-hidden="true" />
            </PaginationPrevious>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" size="icon">
              <IconChevronRight aria-hidden="true" />
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </Tile>
  );
}

function NavigationMenuTile() {
  return (
    <Tile name="Navigation menu">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Product</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="nx:m-0 nx:grid nx:w-56 nx:list-none nx:gap-1 nx:p-2">
                {['Analytics', 'Automation', 'Reports'].map((link) => (
                  <li key={link}>
                    <NavigationMenuLink href="#">{link}</NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Pricing</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Tile>
  );
}

function MenubarTile() {
  return (
    <Tile name="Menubar">
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New file
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Open
              <MenubarShortcut>⌘O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Print</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Zoom in</MenubarItem>
            <MenubarItem>Zoom out</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </Tile>
  );
}

function AlertTile() {
  return (
    <Tile name="Alert">
      <Alert variant="information">
        <AlertTitle>New version available.</AlertTitle>
        <AlertDescription>Update to get the latest fixes.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Payment failed.</AlertTitle>
        <AlertDescription>Check your card details.</AlertDescription>
      </Alert>
    </Tile>
  );
}

function ProgressTile() {
  return (
    <Tile name="Progress">
      {USAGE_LIMITS.map(({ label, value }) => (
        <div key={label} className="nx:flex nx:flex-col nx:gap-2">
          <div className="nx:flex nx:justify-between nx:typography-label-small">
            {label}
            <span className="nx:text-muted-foreground nx:tabular-nums">
              {value}%
            </span>
          </div>
          <Progress value={value} aria-label={label} />
        </div>
      ))}
    </Tile>
  );
}

function SpinnerTile() {
  return (
    <Tile name="Spinner">
      {['Uploading 3 files', 'Saving changes'].map((status) => (
        <div
          key={status}
          className="nx:flex nx:items-center nx:gap-2 nx:typography-body-small nx:text-muted-foreground"
        >
          <Spinner />
          {status}
        </div>
      ))}
    </Tile>
  );
}

function SkeletonTile() {
  return (
    <Tile name="Skeleton">
      <div className="nx:flex nx:items-center nx:gap-3">
        <Skeleton className="nx:size-10 nx:rounded-full nx:bg-control-background" />
        <div className="nx:flex nx:flex-1 nx:flex-col nx:gap-2">
          <Skeleton className="nx:h-4 nx:w-1/2 nx:bg-control-background" />
          <Skeleton className="nx:h-3 nx:w-3/4 nx:bg-control-background" />
        </div>
      </div>
    </Tile>
  );
}

function BadgeTile() {
  return (
    <Tile name="Badge">
      <div className="nx:flex nx:flex-wrap nx:gap-2">
        <Badge>New</Badge>
        <Badge variant="secondary">Draft</Badge>
        <Badge variant="information">In review</Badge>
        <Badge variant="success">Live</Badge>
        <Badge variant="warning">Paused</Badge>
        <Badge variant="error">Failed</Badge>
      </div>
    </Tile>
  );
}

function EmptyStateTile() {
  return (
    <Tile name="Empty state">
      <EmptyState>
        <EmptyStateHeader>
          <EmptyStateMedia variant="icon">
            <IconList aria-hidden="true" />
          </EmptyStateMedia>
          <EmptyStateTitle>No projects yet</EmptyStateTitle>
          <EmptyStateDescription>
            Create a project to start your work.
          </EmptyStateDescription>
        </EmptyStateHeader>
        <EmptyStateContent>
          <Button>Create project</Button>
        </EmptyStateContent>
      </EmptyState>
    </Tile>
  );
}

function TableTile() {
  return (
    <Tile name="Table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="nx:text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {INVOICES.map(({ invoice, status, variant, amount }) => (
            <TableRow key={invoice}>
              <TableCell>{invoice}</TableCell>
              <TableCell>
                <Badge variant={variant}>{status}</Badge>
              </TableCell>
              <TableCell className="nx:text-right nx:tabular-nums">
                {amount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Tile>
  );
}

function ChartTile() {
  return (
    <Tile name="Chart">
      <ChartContainer
        config={{
          usage: {
            label: 'Usage',
            color: 'var(--nx-color-chart-categorical-1)',
          },
        }}
        role="img"
        aria-label={`Monthly usage: ${USAGE.map(({ usage }) => usage).join(', ')}`}
      >
        <BarChart data={USAGE} accessibilityLayer>
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: 'currentColor' }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="usage"
            fill="var(--color-usage)"
            radius={4}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </Tile>
  );
}

function DescriptionListTile() {
  return (
    <Tile name="Description list">
      <DescriptionList>
        {PLAN_DETAILS.map(({ term, value }) => (
          <DescriptionListItem key={term}>
            <DescriptionListTerm>{term}</DescriptionListTerm>
            <DescriptionListDescription>{value}</DescriptionListDescription>
          </DescriptionListItem>
        ))}
      </DescriptionList>
    </Tile>
  );
}

function ItemTile() {
  return (
    <Tile name="Item">
      <ItemGroup>
        {PEOPLE.map(({ initials, name, role }) => (
          <Item key={name} className="nx:px-0">
            <ItemMedia>
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{name}</ItemTitle>
              <ItemDescription>{role}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${name}`}
              >
                <IconDots aria-hidden="true" />
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </Tile>
  );
}

function AvatarTile() {
  return (
    <Tile name="Avatar">
      <div className="nx:flex nx:gap-2">
        {TEAM.map((initials) => (
          <Avatar key={initials}>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        ))}
      </div>
    </Tile>
  );
}

function AccordionTile() {
  return (
    <Tile name="Accordion">
      <Accordion type="single" collapsible defaultValue="access">
        {FAQ.map(({ value, question, answer }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Tile>
  );
}

function CarouselTile() {
  return (
    <Tile name="Carousel">
      <div className="nx:px-12">
        <Carousel aria-label="Release highlights">
          <CarouselContent>
            {[1, 2, 3, 4].map((slide) => (
              <CarouselItem key={slide} aria-label={`Slide ${slide} of 4`}>
                <div className="nx:flex nx:aspect-square nx:items-center nx:justify-center nx:rounded-md nx:border-default nx:border-border-default nx:typography-heading-large">
                  {slide}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </Tile>
  );
}

function MessageTile() {
  return (
    <Tile name="Message">
      <Message>
        <MessageAvatar aria-hidden="true">
          <AvatarFallback>SR</AvatarFallback>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Sam Rivera</MessageHeader>
          <Bubble>
            <BubbleContent>The new theme is ready for review.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble variant="outline">
            <BubbleContent>Looks great. Let’s ship it.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </Tile>
  );
}

/** One card per Nexus component, in columns that follow the wall's width. */
export function ComponentWall() {
  return (
    <div
      className="nx:component-wall"
      role="region"
      aria-label="Nexus components"
    >
      <div className="nx:component-wall-grid">
        <ButtonTile />
        <InputTile />
        <ChartTile />
        <BadgeTile />
        <SwitchTile />
        <TableTile />
        <ButtonGroupTile />
        <SelectTile />
        <DatePickerTile />
        <ToggleGroupTile />
        <TabsTile />
        <ChoiceCardTile />
        <AlertTile />
        <ComboboxTile />
        <ItemTile />
        <SliderTile />
        <AccordionTile />
        <MultiSelectTile />
        <CheckboxTile />
        <ProgressTile />
        <MessageTile />
        <InputOtpTile />
        <EmptyStateTile />
        <RadioGroupTile />
        <FilterChipTile />
        <DescriptionListTile />
        <BreadcrumbTile />
        <TextareaTile />
        <PaginationTile />
        <CarouselTile />
        <MenubarTile />
        <KbdTile />
        <NavigationMenuTile />
        <AvatarTile />
        <SpinnerTile />
        <SkeletonTile />
      </div>
    </div>
  );
}
