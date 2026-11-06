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

import { trustIconMarkup } from '../icon';

// Loading states
export const IconLoader2 = trustIconMarkup(lucideLoaderCircle);

// Navigation
export const IconArrowDown = trustIconMarkup(lucideArrowDown);
export const IconArrowLeft = trustIconMarkup(lucideArrowLeft);
export const IconArrowRight = trustIconMarkup(lucideArrowRight);
export const IconArrowUp = trustIconMarkup(lucideArrowUp);
export const IconChevronDown = trustIconMarkup(lucideChevronDown);
export const IconChevronLeft = trustIconMarkup(lucideChevronLeft);
export const IconChevronRight = trustIconMarkup(lucideChevronRight);
export const IconChevronUp = trustIconMarkup(lucideChevronUp);
export const IconDots = trustIconMarkup(lucideEllipsis);
export const IconLayoutSidebar = trustIconMarkup(lucidePanelLeft);
export const IconSelector = trustIconMarkup(lucideChevronsUpDown);

// Actions
export const IconCheck = trustIconMarkup(lucideCheck);
export const IconCopy = trustIconMarkup(lucideCopy);
export const IconMinus = trustIconMarkup(lucideMinus);
export const IconPencil = trustIconMarkup(lucidePencil);
export const IconPlus = trustIconMarkup(lucidePlus);
export const IconX = trustIconMarkup(lucideX);
export const IconCircleFilled = trustIconMarkup(
  lucideCircle.replace('fill="none"', 'fill="currentColor"')
);

// Filter field types
export const IconCalendar = trustIconMarkup(lucideCalendar);
export const IconHash = trustIconMarkup(lucideHash);
export const IconLetterCase = trustIconMarkup(lucideCaseSensitive);
export const IconList = trustIconMarkup(lucideList);

// Search / input
export const IconSearch = trustIconMarkup(lucideSearch);

// Alerts/Status
export const IconAlertCircle = trustIconMarkup(lucideCircleAlert);
export const IconAlertTriangle = trustIconMarkup(lucideTriangleAlert);
export const IconCircleCheck = trustIconMarkup(lucideCircleCheck);
export const IconInfoCircle = trustIconMarkup(lucideInfo);

// Layout
export const IconGripVertical = trustIconMarkup(lucideGripVertical);
export const IconPalette = trustIconMarkup(lucidePalette);
