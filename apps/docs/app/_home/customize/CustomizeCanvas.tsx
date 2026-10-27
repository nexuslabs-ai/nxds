import { ComponentWall } from './ComponentWall';

/** The Customize canvas: the component wall, in the page's own appearance. */
export function CustomizeCanvas() {
  return (
    <div className="nx:preview-fade">
      <ComponentWall />
    </div>
  );
}
