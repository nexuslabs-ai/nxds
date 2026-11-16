import { LookComparison } from '../_look-comparison';

import { AntDesignReference } from './ant-design';
import { AntScene } from './scene';

/** The Ant Design look, live: the page built with nxds, over the same page built with Ant Design. */
export function AntLookPreview() {
  return (
    <LookComparison
      library="Ant Design"
      nxds={<AntScene />}
      reference={<AntDesignReference />}
    />
  );
}
