import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  BrnTabs,
  BrnTabsContent,
  BrnTabsList,
  BrnTabsTrigger,
} from '@spartan-ng/brain/tabs';
import { cva } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../lib/utils';

type TabsVariant = 'default' | 'underline';
type TabsSize = 'sm' | 'default' | 'lg';

let nextTabsId = 0;

/**
 * Root of the tabs. Holds the active tab, the list and the panels. Bind
 * `[(value)]` to the active tab.
 */
@Directive({
  selector: '[nxTabs]',
  hostDirectives: [
    {
      directive: BrnTabs,
      inputs: ['brnTabs: value', 'orientation', 'activationMode'],
      outputs: ['brnTabsChange: valueChange'],
    },
  ],
})
export class NxTabs {
  /** Prefixes the ids of this root's triggers and panels. */
  readonly id = `nx-tabs-${nextTabsId++}`;
}

/** Row of tab triggers. */
@Component({
  selector: '[nxTabsList]',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [BrnTabsList],
  host: {
    'data-slot': 'tabs-list',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[class]': 'classes()',
  },
  template: `<span
      #indicator
      aria-hidden="true"
      data-slot="tabs-indicator"
      [attr.data-variant]="variant()"
      [class]="indicatorClasses()"
    ></span
    ><ng-content />`,
})
export class NxTabsList {
  /** Visual style of every trigger in the list. */
  readonly variant = input<TabsVariant>('default');
  /** Size of every trigger in the list. */
  readonly size = input<TabsSize>('default');
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly indicator =
    viewChild.required<ElementRef<HTMLSpanElement>>('indicator');
  private readonly ready = signal(false);

  protected readonly classes = computed(() =>
    cn(
      'nx:relative nx:isolate nx:inline-flex nx:items-center nx:justify-center',
      'nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
      this.variant() === 'default' &&
        'nx:rounded-md nx:bg-control-background nx:p-1',
      this.userClass()
    )
  );

  protected readonly indicatorClasses = computed(() =>
    cn(
      'nx:pointer-events-none nx:absolute nx:z-0 nx:opacity-0',
      this.variant() === 'default' &&
        'nx:top-0 nx:left-0 nx:rounded-sm nx:border-default nx:border-border-default nx:bg-background',
      this.variant() === 'underline' && [
        'nx:bg-primary-background',
        'nx:[[data-orientation=horizontal]>&]:bottom-0 nx:[[data-orientation=horizontal]>&]:left-0 nx:[[data-orientation=horizontal]>&]:h-(--nx-borderwidth-thick)',
        'nx:[[data-orientation=vertical]>&]:top-0 nx:[[data-orientation=vertical]>&]:right-0 nx:[[data-orientation=vertical]>&]:w-(--nx-borderwidth-thick)',
      ],
      this.ready() &&
        'nx:transition-[transform,width,height] nx:duration-fast nx:ease-move'
    )
  );

  constructor() {
    afterRenderEffect((onCleanup) => {
      const list = this.host.nativeElement;
      const indicator = this.indicator().nativeElement;
      const variant = this.variant();
      let raf = 0;

      const measure = () => {
        const active = list.querySelector<HTMLElement>(
          '[data-slot="tabs-trigger"][data-state="active"]'
        );

        if (!active) {
          indicator.style.opacity = '0';
          return;
        }

        const isUnderline = variant === 'underline';
        const isVertical = list.dataset['orientation'] === 'vertical';
        const isVerticalBar = isUnderline && isVertical;
        const isHorizontalBar = isUnderline && !isVertical;
        const x = isVerticalBar ? 0 : active.offsetLeft;
        const y = isHorizontalBar ? 0 : active.offsetTop;

        indicator.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        indicator.style.width = isVerticalBar ? '' : `${active.offsetWidth}px`;
        indicator.style.height = isHorizontalBar
          ? ''
          : `${active.offsetHeight}px`;
        indicator.style.opacity = '1';
        this.ready.set(true);
      };

      const schedule = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(measure);
      };

      // Measure before paint so the indicator never flashes at opacity-0.
      measure();

      const mutationObserver = new MutationObserver(schedule);
      mutationObserver.observe(list, {
        attributes: true,
        attributeFilter: ['data-state', 'data-orientation'],
        childList: true,
        subtree: true,
      });

      const resizeObserver = new ResizeObserver(schedule);
      resizeObserver.observe(list);

      onCleanup(() => {
        cancelAnimationFrame(raf);
        mutationObserver.disconnect();
        resizeObserver.disconnect();
      });
    });
  }
}

