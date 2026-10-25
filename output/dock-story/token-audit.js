// Finds page styles that do not use a Nexus token. Nexus utilities and
// components read `var(--nx-*)`; any other colour, radius, border width,
// shadow, type, spacing or motion value is reported. A page variable is
// fine when it only points at a Nexus token.

export const tokenGapKinds = {
  raw: { rank: 3, label: 'Hard-coded value' },
  variable: { rank: 2, label: 'Page variable, not a Nexus token' },
  derived: { rank: 1, label: 'Nexus token changed by calc() or color-mix()' },
};

const categories = [
  [
    'color',
    /^(?:color|background(?:-color)?|(?:border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?|outline|text-decoration|caret|accent)-color|fill|stroke)$/,
  ],
  ['radius', /^border(?:-[a-z]+)*-radius$/],
  [
    'border',
    /^border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-width)?$/,
  ],
  ['shadow', /^box-shadow$/],
  ['type', /^(?:font(?:-(?:size|weight|family))?|line-height|letter-spacing)$/],
  ['space', /^(?:padding|margin)(?:-[a-z-]+)?$|^(?:row-|column-)?gap$/],
  ['motion', /^(?:transition|animation)(?:-(?:duration|timing-function))?$/],
];

const colorLiteral =
  /#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(|\b(?:white|black|red|green|blue|gray|grey|orange|yellow|purple|pink)\b/i;
const lengths =
  /-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|ch|pt|cqi|cqb|cqw|cqh|vw|vh|svh|dvh|lvh)\b/g;
