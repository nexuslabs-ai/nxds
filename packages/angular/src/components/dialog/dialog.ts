import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  Directive,
  effect,
  forwardRef,
  inject,
  InjectionToken,
  Injector,
  input,
  model,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  BrnDialog,
  BrnDialogClose,
  type BrnDialogOptions,
  BrnDialogRef,
  BrnDialogTrigger,
  provideBrnDialogDefaultOptions,
} from '@spartan-ng/brain/dialog';
import type { ClassValue } from 'clsx';

import { NxIcon } from '../../lib/icon';
import { IconX } from '../../lib/icons';
import { lockPageScroll } from '../../lib/scroll-lock';
import { cn } from '../../lib/utils';
import {
  defaultOverlayLayout,
  overlayBodyClassName,
  overlayCloseButtonClassName,
  overlayContentVariants,
  overlayHeaderVariants,
  overlayScrimVariants,
} from '../overlay-layout/overlay-layout';

let nextDialogId = 0;

const NX_DIALOG = new InjectionToken<NxDialog>('NxDialog');

/**
 * Leaves CDK's dialog container without a role or `aria-modal`: the panel
 * names itself, and the container also holds the overlay. Brain's types allow
 * only a role, but CDK drops a null attribute.
 */
const noContainerSemantics = {
  role: null,
  ariaModal: null,
} as unknown as Pick<BrnDialogOptions, 'role' | 'ariaModal'>;

/** Ids the panel names itself with, filled in by its title and descriptions. */
class DialogLabels {
  readonly titleId = `nx-dialog-title-${nextDialogId++}`;
  readonly descriptionIds = signal<readonly string[]>([]);
}

/** Semi-transparent backdrop behind the dialog. Closes it on click. */
@Directive({
  selector: 'div[nxDialogOverlay]',
  host: {
    'data-slot': 'dialog-overlay',
    '[attr.data-state]': 'ref.state()',
    '[class]': 'classes',
    '(click)': 'ref.close()',
  },
})
class NxDialogOverlay {
  protected readonly ref = inject(BrnDialogRef);
  protected readonly classes = overlayScrimVariants();
}

/** Holds the dialog title and description. */
@Directive({
  selector: '[nxDialogHeader]',
  host: {
    'data-slot': 'dialog-header',
    '[attr.data-variant]': 'variant',
    '[class]': 'classes()',
  },
})
export class NxDialogHeader {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly variant = defaultOverlayLayout.variant;
  protected readonly classes = computed(() =>
    cn(overlayHeaderVariants({ variant: this.variant }), this.userClass())
  );
}

/** Holds the dialog's main content. Scrolls when the content overflows. */
@Directive({
  selector: '[nxDialogBody]',
  host: {
    'data-slot': 'dialog-body',
    // Overlay bodies own the scroll region, so pure-text overflow must be keyboard reachable.
    tabindex: '0',
    '[class]': 'classes()',
  },
})
export class NxDialogBody {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(overlayBodyClassName, this.userClass())
  );
}

/**
 * The dialog's content, written as `<ng-template nxDialogContent>`. It renders
 * in a portal above an overlay once the dialog opens.
 */
@Directive({ selector: 'ng-template[nxDialogContent]' })
export class NxDialogContent {
  readonly template = inject(TemplateRef);
  /** Shows the close button in the top-right corner. */
  readonly showCloseButton = input(true, { transform: booleanAttribute });
  /** Title for a generated header. Ignored when `nxDialogHeader` is a direct child. */
  readonly title = input<string>();
  /** Description for a generated header. Ignored when `nxDialogHeader` is a direct child. */
  readonly description = input<string>();
  /** Text for a generated `nxDialogBody`, before the content. Ignored when `nxDialogBody` is a direct child. */
  readonly body = input<string>();
  readonly userClass = input<ClassValue>('', { alias: 'class' });
}

/**
 * Holds the dialog's action buttons. Stacks them on narrow screens and lines
 * them up in a row from the `sm` breakpoint.
 */
@Directive({
  selector: '[nxDialogFooter]',
  host: {
    'data-slot': 'dialog-footer',
    '[attr.data-orientation]': 'orientation',
    '[class]': 'classes()',
  },
})
export class NxDialogFooter {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly orientation = defaultOverlayLayout.buttonOrientation;
  protected readonly classes = computed(() =>
    cn(
      'nx:flex nx:shrink-0 nx:flex-col-reverse nx:px-6 nx:sm:flex-row nx:sm:justify-end nx:sm:gap-2',
      this.userClass()
    )
  );
}

/** The dialog's title. Place it inside `nxDialogHeader`. */
@Directive({
  selector: '[nxDialogTitle]',
  host: {
    'data-slot': 'dialog-title',
    '[id]': 'labels.titleId',
    '[class]': 'classes()',
  },
})
export class NxDialogTitle {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly labels = inject(DialogLabels);
  protected readonly classes = computed(() =>
    cn('nx:m-0 nx:typography-heading-xsmall', this.userClass())
  );
}

