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

import { trustIconMarkup } from '../icon';

// Loading states
export const IconLoader2 = trustIconMarkup(tablerLoader2);

// Navigation
export const IconArrowDown = trustIconMarkup(tablerArrowDown);
export const IconArrowLeft = trustIconMarkup(tablerArrowLeft);
export const IconArrowRight = trustIconMarkup(tablerArrowRight);
export const IconArrowUp = trustIconMarkup(tablerArrowUp);
export const IconChevronDown = trustIconMarkup(tablerChevronDown);
export const IconChevronLeft = trustIconMarkup(tablerChevronLeft);
export const IconChevronRight = trustIconMarkup(tablerChevronRight);
export const IconChevronUp = trustIconMarkup(tablerChevronUp);
export const IconDots = trustIconMarkup(tablerDots);
export const IconLayoutSidebar = trustIconMarkup(tablerLayoutSidebar);
export const IconSelector = trustIconMarkup(tablerSelector);

// Actions
export const IconCheck = trustIconMarkup(tablerCheck);
export const IconCopy = trustIconMarkup(tablerCopy);
export const IconMinus = trustIconMarkup(tablerMinus);
export const IconPencil = trustIconMarkup(tablerPencil);
export const IconPlus = trustIconMarkup(tablerPlus);
export const IconX = trustIconMarkup(tablerX);
export const IconCircleFilled = trustIconMarkup(tablerCircleFill);

// Filter field types
export const IconCalendar = trustIconMarkup(tablerCalendar);
export const IconHash = trustIconMarkup(tablerHash);
export const IconLetterCase = trustIconMarkup(tablerLetterCase);
export const IconList = trustIconMarkup(tablerList);

// Search / input
export const IconSearch = trustIconMarkup(tablerSearch);

// Alerts/Status
export const IconAlertCircle = trustIconMarkup(tablerAlertCircle);
export const IconAlertTriangle = trustIconMarkup(tablerAlertTriangle);
export const IconCircleCheck = trustIconMarkup(tablerCircleCheck);
export const IconInfoCircle = trustIconMarkup(tablerInfoCircle);

// Layout
export const IconGripVertical = trustIconMarkup(tablerGripVertical);
export const IconPalette = trustIconMarkup(tablerPalette);
