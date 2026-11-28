// `nxds-cli` copies a component's `*.stories.*` file into the app, where it
// becomes the app's own. So that file may hold only what still passes after
// the app restyles the component, on the app's own Storybook: examples, and
// tests of roles, names, keyboard, focus, callbacks, ARIA and data attributes.
// Everything this rule reports belongs in the `*.test.stories.*` file beside
// it, which never ships.

const DEFAULT_STORYBOOK_IMPORTS = ['@storybook/react-vite', 'storybook/test'];
const DEFAULT_ICON_IMPORTS = ['@phosphor-icons/react/ssr'];

const STORYBOOK_SOURCE = /^(?:storybook(?:\/|$)|@storybook\/)/;
const ICON_SOURCE =
  /^(?:@phosphor-icons\/|lucide-react(?:\/|$)|@lucide\/|@tabler\/icons-|@hugeicons\/|@remixicon\/)/;
const HELPER_SOURCE = /(?:^|\/)stories\/support(?:\/|$)/;

const MEASURING_CALLS = new Set([
  'getComputedStyle',
  'getBoundingClientRect',
  'getClientRects',
  'toHaveStyle',
]);

const MEASURING_PROPERTIES = new Set([
  'offsetLeft',
  'offsetTop',
  'offsetWidth',
  'offsetHeight',
  'clientLeft',
  'clientTop',
  'clientWidth',
  'clientHeight',
  'scrollWidth',
  'scrollHeight',
]);

const SELECTOR_CALLS = new Set([
  'querySelector',
  'querySelectorAll',
  'closest',
  'matches',
]);

const CLASS_PROPERTIES = new Set(['classList', 'className']);
const ATTRIBUTE_CALLS = new Set(['toHaveAttribute', 'getAttribute']);

const ASSET_ATTRIBUTES = new Set(['src', 'srcSet', 'poster']);
const MARKUP_ASSET = /\bsrc="(\/(?!\/)[^"]*)"/;

const TYPE_WRAPPERS = new Set([
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
]);

function unwrap(node) {
  let current = node;
  while (current && TYPE_WRAPPERS.has(current.type)) {
    current = current.expression;
  }
  return current;
}

/** The name a call's callee ends in: `toHaveClass` for `expect(x).not.toHaveClass`. */
function calleeName(call) {
  const { callee } = call;
  if (callee.type === 'Identifier') return callee.name;
  if (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.property.type === 'Identifier'
  ) {
    return callee.property.name;
  }
  return null;
}

/** A string literal's or a plain template's text, else null. */
function staticText(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  if (node?.type === 'TemplateLiteral') {
    return node.quasis.map((quasi) => quasi.value.cooked ?? '').join('');
  }
  return null;
}

/** Whether a selector names a class, ignoring dots inside `[…]` and strings. */
function hasClassSelector(selector) {
  const bare = selector
    .replace(/\[[^\]]*\]/g, '')
    .replace(/(["'])(?:\\.|(?!\1).)*\1/g, '');
  return /\.[A-Za-z_\\-]/.test(bare);
}

/** A path served from the Storybook's own static folder: `/avatars/ada.svg`. */
function isAssetPath(value) {
  return /^\/(?!\/)/.test(value);
}

/** Whether a node sits in a `className` attribute's value, which passes a class on. */
function inClassNameAttribute(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === 'JSXAttribute') {
      return current.name.name === 'className';
    }
  }
  return false;
}

