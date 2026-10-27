'use client';

import {
  type ComponentProps,
  type FormEvent,
  type ReactNode,
  useId,
  useState,
} from 'react';

import { cn } from '@nxds/react/utils';
import { Bar, BarChart, XAxis } from 'recharts';

import { Avatar, AvatarFallback } from '@/components/avatar/avatar';
import { Badge } from '@/components/badge/badge';
import { Bubble, BubbleContent } from '@/components/bubble/bubble';
import { Button } from '@/components/button/button';
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from '@/components/card/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/chart/chart';
import { Checkbox } from '@/components/checkbox/checkbox';
import { ChoiceRow, ChoiceRowTitle } from '@/components/choice-row/choice-row';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@/components/field/field';
import { Input } from '@/components/input/input';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/item/item';
import { Label } from '@/components/label/label';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from '@/components/message/message';
import { NativeSelect } from '@/components/native-select/native-select';
import { Progress } from '@/components/progress/progress';
import { Separator } from '@/components/separator/separator';
import { Slider } from '@/components/slider/slider';
import { Switch } from '@/components/switch/switch';
import {
  Table,
  TableBody,
  TableCaption,
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
  SiteArrowUpRightIcon,
  SiteFileIcon,
  SiteSendIcon,
} from '../../_lib/site-icons';
import { IconPlus } from '../../_lib/switchable-icons';

const statusClassName =
  'nx:m-0 nx:typography-body-small nx:text-muted-foreground nx:wrap-anywhere';
const proseClassName =
  'nx:m-0 nx:typography-body-default nx:text-muted-foreground';
const stackClassName = 'nx:flex nx:flex-col nx:gap-3.5';
const metricClassName =
  'nx:my-3 nx:flex nx:flex-wrap nx:items-center nx:gap-3.5';
const metricValueClassName = 'nx:typography-heading-large nx:tabular-nums';

type ShowcaseCardProps = Omit<ComponentProps<typeof Card>, 'title'> & {
  title: string;
  /** Sits on the title's row, such as a TabsList. */
  action?: ReactNode;
};

/**
 * A titled Nexus card. It is relative, so its visually hidden labels stay
 * inside its clip, and a `showcase-card` container for the narrow-card rules
 * in gallery.css.
 */
function ShowcaseCard({
  title,
  action,
  children,
  className,
  ...props
}: ShowcaseCardProps) {
  const id = useId();
  return (
    <Card
      {...props}
      className={cn('nx:relative nx:@container/showcase-card', className)}
      role="region"
      aria-labelledby={id}
    >
      <div className="nx:showcase-body nx:p-container">
        <CardHeader className="nx:showcase-heading nx:items-center nx:p-0">
          <CardTitle asChild>
            <h3 id={id}>{title}</h3>
          </CardTitle>
          {action && (
            <CardAction className="nx:row-span-1 nx:self-center">
              {action}
            </CardAction>
          )}
        </CardHeader>
        {children}
      </div>
    </Card>
  );
}

