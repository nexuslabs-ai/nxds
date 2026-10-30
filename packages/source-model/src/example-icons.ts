// The icons docs stories pass to components, such as a Badge's `rightIcon`,
// in each icon library nxds can install. Stories draw Phosphor; the docs show
// each example in the reader's library, and the CLI install check pastes the
// app's.

/** The libraries `nxds-cli init --icons` installs. Phosphor is the stories' own. */
export const ICON_LIBRARIES = [
  'phosphor',
  'lucide',
  'tabler',
  'hugeicons',
  'remix',
] as const;

export type IconLibrary = (typeof ICON_LIBRARIES)[number];

export type Framework = 'react' | 'vue';

export type OtherLibrary = Exclude<IconLibrary, 'phosphor'>;

/**
 * An icon as each library other than Phosphor names it. `filled` names the
 * filled icon a library draws for Phosphor's `weight="fill"`; a library
 * without one draws the outline.
 */
export type ExampleIcon = Record<OtherLibrary, string> & {
  filled?: Partial<Record<OtherLibrary, string>>;
};

/**
 * Each Phosphor icon the stories use, by its Phosphor name (`CaretDown` for
 * `CaretDownIcon` and `PhCaretDown`), as each other library names it: Lucide
 * `ChevronDown` (`ChevronDownIcon`), Tabler `ChevronDown` (`IconChevronDown`),
 * HugeIcons `ArrowDown01` (`ArrowDown01Icon`) and Remix `ArrowDownSLine`
 * (`RiArrowDownSLine`).
 */
