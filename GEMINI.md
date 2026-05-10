# Subsonic Player (webOS Fork) - Development Guide

This repository is a specialized fork of Subsonic Player, optimized for **webOS 5.50.70 (Chromium 53)**. It follows a "minimal-fork strategy" to maintain compatibility with the upstream project while delivering a production-quality TV experience.

## 🎯 Project Mandate
Deliver a modern, responsive Subsonic client that runs smoothly on legacy webOS hardware. The focus is on **spatial navigation**, **performance on old Chromium**, and **ease of maintenance** relative to upstream.

## 🛠 Technical Architecture

### target Environment
- **Platform:** webOS 5.50.70
- **Browser:** Chromium 53 (released ~2016)
- **Constraints:** No ES modules, no `aspect-ratio`, no `clamp()`, no `globalThis`, no `AbortController`, no `customElements`.

### Build Strategy
The app is built as a **Single Page Application (SPA)** using Nuxt's static generation.
- **Bundling:** Vite is configured to produce a single **IIFE bundle** (`format: 'iife'`, `inlineDynamicImports: true`) because Chrome 53 does not support ES modules.
- **Polyfills:** 
    - `core-js/stable` is loaded via `webos/polyfills.client.ts`.
    - Critical early-boot polyfills (e.g., `globalThis`, `AbortController`) are injected via an inline script in `nuxt.config.ts`.
- **Post-processing:** `webos/package-webos.sh` performs surgical edits on the build output to:
    - Convert absolute paths to relative (`file://` compatibility).
    - Remove `crossorigin` attributes.
    - Replace `type="module"` with `defer`.
    - Strip `modulepreload` links.

## 🎮 TV Navigation & UI

### Spatial Navigation
Implemented in `plugins/webos-input.client.ts`:
- **DPAD Support:** Maps remote arrows to spatial navigation between focusable elements.
- **Focus Management:** Uses a `.focused` CSS class for reliable visual indicators (native `:focus` can be inconsistent on old webOS).
- **Navigation Zones:** Deterministic logic for jumping between Sidebar, Header, Content, and Player.
- **Viewport:** Forced to `1280px` width to trigger a stable desktop-style layout regardless of physical TV resolution.

### TV-Specific Styling
Located in `assets/css/global/webos-tv.css`:
- **10-foot UI:** Increased font sizes and spacing for couch viewing.
- **No Hover:** Interactive elements that rely on hover are modified or hidden.
- **Layout Overrides:** Mobile bottom-nav is transformed into a left-side vertical sidebar on TV.
- **Compatibility Fallbacks:** Explicit heights for `aspect-ratio` and fixed values for `clamp()`.

## 🔄 Maintenance Strategy (Minimal-Fork)

To stay in sync with the upstream repository (`VD39/subsonic-player`), we prioritize:
1. **Feature Flags:** Use `process.env.WEBOS_BUILD` for build-time branching.
2. **Runtime Detection:** Use `window.location.protocol === 'file:'` or `document.body.classList.contains('webosTV')`.
3. **Externalized Logic:** Keep webOS-specific code in `webos/`, `plugins/webos-input.client.ts`, and `assets/css/global/webos-tv.css`.

### Update Workflow
```bash
git remote add upstream https://github.com/VD39/subsonic-player.git
git fetch upstream
git rebase upstream/main
```

## 🚀 Development & Debugging

### Commands
- `yarn build:webos`: Complete build, post-process, and package as `.ipk`.
- `yarn test:webos`: Runs Playwright tests specifically for the webOS environment.

### Debugging on TV
Since Chrome 53 has limited inspector support and many TVs are hard to access:
- **Error Overlay:** An inline script in `nuxt.config.ts` catches runtime errors and unhandled rejections, displaying them in a high-contrast green-on-black overlay directly on the TV screen.
- **Remote Inspect:** `ares-inspect --app com.subsonic.player --open` (requires webOS SDK).

## 📝 Conventions
- **CSS:** Use standard CSS. Avoid Tailwind.
- **TS:** Maintain strict typing.
- **Components:** Ensure all new components are reachable via DPAD navigation. Check `isVisible()` and `shouldSkipElement()` in the navigation plugin if items aren't focusing.