function Person({
  name,
  detail,
  children,
}: {
  name: string;
  detail: string;
  children?: ReactNode;
}) {
  return (
    <Item size="sm" className="nx:nexus-showcase-person nx:p-0">
      <ItemMedia>
        <Avatar size="sm" aria-hidden="true">
          <AvatarFallback>
            {name
              .split(' ')
              .map((part) => part[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{name}</ItemTitle>
        <ItemDescription>{detail}</ItemDescription>
      </ItemContent>
      {children && <ItemActions>{children}</ItemActions>}
    </Item>
  );
}

export function ProjectCard() {
  const id = useId();
  const [created, setCreated] = useState('');
  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreated(String(new FormData(event.currentTarget).get('project')));
  }
  return (
    <ShowcaseCard title="Create a project">
      <form className={stackClassName} onSubmit={createProject}>
        <Field>
          <FieldLabel htmlFor={`${id}-name`}>Project name</FieldLabel>
          <Input
            id={`${id}-name`}
            name="project"
            defaultValue="Website refresh"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-team`}>Workspace</FieldLabel>
          <NativeSelect
            id={`${id}-team`}
            name="workspace"
            defaultValue="Design team"
          >
            <option>Design team</option>
            <option>Engineering</option>
            <option>Personal projects</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-date`}>Target date</FieldLabel>
          <Input
            id={`${id}-date`}
            type="date"
            name="date"
            defaultValue="2026-11-12"
          />
        </Field>
        <ChoiceRow htmlFor={`${id}-private`}>
          <Checkbox
            id={`${id}-private`}
            aria-labelledby={`${id}-private-label`}
            defaultChecked
          />
          <ChoiceRowTitle id={`${id}-private-label`}>
            Keep this project private
          </ChoiceRowTitle>
        </ChoiceRow>
        <Button type="submit">
          <IconPlus aria-hidden="true" /> Create project
        </Button>
        <p className={statusClassName} role="status">
          {created
            ? `${created} is ready in this demo.`
            : 'Try it. Everything stays in this preview.'}
        </p>
      </form>
    </ShowcaseCard>
  );
}

const activity = {
  week: {
    total: '1,284',
    change: '+12.8%',
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    values: [48, 72, 56, 89, 64, 100, 82],
  },
  month: {
    total: '5,426',
    change: '+18.4%',
    labels: ['01', '05', '09', '13', '17', '21', '25'],
    values: [37, 49, 68, 53, 79, 91, 100],
  },
};

export function ActivityCard() {
  return (
    <Tabs defaultValue="week" asChild>
      <ShowcaseCard
        title="Workspace activity"
        action={
          <TabsList size="sm" aria-label="Activity period">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        }
      >
        {Object.entries(activity).map(([period, data]) => (
          <TabsContent value={period} key={period}>
            <div className={metricClassName}>
              <strong className={metricValueClassName}>{data.total}</strong>
              <Badge variant="success" fill="light">
                <SiteArrowUpRightIcon aria-hidden="true" />
                {data.change}
              </Badge>
            </div>
            <ChartContainer
              className="nx:aspect-auto nx:h-28"
              config={{
                activity: {
                  label: 'Activity',
                  color: 'var(--nx-color-chart-categorical-1)',
                },
              }}
              role="img"
              aria-label={`${period === 'week' ? 'Weekly' : 'Monthly'} activity index: ${data.values.join(', ')}`}
            >
              {/* No keyboard layer: the chart is one image to assistive tech. */}
              <BarChart
                accessibilityLayer={false}
                data={data.values.map((value, index) => ({
                  day: data.labels[index],
                  activity: value,
                }))}
              >
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="activity"
                  fill="var(--color-activity)"
                  radius={4}
                  isAnimationActive={false}
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        ))}
      </ShowcaseCard>
    </Tabs>
  );
}

const team = [
  ['Alex Morgan', 'Design lead'],
  ['Sam Rivera', 'Product designer'],
  ['Jordan Lee', 'Engineer'],
] as const;

export function TeamCard() {
  const id = useId();
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState('');
  function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInvited(String(new FormData(event.currentTarget).get('email')));
    setInviting(false);
  }
  return (
    <ShowcaseCard title="Team access">
      <div className="nx:flex nx:flex-col nx:gap-2.5">
        {team.map(([name, detail], index) => (
          <Person key={name} name={name} detail={detail}>
            <NativeSelect
              size="sm"
              aria-label={`Role for ${name}`}
              defaultValue={index === 0 ? 'Admin' : 'Editor'}
            >
              <option>Admin</option>
              <option>Editor</option>
              <option>Viewer</option>
            </NativeSelect>
          </Person>
        ))}
        {inviting ? (
          <form className="nx:flex nx:flex-col nx:gap-2.5" onSubmit={invite}>
            <Field>
              <FieldLabel htmlFor={id}>Email address</FieldLabel>
              <Input
                id={id}
                name="email"
                type="email"
                placeholder="teammate@example.com"
                required
              />
            </Field>
            <div className="nx:showcase-actions">
              <Button size="sm" type="submit">
                Add to team
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setInviting(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" onClick={() => setInviting(true)}>
            <IconPlus aria-hidden="true" />
            Invite a teammate
          </Button>
        )}
        {invited && (
          <p className={statusClassName} role="status">
            {invited} added to this demo. No invitation sent.
          </p>
        )}
      </div>
    </ShowcaseCard>
  );
}

export function ConversationCard() {
  const id = useId();
  const [messages, setMessages] = useState<string[]>([]);
  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const text = String(new FormData(form).get('message')).trim();
    if (!text) return;
    setMessages((current) => [...current, text]);
    form.reset();
  }
  return (
    <ShowcaseCard title="Design review">
      <MessageGroup
        announce
        aria-label="Design review conversation"
        className="nx:showcase-messages"
      >
        <Message>
          <MessageAvatar aria-hidden="true">
            <AvatarFallback>SR</AvatarFallback>
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>Sam Rivera</MessageHeader>
            <Bubble variant="outline">
              <BubbleContent>
                The new direction is ready for a look.
              </BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageContent>
            <Bubble variant="primary">
              <BubbleContent>
                Love the quieter navigation. Let’s ship it.
              </BubbleContent>
            </Bubble>
            <MessageFooter>You · 10:42</MessageFooter>
          </MessageContent>
        </Message>
        {messages.map((message, index) => (
          <Message align="end" key={index}>
            <MessageContent>
              <Bubble variant="primary">
                <BubbleContent>{message}</BubbleContent>
              </Bubble>
              <MessageFooter>You · just now</MessageFooter>
            </MessageContent>
          </Message>
        ))}
      </MessageGroup>
      <form className="nx:showcase-composer" onSubmit={sendMessage}>
        <Label className="nx:sr-only" htmlFor={id}>
          Message to the design team
        </Label>
        <Input
          id={id}
          name="message"
          placeholder="Add your thoughts…"
          required
        />
        <Button type="submit" size="icon" aria-label="Send demo message">
          <SiteSendIcon aria-hidden="true" />
        </Button>
      </form>
    </ShowcaseCard>
  );
}

