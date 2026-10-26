# AGENTS.md — Subsonic Player for webOS

Updated: 2026-10-23

## Project purpose and current state

This repository is Sergio's webOS TV fork of the web-based Subsonic Player. It connects to Subsonic-compatible servers, including Navidrome, and packages the client as a webOS IPK.

- Upstream project: https://github.com/VD39/subsonic-player
- This fork: https://github.com/Sergiowlx/subsonic-player-webos
- Current released version: 2.1.0
- webOS application ID: com.subsonic.player
- Target device: LG C1 running webOS 6. The reported TV user agent uses Chromium 79.
- Framework: Nuxt 4, Vue 3, TypeScript, Vite.
- Node version: 20.19.0 from .nvmrc. Dependencies use Yarn Classic 1.22.22.

The v2.1.0 release builds on the TV-oriented interface redesign. It retains the Subsonic client and audio-quality settings while refining navigation, library browsing, playback controls, queue presentation, and webOS 6 compatibility.

Do not bump the app version, create a release, install an IPK on a device, or publish changes unless the user asks for that step.

## Important development rules

1. Keep the regular web client working while making TV changes. Prefer the existing TV-specific components, styles, and runtime detection; when a shared component must change, keep both paths covered.
2. Do not treat a desktop preview as proof of correct webOS rendering. Desktop browser and TV differ in Chromium version, remote key events, focus behavior, codecs, and device scaling.
3. Build all interactive TV features for a remote control. Do not make hover the only way to discover or operate a control. Verify visible focus and directional movement.
4. Preserve the Subsonic/Navidrome API behavior, multi-library filtering, playback state, and the audio-quality settings.
5. Keep static app resources compatible with the webOS file:// launch path. Authentication and TV preferences use local storage because cookie behavior is not reliable there.
6. Do not refresh snapshots blindly. The v2 redesign intentionally changed many snapshots; review snapshot diffs when a UI change is intentional.
7. Keep release version fields aligned when the user requests a release: package.json, webos/appinfo.json, and any generated manifest/IPK filename.

## Architecture map

- pages/: Nuxt routes for Discover, search, library, albums, artists, playlists, podcasts, genres, queue, login, and media detail pages.
- layouts/default.vue: shared app shell, top navigation, playback bar, and route content.
- components/Atoms, components/Molecules, components/Organisms: reusable UI pieces, player, lists, cards, navigation, and TV-specific library cards.
- composables/: API, authentication, library, album, artist, playlist, search, audio player, playback state, and TV preferences.
- utils/api/: endpoint-specific request and merge logic.
- utils/Formatters/: converts Subsonic responses into UI models.
- utils/webos.ts: file-protocol and TV-preview detection plus local-storage authentication helpers.
- plugins/webos-input.client.ts: webOS/keyboard focus and directional remote navigation.
- assets/css/global/webos-tv.css: TV-only layout, focus, and sizing rules.
- webos/: app metadata, manifest generation, static packaging, and deployment documentation.
- .github/workflows/: build, test, IPK packaging, and release workflows.

TV presentation is enabled by isWebOSTV() in utils/webos.ts. It detects the file:// app and the browser preview query parameter ?webos=true; a session-storage preview flag is also supported. Keep this detection centralized.

The desktop sidebar implementation has been removed. Tablet/TV layouts use Home, Search, and Your library in the top bar; small screens retain the bottom navigation. Your Library includes Radio, and Podcasts surfaces saved podcast resume points under Continue listening. The floating player and Now Playing view open the queue overlay directly. The TV remote plugin starts focus in main content and does not wrap focus to unrelated controls at directional edges. CarouselSwiper supports both DPAD card navigation and pointer-edge paging on TV.

VirtualGrid and VirtualList implement TV-friendly rendering and paging. The TV grid uses a seven-column desktop layout at 1080p and groups two rows into a navigation page. Avoid replacing it with a long, individually stepped list without checking remote behavior and performance.

The audio player is shared across platforms. See composables/useAudioPlayer/ and components/Organisms/MusicPlayerAndQueue/. TV-specific Now Playing styling is in the music player component and webos-tv.css. Maintain album, artist, queue, shuffle, repeat, and favourite interactions when changing its layout.

TV-specific settings, including accent color, scrobbling, podcast/radio visibility, and stream bitrate, live in composables/useWebOSTVSettings/. The app uses these settings in the TV settings view and player/API behavior.

## Preview and scale checks

