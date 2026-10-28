---
'nxds-cli': patch
---

`nxds-cli` refuses a `--registry` or `NXDS_REGISTRY_URL` URL that has a user name, password, query or fragment, so its errors can't print a registry token. nxds-cli sends no registry login. For a private registry, download its `latest.json` and `<version>.json` files to a folder, and pass the folder with `--registry`.
