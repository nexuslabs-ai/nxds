/**
 * Internal Icons
 *
 * This barrel file re-exports icons used internally by the design system.
 * These are hardcoded icons for component states (loading, validation, navigation).
 *
 * User-facing icons should be passed via props by consumers.
 *
 * This set draws Remix Icon.
 */

// Loading states
export { RiLoader4Line as IconLoader2 } from '@remixicon/vue';

// Navigation
export {
  RiArrowDownLine as IconArrowDown,
  RiArrowLeftLine as IconArrowLeft,
  RiArrowRightLine as IconArrowRight,
  RiArrowUpLine as IconArrowUp,
  RiArrowDownSLine as IconChevronDown,
  RiArrowLeftSLine as IconChevronLeft,
  RiArrowRightSLine as IconChevronRight,
  RiArrowUpSLine as IconChevronUp,
  RiMoreLine as IconDots,
  RiSideBarLine as IconLayoutSidebar,
  RiExpandUpDownLine as IconSelector,
} from '@remixicon/vue';

// Actions
export {
  RiCheckLine as IconCheck,
  RiCircleFill as IconCircleFilled,
  RiFileCopyLine as IconCopy,
  RiSubtractLine as IconMinus,
  RiPencilLine as IconPencil,
  RiAddLine as IconPlus,
  RiCloseLine as IconX,
} from '@remixicon/vue';

// Filter field types
export {
  RiCalendarLine as IconCalendar,
  RiHashtag as IconHash,
  RiFontSize as IconLetterCase,
  RiListUnordered as IconList,
} from '@remixicon/vue';

// Search / input
export { RiSearchLine as IconSearch } from '@remixicon/vue';

// Alerts/Status
export {
  RiErrorWarningLine as IconAlertCircle,
  RiAlertLine as IconAlertTriangle,
  RiCheckboxCircleLine as IconCircleCheck,
  RiInformationLine as IconInfoCircle,
} from '@remixicon/vue';

// Layout
export {
  RiDraggable as IconGripVertical,
  RiPaletteLine as IconPalette,
} from '@remixicon/vue';
