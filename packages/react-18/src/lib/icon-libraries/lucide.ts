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
import * as React from 'react';

import { Circle } from 'lucide-react';

// Loading states
export { LoaderCircle as IconLoader2 } from 'lucide-react';

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
} from 'lucide-react';

// Actions
export {
  Check as IconCheck,
  Copy as IconCopy,
  Minus as IconMinus,
  Pencil as IconPencil,
  Plus as IconPlus,
  X as IconX,
} from 'lucide-react';

export function IconCircleFilled(
  props: React.ComponentPropsWithoutRef<typeof Circle>
) {
  return React.createElement(Circle, { fill: 'currentColor', ...props });
}

// Filter field types
export {
  Calendar as IconCalendar,
  Hash as IconHash,
  CaseSensitive as IconLetterCase,
  List as IconList,
} from 'lucide-react';

// Search / input
export { Search as IconSearch } from 'lucide-react';

// Alerts/Status
export {
  CircleAlert as IconAlertCircle,
  TriangleAlert as IconAlertTriangle,
  CircleCheck as IconCircleCheck,
  Info as IconInfoCircle,
} from 'lucide-react';

// Layout
export {
  GripVertical as IconGripVertical,
  Palette as IconPalette,
} from 'lucide-react';
