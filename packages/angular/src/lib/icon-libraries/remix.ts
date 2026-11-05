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

import { iconMarkup } from '../icon';

// Loading states
export const IconLoader2 = iconMarkup(remixLoader4Line);

// Navigation
export const IconArrowDown = iconMarkup(remixArrowDownLine);
export const IconArrowLeft = iconMarkup(remixArrowLeftLine);
export const IconArrowRight = iconMarkup(remixArrowRightLine);
export const IconArrowUp = iconMarkup(remixArrowUpLine);
export const IconChevronDown = iconMarkup(remixArrowDownSLine);
export const IconChevronLeft = iconMarkup(remixArrowLeftSLine);
export const IconChevronRight = iconMarkup(remixArrowRightSLine);
export const IconChevronUp = iconMarkup(remixArrowUpSLine);
export const IconDots = iconMarkup(remixMoreLine);
export const IconLayoutSidebar = iconMarkup(remixSideBarLine);
export const IconSelector = iconMarkup(remixExpandUpDownLine);

// Actions
export const IconCheck = iconMarkup(remixCheckLine);
export const IconCopy = iconMarkup(remixFileCopyLine);
export const IconMinus = iconMarkup(remixSubtractLine);
export const IconPencil = iconMarkup(remixPencilLine);
export const IconPlus = iconMarkup(remixAddLine);
export const IconX = iconMarkup(remixCloseLine);
export const IconCircleFilled = iconMarkup(remixCircleFill);

// Filter field types
export const IconCalendar = iconMarkup(remixCalendarLine);
export const IconHash = iconMarkup(remixHashtag);
export const IconLetterCase = iconMarkup(remixFontSize);
export const IconList = iconMarkup(remixListUnordered);

// Search / input
export const IconSearch = iconMarkup(remixSearchLine);

// Alerts/Status
export const IconAlertCircle = iconMarkup(remixErrorWarningLine);
export const IconAlertTriangle = iconMarkup(remixAlertLine);
export const IconCircleCheck = iconMarkup(remixCheckboxCircleLine);
export const IconInfoCircle = iconMarkup(remixInformationLine);

// Layout
export const IconGripVertical = iconMarkup(remixDraggable);
export const IconPalette = iconMarkup(remixPaletteLine);
