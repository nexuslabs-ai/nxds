import { LookComparison } from '../_look-comparison';

import { MaterialUiReference } from './material-ui';
import { MaterialScene } from './scene';

/** The Material look, live: the screen built with nxds, over the same screen built with Material UI. */
export function MaterialLookPreview() {
  return (
    <LookComparison
      library="Material UI"
      nxds={<MaterialScene />}
      reference={<MaterialUiReference />}
    />
  );
}
