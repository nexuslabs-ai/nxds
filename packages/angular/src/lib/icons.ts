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

import { trustIconMarkup } from './icon';

// Loading states
export const IconLoader2 = trustIconMarkup(phosphorCircleNotch);

// Navigation
export const IconArrowDown = trustIconMarkup(phosphorArrowDown);
export const IconArrowLeft = trustIconMarkup(phosphorArrowLeft);
export const IconArrowRight = trustIconMarkup(phosphorArrowRight);
export const IconArrowUp = trustIconMarkup(phosphorArrowUp);
export const IconChevronDown = trustIconMarkup(phosphorCaretDown);
export const IconChevronLeft = trustIconMarkup(phosphorCaretLeft);
export const IconChevronRight = trustIconMarkup(phosphorCaretRight);
export const IconChevronUp = trustIconMarkup(phosphorCaretUp);
export const IconDots = trustIconMarkup(phosphorDotsThree);
export const IconLayoutSidebar = trustIconMarkup(phosphorSidebarSimple);
export const IconSelector = trustIconMarkup(phosphorCaretUpDown);

// Actions
export const IconCheck = trustIconMarkup(phosphorCheck);
export const IconCopy = trustIconMarkup(phosphorCopy);
export const IconMinus = trustIconMarkup(phosphorMinus);
export const IconPencil = trustIconMarkup(phosphorPencilSimple);
export const IconPlus = trustIconMarkup(phosphorPlus);
export const IconX = trustIconMarkup(phosphorX);
export const IconCircleFilled = trustIconMarkup(phosphorCircleFill);

// Filter field types
export const IconCalendar = trustIconMarkup(phosphorCalendarBlank);
export const IconHash = trustIconMarkup(phosphorHash);
export const IconLetterCase = trustIconMarkup(phosphorTextAa);
export const IconList = trustIconMarkup(phosphorListBullets);

// Search / input
export const IconSearch = trustIconMarkup(phosphorMagnifyingGlass);

// Alerts/Status
export const IconAlertCircle = trustIconMarkup(phosphorWarningCircle);
export const IconAlertTriangle = trustIconMarkup(phosphorWarning);
export const IconCircleCheck = trustIconMarkup(phosphorCheckCircle);
export const IconInfoCircle = trustIconMarkup(phosphorInfo);

// Layout
export const IconGripVertical = trustIconMarkup(phosphorDotsSixVertical);
export const IconPalette = trustIconMarkup(phosphorPalette);
