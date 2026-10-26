import type spacingTokens from '../../tokens/semantic/spacing-default.json';

// A JSON key spells a half step with `_` (`0_5`); a step spells it `0.5`.
type StepName<Key> = Key extends `${infer Whole}_${infer Half}`
  ? `${Whole}.${Half}`
  : Key;
type NumberOf<Name> = Name extends `${infer Step extends number}`
  ? Step
  : never;

/** A step on the spacing scale. Each one has its own `--nx-spacing-*` variable. */
export type SpacingStep = NumberOf<
  StepName<keyof (typeof spacingTokens)['spacing']>
>;
