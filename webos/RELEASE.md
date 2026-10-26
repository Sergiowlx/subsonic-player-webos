# webOS Release Guide

## Release process

Keep `package.json` and `webos/appinfo.json` on the same semantic version. The current release is `2.1.0`.

After merging the release commit into `main`, create and push its matching tag:

```bash
git tag v2.1.0
git push origin main v2.1.0
```

Pushing a `v*` tag runs `.github/workflows/build-webos-ipk.yml`. The workflow checks that the tag matches the app version, builds the static webOS app, packages the IPK, generates the webOSbrew manifest, and publishes a GitHub release with both files attached. It also keeps an Actions artifact for seven days.

For a manual package build, install the LG webOS SDK and run:

```bash
yarn build:webos
```

The package is named `com.subsonic.player_<version>_all.ipk`. Install and validate that package on the target LG TV before describing the release as verified on-device.
