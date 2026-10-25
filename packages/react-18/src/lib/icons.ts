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
import * as React from 'react';

import { CircleIcon } from '@phosphor-icons/react/ssr';

// Loading states
export { CircleNotchIcon as IconLoader2 } from '@phosphor-icons/react/ssr';

// Navigation
export {
  ArrowDownIcon as IconArrowDown,
  ArrowLeftIcon as IconArrowLeft,
  ArrowRightIcon as IconArrowRight,
  ArrowUpIcon as IconArrowUp,
  CaretDownIcon as IconChevronDown,
  CaretLeftIcon as IconChevronLeft,
  CaretRightIcon as IconChevronRight,
  CaretUpIcon as IconChevronUp,
  DotsThreeIcon as IconDots,
  SidebarSimpleIcon as IconLayoutSidebar,
  CaretUpDownIcon as IconSelector,
} from '@phosphor-icons/react/ssr';

// Actions
export {
  CheckIcon as IconCheck,
  MinusIcon as IconMinus,
  PencilSimpleIcon as IconPencil,
  PlusIcon as IconPlus,
  XIcon as IconX,
} from '@phosphor-icons/react/ssr';

export function IconCircleFilled(
  props: React.ComponentPropsWithoutRef<typeof CircleIcon>
) {
  return React.createElement(CircleIcon, { weight: 'fill', ...props });
}

// Filter field types
export {
  CalendarBlankIcon as IconCalendar,
  HashIcon as IconHash,
  TextAaIcon as IconLetterCase,
  ListBulletsIcon as IconList,
} from '@phosphor-icons/react/ssr';

// Search / input
export { MagnifyingGlassIcon as IconSearch } from '@phosphor-icons/react/ssr';

// Alerts/Status
export {
  WarningCircleIcon as IconAlertCircle,
  WarningIcon as IconAlertTriangle,
  CheckCircleIcon as IconCircleCheck,
  InfoIcon as IconInfoCircle,
} from '@phosphor-icons/react/ssr';

// Layout
export {
  DotsSixVerticalIcon as IconGripVertical,
  PaletteIcon as IconPalette,
} from '@phosphor-icons/react/ssr';
