/**
 * Internal Icons
 *
 * This barrel file re-exports icons used internally by the design system.
 * These are hardcoded icons for component states (loading, validation, navigation).
 *
 * User-facing icons should be passed via props by consumers.
 *
 * This set draws Lucide.
 */
import { Circle } from '@lucide/vue';
import { type FunctionalComponent, h } from 'vue';

// Loading states
export { LoaderCircle as IconLoader2 } from '@lucide/vue';

// Navigation
export {
  ArrowDown as IconArrowDown,
  ArrowLeft as IconArrowLeft,
  ArrowRight as IconArrowRight,
  ArrowUp as IconArrowUp,
  ChevronDown as IconChevronDown,
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
  ChevronUp as IconChevronUp,
  Ellipsis as IconDots,
  PanelLeft as IconLayoutSidebar,
  ChevronsUpDown as IconSelector,
} from '@lucide/vue';

// Actions
export {
  Check as IconCheck,
  Minus as IconMinus,
  Pencil as IconPencil,
  Plus as IconPlus,
  X as IconX,
} from '@lucide/vue';

export const IconCircleFilled: FunctionalComponent = (_props, { attrs }) =>
  h(Circle, { fill: 'currentColor', ...attrs });

// Filter field types
export {
  Calendar as IconCalendar,
  Hash as IconHash,
  CaseSensitive as IconLetterCase,
  List as IconList,
} from '@lucide/vue';

// Search / input
export { Search as IconSearch } from '@lucide/vue';

// Alerts/Status
export {
  CircleAlert as IconAlertCircle,
  TriangleAlert as IconAlertTriangle,
  CircleCheck as IconCircleCheck,
  Info as IconInfoCircle,
} from '@lucide/vue';

// Layout
export {
  GripVertical as IconGripVertical,
  Palette as IconPalette,
} from '@lucide/vue';
