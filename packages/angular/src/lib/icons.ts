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

import { iconMarkup } from './icon';

// Loading states
export const IconLoader2 = iconMarkup(phosphorCircleNotch);

// Navigation
export const IconArrowDown = iconMarkup(phosphorArrowDown);
export const IconArrowLeft = iconMarkup(phosphorArrowLeft);
export const IconArrowRight = iconMarkup(phosphorArrowRight);
export const IconArrowUp = iconMarkup(phosphorArrowUp);
export const IconChevronDown = iconMarkup(phosphorCaretDown);
export const IconChevronLeft = iconMarkup(phosphorCaretLeft);
export const IconChevronRight = iconMarkup(phosphorCaretRight);
export const IconChevronUp = iconMarkup(phosphorCaretUp);
export const IconDots = iconMarkup(phosphorDotsThree);
export const IconLayoutSidebar = iconMarkup(phosphorSidebarSimple);
export const IconSelector = iconMarkup(phosphorCaretUpDown);

// Actions
export const IconCheck = iconMarkup(phosphorCheck);
export const IconCopy = iconMarkup(phosphorCopy);
export const IconMinus = iconMarkup(phosphorMinus);
export const IconPencil = iconMarkup(phosphorPencilSimple);
export const IconPlus = iconMarkup(phosphorPlus);
export const IconX = iconMarkup(phosphorX);
export const IconCircleFilled = iconMarkup(phosphorCircleFill);

// Filter field types
export const IconCalendar = iconMarkup(phosphorCalendarBlank);
export const IconHash = iconMarkup(phosphorHash);
export const IconLetterCase = iconMarkup(phosphorTextAa);
export const IconList = iconMarkup(phosphorListBullets);

// Search / input
export const IconSearch = iconMarkup(phosphorMagnifyingGlass);

// Alerts/Status
export const IconAlertCircle = iconMarkup(phosphorWarningCircle);
export const IconAlertTriangle = iconMarkup(phosphorWarning);
export const IconCircleCheck = iconMarkup(phosphorCheckCircle);
export const IconInfoCircle = iconMarkup(phosphorInfo);

// Layout
export const IconGripVertical = iconMarkup(phosphorDotsSixVertical);
export const IconPalette = iconMarkup(phosphorPalette);
