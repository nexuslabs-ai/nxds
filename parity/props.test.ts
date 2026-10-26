import type {
  ComponentEntry,
  PropEntry,
  PropsFile,
} from '@nxds/source-model/props-entries.ts';
import {
  reactPackageProps,
  reactPropsFiles,
} from '@nxds/source-model/react-props.mjs';
import {
  componentsRoot,
  vueComponentsRoot,
} from '@nxds/source-model/roots.mjs';
import {
  componentParts,
  createVueProgram,
  ownEvents,
  parseFile,
  partEntry,
  type VueProgram,
} from '@nxds/source-model/vue-sources.ts';
import path from 'node:path';
import ts from 'typescript';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  reactOnlyInheritedProps,
  rebuiltPackages,
  shared,
  twinPackages,
  vueOnlyApi,
} from './parity.ts';

interface VuePartApi {
  entry: ComponentEntry;
  /** Named slots; the default slot is `hasDefaultSlot`. */
  slots: string[];
  hasDefaultSlot: boolean;
  events: string[];
  inheritsAsChild: boolean;
  /** The `class` prop's description. Vue reads `class` as a global prop, so it isn't in `entry`. */
  classDescription: string | undefined;
  /** Every prop, slot and event name, including those Vue inherits from Reka and its global `class` and `style`. */
  allApi: Set<string>;
}

interface Contract {
  react: Map<string, ComponentEntry>;
  vue: Map<string, VuePartApi>;
  /** Parts Vue re-exports from Reka, which have no SFC to read. */
  vueReExports: Set<string>;
}

const REACT_NODE = /^React(?:\.ReactNode|Node)$/;
/** A `render{Name}` callback prop, which a third-party API forces on React. */
const RENDER_PROP = /^render[A-Z]/;
const RETURNS_REACT_NODE = /=> (?:React\.)?ReactNode\)?$/;

/** Vue reads a hyphenated prop such as `aria-label` as `ariaLabel`. */
const camel = (name: string) =>
  name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

const kebab = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** A type as its union members, sorted, without `null` or `undefined`. */
function members(type: string) {
  return type
    .split('|')
    .map((member) => member.trim())
    .filter((member) => member && member !== 'null' && member !== 'undefined')
    .sort();
}

/** Names a Vue component folder re-exports straight from a package. */
function packageReExports(slug: string) {
  const index = parseFile(path.join(vueComponentsRoot, slug, 'index.ts'));
  return index.statements.flatMap((statement) => {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text.startsWith('.') ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    ) {
      return [];
    }
    return statement.exportClause.elements
      .filter((element) => !element.isTypeOnly)
      .map((element) => element.name.text);
  });
}

function vueContract(vueProgram: VueProgram, slug: string) {
  const parts = componentParts(vueProgram, slug).map(
    (part): VuePartApi => ({
      entry: partEntry(vueProgram, part),
      slots: part.meta.slots
        .map((slot) => slot.name)
        .filter((name) => name !== 'default'),
      hasDefaultSlot: part.meta.slots.some((slot) => slot.name === 'default'),
      events: ownEvents(vueProgram, part),
      inheritsAsChild: part.meta.props.some((prop) => prop.name === 'asChild'),
      classDescription: part.meta.props.find((prop) => prop.name === 'class')
        ?.description,
      allApi: new Set([
        ...part.meta.props.map((prop) => prop.name),
        ...part.meta.slots.map((slot) => slot.name),
        ...part.meta.events.map((event) => event.name),
      ]),
    })
  );
  return new Map(parts.map((part) => [part.entry.name, part]));
}

interface VueName {
  prop: PropEntry;
  kind: 'defaultSlot' | 'slot' | 'emit' | 'asChild' | 'class' | 'prop';
  vueName: string;
}

/**
 * The Vue API each React prop maps to: the default slot for `children`, a
 * kebab-case slot for a `ReactNode` prop, a scoped slot for a `render{Name}`
 * callback, an emit, `as-child`, `class` for `className`, or the same prop in
 * camelCase.
 */
function vueNames(react: ComponentEntry) {
  return react.props.map((prop): VueName => {
    if (prop.name === 'children' && REACT_NODE.test(prop.type)) {
      return { prop, kind: 'defaultSlot', vueName: 'default' };
    }
    if (REACT_NODE.test(prop.type)) {
      return { prop, kind: 'slot', vueName: kebab(prop.name) };
    }
    if (RENDER_PROP.test(prop.name) && RETURNS_REACT_NODE.test(prop.type)) {
      const name = prop.name.slice('render'.length);
      return { prop, kind: 'slot', vueName: kebab(name) };
    }
    if (prop.name === 'asChild') {
      return { prop, kind: 'asChild', vueName: prop.name };
    }
    if (prop.name === 'className') {
      return { prop, kind: 'class', vueName: 'class' };
    }
    if (/^on[A-Z]/.test(prop.name)) {
      return { prop, kind: 'emit', vueName: kebab(prop.name.slice(2)) };
    }
    return { prop, kind: 'prop', vueName: camel(prop.name) };
  });
}

