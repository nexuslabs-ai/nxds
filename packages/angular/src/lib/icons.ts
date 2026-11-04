/**
 * Internal Icons
 *
 * SVG markup for the icons the design system draws itself, for component
 * states (loading, validation, navigation). Draw one with `<svg [nxIcon]>`.
 *
 * User-facing icons are the consumer's own markup.
 *
 * This set draws Phosphor. `nxds init --icons` installs the same names drawn by another library.
 */
import { phosphorCircleFill } from '@ng-icons/phosphor-icons/fill';
import {
  phosphorArrowDown,
  phosphorArrowLeft,
  phosphorArrowRight,
  phosphorArrowUp,
  phosphorCalendarBlank,
  phosphorCaretDown,
  phosphorCaretLeft,
  phosphorCaretRight,
  phosphorCaretUp,
  phosphorCaretUpDown,
  phosphorCheck,
  phosphorCheckCircle,
  phosphorCircleNotch,
  phosphorCopy,
  phosphorDotsSixVertical,
  phosphorDotsThree,
  phosphorHash,
  phosphorInfo,
  phosphorListBullets,
  phosphorMagnifyingGlass,
  phosphorMinus,
  phosphorPalette,
  phosphorPencilSimple,
  phosphorPlus,
  phosphorSidebarSimple,
  phosphorTextAa,
  phosphorWarning,
  phosphorWarningCircle,
  phosphorX,
} from '@ng-icons/phosphor-icons/regular';

// Loading states
export const IconLoader2 = phosphorCircleNotch;

// Navigation
export const IconArrowDown = phosphorArrowDown;
export const IconArrowLeft = phosphorArrowLeft;
export const IconArrowRight = phosphorArrowRight;
export const IconArrowUp = phosphorArrowUp;
export const IconChevronDown = phosphorCaretDown;
export const IconChevronLeft = phosphorCaretLeft;
export const IconChevronRight = phosphorCaretRight;
export const IconChevronUp = phosphorCaretUp;
export const IconDots = phosphorDotsThree;
export const IconLayoutSidebar = phosphorSidebarSimple;
export const IconSelector = phosphorCaretUpDown;

// Actions
export const IconCheck = phosphorCheck;
export const IconCopy = phosphorCopy;
export const IconMinus = phosphorMinus;
export const IconPencil = phosphorPencilSimple;
export const IconPlus = phosphorPlus;
export const IconX = phosphorX;
export const IconCircleFilled = phosphorCircleFill;

// Filter field types
export const IconCalendar = phosphorCalendarBlank;
export const IconHash = phosphorHash;
export const IconLetterCase = phosphorTextAa;
export const IconList = phosphorListBullets;

// Search / input
export const IconSearch = phosphorMagnifyingGlass;

// Alerts/Status
export const IconAlertCircle = phosphorWarningCircle;
export const IconAlertTriangle = phosphorWarning;
export const IconCircleCheck = phosphorCheckCircle;
export const IconInfoCircle = phosphorInfo;

// Layout
export const IconGripVertical = phosphorDotsSixVertical;
export const IconPalette = phosphorPalette;