function propertyName(property) {
  if (property.type !== 'Property' || property.computed) return null;
  if (property.key.type === 'Identifier') return property.key.name;
  return typeof property.key.value === 'string' ? property.key.value : null;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep a story file that ships to apps free of what only passes in nxds’s own Storybook.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          storybookImports: { type: 'array', items: { type: 'string' } },
          iconImports: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      classAssertion:
        '`{{name}}` pins nxds’s own classes, so it fails once an app restyles the component. Move it to the test stories file.',
      measurement:
        '`{{name}}` reads layout or computed CSS, which depends on the app’s viewport, fonts and Storybook setup. Move it to the test stories file.',
      classSelector:
        'Finding an element by class depends on nxds’s own classes. Find it by role, label, text, `data-slot` or test id.',
      helperImport:
        '`{{source}}` is a test helper that doesn’t ship. Use it in the test stories file.',
      bundlerImport:
        '`{{source}}` needs a bundler feature an app’s Storybook may lack. Use it in the test stories file.',
      storybookImport:
        'A shipped story imports only {{allowed}} from Storybook. `{{source}}` stays in the test stories file.',
      iconImport:
        'Import story icons from {{allowed}}, which the catalog rewrites for the app’s icon library. `{{source}}` would be missing in the app.',
      assetPath:
        '`{{value}}` is served by nxds’s own Storybook, so it is missing in an app. Use story data.',
      title:
        'A shipped story has no `title`. Storybook names it from its file path, so it can’t collide with the app’s own stories.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const storybookImports =
      options.storybookImports ?? DEFAULT_STORYBOOK_IMPORTS;
    const iconImports = options.iconImports ?? DEFAULT_ICON_IMPORTS;
    const quoted = (sources) =>
      sources.map((source) => `\`${source}\``).join(' and ');

    function reportImport(node, source) {
      if (HELPER_SOURCE.test(source)) {
        context.report({ node, messageId: 'helperImport', data: { source } });
        return;
      }
      if (source.includes('?')) {
        context.report({ node, messageId: 'bundlerImport', data: { source } });
        return;
      }
      if (STORYBOOK_SOURCE.test(source) && !storybookImports.includes(source)) {
        context.report({
          node,
          messageId: 'storybookImport',
          data: { source, allowed: quoted(storybookImports) },
        });
        return;
      }
      if (ICON_SOURCE.test(source) && !iconImports.includes(source)) {
        context.report({
          node,
          messageId: 'iconImport',
          data: { source, allowed: quoted(iconImports) },
        });
      }
    }

    function reportAsset(node, value) {
      context.report({ node, messageId: 'assetPath', data: { value } });
    }

    function reportMarkupAsset(node, markup) {
      const match = markup.match(MARKUP_ASSET);
      if (match) reportAsset(node, match[1]);
    }

    /** The object a default export names: the literal, or the `meta` it reads. */
    function metaObject(declaration) {
      const node = unwrap(declaration);
      if (node.type === 'ObjectExpression') return node;
      if (node.type !== 'Identifier') return null;
      const variable = context.sourceCode
        .getScope(node)
        .set.get(node.name)
        ?.defs.find(
          (definition) => definition.node.type === 'VariableDeclarator'
        );
      const init = unwrap(variable?.node.init);
      return init?.type === 'ObjectExpression' ? init : null;
    }

    return {
      ImportDeclaration(node) {
        reportImport(node.source, node.source.value);
      },

      ExportDefaultDeclaration(node) {
        const title = metaObject(node.declaration)?.properties.find(
          (property) => propertyName(property) === 'title'
        );
        if (title) context.report({ node: title, messageId: 'title' });
      },

      CallExpression(node) {
        const name = calleeName(node);
        if (name === 'toHaveClass') {
          context.report({ node, messageId: 'classAssertion', data: { name } });
          return;
        }
        if (
          ATTRIBUTE_CALLS.has(name) &&
          staticText(node.arguments[0]) === 'class'
        ) {
          context.report({
            node,
            messageId: 'classAssertion',
            data: { name: `${name}('class')` },
          });
          return;
        }
        if (MEASURING_CALLS.has(name)) {
          context.report({ node, messageId: 'measurement', data: { name } });
          return;
        }
        if (name === 'getElementsByClassName') {
          context.report({ node, messageId: 'classSelector' });
          return;
        }
        if (!SELECTOR_CALLS.has(name)) return;
        const selector = staticText(node.arguments[0]);
        if (selector !== null && hasClassSelector(selector)) {
          context.report({
            node: node.arguments[0],
            messageId: 'classSelector',
          });
        }
      },

      MemberExpression(node) {
        if (node.computed || node.property.type !== 'Identifier') return;
        const { name } = node.property;
        if (MEASURING_PROPERTIES.has(name)) {
          context.report({
            node: node.property,
            messageId: 'measurement',
            data: { name },
          });
          return;
        }
        if (CLASS_PROPERTIES.has(name) && !inClassNameAttribute(node)) {
          context.report({
            node: node.property,
            messageId: 'classAssertion',
            data: { name },
          });
        }
      },

      JSXAttribute(node) {
        if (!ASSET_ATTRIBUTES.has(node.name.name)) return;
        const value =
          node.value?.type === 'JSXExpressionContainer'
            ? staticText(node.value.expression)
            : staticText(node.value);
        if (value !== null && isAssetPath(value)) reportAsset(node, value);
      },

      Property(node) {
        if (!ASSET_ATTRIBUTES.has(propertyName(node))) return;
        const value = staticText(node.value);
        if (value !== null && isAssetPath(value)) reportAsset(node, value);
      },

      // A Vue story writes its markup in a string.
      Literal(node) {
        if (typeof node.value === 'string') reportMarkupAsset(node, node.value);
      },

      TemplateElement(node) {
        reportMarkupAsset(node, node.value.cooked ?? '');
      },
    };
  },
};