/** The Vue names the React part's props map to. */
function mappedNames(react: ComponentEntry) {
  return new Set<string>(vueNames(react).map(({ vueName }) => vueName));
}

/** Every way the Vue part's API differs from the React part's. */
function partDrift(react: ComponentEntry, vue: VuePartApi) {
  const drift: string[] = [];
  const at = (name: string) => `${react.name}.${name}`;
  const vueProps = new Map(
    vue.entry.props
      .filter((prop) => prop.name !== 'class')
      .map((prop) => [prop.name, prop])
  );
  for (const { prop, kind, vueName } of vueNames(react)) {
    if (kind === 'defaultSlot') {
      if (!vue.hasDefaultSlot) drift.push(`${at(prop.name)}: no default slot`);
      continue;
    }
    if (kind === 'slot') {
      if (!vue.slots.includes(vueName)) {
        drift.push(`${at(prop.name)}: no #${vueName} slot`);
      }
      continue;
    }
    if (kind === 'asChild') {
      if (!vue.inheritsAsChild) drift.push(`${at(prop.name)}: missing`);
      continue;
    }
    if (kind === 'class') {
      if (vue.classDescription !== prop.description) {
        drift.push(
          `${at(prop.name)}: description "${prop.description}" vs "${vue.classDescription}"`
        );
      }
      continue;
    }
    if (kind === 'emit') {
      if (!vue.events.includes(vueName)) {
        drift.push(`${at(prop.name)}: no '${vueName}' emit`);
      }
      continue;
    }
    const twin = vueProps.get(vueName);
    if (!twin) {
      drift.push(`${at(prop.name)}: missing`);
      continue;
    }
    drift.push(...propDrift(at(prop.name), prop, twin));
  }

  const mapped = mappedNames(react);
  const vueOnly = [...vueProps.keys(), ...vue.slots, ...vue.events].filter(
    (name) => !mapped.has(name) && !(at(name) in vueOnlyApi)
  );
  drift.push(...vueOnly.map((name) => `${at(name)}: Vue only`));
  return drift;
}

function propDrift(at: string, react: PropEntry, vue: PropEntry) {
  const drift: string[] = [];
  if (members(react.type).join(' | ') !== members(vue.type).join(' | ')) {
    drift.push(`${at}: type ${react.type} vs ${vue.type}`);
  }
  if (react.defaultValue !== vue.defaultValue) {
    drift.push(`${at}: default ${react.defaultValue} vs ${vue.defaultValue}`);
  }
  if (react.required !== vue.required) drift.push(`${at}: required`);
  if (react.description !== vue.description) {
    drift.push(
      `${at}: description "${react.description}" vs "${vue.description}"`
    );
  }
  return drift;
}

/** Each interface's property names in `file`, by interface name. */
function interfaceKeys(file: string) {
  const source = parseFile(file);
  const keys = new Map<string, string[]>();
  for (const statement of source.statements) {
    if (!ts.isInterfaceDeclaration(statement)) continue;
    keys.set(
      statement.name.text,
      statement.members.map((member) => member.name?.getText() ?? '').sort()
    );
  }
  return keys;
}

/** The Vue names a React prop could take: the same prop, a slot or an emit. */
function vueCandidates(name: string) {
  if (name === 'children') return ['default'];
  if (name === 'className') return ['class'];
  const candidates = [camel(name), kebab(name)];
  if (/^on[A-Z]/.test(name)) candidates.push(kebab(name.slice(2)));
  return candidates;
}

const contracts = new Map<string, Contract>();
let packageProps: Map<string, Map<string, string[]>>;

beforeAll(() => {
  const vueProgram = createVueProgram();
  const reactFiles = new Map(
    (reactPropsFiles() as PropsFile[]).map((file) => [file.slug, file])
  );
  for (const slug of shared) {
    const react = reactFiles.get(slug);
    if (!react) throw new Error(`@nxds/react has no props file for ${slug}.`);
    contracts.set(slug, {
      react: new Map(react.components.map((entry) => [entry.name, entry])),
      vue: vueContract(vueProgram, slug),
      vueReExports: new Set(packageReExports(slug)),
    });
  }
  packageProps = reactPackageProps();
}, 120_000);

