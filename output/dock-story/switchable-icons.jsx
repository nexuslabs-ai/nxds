// Stands in for packages/react's `lib/icons` (see vite.config.mjs), so every
// Nexus component draws its own icons in the library the visitor picks.
import { ICON_SETS } from '@nxds/icon-sets';

import { useIconLibrary } from './icon-library';

function switchable(name) {
  function SwitchableIcon(props) {
    const Icon = ICON_SETS[useIconLibrary()][name];
    return <Icon {...props} />;
  }
  SwitchableIcon.displayName = name;
  return SwitchableIcon;
}

export const IconAlertCircle = switchable('IconAlertCircle');
export const IconAlertTriangle = switchable('IconAlertTriangle');
export const IconArrowDown = switchable('IconArrowDown');
export const IconArrowLeft = switchable('IconArrowLeft');
export const IconArrowRight = switchable('IconArrowRight');
export const IconArrowUp = switchable('IconArrowUp');
export const IconCalendar = switchable('IconCalendar');
export const IconCheck = switchable('IconCheck');
export const IconChevronDown = switchable('IconChevronDown');
export const IconChevronLeft = switchable('IconChevronLeft');
export const IconChevronRight = switchable('IconChevronRight');
export const IconChevronUp = switchable('IconChevronUp');
export const IconCircleCheck = switchable('IconCircleCheck');
export const IconCircleFilled = switchable('IconCircleFilled');
export const IconDots = switchable('IconDots');
export const IconGripVertical = switchable('IconGripVertical');
export const IconHash = switchable('IconHash');
export const IconInfoCircle = switchable('IconInfoCircle');
export const IconLayoutSidebar = switchable('IconLayoutSidebar');
export const IconLetterCase = switchable('IconLetterCase');
export const IconList = switchable('IconList');
export const IconLoader2 = switchable('IconLoader2');
export const IconMinus = switchable('IconMinus');
export const IconPalette = switchable('IconPalette');
export const IconPencil = switchable('IconPencil');
export const IconPlus = switchable('IconPlus');
export const IconSearch = switchable('IconSearch');
export const IconSelector = switchable('IconSelector');
export const IconX = switchable('IconX');
