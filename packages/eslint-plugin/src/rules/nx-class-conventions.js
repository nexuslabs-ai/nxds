// Enforces the nx: Tailwind class conventions from
// `.claude/rules/shadcn-divergences.md` on
// class strings (string literals and template literals). Ported from the
// former `.claude/hooks/lint-nx-prefix.mjs` Claude hook so the checks run in
// `pnpm lint` and the pre-commit hook for every contributor — not only on
// in-session Claude edits.

export const RAW_FONT_WEIGHTS = [
  'thin',
  'extralight',
  'light',
  'normal',
  'medium',
  'semibold',
  'bold',
  'extrabold',
  'black',
];

export const RAW_LINE_HEIGHTS = [
  'none',
  'tight',
  'snug',
  'normal',
  'relaxed',
  'loose',
];

export const RAW_LETTER_SPACINGS = [
  'tighter',
  'tight',
  'normal',
  'wide',
  'wider',
  'widest',
];

// A size from spacing follows density: a numeric spacing step (`size-4`), or an
// arbitrary value that reads a spacing variable
// (`size-[var(--nx-spacing-8)]`, `size-(--nx-spacing-8)`). Glyph tokens
// (`size-icon-glyph-sm`) and other arbitrary values (`size-[24px]`) do not.
// A leading `!` is Tailwind's important modifier.
const SPACING_SIZE = /^!?(?:size|h|w)-(?:\d|[[(].*--nx-spacing-)/;

// Any size utility: a spacing step, a glyph token or an arbitrary value.
const ANY_SIZE = /^!?(?:size|h|w)-/;

// A fixed size that leaves `--nx-icon-size` unset, such as `size-[24px]`. A size
// from spacing reports `densityIconSize` instead.
const PLAIN_SIZE = /^!?(?:size|h|w)-(?!icon-glyph-|\d|[[(].*--nx-spacing-)/;

// An `Icon*` or `*Icon` JSX element, such as `IconX` or `CheckIcon`.
const ICON_ELEMENT_NAME = /^Icon(?![a-z])|Icon$/;

/** The `nx:` classes in a class string. */
function nxClasses(raw) {
  return raw.split(/\s+/).filter((token) => token.startsWith('nx:'));
}

/** Splits a class at the `:` separators outside `[…]` and `(…)`. */
function splitVariants(className) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < className.length; i++) {
    const char = className[i];
    if (char === '[' || char === '(') depth++;
    else if (char === ']' || char === ')') depth--;
    else if (char === ':' && depth === 0) {
      parts.push(className.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(className.slice(start));
  return parts;
}

/** A selector without its `[…]` and `(…)` groups. */
function withoutGroups(selector) {
  let depth = 0;
  let kept = '';
  for (const char of selector) {
    if (char === '[' || char === '(') depth++;
    else if (char === ']' || char === ')') depth--;
    else if (depth === 0) kept += char;
  }
  return kept;
}

// An arbitrary variant whose subject is the `svg`, such as `[&_svg]` or
// `[&>svg:not(…)]`. In `has-[>svg]` and `[&:has(svg)]` the subject is the box
// around the icon.
function selectsSvg(variant) {
  if (!variant.startsWith('[') || !variant.endsWith(']')) return false;
  const compounds = withoutGroups(variant.slice(1, -1)).split(/[_>+~]/);
  return /^svg(?![\w-])/.test(compounds.at(-1));
}

/** Whether an `nx:` class sizes an `svg` with a utility that `size` matches. */
function sizesSvg(token, size) {
  const variants = splitVariants(token.slice('nx:'.length));
  const utility = variants.pop();
  return size.test(utility) && variants.some(selectsSvg);
}

function sizesSvgFromSpacing(raw) {
  return nxClasses(raw).some((token) => sizesSvg(token, SPACING_SIZE));
}

function sizesFromSpacing(raw) {
  return nxClasses(raw).some((token) =>
    SPACING_SIZE.test(splitVariants(token).at(-1))
  );
}

// Each box class with its `nest-*` twin, which the inner corners read, as
// functions that return the step a class names. Bare `border` is 1px, which no
// nest step names, and `border-0` pairs with `nest-border-none`.
const BORDER_STEPS = new Map([
  ['border', '1px'],
  ['border-0', 'none'],
  ['border-thin', 'thin'],
  ['border-default', 'default'],
  ['border-thick', 'thick'],
]);
const NEST_TWINS = [
  {
    box: (utility) => /^p-(.+)$/.exec(utility)?.[1],
    nest: (utility) => /^nest-padding-(.+)$/.exec(utility)?.[1],
  },
  {
    box: (utility) => BORDER_STEPS.get(utility),
    nest: (utility) =>
      /^nest-border-(none|thin|default|thick)$/.exec(utility)?.[1],
  },
  {
    box: (utility) =>
      /^rounded-(none|base|sm|md|lg|xl|2xl|3xl|4xl|full|\[.+\]|\(.+\))$/.exec(
        utility
      )?.[1],
    nest: (utility) => /^nest-outer-(.+)$/.exec(utility)?.[1],
  },
];

// A class string whose box class and `nest-*` twin name different steps, such
// as `nx:p-2 nx:nest-padding-1`. A template, such as a Vue story's, holds
// several elements, so each quoted value is its own class list.
function nestStepMismatch(text) {
  return text.split(/["'`]/).some(classListNestMismatch);
}

// A list with only one class of a pair passes, because the other can sit on
// another element. Once the list pairs a twin, every variant chain that sets
// either class must set both, to the same step.
function classListNestMismatch(classList) {
  const classes = nxClasses(classList).map((token) => {
    const parts = splitVariants(token.slice('nx:'.length));
    // `!` is the important modifier, at either end.
    const utility = parts.pop().replace(/^!|!$/g, '');
    return { chain: parts.join(':'), utility };
  });
  return NEST_TWINS.some(({ box, nest }) => {
    const chains = new Map();
    for (const { chain, utility } of classes) {
      const steps = chains.get(chain) ?? {};
      steps.box ??= box(utility);
      steps.nest ??= nest(utility);
      chains.set(chain, steps);
    }
    const set = [...chains.values()].filter(
      (steps) => steps.box !== undefined || steps.nest !== undefined
    );
    const paired = set.some(
      (steps) => steps.box !== undefined && steps.nest !== undefined
    );
    return paired && set.some((steps) => steps.box !== steps.nest);
  });
}

function isIconElement(name) {
  return name.type === 'JSXIdentifier' && ICON_ELEMENT_NAME.test(name.name);
}

const NAMED_VARIANT = String.raw`@?[\w-]+(?:\[[^\s]+?\])?(?:\/[\w-]+)?:`;
const ARBITRARY_VARIANT = String.raw`\[[^\s]+?\]:`;
const CHILD_VARIANT = String.raw`\*{1,2}:`;
const NX_MODIFIER_CHAIN = String.raw`(?:${NAMED_VARIANT}|${ARBITRARY_VARIANT}|${CHILD_VARIANT})*`;

const CHECKS = [
  {
    messageId: 'prefixOrder',
    re: /[a-z][a-z0-9_-]*:nx:|\]:nx:/,
  },
  {
    messageId: 'bannedAccent',
    re: new RegExp(`nx:${NX_MODIFIER_CHAIN}(?:bg|text)-accent\\b`),
  },
  {
    messageId: 'incompletePath',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}(?:bg|text|border)-(?:primary|secondary|error|success|warning|information|destructive)(?![\\w-])`
    ),
  },
  {
    messageId: 'rawPrimitive',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}(?:bg|text|border)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}`
    ),
  },
  {
    messageId: 'rawFontSize',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}text-(?:xs|sm|base|lg|xl|[2-9]xl)\\b`
    ),
  },
  {
    messageId: 'rawFontWeight',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}font-(?:${RAW_FONT_WEIGHTS.join('|')})\\b`
    ),
    skipFile: isExampleFile,
  },
  {
    messageId: 'rawLineHeight',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}leading-(?:${RAW_LINE_HEIGHTS.join('|')}|\\d+|\\[)`
    ),
    skipFile: isExampleFile,
  },
  {
    messageId: 'densityIconSize',
    test: sizesSvgFromSpacing,
    // Stories are checked: the docs pages copy their code into apps.
    skipFile: isDocsFile,
  },
  {
    messageId: 'rawLetterSpacing',
    re: new RegExp(
      `nx:${NX_MODIFIER_CHAIN}tracking-(?:${RAW_LETTER_SPACINGS.join('|')}|\\[)`
    ),
    skipFile: isExampleFile,
  },
];

// Only a width or a colour paints a ring. `outline-none` / `outline-hidden`
// suppress one, `outline-0` is a zero width, `outline-offset-*` shifts a ring
// it does not paint, and the style keywords set `outline-style` alone.
const RING_PAINTING_OUTLINE =
  /focus-visible:outline-(?!none\b|hidden\b|0\b|offset-|solid\b|dashed\b|dotted\b|double\b)/;

// `nx:transition-colors` expands to a property list that includes
// `outline-color`, so a surface that also paints a focus ring fades the ring in
// over the duration instead of landing it with the keypress.
function fadesItsFocusRing(scope) {
  return (
    /\bnx:transition-colors\b/.test(scope) && RING_PAINTING_OUTLINE.test(scope)
  );
}

// A class list that sizes its `svg` children draws the icon, so it sets the
// icon's line with `nx:icon-stroke` too.
function leavesIconUnstroked(scope) {
  const classes = nxClasses(scope);
  if (classes.includes('nx:icon-stroke')) return false;
  return classes.some((token) => sizesSvg(token, ANY_SIZE));
}

// `size-icon-glyph-*` sets `--nx-icon-size`, the size the line is drawn for. Any
// other size must set the variable itself, under the same variants.
function sizesIconWithoutLine(scope) {
  const classes = nxClasses(scope);
  return classes.some((token) => {
    if (!sizesSvg(token, PLAIN_SIZE)) return false;
    const variants = splitVariants(token).slice(0, -1).join(':');
    return !classes.some((other) =>
      other.startsWith(`${variants}:[--nx-icon-size:`)
    );
  });
}

function isStoryFile(filename) {
  return /\.stories\.[jt]sx?$/.test(filename);
}

function isDocsFile(filename) {
  return /(?:^|[/\\])apps[/\\]docs[/\\]/.test(filename);
}

// What the raw typography and stroke checks skip: stories and the docs app
// quote utilities as specimens and prose, and the docs app styles its own
// chrome off-system.
function isExampleFile(filename) {
  return isStoryFile(filename) || isDocsFile(filename);
}

// The ring check skips less: only the docs pages, which render a pairing as
// the subject of the prose around it. The rest of the docs app is its own
// shipped chrome, and a story's class strings are the component's real ones.
function isDocsSpecimenPage(filename) {
  return /(?:^|[/\\])apps[/\\]docs[/\\]app[/\\]_pages[/\\]/.test(filename);
}

const RAW_TYPOGRAPHY_EXCEPTIONS = [
  {
    filename:
      /(?:^|[/\\])packages[/\\]react(?:-18)?[/\\]src[/\\]components[/\\]avatar[/\\]avatar\.tsx$/,
    className:
      'nx:flex nx:size-full nx:items-center nx:justify-center nx:rounded-[inherit] nx:bg-muted nx:text-foreground nx:font-medium nx:leading-none',
    messageIds: new Set(['rawFontWeight', 'rawLineHeight']),
  },
  {
    filename:
      /(?:^|[/\\])packages[/\\]react(?:-18)?[/\\]src[/\\]components[/\\]chart[/\\]chart\.tsx$/,
    className: 'nx:text-foreground nx:font-mono nx:font-medium nx:tabular-nums',
    messageIds: new Set(['rawFontWeight']),
  },
];

function normalizeClassName(raw) {
  return raw.trim().replace(/\s+/g, ' ');
}

function isRawTypographyException(check, filename, raw) {
  const normalized = normalizeClassName(raw);
  return RAW_TYPOGRAPHY_EXCEPTIONS.some(
    (exception) =>
      exception.filename.test(filename) &&
      exception.className === normalized &&
      exception.messageIds.has(check.messageId)
  );
}

function shouldRunCheck(check, filename, raw) {
  if (check.skipFile?.(filename)) {
    return false;
  }
  return !isRawTypographyException(check, filename, raw);
}

function matchedMessageIds(raw, filename) {
  const matched = new Set();
  for (const check of CHECKS) {
    if (!shouldRunCheck(check, filename, raw)) {
      continue;
    }
    const matches = check.test ? check.test(raw) : check.re.test(raw);
    if (matches) {
      matched.add(check.messageId);
    }
  }
  return matched;
}

// A class composer joins every string it is handed — base, array element,
// `variants` value — so the whole call is one scope. The name has to be
// written plainly; an aliased or member-expression composer is invisible.
const CLASS_COMPOSING_CALLEES = new Set(['cva', 'cn', 'clsx', 'cx']);

// `[…].join(' ')` collapses the array literal into one class attribute.
function isJoinedArrayLiteral(node) {
  const { callee } = node;
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.object.type === 'ArrayExpression' &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'join'
  );
}

function isClassComposingCall(node) {
  if (node.type !== 'CallExpression') {
    return false;
  }
  if (node.callee.type === 'Identifier') {
    return CLASS_COMPOSING_CALLEES.has(node.callee.name);
  }
  return isJoinedArrayLiteral(node);
}

// A string handed to some other function reaches the class attribute only
// through that call's return value, so it leaves the scope.
function breaksClassScope(node) {
  return node.type === 'CallExpression' && !isClassComposingCall(node);
}

function isInsideClassCall(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (isClassComposingCall(current)) {
      return true;
    }
    if (breaksClassScope(current)) {
      return false;
    }
  }
  return false;
}

// Every class string a node can contribute: its own value, a template
// literal's quasis, and the same for anything nested inside it that still
// reaches the same class attribute.
function collectClassStrings(node, visitorKeys, collected) {
  if (node.type === 'Literal') {
    if (typeof node.value === 'string') {
      collected.push(node.value);
    }
    return;
  }
  if (node.type === 'TemplateLiteral') {
    for (const quasi of node.quasis) {
      collected.push(quasi.value.cooked ?? quasi.value.raw);
    }
  }
  for (const key of visitorKeys[node.type] ?? []) {
    const child = node[key];
    for (const value of Array.isArray(child) ? child : [child]) {
      if (value?.type && !breaksClassScope(value)) {
        collectClassStrings(value, visitorKeys, collected);
      }
    }
  }
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce nx: Tailwind class conventions — correct prefix order, no banned `accent` token, complete semantic token paths, no raw primitive colors, no raw named font-size utilities, no icon sized from spacing, no `nest-*` class out of step with its box, no ring-fading `transition-colors` on a focus-ring surface, and no sized `svg` children without `nx:icon-stroke`.',
    },
    schema: [],
    messages: {
      prefixOrder:
        'Wrong nx: prefix order — `nx:` must come BEFORE all modifiers (e.g. `nx:hover:bg-*`, not `hover:nx:bg-*`).',
      bannedAccent:
        'Banned `accent` token — nxds has no `accent`; use `background-hover` / `container-hover` / `popover-hover` (see shadcn-divergences.md).',
      incompletePath:
        'Incomplete semantic token path — add a `-background`, `-foreground`, or `-subtle` suffix (e.g. `nx:bg-primary-background`).',
      rawPrimitive:
        'Raw Tailwind primitive color — use a semantic token instead (e.g. `nx:bg-primary-background`, not `nx:bg-blue-500`).',
      rawFontSize:
        'Raw Tailwind font-size utility — use a typography composite instead (e.g. `nx:typography-body-default`, not `nx:text-sm`).',
      rawFontWeight:
        'Raw Tailwind font-weight utility — use a typography composite instead (e.g. `nx:typography-label-default`, not `nx:font-medium`).',
      rawLineHeight:
        'Raw Tailwind line-height utility — let a typography composite own line-height instead of `nx:leading-*`.',
      rawLetterSpacing:
        'Raw Tailwind letter-spacing utility — use a typography composite such as `nx:typography-label-caps` instead of `nx:tracking-*`.',
      densityIconSize:
        'Icon size from spacing — a numeric `size-*`, `h-*` or `w-*`, or one that reads a `--nx-spacing-*` variable, on an `svg` selector (`[&_svg]:size-4`) or on an `Icon*` / `*Icon` element follows density. Use `size-icon-glyph-xs`, `-sm`, `-default`, `-lg` or `-xl` (12, 14, 16, 24 or 32px at the Default UI scale).',
      nestStepMismatch:
        'Nest step mismatch — this class string sets a box padding, border width or radius (`p-*`, `border-*`, `rounded-*`) and its `nest-padding-*`, `nest-border-*` or `nest-outer-*` twin to different steps, or sets one without the other under a variant, so the inner corners use the wrong value. Set both to the same step under the same variants.',
      ringFadingTransition:
        'Ring-fading transition — `nx:transition-colors` includes `outline-color`, so this focus ring fades in instead of landing with the keypress. Use `nx:transition-control` (or `nx:transition-field` on a field surface).',
      unstrokedIcon:
        'Unstroked icon — this class list sizes its `svg` children (`[&_svg]:size-icon-glyph-default`), so add `nx:icon-stroke` to draw stroked icons at the icon line width.',
      plainIconSize:
        'Plain icon size — size `svg` children with a `size-icon-glyph-*` class, so the line matches the icon. `size-*`, `h-*` and `w-*` leave `--nx-icon-size` unset, so set it on the same selector for a size off the scale.',
    },
  },
  create(context) {
    const filename = context.filename ?? '';
    const { visitorKeys } = context.sourceCode;

    function report(node, raw) {
      for (const messageId of matchedMessageIds(raw, filename)) {
        context.report({ node, messageId });
      }
    }

    function reportNestMismatch(node, text) {
      if (nestStepMismatch(text)) {
        context.report({ node, messageId: 'nestStepMismatch' });
      }
    }

    function reportScope(node) {
      if (isInsideClassCall(node)) {
        return;
      }
      const collected = [];
      collectClassStrings(node, visitorKeys, collected);
      const scope = collected.join(' ');
      if (!isDocsSpecimenPage(filename) && fadesItsFocusRing(scope)) {
        context.report({ node, messageId: 'ringFadingTransition' });
      }
      if (isExampleFile(filename)) return;
      if (leavesIconUnstroked(scope)) {
        context.report({ node, messageId: 'unstrokedIcon' });
      }
      if (sizesIconWithoutLine(scope)) {
        context.report({ node, messageId: 'plainIconSize' });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value !== 'string') {
          return;
        }
        report(node, node.value);
        reportNestMismatch(node, node.value);
        reportScope(node);
      },
      TemplateLiteral(node) {
        const matched = new Set();
        for (const quasi of node.quasis) {
          const raw = quasi.value.cooked ?? quasi.value.raw;
          for (const id of matchedMessageIds(raw, filename)) {
            matched.add(id);
          }
        }
        for (const messageId of matched) {
          context.report({ node, messageId });
        }
        // One class list can run across a `${}`, so the quasis are read together.
        reportNestMismatch(
          node,
          node.quasis
            .map((quasi) => quasi.value.cooked ?? quasi.value.raw)
            .join(' ')
        );
        reportScope(node);
      },
      CallExpression(node) {
        if (!isClassComposingCall(node)) {
          return;
        }
        reportScope(node);
      },
      JSXOpeningElement(node) {
        if (isDocsFile(filename) || !isIconElement(node.name)) {
          return;
        }
        const className = node.attributes.find(
          (attribute) =>
            attribute.type === 'JSXAttribute' &&
            attribute.name.name === 'className'
        );
        if (!className?.value) {
          return;
        }
        const collected = [];
        collectClassStrings(className.value, visitorKeys, collected);
        if (collected.some(sizesFromSpacing)) {
          context.report({ node: className, messageId: 'densityIconSize' });
        }
      },
    };
  },
};
