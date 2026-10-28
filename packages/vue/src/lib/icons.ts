/**
 * Internal Icons
 *
 * This barrel file re-exports icons used internally by the design system.
 * These are hardcoded icons for component states (loading, validation, navigation).
 *
 * User-facing icons should be passed via props by consumers.
 *
 * This set draws Phosphor. `nxds init --icons` installs the same names drawn
 * by another library.
 */
import { PhCircle } from '@phosphor-icons/vue';
import { type FunctionalComponent, h } from 'vue';

// Loading states
export { PhCircleNotch as IconLoader2 } from '@phosphor-icons/vue';

// Navigation
export {
  PhArrowDown as IconArrowDown,
  PhArrowLeft as IconArrowLeft,
  PhArrowRight as IconArrowRight,
  PhArrowUp as IconArrowUp,
  PhCaretDown as IconChevronDown,
  PhCaretLeft as IconChevronLeft,
  PhCaretRight as IconChevronRight,
  PhCaretUp as IconChevronUp,
  PhDotsThree as IconDots,
  PhSidebarSimple as IconLayoutSidebar,
  PhCaretUpDown as IconSelector,
} from '@phosphor-icons/vue';

// Actions
export {
  PhCheck as IconCheck,
  PhCopy as IconCopy,
  PhMinus as IconMinus,
  PhPencilSimple as IconPencil,
  PhPlus as IconPlus,
  PhX as IconX,
} from '@phosphor-icons/vue';

export const IconCircleFilled: FunctionalComponent = (_props, { attrs }) =>
  h(PhCircle, { weight: 'fill', ...attrs });

// Filter field types
export {
  PhCalendarBlank as IconCalendar,
  PhHash as IconHash,
  PhTextAa as IconLetterCase,
  PhListBullets as IconList,
} from '@phosphor-icons/vue';

// Search / input
export { PhMagnifyingGlass as IconSearch } from '@phosphor-icons/vue';

// Alerts/Status
export {
  PhWarningCircle as IconAlertCircle,
  PhWarning as IconAlertTriangle,
  PhCheckCircle as IconCircleCheck,
  PhInfo as IconInfoCircle,
} from '@phosphor-icons/vue';

// Layout
export {
  PhDotsSixVertical as IconGripVertical,
  PhPalette as IconPalette,
} from '@phosphor-icons/vue';