export const EXAMPLE_ICONS: Record<string, ExampleIcon> = {
  Archive: {
    lucide: 'Archive',
    tabler: 'Archive',
    hugeicons: 'Archive02',
    remix: 'ArchiveLine',
  },
  ArrowClockwise: {
    lucide: 'RotateCw',
    tabler: 'Refresh',
    hugeicons: 'Refresh',
    remix: 'RefreshLine',
  },
  ArrowRight: {
    lucide: 'ArrowRight',
    tabler: 'ArrowRight',
    hugeicons: 'ArrowRight02',
    remix: 'ArrowRightLine',
  },
  ArrowUUpLeft: {
    lucide: 'Undo2',
    tabler: 'ArrowBackUp',
    hugeicons: 'Undo02',
    remix: 'ArrowGoBackLine',
  },
  Book: {
    lucide: 'Book',
    tabler: 'Book',
    hugeicons: 'Book02',
    remix: 'BookLine',
  },
  CalendarBlank: {
    lucide: 'Calendar',
    tabler: 'Calendar',
    hugeicons: 'Calendar03',
    remix: 'CalendarLine',
  },
  CaretDown: {
    lucide: 'ChevronDown',
    tabler: 'ChevronDown',
    hugeicons: 'ArrowDown01',
    remix: 'ArrowDownSLine',
  },
  CaretLeft: {
    lucide: 'ChevronLeft',
    tabler: 'ChevronLeft',
    hugeicons: 'ArrowLeft01',
    remix: 'ArrowLeftSLine',
  },
  CaretRight: {
    lucide: 'ChevronRight',
    tabler: 'ChevronRight',
    hugeicons: 'ArrowRight01',
    remix: 'ArrowRightSLine',
  },
  CaretUp: {
    lucide: 'ChevronUp',
    tabler: 'ChevronUp',
    hugeicons: 'ArrowUp01',
    remix: 'ArrowUpSLine',
  },
  CaretUpDown: {
    lucide: 'ChevronsUpDown',
    tabler: 'Selector',
    hugeicons: 'UnfoldMore',
    remix: 'ExpandUpDownLine',
  },
  ChatText: {
    lucide: 'MessageSquareText',
    tabler: 'Message',
    hugeicons: 'Message01',
    remix: 'Message2Line',
  },
  Check: {
    lucide: 'Check',
    tabler: 'Check',
    hugeicons: 'Tick02',
    remix: 'CheckLine',
  },
  CheckCircle: {
    lucide: 'CircleCheck',
    tabler: 'CircleCheck',
    hugeicons: 'CheckmarkCircle02',
    remix: 'CheckboxCircleLine',
    filled: { tabler: 'CircleCheckFilled', remix: 'CheckboxCircleFill' },
  },
  Checkerboard: {
    lucide: 'Grid3x3',
    tabler: 'Texture',
    hugeicons: 'GridView',
    remix: 'LayoutGridLine',
  },
  Copy: {
    lucide: 'Copy',
    tabler: 'Copy',
    hugeicons: 'Copy01',
    remix: 'FileCopyLine',
  },
  DotsThree: {
    lucide: 'Ellipsis',
    tabler: 'Dots',
    hugeicons: 'MoreHorizontal',
    remix: 'MoreLine',
  },
  DownloadSimple: {
    lucide: 'Download',
    tabler: 'Download',
    hugeicons: 'Download01',
    remix: 'DownloadLine',
  },
  Envelope: {
    lucide: 'Mail',
    tabler: 'Mail',
    hugeicons: 'Mail01',
    remix: 'MailLine',
  },
  File: {
    lucide: 'File',
    tabler: 'File',
    hugeicons: 'File01',
    remix: 'FileLine',
  },
  FileDoc: {
    lucide: 'FileText',
    tabler: 'FileTypeDoc',
    hugeicons: 'Doc01',
    remix: 'FileWordLine',
  },
  FilePdf: {
    lucide: 'File',
    tabler: 'FileTypePdf',
    hugeicons: 'Pdf01',
    remix: 'FilePdfLine',
  },
  FileText: {
    lucide: 'FileText',
    tabler: 'FileText',
    hugeicons: 'File02',
    remix: 'FileTextLine',
  },
  FileTxt: {
    lucide: 'FileText',
    tabler: 'FileTypeTxt',
    hugeicons: 'Txt01',
    remix: 'FileTextLine',
  },
  FileZip: {
    lucide: 'FileArchive',
    tabler: 'FileZip',
    hugeicons: 'Zip01',
    remix: 'FileZipLine',
  },
  Folder: {
    lucide: 'Folder',
    tabler: 'Folder',
    hugeicons: 'Folder01',
    remix: 'FolderLine',
  },
  Gear: {
    lucide: 'Settings',
    tabler: 'Settings',
    hugeicons: 'Settings01',
    remix: 'SettingsLine',
  },
  GitBranch: {
    lucide: 'GitBranch',
    tabler: 'GitBranch',
    hugeicons: 'GitBranch',
    remix: 'GitBranchLine',
  },
  House: {
    lucide: 'House',
    tabler: 'Home',
    hugeicons: 'Home01',
    remix: 'HomeLine',
  },
  Info: {
    lucide: 'Info',
    tabler: 'InfoCircle',
    hugeicons: 'InformationCircle',
    remix: 'InformationLine',
  },
  Link: {
    lucide: 'Link',
    tabler: 'Link',
    hugeicons: 'Link01',
    remix: 'LinkM',
  },
  MagnifyingGlass: {
    lucide: 'Search',
    tabler: 'Search',
    hugeicons: 'Search01',
    remix: 'SearchLine',
  },
  PencilSimple: {
    lucide: 'Pencil',
    tabler: 'Pencil',
    hugeicons: 'PencilEdit02',
    remix: 'PencilLine',
  },
  Rocket: {
    lucide: 'Rocket',
    tabler: 'Rocket',
    hugeicons: 'Rocket01',
    remix: 'RocketLine',
  },
  SquaresFour: {
    lucide: 'LayoutGrid',
    tabler: 'LayoutGrid',
    hugeicons: 'DashboardSquare01',
    remix: 'DashboardLine',
  },
  Star: {
    lucide: 'Star',
    tabler: 'Star',
    hugeicons: 'Star',
    remix: 'StarLine',
  },
  TextAlignCenter: {
    lucide: 'TextAlignCenter',
    tabler: 'AlignCenter',
    hugeicons: 'TextAlignCenter',
    remix: 'AlignCenter',
  },
  TextAlignLeft: {
    lucide: 'TextAlignStart',
    tabler: 'AlignLeft',
    hugeicons: 'TextAlignLeft',
    remix: 'AlignLeft',
  },
  TextAlignRight: {
    lucide: 'TextAlignEnd',
    tabler: 'AlignRight',
    hugeicons: 'TextAlignRight',
    remix: 'AlignRight',
  },
  TextB: {
    lucide: 'Bold',
    tabler: 'Bold',
    hugeicons: 'TextBold',
    remix: 'Bold',
  },
  TextItalic: {
    lucide: 'Italic',
    tabler: 'Italic',
    hugeicons: 'TextItalic',
    remix: 'Italic',
  },
  TextUnderline: {
    lucide: 'Underline',
    tabler: 'Underline',
    hugeicons: 'TextUnderline',
    remix: 'Underline',
  },
  Tray: {
    lucide: 'Inbox',
    tabler: 'Inbox',
    hugeicons: 'Inbox',
    remix: 'InboxLine',
  },
  UploadSimple: {
    lucide: 'Upload',
    tabler: 'Upload',
    hugeicons: 'Upload01',
    remix: 'UploadLine',
  },
  User: {
    lucide: 'User',
    tabler: 'User',
    hugeicons: 'User',
    remix: 'UserLine',
  },
  Users: {
    lucide: 'Users',
    tabler: 'Users',
    hugeicons: 'UserMultiple',
    remix: 'GroupLine',
  },
  Warning: {
    lucide: 'TriangleAlert',
    tabler: 'AlertTriangle',
    hugeicons: 'Alert02',
    remix: 'AlertLine',
  },
  WarningCircle: {
    lucide: 'CircleAlert',
    tabler: 'AlertCircle',
    hugeicons: 'AlertCircle',
    remix: 'ErrorWarningLine',
  },
  X: {
    lucide: 'X',
    tabler: 'X',
    hugeicons: 'Cancel01',
    remix: 'CloseLine',
  },
};

