import {
  angularComponentDocs,
  angularDemos,
} from '../../generated/angular/docs';
import { vueComponentDocs, vueDemos } from '../../generated/vue/docs';

import type { CodeSampleLanguage } from './code-sample';
import type { FrameworkComponentDocs, FrameworkDemo } from './framework-docs';
import type { Framework } from './frameworks';

/** A framework the docs show beside React, from its package's docs stories. */
export type OtherFramework = Exclude<Framework, 'react'>;

/** Each other framework's component docs, demos and the language its demo files are in. */
export const FRAMEWORK_DOCS: Record<
  OtherFramework,
  {
    docs: Record<string, FrameworkComponentDocs>;
    demos: Record<string, FrameworkDemo>;
    lang: CodeSampleLanguage;
  }
> = {
  vue: { docs: vueComponentDocs, demos: vueDemos, lang: 'vue' },
  angular: {
    docs: angularComponentDocs,
    demos: angularDemos,
    lang: 'angular-ts',
  },
};

export const OTHER_FRAMEWORKS = Object.keys(FRAMEWORK_DOCS) as OtherFramework[];
