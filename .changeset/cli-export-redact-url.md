---
'nxds-cli': patch
---

`nxds-cli export` prints registry and tarball URLs without their user name, password or query string. It refuses an `--npm-registry` URL that includes a user name or password, or that is not http or https. Put a registry token in `.npmrc` or an environment variable instead.