const tabsTriggerVariants = cva(
  // Base classes
  [
    'nx:relative nx:z-1 nx:inline-flex nx:items-center nx:justify-center',
    'nx:whitespace-nowrap nx:bg-transparent',
    'nx:text-muted-foreground',
    'nx:transition-control',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
    'nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground',
  ],
  {
    variants: {
      /**
       * Visual style.
       */
      variant: {
        default: [
          'nx:rounded-sm nx:border-default nx:border-transparent',
          'nx:data-[state=inactive]:hover:bg-control-background-hover',
          'nx:data-[state=active]:text-foreground',
        ],
        underline: [
          'nx:rounded-none nx:border-0 nx:border-b-thick nx:border-transparent',
          'nx:data-[orientation=vertical]:border-b-0 nx:data-[orientation=vertical]:border-r-thick',
          'nx:bg-transparent',
          'nx:data-[state=active]:text-foreground',
        ],
      },
      /**
       * Size.
       */
      size: {
        sm: 'nx:px-2 nx:py-1 nx:typography-label-small',
        default: 'nx:px-3 nx:py-1.5 nx:typography-label-default',
        lg: 'nx:px-4 nx:py-2 nx:typography-label-default',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * Tab button that shows its panel. Takes its style from the list's `variant`
 * and `size`.
 */
@Directive({
  selector: 'button[nxTabsTrigger]',
  hostDirectives: [
    {
      directive: BrnTabsTrigger,
      inputs: ['brnTabsTrigger: value', 'disabled'],
    },
  ],
  host: {
    'data-slot': 'tabs-trigger',
    '[id]': 'triggerId()',
    '[attr.aria-controls]': 'panelId()',
    '[attr.aria-disabled]': 'null',
    '[attr.disabled]': "disabled() ? '' : null",
    '[attr.data-disabled]': "disabled() ? '' : null",
    '[tabindex]': 'disabled() ? -1 : brn.selected() ? 0 : -1',
    '[attr.data-variant]': 'list.variant()',
    '[attr.data-size]': 'list.size()',
    '[class]': 'classes()',
  },
})
export class NxTabsTrigger {
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly list = inject(NxTabsList);
  private readonly root = inject(NxTabs);
  protected readonly brn = inject(BrnTabsTrigger);

  protected readonly triggerId = computed(
    () => `${this.root.id}-trigger-${this.value()}`
  );
  protected readonly panelId = computed(
    () => `${this.root.id}-content-${this.value()}`
  );
  protected readonly classes = computed(() =>
    cn(
      tabsTriggerVariants({
        variant: this.list.variant(),
        size: this.list.size(),
      }),
      this.userClass()
    )
  );
}

/** Panel for one tab, shown only while that tab is active. */
@Directive({
  selector: '[nxTabsContent]',
  hostDirectives: [
    { directive: BrnTabsContent, inputs: ['brnTabsContent: value'] },
  ],
  host: {
    'data-slot': 'tabs-content',
    '[id]': 'panelId()',
    '[attr.aria-labelledby]': 'triggerId()',
    '[class]': 'classes()',
  },
})
export class NxTabsContent {
  readonly value = input.required<string>();
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  private readonly root = inject(NxTabs);

  protected readonly triggerId = computed(
    () => `${this.root.id}-trigger-${this.value()}`
  );
  protected readonly panelId = computed(
    () => `${this.root.id}-content-${this.value()}`
  );
  protected readonly classes = computed(() =>
    cn(
      'nx:mt-2',
      'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
      this.userClass()
    )
  );
}

export { tabsTriggerVariants };
