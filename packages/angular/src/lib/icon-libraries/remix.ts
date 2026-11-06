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

import { trustIconMarkup } from '../icon';

// Loading states
export const IconLoader2 = trustIconMarkup(remixLoader4Line);

// Navigation
export const IconArrowDown = trustIconMarkup(remixArrowDownLine);
export const IconArrowLeft = trustIconMarkup(remixArrowLeftLine);
export const IconArrowRight = trustIconMarkup(remixArrowRightLine);
export const IconArrowUp = trustIconMarkup(remixArrowUpLine);
export const IconChevronDown = trustIconMarkup(remixArrowDownSLine);
export const IconChevronLeft = trustIconMarkup(remixArrowLeftSLine);
export const IconChevronRight = trustIconMarkup(remixArrowRightSLine);
export const IconChevronUp = trustIconMarkup(remixArrowUpSLine);
export const IconDots = trustIconMarkup(remixMoreLine);
export const IconLayoutSidebar = trustIconMarkup(remixSideBarLine);
export const IconSelector = trustIconMarkup(remixExpandUpDownLine);

// Actions
export const IconCheck = trustIconMarkup(remixCheckLine);
export const IconCopy = trustIconMarkup(remixFileCopyLine);
export const IconMinus = trustIconMarkup(remixSubtractLine);
export const IconPencil = trustIconMarkup(remixPencilLine);
export const IconPlus = trustIconMarkup(remixAddLine);
export const IconX = trustIconMarkup(remixCloseLine);
export const IconCircleFilled = trustIconMarkup(remixCircleFill);

// Filter field types
export const IconCalendar = trustIconMarkup(remixCalendarLine);
export const IconHash = trustIconMarkup(remixHashtag);
export const IconLetterCase = trustIconMarkup(remixFontSize);
export const IconList = trustIconMarkup(remixListUnordered);

// Search / input
export const IconSearch = trustIconMarkup(remixSearchLine);

// Alerts/Status
export const IconAlertCircle = trustIconMarkup(remixErrorWarningLine);
export const IconAlertTriangle = trustIconMarkup(remixAlertLine);
export const IconCircleCheck = trustIconMarkup(remixCheckboxCircleLine);
export const IconInfoCircle = trustIconMarkup(remixInformationLine);

// Layout
export const IconGripVertical = trustIconMarkup(remixDraggable);
export const IconPalette = trustIconMarkup(remixPaletteLine);