const notifications = [
  ['Mentions and replies', 'When someone needs your attention.'],
  ['Project updates', 'Progress, milestones and shared work.'],
  ['Weekly digest', 'A weekly summary of your workspace.'],
] as const;

export function PreferencesCard() {
  const id = useId();
  const [volume, setVolume] = useState([65]);
  return (
    <ShowcaseCard title="Notifications">
      <div className={stackClassName}>
        {notifications.map(([label, description], index) => (
          <Field orientation="horizontal" key={label}>
            <FieldContent>
              <FieldLabel htmlFor={`${id}-${index}`}>{label}</FieldLabel>
              {/* Not shown, but still read as the switch's description. */}
              <FieldDescription
                className="nx:hidden"
                id={`${id}-${index}-description`}
              >
                {description}
              </FieldDescription>
            </FieldContent>
            <Switch
              id={`${id}-${index}`}
              aria-describedby={`${id}-${index}-description`}
              defaultChecked={index < 2}
            />
          </Field>
        ))}
        <div className={stackClassName}>
          <Separator className="nx:my-0.5" />
          <div className="nx:showcase-between">
            <Label htmlFor={`${id}-volume`}>Notification volume</Label>
            <output>{volume[0]}%</output>
          </div>
          <Slider
            id={`${id}-volume`}
            aria-label="Notification volume"
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={5}
          />
        </div>
      </div>
    </ShowcaseCard>
  );
}

const initialTasks = [
  'Explore the direction',
  'Review the components',
  'Polish the interactions',
  'Share with the team',
];
export function TasksCard() {
  const id = useId();
  const [done, setDone] = useState([true, true, false, false]);
  const completed = done.filter(Boolean).length;
  function toggleTask(index: number, checked: boolean) {
    setDone((current) =>
      current.map((value, i) => (i === index ? checked : value))
    );
  }
  return (
    <ShowcaseCard title="Project checklist">
      <div className={metricClassName}>
        <strong className={metricValueClassName}>
          {completed}
          <span className="nx:typography-heading-small nx:text-muted-foreground">
            {' '}
            / 4
          </span>
        </strong>
        <Badge variant="secondary" fill="light">
          In progress
        </Badge>
      </div>
      <Progress
        value={completed * 25}
        aria-label={`${completed} of 4 tasks complete`}
      />
      <div className="nx:mt-4 nx:flex nx:flex-col">
        {initialTasks.map((task, index) => (
          <ChoiceRow htmlFor={`${id}-${index}`} key={task}>
            <Checkbox
              id={`${id}-${index}`}
              checked={done[index]}
              aria-labelledby={`${id}-${index}-label`}
              onCheckedChange={(checked) => toggleTask(index, checked === true)}
            />
            <ChoiceRowTitle
              id={`${id}-${index}-label`}
              className={
                done[index]
                  ? 'nx:line-through nx:text-muted-foreground'
                  : undefined
              }
            >
              {task}
            </ChoiceRowTitle>
          </ChoiceRow>
        ))}
      </div>
      <Separator className="nx:my-6" />
      <Person name="Alex Morgan" detail="Due November 12" />
    </ShowcaseCard>
  );
}

const mail = [
  {
    name: 'Sam Rivera',
    title: 'A fresh direction',
    body: 'The first pass is ready. I’ve kept the navigation quiet and given the work more room. Let me know what you think.',
    time: '10:42',
  },
  {
    name: 'Jordan Lee',
    title: 'Ready for review',
    body: 'The components are in place. Keyboard support and both themes are ready for a final look.',
    time: '09:18',
  },
  {
    name: 'Alex Morgan',
    title: 'Friday catch-up',
    body: 'Let’s walk through the latest work together on Friday. Bring any open questions and ideas for the next release.',
    time: 'Yesterday',
  },
] as const;
type Mail = (typeof mail)[number];

