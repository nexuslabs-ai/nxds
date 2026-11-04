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

// Loading states
export const IconLoader2 = lucideLoaderCircle;

// Navigation
export const IconArrowDown = lucideArrowDown;
export const IconArrowLeft = lucideArrowLeft;
export const IconArrowRight = lucideArrowRight;
export const IconArrowUp = lucideArrowUp;
export const IconChevronDown = lucideChevronDown;
export const IconChevronLeft = lucideChevronLeft;
export const IconChevronRight = lucideChevronRight;
export const IconChevronUp = lucideChevronUp;
export const IconDots = lucideEllipsis;
export const IconLayoutSidebar = lucidePanelLeft;
export const IconSelector = lucideChevronsUpDown;

// Actions
export const IconCheck = lucideCheck;
export const IconCopy = lucideCopy;
export const IconMinus = lucideMinus;
export const IconPencil = lucidePencil;
export const IconPlus = lucidePlus;
export const IconX = lucideX;
export const IconCircleFilled = lucideCircle.replace(
  'fill="none"',
  'fill="currentColor"'
);

// Filter field types
export const IconCalendar = lucideCalendar;
export const IconHash = lucideHash;
export const IconLetterCase = lucideCaseSensitive;
export const IconList = lucideList;

// Search / input
export const IconSearch = lucideSearch;

// Alerts/Status
export const IconAlertCircle = lucideCircleAlert;
export const IconAlertTriangle = lucideTriangleAlert;
export const IconCircleCheck = lucideCircleCheck;
export const IconInfoCircle = lucideInfo;

// Layout
export const IconGripVertical = lucideGripVertical;
export const IconPalette = lucidePalette;
