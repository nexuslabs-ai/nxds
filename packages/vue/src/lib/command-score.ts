// cmdk's command-score, so Vue's Command matches the same items React's does.
// From cmdk 1.1.1 (MIT, Copyright (c) 2022 Paco Coursey), itself after
// https://github.com/superhuman/command-score (MIT).

const SCORE_CONTINUE_MATCH = 1;
const SCORE_SPACE_WORD_JUMP = 0.9;
const SCORE_NON_SPACE_WORD_JUMP = 0.8;
const SCORE_CHARACTER_JUMP = 0.17;
const SCORE_TRANSPOSITION = 0.1;
const PENALTY_SKIPPED = 0.999;
const PENALTY_CASE_MISMATCH = 0.9999;
const PENALTY_NOT_COMPLETE = 0.99;

const IS_GAP_REGEXP = /[\\/_+.#"@[({&]/;
const COUNT_GAPS_REGEXP = /[\\/_+.#"@[({&]/g;
const IS_SPACE_REGEXP = /[\s-]/;
const COUNT_SPACE_REGEXP = /[\s-]/g;

interface Input {
  string: string;
  abbreviation: string;
  lowerString: string;
  lowerAbbreviation: string;
  memo: Record<string, number>;
}

function scoreFrom(
  input: Input,
  stringIndex: number,
  abbreviationIndex: number
): number {
  const { string, abbreviation, lowerString, lowerAbbreviation, memo } = input;
  if (abbreviationIndex === abbreviation.length) {
    return stringIndex === string.length
      ? SCORE_CONTINUE_MATCH
      : PENALTY_NOT_COMPLETE;
  }

  const key = `${stringIndex},${abbreviationIndex}`;
  const cached = memo[key];
  if (cached !== undefined) return cached;

  const abbreviationChar = lowerAbbreviation.charAt(abbreviationIndex);
  let index = lowerString.indexOf(abbreviationChar, stringIndex);
  let highScore = 0;

  while (index >= 0) {
    let score = scoreFrom(input, index + 1, abbreviationIndex + 1);

    if (score > highScore) {
      if (index === stringIndex) {
        score *= SCORE_CONTINUE_MATCH;
      } else if (IS_GAP_REGEXP.test(string.charAt(index - 1))) {
        score *= SCORE_NON_SPACE_WORD_JUMP;
        const wordBreaks = string
          .slice(stringIndex, index - 1)
          .match(COUNT_GAPS_REGEXP);
        if (wordBreaks && stringIndex > 0) {
          score *= Math.pow(PENALTY_SKIPPED, wordBreaks.length);
        }
      } else if (IS_SPACE_REGEXP.test(string.charAt(index - 1))) {
        score *= SCORE_SPACE_WORD_JUMP;
        const spaceBreaks = string
          .slice(stringIndex, index - 1)
          .match(COUNT_SPACE_REGEXP);
        if (spaceBreaks && stringIndex > 0) {
          score *= Math.pow(PENALTY_SKIPPED, spaceBreaks.length);
        }
      } else {
        score *= SCORE_CHARACTER_JUMP;
        if (stringIndex > 0) {
          score *= Math.pow(PENALTY_SKIPPED, index - stringIndex);
        }
      }

      if (string.charAt(index) !== abbreviation.charAt(abbreviationIndex)) {
        score *= PENALTY_CASE_MISMATCH;
      }
    }

    const nextChar = lowerAbbreviation.charAt(abbreviationIndex + 1);
    if (
      (score < SCORE_TRANSPOSITION &&
        lowerString.charAt(index - 1) === nextChar) ||
      (nextChar === abbreviationChar &&
        lowerString.charAt(index - 1) !== abbreviationChar)
    ) {
      const transposedScore = scoreFrom(
        input,
        index + 1,
        abbreviationIndex + 2
      );
      if (transposedScore * SCORE_TRANSPOSITION > score) {
        score = transposedScore * SCORE_TRANSPOSITION;
      }
    }

    if (score > highScore) highScore = score;
    index = lowerString.indexOf(abbreviationChar, index + 1);
  }

  memo[key] = highScore;
  return highScore;
}

function formatInput(value: string) {
  return value.toLowerCase().replace(COUNT_SPACE_REGEXP, ' ');
}

/** How well `search` matches `value` and its `keywords`, from 0 (no match) to 1. */
export function commandScore(
  value: string,
  search: string,
  keywords: string[] = []
) {
  const string = keywords.length > 0 ? `${value} ${keywords.join(' ')}` : value;
  return scoreFrom(
    {
      string,
      abbreviation: search,
      lowerString: formatInput(string),
      lowerAbbreviation: formatInput(search),
      memo: {},
    },
    0,
    0
  );
}