For a quick TV-style browser preview:

1. Start the app with yarn dev.
2. Open http://localhost:3000/?webos=true.
3. Use a 16:9 viewport at 1920x1080 first. Also check 3840x2160 if that is the TV output mode.
4. Test keyboard arrows, Enter, Backspace/Escape, focus visibility, scrolling, the top bar, library tabs, floating player, and Now Playing.

Connecting a computer to the TV over HDMI is useful for checking physical size, viewing distance, overscan, and how the layout feels on the actual panel. Set the TV to the intended resolution, use browser full screen and 100% zoom, and confirm the browser content viewport. HDMI still runs the computer browser: it does not reproduce the TV's webOS Chromium, webOS media stack, IPK environment, or Magic Remote behavior.

Only an IPK installed and launched on the LG TV validates those device-specific behaviors. Use ares-inspect for the TV Web Inspector when Developer Mode and the webOS SDK are configured. Record the webOS version, resolution, route, and remote action with any reported UI defect.

Recommended device QA routes: login, Discover, Search, every Your Library tab, album detail, artist detail, playlist detail, Queue, Now Playing, and Settings. Check the top and bottom of long pages as well as the floating player overlap, image loading, focus movement, and text clipping.

## Build, package, deploy

The standard webOS packaging script is webos/package-webos.sh. It runs a static Nuxt generation with WEBOS_BUILD=true, copies .output/public into webos/, rewrites absolute asset paths for file://, removes module-only preload markup, generates the webOS manifest, and packages with ares-package when the webOS CLI is available.

Typical commands from the repository root:

- Development preview: yarn dev
- Full test suite: yarn test:once
- Type check: yarn check-types
- Lint: yarn lint
- webOS static build and IPK: yarn build:webos
- List configured TVs: ares-device --list
- Install: ares-install com.subsonic.player_2.1.0_all.ipk -d TV_NAME
- Launch: ares-launch com.subsonic.player -d TV_NAME
- Inspect: ares-inspect com.subsonic.player -d TV_NAME
- TV logs: ares-log -f com.subsonic.player -d TV_NAME

The packaging script needs Bash and the LG webOS CLI tools, especially ares-package, ares-install, and ares-launch. Follow webos/README.md and webos/DEPLOYMENT.md for SDK setup. Verify the version in webos/appinfo.json before naming or installing an IPK.

## Tests and current verification notes

Vitest configuration is in vitest.config.mjs. The project uses Nuxt Test Utils and Istanbul coverage, with configured global thresholds of 85% for statements, lines, functions, and branches.

Nuxt configuration omits @vite-pwa/nuxt only when VITEST=true. This isolates a Vite PWA virtual-module resolution issue in the test environment; it does not disable PWA behavior in development or production builds.

On 2026-10-23, the complete local run reported 177 test files and 4,282 passing tests with no failed assertions or unhandled errors. The process still exited non-zero because current measured coverage was below the configured gate: 83.47% lines, 83.00% statements, and 72.51% branches (functions passed). Do not report the run as fully green, lower thresholds, or add blanket coverage exclusions without reviewing the cause. Newly added TV entry and layout paths need meaningful automated or device-level coverage.

The 139 recorded snapshot updates correspond to the released v2 interface redesign. The assertions that failed before the updates were stale expectations for the redesign, newer Subsonic API version/format fields, and async handlers. Relevant behavior tests were updated. A focused rerun of the affected 10 test files passed 454 tests; after the final ArtistsList selector adjustment, that file passed 15 tests. Vue type checking passed. A lint run under Windows was noisy because the checkout uses CRLF with core.autocrlf=true while Prettier expects LF; confirm lint in a Linux/WSL checkout or use the repository's expected line-ending setup.

Never use --update as a way to clear failures without inspecting the changed snapshots. Avoid weakening the configured coverage gate just to make the command exit successfully.

## AI handoff notes

Before editing, inspect git status and the current branch. Preserve user changes and do not use another checkout's preview files as a source of truth without comparing commits. Read the relevant component, composable, and tests before changing behavior.

When reporting work, distinguish:
- unit/component tests from visual checks,
- desktop preview from real TV validation,
- passing assertions from coverage-threshold status,
- a locally built IPK from a release published to GitHub.

For UI feedback from the user, ask for the exact TV route and a photo or short video when the mismatch cannot be reproduced locally. Use an HDMI preview to tune physical scale, then confirm the final result on the actual webOS TV before calling the TV layout verified.
