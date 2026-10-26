import { resolve } from 'node:path';
import { defineNuxtConfig } from 'nuxt/config';

import { createPWAConfig } from './config/pwa.config';

const IS_WEBOS_BUILD = process.env.WEBOS_BUILD === 'true';
const IS_VITEST = process.env.VITEST === 'true';

// Inline classic script that installs an on-screen error overlay BEFORE the
// module bundle is parsed. Older webOS Chromium has no usable inspector, so
// this is how we surface runtime errors visually on the TV.
const WEBOS_ERROR_OVERLAY_SCRIPT = `
(function(){
  // Pre-bundle polyfills for DOM/JS APIs missing in Chromium 53. Must run
  // before the IIFE bundle since the framework references these at module
  // top-level (core-js inside the bundle can't help — too late).

  // globalThis (Chrome 71+)
  if (typeof globalThis === 'undefined') {
    try {
      Object.defineProperty(Object.prototype, '__magic__', {
        get: function(){ return this; },
        configurable: true
      });
      __magic__.globalThis = __magic__;
      delete Object.prototype.__magic__;
    } catch(_) {
      window.globalThis = window;
    }
  }

  // window.customElements (Chrome 67+) — minimal stub. The app doesn't
  // actually need custom elements; Nuxt/Vue just probes the registry.
  if (typeof window.customElements === 'undefined') {
    window.customElements = {
      get: function(){ return undefined; },
      define: function(){},
      whenDefined: function(){
        return typeof Promise !== 'undefined' ? Promise.resolve() : { then: function(){} };
      },
      upgrade: function(){}
    };
  }

  // Element.prototype.getAttributeNames (Chrome 60+)
  if (typeof Element !== 'undefined' && !Element.prototype.getAttributeNames) {
    Element.prototype.getAttributeNames = function(){
      var names = [];
      for (var i = 0; i < this.attributes.length; i++) names.push(this.attributes[i].name);
      return names;
    };
  }

  // Stub for Swiper custom element (<swiper-container>) — older Chromium has
  // no usable customElements support, so swiper-element's .initialize() never
  // gets attached. Keep the app alive and use its native horizontal-strip
  // fallback for carousels.
  if (typeof Element !== 'undefined' && !Element.prototype.initialize) {
    Element.prototype.initialize = function(){};
  }

  // Fallback CSS so swiper carousels render as horizontal scroll strips on
  // old Chromium. CarouselSwiper adds pointer-edge scrolling to this strip.
  try {
    var s = document.createElement('style');
    s.textContent =
      'swiper-container{display:block;width:100%;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scroll-behavior:smooth;-webkit-overflow-scrolling:touch}' +
      'swiper-slide{display:inline-block;vertical-align:top;white-space:normal;width:auto;margin-right:16px}';
    (document.head || document.documentElement).appendChild(s);
  } catch(_) {}

  // AbortController / AbortSignal (Chrome 66+) — minimal stub. Ch53's
  // fetch won't actually honor abort, but this prevents the crash on use.
  if (typeof AbortController === 'undefined') {
    function ASig(){ this.aborted = false; this.reason = undefined; this._ls = []; }
    ASig.prototype.addEventListener = function(t, fn){ if (t === 'abort') this._ls.push(fn); };
    ASig.prototype.removeEventListener = function(t, fn){
      if (t !== 'abort') return;
      var i = this._ls.indexOf(fn);
      if (i !== -1) this._ls.splice(i, 1);
    };
    ASig.prototype.dispatchEvent = function(ev){
      if (ev.type !== 'abort') return;
      this.aborted = true;
      if (typeof this.onabort === 'function') { try { this.onabort(ev); } catch(_){} }
      var ls = this._ls.slice();
      for (var i = 0; i < ls.length; i++) { try { ls[i].call(this, ev); } catch(_){} }
    };
    function ACtl(){ this.signal = new ASig(); }
    ACtl.prototype.abort = function(reason){
      if (this.signal.aborted) return;
      this.signal.reason = reason;
      this.signal.dispatchEvent({ type: 'abort' });
    };
    window.AbortController = ACtl;
    window.AbortSignal = ASig;
  }
  var log = [];
  function ensureEl(){
    var el = document.getElementById('__webos_overlay__');
    if (!el && document.body) {
      el = document.createElement('div');
      el.id = '__webos_overlay__';
      el.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#000;color:#0f0;font:12px/1.4 monospace;padding:16px;overflow:auto;white-space:pre-wrap;word-break:break-all;z-index:2147483647';
      document.body.appendChild(el);
    }
    return el;
  }
  var hasError = false;
  function render(){
    if (!hasError) return;
    var el = ensureEl();
    if (el) el.textContent = log.join('\\n\\n');
    else setTimeout(render, 50);
  }
  function push(label, detail, isError){
    log.push('[' + (log.length+1) + '] ' + label + '\\n' + detail);
    if (isError) hasError = true;
    render();
  }
  // Expose a manual trigger so dev can show full log if needed:
  // window.__webosShowOverlay()
  window.__webosShowOverlay = function(){ hasError = true; render(); };
  push('BOOT', 'overlay installed at ' + new Date().toISOString() + '\\nUA: ' + navigator.userAgent);
  window.addEventListener('error', function(e){
    var stack = (e.error && e.error.stack) ? e.error.stack : '';
    push('ERROR', e.message + '\\n  at ' + e.filename + ':' + e.lineno + ':' + e.colno + '\\n' + stack, true);
  });
  window.addEventListener('unhandledrejection', function(e){
    var r = e.reason;
    var d = (r && r.stack) ? r.stack : (typeof r === 'object' ? JSON.stringify(r) : String(r));
    push('UNHANDLED REJECTION', d, true);
  });
  var origErr = console.error;
  console.error = function(){
    try {
      var parts = [];
      for (var i=0; i<arguments.length; i++){
        var a = arguments[i];
        parts.push(a && a.stack ? a.stack : (typeof a === 'object' ? JSON.stringify(a) : String(a)));
      }
      push('CONSOLE.ERROR', parts.join(' '), true);
    } catch(_){}
    return origErr.apply(console, arguments);
  };
  document.addEventListener('DOMContentLoaded', function(){
    push('DOM', 'DOMContentLoaded fired');
  });
  window.addEventListener('load', function(){
    push('LOAD', 'window load fired');
  });
})();
`;