/**
 * Where each library's icons come from, and for HugeIcons, whose icons are
 * data, the component that draws them.
 */
export const ICON_PACKAGES: Record<
  IconLibrary,
  Record<Framework, { icons: string; component?: string }>
> = {
  phosphor: {
    react: { icons: '@phosphor-icons/react/ssr' },
    vue: { icons: '@phosphor-icons/vue' },
  },
  lucide: { react: { icons: 'lucide-react' }, vue: { icons: '@lucide/vue' } },
  tabler: {
    react: { icons: '@tabler/icons-react' },
    vue: { icons: '@tabler/icons-vue' },
  },
  hugeicons: {
    react: {
      icons: '@hugeicons/core-free-icons',
      component: '@hugeicons/react',
    },
    vue: { icons: '@hugeicons/core-free-icons', component: '@hugeicons/vue' },
  },
  remix: {
    react: { icons: '@remixicon/react' },
    vue: { icons: '@remixicon/vue' },
  },
};

/**
 * The name `library`'s package exports for its icon `name`: Phosphor `XIcon`
 * and `PhX`, Lucide `XIcon`, Tabler `IconX`, HugeIcons `XIcon` and Remix
 * `RiX`.
 */
export function iconExport(
  library: IconLibrary,
  framework: Framework,
  name: string
) {
  if (library === 'phosphor') {
    return framework === 'react' ? `${name}Icon` : `Ph${name}`;
  }
  if (library === 'tabler') return `Icon${name}`;
  if (library === 'remix') return `Ri${name}`;
  return `${name}Icon`;
}

/**
 * The Phosphor icon `phosphor` as `library` names it. With `filled`, the
 * library's filled icon when it has one.
 */
export function exampleIconName(
  phosphor: string,
  library: IconLibrary,
  filled = false
) {
  if (library === 'phosphor') return phosphor;
  const icon = EXAMPLE_ICONS[phosphor];
  if (!icon) {
    throw new Error(
      `No other library's name for Phosphor's ${phosphor}. Add it to EXAMPLE_ICONS in packages/source-model/src/example-icons.ts.`
    );
  }
  return (filled ? icon.filled?.[library] : undefined) ?? icon[library];
}
