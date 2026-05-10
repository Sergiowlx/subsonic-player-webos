// Polyfills for older webOS Chromium (4.x = Ch53, 5.x = Ch68).
// Loaded only when WEBOS_BUILD=true via nuxt.config plugins entry.
import 'core-js/stable';

export default defineNuxtPlugin({
  enforce: 'pre',
  name: 'webos-polyfills',
  setup() {},
});
