import { UsageError } from './errors';

/** `value` as a URL, if it is an http or https one. */
export function httpUrl(value: string) {
  const url = URL.canParse(value) ? new URL(value) : undefined;
  return url?.protocol === 'http:' || url?.protocol === 'https:'
    ? url
    : undefined;
}

/**
 * Refuses a registry URL that is not http or https, or that has a user name,
 * password, query or fragment. `privateRegistryHint` says what to do instead
 * of a login.
 */
export function assertRegistryUrl(
  flag: string,
  value: string,
  privateRegistryHint: string
) {
  const url = httpUrl(value);
  if (!url) {
    throw new UsageError(`${flag} must be an http or https URL.`);
  }
  if (url.username || url.password || /[?#]/.test(value)) {
    throw new UsageError(
      `${flag} can't include a user name, password, query or fragment. nxds-cli sends no registry login, and it adds file paths to the URL. ${privateRegistryHint}`
    );
  }
}
