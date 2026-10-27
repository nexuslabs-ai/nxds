import { defaultFilter } from 'cmdk';
import { describe, expect, it } from 'vitest';

import { commandScore } from '../packages/vue/src/lib/command-score.ts';

// Items and searches from the Command, Combobox and MultiSelect stories.
const items: [value: string, keywords?: string[]][] = [
  ['Calendar'],
  ['Search Emoji'],
  ['Calculator'],
  ['open recent'],
  ['open'],
  ['invite-teammate', ['members', 'users', 'people']],
  ['open-billing', ['invoice', 'payment', 'card']],
  ['profile', ['account', 'user']],
  ['settings', ['preferences', 'configuration']],
  ['next', ['Next.js']],
  ['sveltekit', ['SvelteKit']],
  ['nuxt', ['Nuxt.js']],
  ['remix', ['Remix']],
  ['astro', ['Astro']],
  ['next', ['Next.js — the React framework for the web']],
];

const searches = [
  'c',
  'cal',
  'CALC',
  'emj',
  'open',
  'op re',
  'bill',
  'inv',
  'user',
  'pref',
  'next.js',
  'js',
  'kit',
  'stro',
  'web',
  'xyz',
  'set-',
];

describe('commandScore', () => {
  it.each(searches)("scores '%s' as cmdk's defaultFilter does", (search) => {
    expect(
      items.map(([value, keywords]) => commandScore(value, search, keywords))
    ).toEqual(
      items.map(([value, keywords]) => defaultFilter(value, search, keywords))
    );
  });
});
