'use client';

// Icons the site supplies, drawn in the icon library the visitor picks like
// the icons inside Nexus components (see ../_lib/switchable-icons.tsx). Lucide
// has no brand marks, so it borrows Tabler's, which share its stroke style.
import type { ComponentPropsWithoutRef, ComponentType } from 'react';

import {
  ArrowUpRight01Icon,
  DiscordIcon,
  File01Icon,
  GithubIcon,
  Menu01Icon,
  Moon02Icon,
  NewTwitterIcon,
  Sent02Icon,
  Sun03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import type { NxdsIconLibrary } from '@nxds/core';
import {
  ArrowUpRightIcon,
  DiscordLogoIcon,
  FileIcon,
  GithubLogoIcon,
  ListIcon,
  MoonIcon,
  PaperPlaneRightIcon,
  SunIcon,
  XLogoIcon,
} from '@phosphor-icons/react/ssr';
import {
  RiArrowRightUpLine,
  RiDiscordLine,
  RiFileLine,
  RiGithubLine,
  RiMenuLine,
  RiMoonLine,
  RiSendPlaneLine,
  RiSunLine,
  RiTwitterXLine,
} from '@remixicon/react';
import {
  IconArrowUpRight,
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandX,
  IconFile,
  IconMenu2,
  IconMoon,
  IconSend,
  IconSun,
} from '@tabler/icons-react';
import { ArrowUpRight, LucideFile, Menu, Moon, Send, Sun } from 'lucide-react';

import { useIconLibrary } from './icon-library';

type SiteIconProps = Omit<
  ComponentPropsWithoutRef<'svg'>,
  'children' | 'strokeWidth'
>;

function hugeicon(icon: IconSvgElement) {
  return function Hugeicon(props: SiteIconProps) {
    return <HugeiconsIcon icon={icon} {...props} />;
  };
}

function siteIcon(
  name: string,
  icons: Record<NxdsIconLibrary, ComponentType<SiteIconProps>>
) {
  function SiteIcon(props: SiteIconProps) {
    const Icon = icons[useIconLibrary()];
    return <Icon {...props} />;
  }
  SiteIcon.displayName = name;
  return SiteIcon;
}

export const SiteMoonIcon = siteIcon('SiteMoonIcon', {
  phosphor: MoonIcon,
  lucide: Moon,
  tabler: IconMoon,
  hugeicons: hugeicon(Moon02Icon),
  remix: RiMoonLine,
});

export const SiteSunIcon = siteIcon('SiteSunIcon', {
  phosphor: SunIcon,
  lucide: Sun,
  tabler: IconSun,
  hugeicons: hugeicon(Sun03Icon),
  remix: RiSunLine,
});

export const SiteMenuIcon = siteIcon('SiteMenuIcon', {
  phosphor: ListIcon,
  lucide: Menu,
  tabler: IconMenu2,
  hugeicons: hugeicon(Menu01Icon),
  remix: RiMenuLine,
});

export const SiteArrowUpRightIcon = siteIcon('SiteArrowUpRightIcon', {
  phosphor: ArrowUpRightIcon,
  lucide: ArrowUpRight,
  tabler: IconArrowUpRight,
  hugeicons: hugeicon(ArrowUpRight01Icon),
  remix: RiArrowRightUpLine,
});

export const SiteSendIcon = siteIcon('SiteSendIcon', {
  phosphor: PaperPlaneRightIcon,
  lucide: Send,
  tabler: IconSend,
  hugeicons: hugeicon(Sent02Icon),
  remix: RiSendPlaneLine,
});

export const SiteFileIcon = siteIcon('SiteFileIcon', {
  phosphor: FileIcon,
  lucide: LucideFile,
  tabler: IconFile,
  hugeicons: hugeicon(File01Icon),
  remix: RiFileLine,
});

export const DiscordMark = siteIcon('DiscordMark', {
  phosphor: DiscordLogoIcon,
  lucide: IconBrandDiscord,
  tabler: IconBrandDiscord,
  hugeicons: hugeicon(DiscordIcon),
  remix: RiDiscordLine,
});

export const XMark = siteIcon('XMark', {
  phosphor: XLogoIcon,
  lucide: IconBrandX,
  tabler: IconBrandX,
  hugeicons: hugeicon(NewTwitterIcon),
  remix: RiTwitterXLine,
});

export const GitHubMark = siteIcon('GitHubMark', {
  phosphor: GithubLogoIcon,
  lucide: IconBrandGithub,
  tabler: IconBrandGithub,
  hugeicons: hugeicon(GithubIcon),
  remix: RiGithubLine,
});