const IMPORT_DIRECTORIES = [
  'components/**',
  'composables/**',
  'constants/**',
  'navigations/**',
  'types/**',
  'utils/**',
];

const ENVIRONMENT_VARIABLES = {
  IMAGE_SIZE: process.env.IMAGE_SIZE || '500',
  LOAD_SIZE: process.env.LOAD_SIZE || '50',
  MAIN_APP_TITLE: process.env.MAIN_APP_TITLE || 'Music App',
  SERVER_URL: process.env.SERVER_URL || '',
  // webOS builds are always SPA mode (no SSR, no server API)
  SPA_MODE:
    process.env.SPA_MODE === 'true' || process.env.WEBOS_BUILD === 'true',
};

export default defineNuxtConfig({
  app: {
    baseURL: './',
    buildAssetsDir: '_nuxt/',
    head: IS_WEBOS_BUILD
      ? {
          script: [
            {
              innerHTML: WEBOS_ERROR_OVERLAY_SCRIPT,
              tagPosition: 'head',
              type: 'text/javascript',
            },
          ],
        }
      : {},
  },
  builder: 'vite',
  compatibilityDate: '2024-04-03',
  css: ['@/assets/css/main.css'],
  devtools: {
    enabled: true,
  },
  experimental: {
    appManifest: false,
    payloadExtraction: false,
  },
  features: {
    inlineStyles: process.env.WEBOS_BUILD !== 'true',
  },
  ignore: ['coverage/**', 'docs/**', '**/*.spec.ts'],
  imports: {
    dirs: IMPORT_DIRECTORIES,
  },
  modules: [
    '@nuxt/eslint',
    ...(IS_VITEST ? [] : ['@vite-pwa/nuxt']),
    'nuxt-swiper',
  ],
  nitro: {
    imports: {
      dirs: IMPORT_DIRECTORIES,
    },
    output: {
      publicDir: '.output/public',
    },
    preset: 'static',
  },
  plugins: IS_WEBOS_BUILD
    ? [{ mode: 'client', src: '~/webos/polyfills.client.ts' }]
    : [],
  postcss: {
    plugins: {
      '@csstools/postcss-global-data': {
        files: [
          resolve('./assets/css/breakpoints.css'),
          resolve('./assets/css/main.css'),
        ],
      },
      autoprefixer: {},
      'postcss-custom-media': {},
      'postcss-extend-rule': {},
      'postcss-preset-env': {
        stage: 0,
      },
      'postcss-pxtorem': {
        propList: ['*'],
        replace: true,
      },
    },
  },
  ...createPWAConfig(ENVIRONMENT_VARIABLES.MAIN_APP_TITLE),
  runtimeConfig: {
    public: {
      ...ENVIRONMENT_VARIABLES,
    },
  },
  ssr: false,
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: false,
      },
    },
    typeCheck: IS_WEBOS_BUILD ? false : 'build',
  },
  vite: {
    build: {
      assetsDir: '_nuxt',
      ...(IS_WEBOS_BUILD && {
        rollupOptions: {
          output: {
            entryFileNames: '_nuxt/entry.js',
            format: 'iife',
            inlineDynamicImports: true,
          },
        },
        target: ['chrome53'],
      }),
    },
    ...(IS_WEBOS_BUILD && {
      esbuild: {
        target: 'chrome53',
      },
    }),
  },
});