describe('component contract', () => {
  it.each(shared)('%s exports the same parts', (slug) => {
    const { react, vue, vueReExports } = contracts.get(slug)!;
    const vueParts = new Set([...vue.keys(), ...vueReExports]);
    expect(react.size).toBeGreaterThan(0);
    expect([...vueParts].sort()).toEqual([...react.keys()].sort());
  });

  it.each(shared)('%s parts take the same props, slots and events', (slug) => {
    const { react, vue } = contracts.get(slug)!;
    const drift = [...vue].flatMap(([name, part]) => {
      const twin = react.get(name);
      return twin ? partDrift(twin, part) : [];
    });
    expect(drift).toEqual([]);
  });

  it('allows only Vue-only API that Vue declares and React lacks', () => {
    const vueOnly = new Set(
      [...contracts.values()].flatMap(({ react, vue }) =>
        [...vue].flatMap(([name, part]) => {
          const reactPart = react.get(name);
          const mapped = reactPart ? mappedNames(reactPart) : new Set<string>();
          return [
            ...part.entry.props.map((prop) => prop.name),
            ...part.slots,
            ...part.events,
          ]
            .filter((api) => !mapped.has(api))
            .map((api) => `${name}.${api}`);
        })
      )
    );
    expect(Object.keys(vueOnlyApi).filter((key) => !vueOnly.has(key))).toEqual(
      []
    );
  });
});

describe('inherited contract', () => {
  /** The props a React part inherits from a rebuilt package. */
  function rebuiltProps(name: string) {
    const props = packageProps.get(name);
    return [
      ...new Set(rebuiltPackages.flatMap((pkg) => props?.get(pkg) ?? [])),
    ];
  }

  /** `{Part}.{prop}` for each prop a React part inherits from a rebuilt package that its Vue twin has no name for. */
  function reactOnly() {
    return [...contracts.values()].flatMap(({ vue }) =>
      [...vue].flatMap(([name, part]) =>
        rebuiltProps(name)
          .filter((prop) =>
            vueCandidates(prop).every((api) => !part.allApi.has(api))
          )
          .map((prop) => `${name}.${prop}`)
      )
    );
  }

  /** Each package a shared React part takes props from, with the part's name. */
  function partPackages() {
    return [...contracts.values()].flatMap(({ react }) =>
      [...react.keys()].flatMap((part) =>
        [...(packageProps.get(part)?.keys() ?? [])].map((pkg) => ({
          part,
          pkg,
        }))
      )
    );
  }

  /** Whether a package is `entry`, or sits in the scope `entry` names. */
  const isPackage = (pkg: string, entry: string) =>
    pkg === entry || pkg.startsWith(`${entry}/`);

  const sortedPackages = [...twinPackages, ...rebuiltPackages];

  it('sorts each package a React part takes props from as a twin or rebuilt', () => {
    expect(
      partPackages()
        .filter(
          ({ pkg }) => !sortedPackages.some((entry) => isPackage(pkg, entry))
        )
        .map(({ part, pkg }) => `${part}: ${pkg}`)
    ).toEqual([]);
  });

  it('sorts only packages a React part takes props from', () => {
    const packages = partPackages().map(({ pkg }) => pkg);
    expect(
      sortedPackages.filter(
        (entry) => !packages.some((pkg) => isPackage(pkg, entry))
      )
    ).toEqual([]);
  });

  it('records every inherited prop the Vue part lacks', () => {
    expect(
      reactOnly().filter((key) => !(key in reactOnlyInheritedProps))
    ).toEqual([]);
  });

  it('records only inherited props the Vue part lacks', () => {
    const lacking = new Set(reactOnly());
    expect(
      Object.keys(reactOnlyInheritedProps).filter((key) => !lacking.has(key))
    ).toEqual([]);
  });
});

describe('composable contract', () => {
  it('useMessageScroller returns what the React hook returns', () => {
    const interfaceName = 'MessageScrollerContextValue';
    const react = interfaceKeys(
      path.join(componentsRoot, 'message-scroller', 'message-scroller.tsx')
    ).get(interfaceName);
    const vue = interfaceKeys(
      path.join(vueComponentsRoot, 'message-scroller', 'index.ts')
    ).get(interfaceName);
    expect(react?.length).toBeGreaterThan(0);
    expect(vue).toEqual(react);
  });
});

describe('appearance contract', () => {
  const react = interfaceKeys(
    path.join(componentsRoot, 'appearance', 'provider', 'provider.tsx')
  );
  const vue = interfaceKeys(
    path.join(vueComponentsRoot, 'appearance', 'appearance.ts')
  );

  it('the Vue plugin takes the options the React provider takes as props', () => {
    const providerProps = react
      .get('NxdsAppearanceProviderProps')
      ?.filter((key) => key !== 'children');
    expect(providerProps?.length).toBeGreaterThan(0);
    expect(vue.get('NxdsAppearanceOptions')).toEqual(providerProps);
  });

  it('useNxdsAppearance returns what the React context holds', () => {
    const context = react.get('NxdsAppearanceContextValue');
    expect(context?.length).toBeGreaterThan(0);
    expect(vue.get('NxdsAppearance')).toEqual(context);
  });
});
