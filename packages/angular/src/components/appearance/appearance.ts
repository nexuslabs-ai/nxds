import {
  afterNextRender,
  computed,
  DestroyRef,
  effect,
  type EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  type Signal,
  signal,
} from '@angular/core';
import {
  applyNxdsAppearance,
  DEFAULT_NXDS_APPEARANCE,
  DEFAULT_STORAGE_KEY,
  type NxdsAppearanceCookieOptions,
  type NxdsAppearanceState,
  persistNxdsAppearance,
  prefersDarkColorScheme,
  readStoredNxdsAppearance,
  removeNxdsAppearance,
  resolveNxdsAppearanceMode,
  sanitizeNxdsAppearance,
  watchColorScheme,
} from '@nxds/core';

export interface NxdsAppearanceOptions {
  /**
   * localStorage key for the saved appearance. The head script reads it before
   * first paint and the service after the first render, overriding
   * `defaultState`. Pass `false` to turn it off.
   */
  storageKey?: string | false;
  /**
   * Cookie the service writes so your server can render the saved appearance.
   * The client never reads it.
   */
  cookieWriteKey?: string | false;
  cookieOptions?: NxdsAppearanceCookieOptions;
  /**
   * The appearance to show, held in a signal you own. With it, the service
   * reads and saves nothing, and `setState` only calls `onStateChange`.
   */
  state?: Signal<NxdsAppearanceState>;
  defaultState?: NxdsAppearanceState;
  /** Called with the next appearance on every `setState`. */
  onStateChange?: (state: NxdsAppearanceState) => void;
}

const NXDS_APPEARANCE_OPTIONS = new InjectionToken<NxdsAppearanceOptions>(
  'NxdsAppearanceOptions'
);

/**
 * Runs the nxds theme engine for the whole app. Until the first render it
 * holds `defaultState` and leaves the page alone, so server and client render
 * the same markup. The head script covers first paint. After the first render
 * it loads the saved appearance and applies it.
 */
@Injectable()
export class NxdsAppearance {
  private readonly options = inject(NXDS_APPEARANCE_OPTIONS);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly initialState = sanitizeNxdsAppearance(
    this.options.defaultState ?? DEFAULT_NXDS_APPEARANCE
  );
  private readonly internalState = signal(this.initialState);
  private readonly systemDark = signal(false);
  private readonly isMounted = signal(false);

  readonly state = computed(
    () => this.options.state?.() ?? this.internalState()
  );
  readonly resolvedMode = computed(() =>
    resolveNxdsAppearanceMode(this.state().mode, this.systemDark())
  );
  /** `true` once the app has rendered and the saved appearance is loaded. */
  readonly mounted = this.isMounted.asReadonly();

  constructor() {
    afterNextRender(() => this.mount());
  }

  setState(
    update:
      | NxdsAppearanceState
      | ((previous: NxdsAppearanceState) => NxdsAppearanceState)
  ): void {
    const next = sanitizeNxdsAppearance(
      typeof update === 'function' ? update(this.state()) : update
    );
    if (!this.options.state) this.internalState.set(next);
    this.options.onStateChange?.(next);
  }

  reset(): void {
    this.setState(this.initialState);
  }

  private mount() {
    const {
      state: controlledState,
      storageKey = DEFAULT_STORAGE_KEY,
      cookieWriteKey = false,
      cookieOptions,
    } = this.options;

    if (!controlledState) {
      this.internalState.set(
        readStoredNxdsAppearance(storageKey, this.internalState())
      );
    }
    this.isMounted.set(true);

    const syncSystemDark = () => this.systemDark.set(prefersDarkColorScheme());
    syncSystemDark();
    const stopWatching = watchColorScheme(syncSystemDark);
    this.destroyRef.onDestroy(() => {
      stopWatching();
      removeNxdsAppearance();
    });

    effect(() => applyNxdsAppearance(this.state(), this.systemDark()), {
      injector: this.injector,
    });
    if (controlledState) return;
    effect(
      () =>
        persistNxdsAppearance(this.state(), {
          storageKey,
          cookieWriteKey,
          cookieOptions,
        }),
      { injector: this.injector }
    );
  }
}

/** Provides `NxdsAppearance` to the whole app. Add it to `app.config.ts`. */
export function provideNxdsAppearance(
  options: NxdsAppearanceOptions = {}
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NXDS_APPEARANCE_OPTIONS, useValue: options },
    NxdsAppearance,
    provideEnvironmentInitializer(() => inject(NxdsAppearance)),
  ]);
}
