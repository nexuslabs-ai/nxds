// What a card's README shows under "On the canvas", where no docs story can be
// written as markup and its root part alone would render nothing. Each entry
// is that section's markdown. The smoke test mounts every html block in it
// that has no `{{…}}` binding.

const html = (markup: string) => ['```html', markup.trim(), '```'].join('\n');

const FILTER_FIELDS =
  '[{"id":"status","label":"Status","type":"choice","options":[{"value":"active","label":"Active"},{"value":"invited","label":"Invited"},{"value":"suspended","label":"Suspended"}]},{"id":"name","label":"Name","type":"text"},{"id":"projects","label":"Projects","type":"number"}]';

const FILTER_VALUE =
  '{"kind":"group","id":"root","conjunction":"all","children":[{"kind":"rule","id":"r1","field":"status","operator":"is","value":"active"}]}';

const FILTER_SCRIPT = `<script type="text/x-dc" data-dc-script data-props='{"mode":{"editor":"enum","options":["light","dark"],"default":"light","section":"nxds appearance"},"$preview":{"width":960,"height":480}}'>
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        kind: 'group',
        id: 'root',
        conjunction: 'all',
        children: [
          { kind: 'rule', id: 'r1', field: 'status', operator: 'is', value: 'active' }
        ]
      }
    };
  }
  renderVals() {
    return {
      mode: this.props.mode ?? 'light',
      filters: this.state.filters,
      setFilters: (next) => this.setState({ filters: next })
    };
  }
}
</script>`;

const FILLER =
  'display: flex; align-items: center; justify-content: center; height: 100%;';

