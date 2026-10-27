/**
 * Internal Icons
 *
 * This barrel file re-exports icons used internally by the design system.
 * These are hardcoded icons for component states (loading, validation, navigation).
 *
 * User-facing icons should be passed via props by consumers.
 *
 * This set draws HugeIcons.
 */
import * as React from 'react';

import {
  Alert02Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowDown02Icon,
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowUp01Icon,
  ArrowUp02Icon,
  Calendar03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  CircleIcon,
  Copy01Icon,
  DragDropVerticalIcon,
  HashtagIcon,
  InformationCircleIcon,
  LeftToRightListBulletIcon,
  Loading03Icon,
  MinusSignIcon,
  MoreHorizontalIcon,
  PaintBoardIcon,
  PencilEdit02Icon,
  PlusSignIcon,
  Search01Icon,
  SidebarLeftIcon,
  TextFontIcon,
  Tick02Icon,
  UnfoldMoreIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';

type IconProps = Omit<React.ComponentPropsWithoutRef<'svg'>, 'strokeWidth'>;

function hugeicon(icon: IconSvgElement, defaults?: IconProps) {
  return function Hugeicon(props: IconProps) {
    return React.createElement(HugeiconsIcon, { icon, ...defaults, ...props });
  };
}

// Loading states
export const IconLoader2 = hugeicon(Loading03Icon);

// Navigation
export const IconArrowDown = hugeicon(ArrowDown02Icon);
export const IconArrowLeft = hugeicon(ArrowLeft02Icon);
export const IconArrowRight = hugeicon(ArrowRight02Icon);
export const IconArrowUp = hugeicon(ArrowUp02Icon);
export const IconChevronDown = hugeicon(ArrowDown01Icon);
export const IconChevronLeft = hugeicon(ArrowLeft01Icon);
export const IconChevronRight = hugeicon(ArrowRight01Icon);
export const IconChevronUp = hugeicon(ArrowUp01Icon);
export const IconDots = hugeicon(MoreHorizontalIcon);
export const IconLayoutSidebar = hugeicon(SidebarLeftIcon);
export const IconSelector = hugeicon(UnfoldMoreIcon);

// Actions
export const IconCheck = hugeicon(Tick02Icon);
export const IconCircleFilled = hugeicon(CircleIcon, { fill: 'currentColor' });
export const IconCopy = hugeicon(Copy01Icon);
export const IconMinus = hugeicon(MinusSignIcon);
export const IconPencil = hugeicon(PencilEdit02Icon);
export const IconPlus = hugeicon(PlusSignIcon);
export const IconX = hugeicon(Cancel01Icon);

// Filter field types
export const IconCalendar = hugeicon(Calendar03Icon);
export const IconHash = hugeicon(HashtagIcon);
export const IconLetterCase = hugeicon(TextFontIcon);
export const IconList = hugeicon(LeftToRightListBulletIcon);

// Search / input
export const IconSearch = hugeicon(Search01Icon);

// Alerts/Status
export const IconAlertCircle = hugeicon(AlertCircleIcon);
export const IconAlertTriangle = hugeicon(Alert02Icon);
export const IconCircleCheck = hugeicon(CheckmarkCircle02Icon);
export const IconInfoCircle = hugeicon(InformationCircleIcon);

// Layout
export const IconGripVertical = hugeicon(DragDropVerticalIcon);
export const IconPalette = hugeicon(PaintBoardIcon);