/** Supporting text that explains the dialog. */
@Directive({
  selector: '[nxDialogDescription]',
  host: {
    'data-slot': 'dialog-description',
    '[id]': 'id',
    '[class]': 'classes()',
  },
})
export class NxDialogDescription {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  private readonly labels = inject(DialogLabels);
  protected readonly id = `${this.labels.titleId}-description-${nextDialogId++}`;
  protected readonly classes = computed(() =>
    cn(
      'nx:m-0 nx:typography-body-default nx:text-muted-foreground',
      this.userClass()
    )
  );

  constructor() {
    this.labels.descriptionIds.update((ids) => [...ids, this.id]);
    inject(DestroyRef).onDestroy(() =>
      this.labels.descriptionIds.update((ids) =>
        ids.filter((id) => id !== this.id)
      )
    );
  }
}

/** The dialog panel, with the content, the generated header and body, and the close button. */
@Component({
  selector: 'div[nxDialogPanel]',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    NxDialogBody,
    NxDialogDescription,
    NxDialogHeader,
    NxDialogTitle,
    NxIcon,
    BrnDialogClose,
  ],
  providers: [DialogLabels],
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    'data-slot': 'dialog-content',
    '[attr.data-variant]': 'layout.variant',
    '[attr.data-orientation]': 'layout.buttonOrientation',
    '[attr.aria-labelledby]': 'labels.titleId',
    '[attr.aria-describedby]': "labels.descriptionIds().join(' ') || null",
    '[attr.data-state]': 'ref.state()',
    '[class]': 'classes()',
  },
  template: `
    @let options = dialog.content();
    @if (
      !dialog.authoredHeader() && (options.title() || options.description())
    ) {
      <div nxDialogHeader>
        @if (options.title()) {
          <h2 nxDialogTitle>{{ options.title() }}</h2>
        }
        @if (options.description()) {
          <p nxDialogDescription>{{ options.description() }}</p>
        }
      </div>
    }
    @if (!dialog.authoredBody() && options.body()) {
      <div nxDialogBody>{{ options.body() }}</div>
    }
    <ng-container
      [ngTemplateOutlet]="options.template"
      [ngTemplateOutletInjector]="injector"
    />
    @if (options.showCloseButton()) {
      <button
        type="button"
        brnDialogClose
        data-slot="dialog-close-button"
        [class]="closeButtonClasses"
      >
        <svg class="nx:size-4" [nxIcon]="iconX"></svg
        ><span class="nx:sr-only">Close</span>
      </button>
    }
  `,
})
class NxDialogPanel {
  protected readonly dialog = inject(NX_DIALOG);
  protected readonly ref = inject(BrnDialogRef);
  protected readonly labels = inject(DialogLabels);
  protected readonly injector = inject(Injector);
  protected readonly layout = defaultOverlayLayout;
  protected readonly iconX = IconX;
  protected readonly closeButtonClasses = overlayCloseButtonClassName;
  protected readonly classes = computed(() =>
    cn(overlayContentVariants(), this.dialog.content().userClass())
  );

  constructor() {
    lockPageScroll();
  }
}

/**
 * Root of the dialog. Holds the open state: bind `[(open)]`, or let
 * `nxDialogTrigger` and `nxDialogClose` open and close it.
 */
@Component({
  selector: 'nx-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxDialogOverlay, NxDialogPanel],
  hostDirectives: [BrnDialog],
  providers: [
    { provide: NX_DIALOG, useExisting: forwardRef(() => NxDialog) },
    // nxds draws the overlay, names the panel and locks page scroll itself,
    // so CDK adds no backdrop and no scroll lock.
    provideBrnDialogDefaultOptions({
      ...noContainerSemantics,
      ariaLabelledBy: null,
      hasBackdrop: false,
      scrollStrategy: new NoopScrollStrategy(),
    }),
  ],
  host: { class: 'nx:contents' },
  template: `
    <ng-content />
    <ng-template #portal>
      <div nxDialogOverlay></div>
      <div nxDialogPanel></div>
    </ng-template>
  `,
})
export class NxDialog {
  /** Whether the dialog is open. */
  readonly open = model(false);

  readonly content = contentChild.required(NxDialogContent);
  readonly authoredHeader = contentChild(NxDialogHeader, {
    descendants: false,
  });
  readonly authoredBody = contentChild(NxDialogBody, { descendants: false });
  private readonly portal = viewChild.required<TemplateRef<unknown>>('portal');
  private readonly brn = inject(BrnDialog);

  constructor() {
    effect(() => {
      this.brn.registerContent(
        this.portal(),
        signal(undefined),
        signal(undefined)
      );
    });
    effect(() => {
      const open = this.open();
      untracked(() => (open ? this.brn.open() : this.brn.close()));
    });
    this.brn.stateChanged.subscribe((state) => this.open.set(state === 'open'));
  }
}

/** Opens the dialog. Put it on a `<button>`, such as one with `nxButton`. */
@Directive({
  selector: 'button[nxDialogTrigger]',
  hostDirectives: [BrnDialogTrigger],
})
export class NxDialogTrigger {}

/** Closes the dialog. Put it on a `<button>`, such as one with `nxButton`. */
@Directive({
  selector: 'button[nxDialogClose]',
  hostDirectives: [BrnDialogClose],
})
export class NxDialogClose {}
