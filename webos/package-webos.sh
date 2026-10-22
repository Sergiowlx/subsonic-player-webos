#!/bin/bash

# webOS Packaging Script for Subsonic Player
# This script builds the Nuxt app and packages it for webOS TV

set -e

echo "🚀 Building Subsonic Player for webOS..."

# Step 1: Generate the Nuxt app as static SPA with webOS-specific settings
echo "📦 Step 1: Generating Nuxt static app for webOS..."
cd "$(dirname "$0")/.."
WEBOS_BUILD=true yarn nuxt generate

# Step 2: Clean previous webOS build
echo "🧹 Step 2: Cleaning previous webOS build..."
rm -rf webos/dist webos/_nuxt webos/*.html webos/*.js webos/*.css webos/*.png webos/*.svg webos/*.webmanifest webos/*.ico

# Step 3: Copy build output to webOS directory
echo "📋 Step 3: Copying build output to webOS directory..."
cp -r .output/public/* webos/

# Step 3.5: Fix absolute paths for webOS file:// protocol
# Use perl -i for cross-platform compatibility (BSD sed on macOS treats
# the next arg after -i as the backup extension, which silently breaks
# all the substitutions below).
echo "🔧 Step 3.5: Converting absolute paths to relative paths..."
# Fix HTML attributes (href, src)
find webos -name "*.html" -type f -exec perl -i -pe 's|href="/|href="./|g; s|src="/|src="./|g' {} \;
# Fix importmap JSON in HTML ({"imports":{"#entry":"/_nuxt/...)
find webos -name "*.html" -type f -exec perl -i -pe 's|"/_nuxt/|"./_nuxt/|g; s|"/builds/|"./builds/|g' {} \;
# Fix JavaScript module imports and fetch calls
find webos -name "*.js" -type f -exec perl -i -pe 's|"/_nuxt/|"./_nuxt/|g; s|'\''/_nuxt/|'\''./_nuxt/|g; s|"/builds/|"./builds/|g; s|'\''/builds/|'\''./builds/|g' {} \;

# Step 3.6: Remove crossorigin attributes (file:// protocol doesn't support CORS)
echo "🔧 Step 3.6: Removing crossorigin attributes for file:// compatibility..."
find webos -name "*.html" -type f -exec perl -i -pe 's| crossorigin||g' {} \;

# Step 3.6b: Replace type="module" with defer (webOS 4.x/older 5.x runs
# Chromium 53, which has no module support — bundle is built as classic
# IIFE for webOS). defer preserves the post-parse execution order so the
# inline window.__NUXT__ config script in <body> runs first.
echo "🔧 Step 3.6b: Replacing type=\"module\" with defer on script tags..."
find webos -name "*.html" -type f -exec perl -i -pe 's| type="module"| defer|g' {} \;

# Step 3.7: Removing modulepreload links...
echo "🔧 Step 3.7: Removing modulepreload links..."
find webos -name "*.html" -type f -exec perl -i -pe 's|<link rel="modulepreload"[^>]*>||g' {} \;

# Step 3.8: Fix runtime config baseURL in inline script
echo "🔧 Step 3.8: Fixing runtime config baseURL..."
find webos -name "*.html" -type f -exec perl -i -pe 's|baseURL:"/"|baseURL:"./"|g' {} \;

# Step 4: Create icons (using existing favicon)
echo "🎨 Step 4: Creating webOS icons..."
if [ -f "webos/favicon.svg" ]; then
  cp webos/favicon.svg webos/icon.png 2>/dev/null || echo "  ⚠️  Icon conversion skipped (install imagemagick for auto-conversion)"
  cp webos/favicon.svg webos/largeIcon.png 2>/dev/null || true
fi

# Use existing PWA icons if available
if [ -f "webos/pwa-512x512.png" ]; then
  cp webos/pwa-512x512.png webos/icon.png
  cp webos/pwa-512x512.png webos/largeIcon.png
  cp webos/pwa-512x512.png webos/splashBackground.png
fi

# Step 5: Package for webOS (if ares-package is installed)
echo "📦 Step 5: Creating webOS package..."
if command -v ares-package &> /dev/null; then
  # Use --no-minify because Nuxt already minified the code
  ares-package webos --outdir ./ --no-minify
  echo "✅ webOS package created successfully!"
  APP_ID=$(node -e "process.stdout.write(require('./webos/appinfo.json').id)")
  APP_VERSION=$(node -e "process.stdout.write(require('./webos/appinfo.json').version)")
  IPK_FILENAME="${APP_ID}_${APP_VERSION}_all.ipk"
  echo "📦 Package: ${IPK_FILENAME}"
  echo ""
  echo "To install on your TV:"
  echo "  ares-install ${IPK_FILENAME} -d <TV_NAME>"
else
  echo "⚠️  ares-package not found. Install webOS SDK to create .ipk package"
  echo "   See: https://webostv.developer.lge.com/sdk/installation/"
fi

echo ""
echo "✅ Build complete! webOS app files are in: webos/"
yarn manifest
