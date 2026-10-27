import { UsageError } from './errors';

/** `value` as a URL, if it is an http or https one. */
export function httpUrl(value: string) {
  const url = URL.canParse(value) ? new URL(value) : undefined;
  return url?.protocol === 'http:' || url?.protocol === 'https:'
    ? url
    : undefined;
}

/**
 * Refuses a registry URL that is not a valid http or https URL, or that has a
 * user name, password, query or fragment. Each error ends with
 * `privateRegistryHint`, which says what to do instead.
 */
export function assertRegistryUrl(
  flag: string,
  value: string,
  privateRegistryHint: string
) {
  const url = httpUrl(value);
  if (!url) {
    throw new UsageError(
      `${flag} is not a valid http or https URL. ${privateRegistryHint}`
    );
  }
  if (url.username || url.password || /[?#]/.test(value)) {
    throw new UsageError(
      `${flag} can't include a user name, password, query or fragment. nxds-cli sends no registry login, and it adds file paths to the URL. ${privateRegistryHint}`
    );
  }
}
