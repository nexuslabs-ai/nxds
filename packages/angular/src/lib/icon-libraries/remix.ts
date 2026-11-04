/**
 * Internal Icons
 *
 * SVG markup for the icons the design system draws itself, for component
 * states (loading, validation, navigation). Draw one with `<svg [nxIcon]>`.
 *
 * User-facing icons are the consumer's own markup.
 *
 * This set draws Remix Icon.
 */
import {
  remixAddLine,
  remixAlertLine,
  remixArrowDownLine,
  remixArrowDownSLine,
  remixArrowLeftLine,
  remixArrowLeftSLine,
  remixArrowRightLine,
  remixArrowRightSLine,
  remixArrowUpLine,
  remixArrowUpSLine,
  remixCalendarLine,
  remixCheckboxCircleLine,
  remixCheckLine,
  remixCircleFill,
  remixCloseLine,
  remixDraggable,
  remixErrorWarningLine,
  remixExpandUpDownLine,
  remixFileCopyLine,
  remixFontSize,
  remixHashtag,
  remixInformationLine,
  remixListUnordered,
  remixLoader4Line,
  remixMoreLine,
  remixPaletteLine,
  remixPencilLine,
  remixSearchLine,
  remixSideBarLine,
  remixSubtractLine,
} from '@ng-icons/remixicon';

// Loading states
export const IconLoader2 = remixLoader4Line;

// Navigation
export const IconArrowDown = remixArrowDownLine;
export const IconArrowLeft = remixArrowLeftLine;
export const IconArrowRight = remixArrowRightLine;
export const IconArrowUp = remixArrowUpLine;
export const IconChevronDown = remixArrowDownSLine;
export const IconChevronLeft = remixArrowLeftSLine;
export const IconChevronRight = remixArrowRightSLine;
export const IconChevronUp = remixArrowUpSLine;
export const IconDots = remixMoreLine;
export const IconLayoutSidebar = remixSideBarLine;
export const IconSelector = remixExpandUpDownLine;

// Actions
export const IconCheck = remixCheckLine;
export const IconCopy = remixFileCopyLine;
export const IconMinus = remixSubtractLine;
export const IconPencil = remixPencilLine;
export const IconPlus = remixAddLine;
export const IconX = remixCloseLine;
export const IconCircleFilled = remixCircleFill;

// Filter field types
export const IconCalendar = remixCalendarLine;
export const IconHash = remixHashtag;
export const IconLetterCase = remixFontSize;
export const IconList = remixListUnordered;

// Search / input
export const IconSearch = remixSearchLine;

// Alerts/Status
export const IconAlertCircle = remixErrorWarningLine;
export const IconAlertTriangle = remixAlertLine;
export const IconCircleCheck = remixCheckboxCircleLine;
export const IconInfoCircle = remixInformationLine;

// Layout
export const IconGripVertical = remixDraggable;
export const IconPalette = remixPaletteLine;