export function InboxCard() {
  const [selected, setSelected] = useState<Mail>(mail[0]);
  const [query, setQuery] = useState('');
  return (
    <ShowcaseCard title="Inbox">
      <Input
        aria-label="Search inbox"
        placeholder="Search conversations…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <ItemGroup className="nx:my-5 nx:gap-2">
        {mail.map(
          (message) =>
            (!query ||
              `${message.name} ${message.title}`
                .toLowerCase()
                .includes(query.toLowerCase())) && (
              <Item
                asChild
                size="sm"
                variant={selected === message ? 'outline' : 'default'}
                key={message.title}
                onClick={() => setSelected(message)}
                aria-pressed={selected === message}
              >
                <button
                  type="button"
                  className="nx:text-start nx:cursor-pointer"
                >
                  <ItemContent>
                    <ItemTitle>{message.name}</ItemTitle>
                    <ItemDescription>{message.title}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <span className="nx:typography-label-small nx:text-muted-foreground">
                      {message.time}
                    </span>
                  </ItemActions>
                </button>
              </Item>
            )
        )}
      </ItemGroup>
      <Separator className="nx:my-6" />
      <Person name={selected.name} detail={selected.time} />
      <h3 className="nx:mt-4 nx:mb-1 nx:typography-heading-xxsmall">
        {selected.title}
      </h3>
      <p className={proseClassName}>{selected.body}</p>
    </ShowcaseCard>
  );
}

export function ComposeCard() {
  const id = useId();
  const [saved, setSaved] = useState(false);
  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }
  return (
    <ShowcaseCard title="New message">
      <form className={stackClassName} onSubmit={saveDraft}>
        <Field>
          <FieldLabel htmlFor={`${id}-to`}>To</FieldLabel>
          <Input
            id={`${id}-to`}
            type="email"
            name="to"
            defaultValue="sam@example.com"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-message`}>Message</FieldLabel>
          <Textarea
            id={`${id}-message`}
            name="message"
            defaultValue="Thanks for sharing. This is looking great."
            rows={3}
            required
          />
        </Field>
        <Button type="submit" variant="outline">
          Save draft
        </Button>
        <p className={statusClassName} role="status">
          {saved
            ? 'Draft saved in this preview.'
            : 'Nothing is sent from this demo.'}
        </p>
      </form>
    </ShowcaseCard>
  );
}

const files = [
  ['Brand guidelines.pdf', '2.4 MB'],
  ['Component inventory.csv', '128 KB'],
  ['Launch checklist.md', '12 KB'],
] as const;

export function FilesCard() {
  const [selected, setSelected] = useState('');
  return (
    <ShowcaseCard title="Shared files">
      <div className={stackClassName}>
        {files.map(([name, size]) => (
          <Item variant="outline" size="sm" key={name}>
            <ItemMedia variant="icon">
              <SiteFileIcon aria-hidden="true" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{name}</ItemTitle>
              <ItemDescription>{size}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Select ${name}`}
                onClick={() => setSelected(name)}
              >
                <SiteArrowUpRightIcon aria-hidden="true" />
              </Button>
            </ItemActions>
          </Item>
        ))}
      </div>
      <p className={statusClassName} role="status">
        {selected
          ? `${selected} selected. Sample file only.`
          : 'Three files · Updated today'}
      </p>
    </ShowcaseCard>
  );
}

