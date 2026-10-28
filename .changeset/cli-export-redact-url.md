---
'nxds-cli': patch
---

`nxds-cli export` prints registry and tarball URLs without their user name, password or query string. It refuses an `--npm-registry` URL that is not http or https, or that has a user name, password, query or fragment. nxds-cli sends no registry login. For a private registry, unpack the tarball from `npm pack @nxds/claude-design` and pass its `package` folder with `--source`.
