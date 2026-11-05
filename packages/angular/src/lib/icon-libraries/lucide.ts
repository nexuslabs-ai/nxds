/**
 * Internal Icons
 *
 * SVG markup for the icons the design system draws itself, for component
 * states (loading, validation, navigation). Draw one with `<svg [nxIcon]>`.
 *
 * User-facing icons are the consumer's own markup.
 *
 * This set draws Lucide.
 */
import {
  lucideArrowDown,
  lucideArrowLeft,
  lucideArrowRight,
  lucideArrowUp,
  lucideCalendar,
  lucideCaseSensitive,
  lucideCheck,
  lucideChevronDown,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsUpDown,
  lucideChevronUp,
  lucideCircle,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideCopy,
  lucideEllipsis,
  lucideGripVertical,
  lucideHash,
  lucideInfo,
  lucideList,
  lucideLoaderCircle,
  lucideMinus,
  lucidePalette,
  lucidePanelLeft,
  lucidePencil,
  lucidePlus,
  lucideSearch,
  lucideTriangleAlert,
  lucideX,
} from '@ng-icons/lucide';

import { iconMarkup } from '../icon';

// Loading states
export const IconLoader2 = iconMarkup(lucideLoaderCircle);

// Navigation
export const IconArrowDown = iconMarkup(lucideArrowDown);
export const IconArrowLeft = iconMarkup(lucideArrowLeft);
export const IconArrowRight = iconMarkup(lucideArrowRight);
export const IconArrowUp = iconMarkup(lucideArrowUp);
export const IconChevronDown = iconMarkup(lucideChevronDown);
export const IconChevronLeft = iconMarkup(lucideChevronLeft);
export const IconChevronRight = iconMarkup(lucideChevronRight);
export const IconChevronUp = iconMarkup(lucideChevronUp);
export const IconDots = iconMarkup(lucideEllipsis);
export const IconLayoutSidebar = iconMarkup(lucidePanelLeft);
export const IconSelector = iconMarkup(lucideChevronsUpDown);

// Actions
export const IconCheck = iconMarkup(lucideCheck);
export const IconCopy = iconMarkup(lucideCopy);
export const IconMinus = iconMarkup(lucideMinus);
export const IconPencil = iconMarkup(lucidePencil);
export const IconPlus = iconMarkup(lucidePlus);
export const IconX = iconMarkup(lucideX);
export const IconCircleFilled = iconMarkup(
  lucideCircle.replace('fill="none"', 'fill="currentColor"')
);

// Filter field types
export const IconCalendar = iconMarkup(lucideCalendar);
export const IconHash = iconMarkup(lucideHash);
export const IconLetterCase = iconMarkup(lucideCaseSensitive);
export const IconList = iconMarkup(lucideList);

// Search / input
export const IconSearch = iconMarkup(lucideSearch);

// Alerts/Status
export const IconAlertCircle = iconMarkup(lucideCircleAlert);
export const IconAlertTriangle = iconMarkup(lucideTriangleAlert);
export const IconCircleCheck = iconMarkup(lucideCircleCheck);
export const IconInfoCircle = iconMarkup(lucideInfo);

// Layout
export const IconGripVertical = iconMarkup(lucideGripVertical);
export const IconPalette = iconMarkup(lucidePalette);