const numbers = /(?<![\w.#-])-?(?:\d+\.?\d*|\.\d+)(?![\w%.(])/g;
const durations = /(?:\d+\.?\d*|\.\d+)m?s\b/g;
const easings =
  /\b(?:ease(?:-in-out|-in|-out)?|linear)\b|\b(?:cubic-bezier|steps)\(/;
const fontKeywords =
  /\b(?:inherit|initial|unset|revert-layer|revert|normal|sans-serif|serif|monospace|system-ui|ui-sans-serif|ui-monospace)\b/g;
const internalVariable = /^--(?:nx|tw|default)-/;

// Hover and focus rules still describe the element, so they match without the state.
const statePseudo =
  /(?<!\\)::?(?:hover|focus-visible|focus-within|focus|active|visited|before|after|placeholder|selection|marker|backdrop|-webkit-[\w-]+|-moz-[\w-]+)(?![\w-])/g;

const ignored =
  '.nexus-source-audit, .dialkit-panel, .dialkit-trigger, [data-external-ui], #recharts_measurement_span';

function firstNonZero(pattern, text) {
  for (const [match] of text.matchAll(pattern))
    if (parseFloat(match) !== 0) return match;
  return null;
}

function removeVars(value) {
  let text = value;
  let start = text.indexOf('var(');
  while (start !== -1) {
    let depth = 0;
    let end = start + 3;
    for (; end < text.length; end++) {
      if (text[end] === '(') depth++;
      if (text[end] === ')' && --depth === 0) break;
    }
    text = `${text.slice(0, start)} ${text.slice(end + 1)}`;
    start = text.indexOf('var(');
  }
  return text
    .replace(/calc\(\s*infinity\s*\*\s*1px\s*\)/g, ' ')
    .replace(/\*\s*-1\b/g, ' ');
}

function pageVariables(value) {
  return [...value.matchAll(/var\(\s*(--[\w-]+)/g)]
    .map((match) => match[1])
    .filter((name) => !internalVariable.test(name));
}

function rawLiteral(category, property, text) {
  if (category === 'color') return text.match(colorLiteral)?.[0];
  if (category === 'radius' || category === 'space')
    return firstNonZero(lengths, text);
  if (category === 'border' || category === 'shadow')
    return firstNonZero(lengths, text) ?? text.match(colorLiteral)?.[0];
  if (category === 'motion') {
    const duration = firstNonZero(durations, text);
    // `animation: none` serializes as `… ease 0s …`; a zero-length motion has nothing to tokenize.
    if (duration || /(?<![\d.])0m?s\b/.test(text)) return duration;
    return text.match(easings)?.[0];
  }
  if (category !== 'type') return anyLiteral(text);
  const sized = firstNonZero(lengths, text) ?? firstNonZero(numbers, text);
  if (sized) return sized;
  if (property === 'font-weight')
    return text.match(/\b(?:bold|bolder|lighter)\b/)?.[0];
  if (property === 'font' || property === 'font-family')
    return text.replace(fontKeywords, ' ').match(/["']|[a-z][\w-]*/i)?.[0];
  return null;
}

function anyLiteral(text) {
  return (
    text.match(colorLiteral)?.[0] ??
    firstNonZero(lengths, text) ??
    firstNonZero(durations, text) ??
    text.match(easings)?.[0] ??
    firstNonZero(numbers, text)
  );
}

function worse(a, b) {
  if (!a) return b;
  if (!b) return a;
  return tokenGapKinds[a].rank >= tokenGapKinds[b].rank ? a : b;
}

// The outermost calc(), clamp(), min() and max() calls in a value.
function mathCalls(value) {
  const calls = [];
  const start = /\b(?:calc|clamp|min|max)\(/g;
  for (let match = start.exec(value); match; match = start.exec(value)) {
    let depth = 0;
    let end = match.index + match[0].length - 1;
    for (; end < value.length; end++) {
      if (value[end] === '(') depth++;
      if (value[end] === ')' && --depth === 0) break;
    }
    calls.push(value.slice(match.index, end + 1));
    start.lastIndex = end + 1;
  }
  return calls;
}

// A raw number inside math that also reads a variable changes that variable,
// so it counts as a changed token, not a hard-coded value.
function classifyValue(category, property, value, resolve) {
  let rest = value;
  let changed = /color-mix\(/.test(value) && value.includes('var(');
  for (const call of mathCalls(value)) {
    if (!call.includes('var(')) continue;
    if (rawLiteral(category, property, removeVars(call))) changed = true;
    rest = rest.replace(call, ' ');
  }
  if (rawLiteral(category, property, removeVars(rest))) return { kind: 'raw' };
  for (const name of pageVariables(value))
    if (resolve(name)) return { kind: 'variable', note: name };
  return changed ? { kind: 'derived' } : null;
}

// A page variable takes the worst kind of its definitions; null means every
// definition is a Nexus token or a neutral value such as `0` or `none`.
function variableResolver(definitions) {
  const resolved = new Map();
  function resolve(name, depth = 0) {
    if (resolved.has(name)) return resolved.get(name);
    const values = definitions.get(name);
    if (!values || depth > 4) return 'variable';
    resolved.set(name, null);
    let kind = null;
    for (const value of values) {
      const gap = classifyValue(null, '', value, (child) =>
        resolve(child, depth + 1)
      );
      kind = worse(kind, gap?.kind ?? null);
    }
    resolved.set(name, kind);
    return kind;
  }
  return resolve;
}

export function classifyDeclaration(property, value, resolve) {
  const category = categories.find(([, pattern]) => pattern.test(property));
  if (!category) return null;
  return classifyValue(category[0], property, value, resolve);
}

function declarations(style) {
  return style.cssText
    .split(/;(?![^(]*\))/)
    .map((part) => {
      const colon = part.indexOf(':');
      return [
        part.slice(0, colon).trim(),
        part
          .slice(colon + 1)
          .replace(/!important/, '')
          .trim(),
      ];
    })
    .filter(([property, value]) => property && value);
}

function* styleRules(rules, parentSelector, layer) {
  for (const rule of rules) {
    const type = rule.constructor.name;
    if (type === 'CSSKeyframesRule') continue;
    if (type === 'CSSNestedDeclarations') {
      yield { selector: parentSelector, style: rule.style, layer };
      continue;
    }
    if (type === 'CSSStyleRule') {
      const selector = !parentSelector
        ? rule.selectorText
        : rule.selectorText.includes('&')
          ? rule.selectorText.replaceAll('&', `:is(${parentSelector})`)
          : `:is(${parentSelector}) ${rule.selectorText}`;
      yield { selector, style: rule.style, layer };
      if (rule.cssRules.length)
        yield* styleRules(rule.cssRules, selector, layer);
      continue;
    }
    if (rule.cssRules)
      yield* styleRules(
        rule.cssRules,
        parentSelector,
        type === 'CSSLayerBlockRule' ? rule.name : layer
      );
  }
}

function sheetPath(sheet) {
  return sheet.ownerNode?.dataset?.viteDevId ?? '';
}

function readRules(sheet) {
  try {
    return [...styleRules(sheet.cssRules)];
  } catch {
    return [];
  }
}

// Utility classes in @nxds/react's own CSS are the ones Nexus components use.
function nexusClasses(doc) {
  const sheet = [...doc.styleSheets].find((candidate) =>
    sheetPath(candidate).endsWith('/packages/react/src/index.css')
  );
  return new Set(
    sheet
      ? readRules(sheet)
          .filter(({ layer }) => layer === 'utilities')
          .map(({ selector }) => selector)
      : []
  );
}

const pageDeclarations = new WeakMap();

// The page's own CSS: every dock-story file, and the utility classes in
// page.css that only the page uses.
function pageRules(sheet, nexus) {
  if (pageDeclarations.has(sheet)) return pageDeclarations.get(sheet);
  const path = sheetPath(sheet);
  const file = path.split('/').pop();
  const found = [];
  if (path.includes('/output/dock-story/') && file !== 'source-audit.css') {
    for (const { selector, style, layer } of readRules(sheet)) {
      if (file === 'page.css' && layer !== 'utilities') continue;
      if (nexus.has(selector)) continue;
      const source =
        layer === 'utilities'
          ? `class ${selector.replace(/^\./, '').replace(/\\/g, '').split(':is(')[0]}`
          : `${file} ${selector.slice(0, 48)}`;
      for (const [property, value] of declarations(style))
        if (!property.startsWith('--'))
          found.push({
            selector: selector.replace(statePseudo, ''),
            property,
            value,
            source,
          });
    }
  }
  pageDeclarations.set(sheet, found);
  return found;
}

function variableDefinitions(doc) {
  const definitions = new Map();
  function add(property, value) {
    if (!property.startsWith('--') || internalVariable.test(property)) return;
    if (!definitions.has(property)) definitions.set(property, new Set());
    definitions.get(property).add(value);
  }
  for (const sheet of doc.styleSheets)
    for (const { style } of readRules(sheet))
      for (const [property, value] of declarations(style)) add(property, value);
  doc.querySelectorAll('[style]').forEach((element) => {
    for (const [property, value] of declarations(element.style))
      add(property, value);
  });
  return definitions;
}

function describe(gap, property, value, source) {
  const note = gap.note ? ` (${gap.note})` : '';
  return `${tokenGapKinds[gap.kind].label}${note} · ${property}: ${value} · ${source}`;
}

function addGap(found, element, kind, text) {
  if (element.closest(ignored) || !element.getClientRects().length) return;
  const entry = found.get(element) ?? { kind, texts: new Set() };
  entry.kind = worse(entry.kind, kind);
  entry.texts.add(text);
  found.set(element, entry);
}

export function findTokenGaps(documents) {
  const found = new Map();
  for (const doc of documents) {
    const nexus = nexusClasses(doc);
    const resolve = variableResolver(variableDefinitions(doc));
    for (const sheet of doc.styleSheets) {
      for (const { selector, property, value, source } of pageRules(
        sheet,
        nexus
      )) {
        const gap = classifyDeclaration(property, value, resolve);
        if (!gap) continue;
        let elements = [];
        try {
          elements = doc.querySelectorAll(selector);
        } catch {
          continue;
        }
        const text = describe(gap, property, value, source);
        elements.forEach((element) => addGap(found, element, gap.kind, text));
      }
    }
    doc.querySelectorAll('[style]').forEach((element) => {
      for (const [property, value] of declarations(element.style)) {
        if (property.startsWith('--')) continue;
        const gap = classifyDeclaration(property, value, resolve);
        if (gap)
          addGap(
            found,
            element,
            gap.kind,
            describe(gap, property, value, 'inline style')
          );
      }
    });
    doc.querySelectorAll('[fill], [stroke]').forEach((element) => {
      for (const property of ['fill', 'stroke']) {
        const value = element.getAttribute(property);
        const gap = value && classifyDeclaration(property, value, resolve);
        if (gap)
          addGap(
            found,
            element,
            gap.kind,
            describe(gap, property, value, 'SVG attribute')
          );
      }
    });
  }
  return found;
}
