<script setup lang="ts">
import {
  WEBOS_ACCENT_COLOURS,
} from '@/composables/useWebOSTVSettings';

const { isDarkTheme, toggleTheme } = useTheme();
const { setViewLayout, viewLayout } = useViewLayout();
const {
  resetSettings: resetWebOSSettings,
  setAccentColor,
  setStreamBitrate,
  settings,
  toggleScrobble,
  toggleShowPodcasts,
  toggleShowRadioStations,
} = useWebOSTVSettings();

const bitrateOptions = [
  { label: 'Original', value: 0 },
  { label: '320 kbps', value: 320 },
  { label: '256 kbps', value: 256 },
  { label: '192 kbps', value: 192 },
  { label: '128 kbps', value: 128 },
];

function setTheme(dark: boolean) {
  if (isDarkTheme.value !== dark) {
    toggleTheme();
  }
}

function resetPreferences() {
  resetWebOSSettings();
  setViewLayout('gridLayout');
  if (isDarkTheme.value) {
    toggleTheme();
  }
}

useHead({
  title: 'Settings',
});
</script>

<template>
  <div :class="['column', $style.settings]">
    <h1 :class="$style.title">Settings</h1>

    <section :class="['column', $style.section]">
      <h2>Appearance</h2>

      <div :class="$style.row">
        <div :class="$style.copy">
          <h3>Theme</h3>
          <p>Choose the light or dark appearance.</p>
        </div>
        <div :class="$style.choices">
          <button
            :aria-pressed="!isDarkTheme"
            :class="$style.choice"
            @click="setTheme(false)"
          >
            Light
          </button>
          <button
            :aria-pressed="isDarkTheme"
            :class="$style.choice"
            @click="setTheme(true)"
          >
            Dark
          </button>
        </div>
      </div>

      <div :class="$style.row">
        <div :class="$style.copy">
          <h3>Layout</h3>
          <p>Choose a compact grid or a detailed list.</p>
        </div>
        <div :class="$style.choices">
          <button
            :aria-pressed="viewLayout === 'gridLayout'"
            :class="$style.choice"
            @click="setViewLayout('gridLayout')"
          >
            Grid
          </button>
          <button
            :aria-pressed="viewLayout === 'listLayout'"
            :class="$style.choice"
            @click="setViewLayout('listLayout')"
          >
            List
          </button>
        </div>
      </div>

      <div :class="$style.row">
        <div :class="$style.copy">
          <h3>Accent colour</h3>
          <p>Change the focus and selection colour across the TV app.</p>
        </div>
        <div :class="$style.palette">
          <button
            v-for="colour in WEBOS_ACCENT_COLOURS"
            :key="colour.value"
            :aria-label="colour.label + ' accent colour'"
            :aria-pressed="settings.accentColor === colour.value"
            :class="$style.swatchButton"
            @click="setAccentColor(colour.value)"
          >
            <span
              :class="$style.swatch"
              :style="{ backgroundColor: colour.value }"
            />
          </button>
        </div>
      </div>
    </section>

    <section :class="['column', $style.section]">
      <h2>Audio quality</h2>

      <div :class="$style.row">
        <div :class="$style.copy">
          <h3>Streaming bitrate</h3>
          <p>
            Lower bitrates ask the server to transcode audio and may help on
            slower connections. Changes apply to the next track.
          </p>
        </div>
        <div :class="$style.choices">
          <button
            v-for="option in bitrateOptions"
            :key="option.value"
            :aria-pressed="settings.streamBitrate === option.value"
            :class="$style.choice"
            @click="setStreamBitrate(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </section>

    <section :class="['column', $style.section]">
      <h2>Navigation and playback</h2>

      <div :class="$style.row">
        <div :class="$style.copy">
          <h3>Show podcasts</h3>
          <p>Display podcasts in the sidebar.</p>
        </div>
        <button
          :aria-pressed="settings.showPodcasts"
          :class="$style.toggle"
          @click="toggleShowPodcasts"
        >
          {{ settings.showPodcasts ? 'On' : 'Off' }}
        </button>
      </div>

      <div :class="$style.row">
        <div :class="$style.copy">
          <h3>Show radio stations</h3>
          <p>Display radio stations in the sidebar.</p>
        </div>
        <button
          :aria-pressed="settings.showRadioStations"
          :class="$style.toggle"
          @click="toggleShowRadioStations"
        >
          {{ settings.showRadioStations ? 'On' : 'Off' }}
        </button>
      </div>

      <div :class="$style.row">
        <div :class="$style.copy">
          <h3>Scrobbling</h3>
          <p>Report completed listens to your Subsonic server.</p>
        </div>
        <button
          :aria-pressed="settings.scrobbleEnabled"
          :class="$style.toggle"
          @click="toggleScrobble"
        >
          {{ settings.scrobbleEnabled ? 'On' : 'Off' }}
        </button>
      </div>
    </section>

    <section :class="['column', $style.section]">
      <h2>Maintenance</h2>
      <div :class="$style.row">
        <div :class="$style.copy">
          <h3>Reset preferences</h3>
          <p>Restore the TV app’s appearance and playback preferences.</p>
        </div>
        <button :class="$style.choice" @click="resetPreferences">
          Reset
        </button>
      </div>
    </section>
  </div>
</template>

<style module>
.settings {
  gap: var(--space-24);
  padding: var(--space-24);
}

.title {
  font-size: var(--h2-font-size);
}

.section {
  gap: var(--space-16);
}

.section h2 {
  font-size: var(--h3-font-size);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-24);
  padding: var(--space-16) var(--space-20);
  background: var(--hover-selected-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-medium);
}

.copy {
  flex: 1;
  min-width: 0;
}

.copy h3 {
  margin-bottom: var(--space-4);
  font-size: var(--body-font-size);
}

.copy p {
  color: var(--secondary-font-color);
}

.choices,
.palette {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
  justify-content: flex-end;
}

.choice,
.toggle,
.swatchButton {
  min-height: 48px;
  padding: var(--space-8) var(--space-16);
  color: var(--body-font-color);
  background: var(--background-color);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-medium);
  cursor: pointer;
}

.choice[aria-pressed='true'],
.toggle[aria-pressed='true'] {
  border-color: var(--theme-color);
  box-shadow: 0 0 0 2px rgba(var(--theme-color-rgb, 99, 19, 188), 0.28);
}

.swatchButton {
  display: flex;
  width: 52px;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.swatchButton[aria-pressed='true'] {
  border-color: var(--theme-color);
  box-shadow: 0 0 0 2px rgba(var(--theme-color-rgb, 99, 19, 188), 0.35);
}

.swatch {
  display: block;
  width: 34px;
  height: 34px;
  border-radius: 50%;
}

@media (--mobile-only) {
  .row {
    align-items: flex-start;
    flex-direction: column;
  }

  .choices,
  .palette {
    justify-content: flex-start;
  }
}
</style>
