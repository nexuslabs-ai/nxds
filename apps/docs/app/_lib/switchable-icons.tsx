'use client';

/**
 * Stands in for packages/react's `lib/icons` in the docs (see next.config.ts),
 * so every example draws nxds's own icons in the library the reader picks.
 */
import { ICON_SETS, type IconName, type IconProps } from '@/lib/icon-libraries';

import { useIconLibrary } from './icon-library';

function switchable(name: IconName) {
  function SwitchableIcon(props: IconProps) {
    const Icon = ICON_SETS[useIconLibrary()][name];
    return <Icon {...props} />;
  }
  SwitchableIcon.displayName = name;
  return SwitchableIcon;
}

const icons = {
  IconAlertCircle: switchable('IconAlertCircle'),
  IconAlertTriangle: switchable('IconAlertTriangle'),
  IconArrowDown: switchable('IconArrowDown'),
  IconArrowLeft: switchable('IconArrowLeft'),
  IconArrowRight: switchable('IconArrowRight'),
  IconArrowUp: switchable('IconArrowUp'),
  IconCalendar: switchable('IconCalendar'),
  IconCheck: switchable('IconCheck'),
  IconChevronDown: switchable('IconChevronDown'),
  IconChevronLeft: switchable('IconChevronLeft'),
  IconChevronRight: switchable('IconChevronRight'),
  IconChevronUp: switchable('IconChevronUp'),
  IconCircleCheck: switchable('IconCircleCheck'),
  IconCircleFilled: switchable('IconCircleFilled'),
  IconCopy: switchable('IconCopy'),
  IconDots: switchable('IconDots'),
  IconGripVertical: switchable('IconGripVertical'),
  IconHash: switchable('IconHash'),
  IconInfoCircle: switchable('IconInfoCircle'),
  IconLayoutSidebar: switchable('IconLayoutSidebar'),
  IconLetterCase: switchable('IconLetterCase'),
  IconList: switchable('IconList'),
  IconLoader2: switchable('IconLoader2'),
  IconMinus: switchable('IconMinus'),
  IconPalette: switchable('IconPalette'),
  IconPencil: switchable('IconPencil'),
  IconPlus: switchable('IconPlus'),
  IconSearch: switchable('IconSearch'),
  IconSelector: switchable('IconSelector'),
  IconX: switchable('IconX'),
} satisfies Record<IconName, unknown>;

export const {
  IconAlertCircle,
  IconAlertTriangle,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconCircleFilled,
  IconCopy,
  IconDots,
  IconGripVertical,
  IconHash,
  IconInfoCircle,
  IconLayoutSidebar,
  IconLetterCase,
  IconList,
  IconLoader2,
  IconMinus,
  IconPalette,
  IconPencil,
  IconPlus,
  IconSearch,
  IconSelector,
  IconX,
} = icons;
