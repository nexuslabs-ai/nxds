import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..'
);
export const reactRoot = path.join(repoRoot, 'packages', 'react');
export const reactSrc = path.join(reactRoot, 'src');
export const componentsRoot = path.join(reactSrc, 'components');
export const blocksRoot = path.join(reactSrc, 'blocks');
// The files Storybook serves at `/`, such as the `/avatars/*.svg` stories show.
export const reactStaticRoot = path.join(reactRoot, '.storybook', 'public');
export const react18Root = path.join(repoRoot, 'packages', 'react-18');
export const react18Src = path.join(react18Root, 'src');
export const vueRoot = path.join(repoRoot, 'packages', 'vue');
export const vueSrc = path.join(vueRoot, 'src');
export const vueComponentsRoot = path.join(vueSrc, 'components');
export const angularRoot = path.join(repoRoot, 'packages', 'angular');
export const angularSrc = path.join(angularRoot, 'src');
export const angularComponentsRoot = path.join(angularSrc, 'components');

export function toRepoPath(absolutePath) {
  return path.relative(repoRoot, absolutePath).split(path.sep).join('/');
}

export function isUnder(filePath, directory) {
  const relative = path.relative(directory, filePath);
  return (
    relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

/**
 * The exported component whose folder under `componentsRoot` holds `file`, or
 * null. A Vue or Angular component is its whole folder, so any file in it
 * links the component.
 */
export function componentFolderSlug(componentsRoot, file, exported) {
  if (!isUnder(file, componentsRoot)) return null;
  const [slug] = path.relative(componentsRoot, file).split(path.sep);
  return slug !== undefined && exported.has(slug) ? slug : null;
}
