# webOS Release Guide

## Prerequisites

- webOS SDK installed (for `ares-package`)
- `yarn` installed
- Git repository in clean state

## Release Steps

### 1. Update Version Numbers

Edit two files with the new version (for this redesign, `2.0.0`):

**package.json** (line 95):

```json
"version": "2.0.0"
```

**webos/appinfo.json** (line 4):

```json
"version": "2.0.0"
```

### 2. Build webOS Package

```bash
yarn build:webos
```

This creates: `com.subsonic.player_2.0.0_all.ipk`

### 3. Generate Homebrew Manifest

```bash
yarn manifest
```

This creates: `com.subsonic.player.v2.manifest.json`

### 4. Create GitHub Release

1. Go to: https://github.com/Sergiowlx/subsonic-player-webos/releases/new
2. Click "Choose a tag" → enter `v2.0.0` → "Create new tag"
3. Title: `v2.0.0 — Complete webOS TV interface redesign`
4. Description: Summarize changes (see step 5 for how to generate)
5. Attach both files:
   - `com.subsonic.player_2.0.0_all.ipk`
   - `com.subsonic.player.v2.manifest.json`
6. Click "Publish release"

### 5. Generate Release Notes (Optional)

```bash
git log v1.0.2-webos-legacy.1..HEAD --oneline --no-merges | grep -v dependabot
```

Replace the starting tag with the previous release tag when preparing later releases.

### 6. Commit and Tag

```bash
git add package.json webos/appinfo.json
git commit -m "release: v2.0.0"
git tag v2.0.0
git push origin main v2.0.0
```

## Summary Checklist

- [ ] Update `package.json` version
- [ ] Update `webos/appinfo.json` version
- [ ] Run `yarn build:webos`
- [ ] Run `yarn manifest`
- [ ] Create GitHub release with both files attached
- [ ] Commit, tag, and push