export function BillingCard() {
  const [period, setPeriod] = useState('monthly');
  const [reviewing, setReviewing] = useState(false);
  return (
    <Tabs value={period} onValueChange={setPeriod} asChild>
      <ShowcaseCard
        title="Workspace plan"
        action={
          <TabsList aria-label="Billing period" size="sm">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="monthly" className={metricClassName}>
          <p className={`nx:m-0 ${metricValueClassName}`}>
            $24{' '}
            <span className="nx:typography-body-small nx:text-muted-foreground">
              / person / month
            </span>
          </p>
        </TabsContent>
        <TabsContent value="yearly" className={metricClassName}>
          <p className={`nx:m-0 ${metricValueClassName}`}>
            $20{' '}
            <span className="nx:typography-body-small nx:text-muted-foreground">
              / person / month
            </span>
          </p>
          <Badge variant="success" fill="light">
            Save 17%
          </Badge>
        </TabsContent>
        <div className={stackClassName}>
          <div className="nx:showcase-between">
            <span>Team seats</span>
            <strong>3 of 5</strong>
          </div>
          <Progress value={60} aria-label="3 of 5 team seats used" />
          <div className="nx:showcase-between">
            <span>Storage</span>
            <strong>6.4 of 20 GB</strong>
          </div>
          <Progress value={32} aria-label="6.4 of 20 gigabytes used" />
          <Button
            variant="outline"
            onClick={() => setReviewing((value) => !value)}
          >
            {reviewing ? 'Close plan details' : 'Review plan'}
          </Button>
          {reviewing && (
            <p className={statusClassName} role="status">
              5 seats, 20 GB storage, unlimited projects. Demo only; no payment
              is taken.
            </p>
          )}
        </div>
      </ShowcaseCard>
    </Tabs>
  );
}

const invoices = [
  ['Studio North', '$2,400', 'Paid'],
  ['Forma Labs', '$1,850', 'Pending'],
  ['Fieldwork', '$3,200', 'Paid'],
] as const;

export function TransactionsCard() {
  const [filter, setFilter] = useState('All');
  return (
    <ShowcaseCard title="Invoices">
      <NativeSelect
        size="sm"
        aria-label="Filter invoice status"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      >
        <option>All</option>
        <option>Paid</option>
        <option>Pending</option>
      </NativeSelect>
      <div className="nx:mt-5 nx:overflow-x-auto">
        <Table density="compact">
          <TableCaption className="nx:sr-only">Sample invoices</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices
              .filter(([, , status]) => filter === 'All' || status === filter)
              .map(([name, amount, status]) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell>{amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={status === 'Paid' ? 'success' : 'warning'}
                      fill="light"
                    >
                      {status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </ShowcaseCard>
  );
}

export function ContactCard() {
  const id = useId();
  const [saved, setSaved] = useState(false);
  function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }
  return (
    <ShowcaseCard title="Contact details">
      <Person name="Jamie Park" detail="Head of design" />
      <Separator className="nx:my-6" />
      <form className={stackClassName} onSubmit={saveContact}>
        <Field>
          <FieldLabel htmlFor={`${id}-name`}>Full name</FieldLabel>
          <Input
            id={`${id}-name`}
            name="name"
            defaultValue="Jamie Park"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            defaultValue="jamie@example.com"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-stage`}>Stage</FieldLabel>
          <NativeSelect id={`${id}-stage`} defaultValue="Discovery">
            <option>Discovery</option>
            <option>Proposal</option>
            <option>Won</option>
          </NativeSelect>
        </Field>
        <Button type="submit">Save contact</Button>
        {saved && (
          <p className={statusClassName} role="status">
            Contact updated in this preview.
          </p>
        )}
      </form>
    </ShowcaseCard>
  );
}

const pipeline = [
  { stage: 'Discovery', total: '$12,400', progress: 35 },
  { stage: 'Proposal', total: '$8,200', progress: 65 },
  { stage: 'Won', total: '$24,600', progress: 100 },
] as const;
type PipelineStage = (typeof pipeline)[number];

export function PipelineCard() {
  const [current, setCurrent] = useState<PipelineStage>(pipeline[0]);
  return (
    <ShowcaseCard title="Sales pipeline">
      <div className="nx:showcase-actions">
        {pipeline.map((stage) => (
          <Button
            key={stage.stage}
            size="sm"
            variant={current === stage ? 'secondary' : 'ghost'}
            aria-pressed={current === stage}
            onClick={() => setCurrent(stage)}
          >
            {stage.stage}
          </Button>
        ))}
      </div>
      <div className={metricClassName}>
        <strong className={metricValueClassName}>{current.total}</strong>
      </div>
      <Progress
        value={current.progress}
        aria-label={`${current.stage} pipeline progress`}
      />
      <p className={`${proseClassName} nx:mt-3`}>
        Total value in {current.stage.toLowerCase()}.
      </p>
    </ShowcaseCard>
  );
}

export function NotesCard() {
  const id = useId();
  const [saved, setSaved] = useState(false);
  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }
  return (
    <ShowcaseCard title="Team notes">
      <form className={stackClassName} onSubmit={saveNote}>
        <Field>
          <FieldLabel htmlFor={id}>Team note</FieldLabel>
          <Textarea
            id={id}
            rows={4}
            defaultValue="Keep the experience simple. Make the details count."
            onChange={() => setSaved(false)}
          />
        </Field>
        <Button variant="outline" type="submit">
          Save note
        </Button>
        <p className={statusClassName} role="status">
          {saved ? 'Note saved in this preview.' : 'Only visible in this demo.'}
        </p>
      </form>
    </ShowcaseCard>
  );
}