export const CANVAS_EXAMPLES: Readonly<Record<string, string>> = {
  AspectRatio: [
    'Give it a `ratio` of width over height, such as `1.5` for 3:2. It takes its width from its container.',
    '',
    html(`
<div style="width: var(--nx-spacing-80);">
  <x-import component-from-global-scope="Nxds.AspectRatio" ratio="1.5">
    <div class="typography-body-small" style="${FILLER} border-radius: var(--nx-radius-md); background: var(--nx-color-muted); color: var(--nx-color-muted-foreground);">Cover image</div>
  </x-import>
</div>`),
  ].join('\n'),

  Carousel: [
    "Put each slide in a `Nxds.CarouselItem`. A canvas can't scroll the carousel, so it shows the first slide.",
    '',
    html(`
<div style="width: var(--nx-spacing-80); padding: 0 var(--nx-spacing-12);">
  <x-import component-from-global-scope="Nxds.Carousel">
    <x-import component-from-global-scope="Nxds.CarouselContent">
      <x-import component-from-global-scope="Nxds.CarouselItem">
        <x-import component-from-global-scope="Nxds.Card">
          <div class="typography-heading-large" style="${FILLER} aspect-ratio: 1;">Plan</div>
        </x-import>
      </x-import>
      <x-import component-from-global-scope="Nxds.CarouselItem">
        <x-import component-from-global-scope="Nxds.Card">
          <div class="typography-heading-large" style="${FILLER} aspect-ratio: 1;">Build</div>
        </x-import>
      </x-import>
      <x-import component-from-global-scope="Nxds.CarouselItem">
        <x-import component-from-global-scope="Nxds.Card">
          <div class="typography-heading-large" style="${FILLER} aspect-ratio: 1;">Ship</div>
        </x-import>
      </x-import>
    </x-import>
    <x-import component-from-global-scope="Nxds.CarouselPrevious"></x-import>
    <x-import component-from-global-scope="Nxds.CarouselNext"></x-import>
  </x-import>
</div>`),
  ].join('\n'),

  Combobox: [
    "Write the picked option as the trigger's text, and mark that option `selected`.",
    '',
    html(`
<x-import component-from-global-scope="Nxds.Combobox">
  <x-import component-from-global-scope="Nxds.ComboboxTrigger" class-name="nx:w-64">Astro</x-import>
  <x-import component-from-global-scope="Nxds.ComboboxContent" label="Framework">
    <x-import component-from-global-scope="Nxds.ComboboxInput" placeholder="Search framework…"></x-import>
    <x-import component-from-global-scope="Nxds.ComboboxList">
      <x-import component-from-global-scope="Nxds.ComboboxEmpty">No framework found.</x-import>
      <x-import component-from-global-scope="Nxds.ComboboxGroup">
        <x-import component-from-global-scope="Nxds.ComboboxItem" value="next">Next.js</x-import>
        <x-import component-from-global-scope="Nxds.ComboboxItem" value="sveltekit">SvelteKit</x-import>
        <x-import component-from-global-scope="Nxds.ComboboxItem" value="nuxt">Nuxt</x-import>
        <x-import component-from-global-scope="Nxds.ComboboxItem" value="remix">Remix</x-import>
        <x-import component-from-global-scope="Nxds.ComboboxItem" value="astro" selected>Astro</x-import>
      </x-import>
    </x-import>
  </x-import>
</x-import>`),
  ].join('\n'),

  FilterBuilder: [
    "`value` takes the filter tree either as JSON or as a `{{name}}` from the artboard's script.",
    '',
    "Pass `fields` and `value` as JSON to show a filter in a mockup. Its controls don't change anything.",
    '',
    html(
      `<x-import component-from-global-scope="Nxds.FilterBuilder" aria-label="Member filters" fields='${FILTER_FIELDS}' value='${FILTER_VALUE}'></x-import>`
    ),
    '',
    "To let the person edit the filter, keep the tree in the artboard's script state. Bind `value` to it, and `on-value-change` to the function that sets it.",
    '',
    html(
      `<x-import component-from-global-scope="Nxds.FilterBuilder" aria-label="Member filters" fields='${FILTER_FIELDS}' value="{{filters}}" on-value-change="{{setFilters}}"></x-import>`
    ),
    '',
    html(FILTER_SCRIPT),
  ].join('\n'),

  FilterCondition: [
    'Write each segment as text. Name every segment and the remove button for screen readers.',
    '',
    html(`
<x-import component-from-global-scope="Nxds.FilterCondition">
  <x-import component-from-global-scope="Nxds.FilterConditionField">Status</x-import>
  <x-import component-from-global-scope="Nxds.FilterConditionSegment" aria-label="Edit Status operator">is</x-import>
  <x-import component-from-global-scope="Nxds.FilterConditionSegment" aria-label="Edit Status value: Paid">Paid</x-import>
  <x-import component-from-global-scope="Nxds.FilterConditionRemove" aria-label="Remove Status filter"></x-import>
</x-import>`),
  ].join('\n'),

  Resizable: [
    "Give the group a height from its container. Set each panel's `default-size` as a percentage.",
    '',
    html(`
<div style="width: var(--nx-spacing-96); height: var(--nx-spacing-48); border: var(--nx-borderwidth-default) solid var(--nx-color-border-default); border-radius: var(--nx-radius-md);">
  <x-import component-from-global-scope="Nxds.ResizablePanelGroup" orientation="horizontal">
    <x-import component-from-global-scope="Nxds.ResizablePanel" default-size="35">
      <div class="typography-label-default" style="${FILLER}">Folders</div>
    </x-import>
    <x-import component-from-global-scope="Nxds.ResizableHandle" with-handle></x-import>
    <x-import component-from-global-scope="Nxds.ResizablePanel" default-size="65">
      <div class="typography-label-default" style="${FILLER}">Messages</div>
    </x-import>
  </x-import>
</div>`),
  ].join('\n'),

  ScrollArea: [
    'Give it a height. Content taller than that scrolls inside it.',
    '',
    html(`
<div style="width: var(--nx-spacing-48); border: var(--nx-borderwidth-default) solid var(--nx-color-border-default); border-radius: var(--nx-radius-md);">
  <x-import component-from-global-scope="Nxds.ScrollArea" class-name="nx:h-48">
    <div class="typography-body-small" style="display: flex; flex-direction: column; gap: var(--nx-spacing-2); padding: var(--nx-spacing-4);">
      <span class="typography-label-default">Releases</span>
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
  </x-import>
</div>`),
  ].join('\n'),

  Sidebar:
    'Mount `Nxds.Sidebar` inside `Nxds.SidebarProvider`. On its own, `Nxds.Sidebar` throws. Put `Nxds.SidebarHeader`, `Nxds.SidebarContent` and `Nxds.SidebarFooter` inside it, and `Nxds.SidebarInset` beside it for the page.',

  Sonner: [
    '`Nxds.Toaster` shows a toast only when code calls `toast()`, so on its own it draws nothing. On a static screen, place a `Nxds.Toast` where the app shows its toasts.',
    '',
    html(
      '<x-import component-from-global-scope="Nxds.Toast" variant="success" title="Changes saved" description="Your profile is up to date."></x-import>'
    ),
  ].join('\n'),

  Table: [
    'Mount every row and cell as its own part.',
    '',
    html(`
<x-import component-from-global-scope="Nxds.Table" aria-label="Invoices">
  <x-import component-from-global-scope="Nxds.TableHeader">
    <x-import component-from-global-scope="Nxds.TableRow">
      <x-import component-from-global-scope="Nxds.TableHead">Invoice</x-import>
      <x-import component-from-global-scope="Nxds.TableHead">Status</x-import>
      <x-import component-from-global-scope="Nxds.TableHead" class-name="nx:text-end">Amount</x-import>
    </x-import>
  </x-import>
  <x-import component-from-global-scope="Nxds.TableBody">
    <x-import component-from-global-scope="Nxds.TableRow">
      <x-import component-from-global-scope="Nxds.TableCell">INV-1042</x-import>
      <x-import component-from-global-scope="Nxds.TableCell">Paid</x-import>
      <x-import component-from-global-scope="Nxds.TableCell" class-name="nx:text-end nx:tabular-nums">$1,250.00</x-import>
    </x-import>
    <x-import component-from-global-scope="Nxds.TableRow">
      <x-import component-from-global-scope="Nxds.TableCell">INV-1043</x-import>
      <x-import component-from-global-scope="Nxds.TableCell">Pending</x-import>
      <x-import component-from-global-scope="Nxds.TableCell" class-name="nx:text-end nx:tabular-nums">$480.00</x-import>
    </x-import>
    <x-import component-from-global-scope="Nxds.TableRow">
      <x-import component-from-global-scope="Nxds.TableCell">INV-1044</x-import>
      <x-import component-from-global-scope="Nxds.TableCell">Overdue</x-import>
      <x-import component-from-global-scope="Nxds.TableCell" class-name="nx:text-end nx:tabular-nums">$2,100.00</x-import>
    </x-import>
  </x-import>
</x-import>`),
  ].join('\n'),
};
