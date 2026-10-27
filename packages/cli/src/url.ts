import { UsageError } from './errors';

/** `value` as a URL, if it is an http or https one. */
export function httpUrl(value: string) {
  const url = URL.canParse(value) ? new URL(value) : undefined;
  return url?.protocol === 'http:' || url?.protocol === 'https:'
    ? url
    : undefined;
}

/**
 * Refuses a registry URL that is not http or https, or that has a query,
 * fragment, user name or password. `privateRegistry` says what to do instead
 * of a login.
 */
export function assertRegistryUrl(
  flag: string,
  value: string,
  privateRegistry: string
) {
  const url = httpUrl(value);
  if (!url || /[?#]/.test(value)) {
    throw new UsageError(
      `${flag} must be an http or https URL with no query or fragment.`
    );
  }
  if (url.username || url.password) {
    throw new UsageError(
      `${flag} can't include a user name or password, because nxds-cli sends no registry login. ${privateRegistry}`
    );
  }
}
