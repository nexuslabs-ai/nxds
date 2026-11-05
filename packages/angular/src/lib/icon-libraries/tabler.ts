/**
 * Internal Icons
 *
 * SVG markup for the icons the design system draws itself, for component
 * states (loading, validation, navigation). Draw one with `<svg [nxIcon]>`.
 *
 * User-facing icons are the consumer's own markup.
 *
 * This set draws Tabler Icons.
 */
import {
  tablerAlertCircle,
  tablerAlertTriangle,
  tablerArrowDown,
  tablerArrowLeft,
  tablerArrowRight,
  tablerArrowUp,
  tablerCalendar,
  tablerCheck,
  tablerChevronDown,
  tablerChevronLeft,
  tablerChevronRight,
  tablerChevronUp,
  tablerCircleCheck,
  tablerCopy,
  tablerDots,
  tablerGripVertical,
  tablerHash,
  tablerInfoCircle,
  tablerLayoutSidebar,
  tablerLetterCase,
  tablerList,
  tablerLoader2,
  tablerMinus,
  tablerPalette,
  tablerPencil,
  tablerPlus,
  tablerSearch,
  tablerSelector,
  tablerX,
} from '@ng-icons/tabler-icons';
import { tablerCircleFill } from '@ng-icons/tabler-icons/fill';

import { iconMarkup } from '../icon';

// Loading states
export const IconLoader2 = iconMarkup(tablerLoader2);

// Navigation
export const IconArrowDown = iconMarkup(tablerArrowDown);
export const IconArrowLeft = iconMarkup(tablerArrowLeft);
export const IconArrowRight = iconMarkup(tablerArrowRight);
export const IconArrowUp = iconMarkup(tablerArrowUp);
export const IconChevronDown = iconMarkup(tablerChevronDown);
export const IconChevronLeft = iconMarkup(tablerChevronLeft);
export const IconChevronRight = iconMarkup(tablerChevronRight);
export const IconChevronUp = iconMarkup(tablerChevronUp);
export const IconDots = iconMarkup(tablerDots);
export const IconLayoutSidebar = iconMarkup(tablerLayoutSidebar);
export const IconSelector = iconMarkup(tablerSelector);

// Actions
export const IconCheck = iconMarkup(tablerCheck);
export const IconCopy = iconMarkup(tablerCopy);
export const IconMinus = iconMarkup(tablerMinus);
export const IconPencil = iconMarkup(tablerPencil);
export const IconPlus = iconMarkup(tablerPlus);
export const IconX = iconMarkup(tablerX);
export const IconCircleFilled = iconMarkup(tablerCircleFill);

// Filter field types
export const IconCalendar = iconMarkup(tablerCalendar);
export const IconHash = iconMarkup(tablerHash);
export const IconLetterCase = iconMarkup(tablerLetterCase);
export const IconList = iconMarkup(tablerList);

// Search / input
export const IconSearch = iconMarkup(tablerSearch);

// Alerts/Status
export const IconAlertCircle = iconMarkup(tablerAlertCircle);
export const IconAlertTriangle = iconMarkup(tablerAlertTriangle);
export const IconCircleCheck = iconMarkup(tablerCircleCheck);
export const IconInfoCircle = iconMarkup(tablerInfoCircle);

// Layout
export const IconGripVertical = iconMarkup(tablerGripVertical);
export const IconPalette = iconMarkup(tablerPalette);
