<script setup lang="ts">
import SelectableBadge from '@/components/settings/SelectableBadge.vue';
import SelectableOption from '@/components/settings/SelectableOption.vue';
import SettingsField from '@/components/settings/SettingsField.vue';
import SettingsGroup from '@/components/settings/SettingsGroup.vue';
import SettingsSection from '@/components/settings/SettingsSection.vue';
import ToggleSwitch from '@/components/settings/ToggleSwitch.vue';
import { WEBOS_ACCENT_COLOURS } from '@/composables/useWebOSTVSettings';

type ThemePreference = 'auto' | 'dark' | 'light';

const { isDarkTheme } = useTheme();
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

const themePreference = useState<ThemePreference>(
  'webos-theme-preference',
  () => {
    const savedTheme = getLocalStorage(STATE_NAMES.theme);
    if (typeof savedTheme === 'boolean') {
      return savedTheme ? 'dark' : 'light';
    }
    return 'auto';
  },
);

const themeOptions = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
  { label: 'Auto', value: 'auto' },
] as const;

const layoutOptions = [
  {
    description: 'Compact grid of items',
    title: 'Grid',
    value: 'gridLayout',
  },
  {
    description: 'Detailed list view',
    title: 'List',
    value: 'listLayout',
  },
] as const;

const bitrateOptions = [
  {
    description:
      'Direct playback of the original audio source without modifications',
    title: 'Source',
    value: 0,
  },
  {
    badge: '320 kbps',
    description:
      'Superior sound quality, perfect for immersive listening with moderate data usage',
    title: 'High',
    value: 320,
  },
  {
    badge: '256 kbps',
    description:
      'Crisp audio with a balanced blend of quality and data efficiency',
    title: 'Medium',
    value: 256,
  },
  {
    badge: '192 kbps',
    description: 'Solid quality tailored for streaming with reduced bandwidth',
    title: 'Low',
    value: 192,
  },
  {
    badge: '128 kbps',
    description:
      'Essential audio quality optimized for the lowest data consumption',
    title: 'Minimal',
    value: 128,
  },
] as const;

function resetPreferences() {
  resetWebOSSettings();
  setViewLayout('gridLayout');
  setThemeMode('auto');
}

function setThemeMode(mode: ThemePreference) {
  themePreference.value = mode;

  if (mode === 'auto') {
    deleteLocalStorage(STATE_NAMES.theme);
    const isWebOSTV =
      window.location.protocol === 'file:' ||
      window.location.search.includes('webos=true');
    isDarkTheme.value =
      isWebOSTV || window.matchMedia('(prefers-color-scheme: dark)').matches;
    return;
  }

  isDarkTheme.value = mode === 'dark';
  setLocalStorage(STATE_NAMES.theme, isDarkTheme.value);
}

useHead({
  title: 'Settings',
});
</script>

<template>
  <div :class="['column', $style.settings]">
    <h1 :class="$style.title">Settings</h1>

    <SettingsSection title="Appearance">
      <SettingsGroup
        description="Switch between dark, light, or system-preferred appearance"
        title="Theme"
        variant="badge"
      >
        <SelectableBadge
          v-for="option in themeOptions"
          :key="option.value"
          :label="option.label"
          name="theme"
          :selected="themePreference === option.value"
          @click="setThemeMode(option.value)"
        />
      </SettingsGroup>

      <SettingsGroup
        description="Choose between a compact grid or a detailed list"
        title="Layout"
        variant="list"
      >
        <SelectableOption
          v-for="option in layoutOptions"
          :key="option.value"
          :description="option.description"
          name="layout"
          :selected="viewLayout === option.value"
          :title="option.title"
          @click="setViewLayout(option.value)"
        />
      </SettingsGroup>

      <SettingsGroup
        description="Choose the colour used for focus and selection across the TV app"
        title="Accent colour"
        variant="list"
      >
        <SettingsField title="Accent colour">
          <div
            aria-label="Accent colour"
            :class="$style.accentPalette"
            role="group"
          >
            <button
              v-for="colour in WEBOS_ACCENT_COLOURS"
              :key="colour.value"
              :aria-label="colour.label + ' accent colour'"
              :aria-pressed="settings.accentColor === colour.value"
              :class="$style.accentButton"
              :title="colour.label"
              type="button"
              @click="setAccentColor(colour.value)"
            >
              <span
                :class="$style.accentSwatch"
                :style="{ backgroundColor: colour.value }"
              />
            </button>
          </div>
        </SettingsField>
      </SettingsGroup>
    </SettingsSection>

    <SettingsSection title="Audio Quality">
      <SettingsGroup
        description="Adjusting audio quality enables server-side transcoding, converting to a compatible format with a lower bitrate for smoother streaming"
        title="Streaming"
        variant="list"
      >
        <SelectableOption
          v-for="option in bitrateOptions"
          :key="option.value"
          :badge="'badge' in option ? option.badge : undefined"
          :description="option.description"
          name="streamBitrate"
          :selected="settings.streamBitrate === option.value"
          :title="option.title"
          @click="setStreamBitrate(option.value)"
        />
      </SettingsGroup>
    </SettingsSection>

    <SettingsSection title="Navigation">
      <SettingsField
        description="Display podcasts in the navigation menu"
        title="Show podcasts"
      >
        <ToggleSwitch
          label="Show podcasts"
          :pressed="settings.showPodcasts"
          @click="toggleShowPodcasts"
        />
      </SettingsField>

      <SettingsField
        description="Display radio stations in the navigation menu"
        title="Show radio stations"
      >
        <ToggleSwitch
          label="Show radio stations"
          :pressed="settings.showRadioStations"
          @click="toggleShowRadioStations"
        />
      </SettingsField>
    </SettingsSection>

    <SettingsSection title="Playback">
      <SettingsField
        description="Report plays to your Subsonic server"
        title="Scrobble"
      >
        <ToggleSwitch
          label="Scrobble"
          :pressed="settings.scrobbleEnabled"
          @click="toggleScrobble"
        />
      </SettingsField>
    </SettingsSection>

    <SettingsSection title="Maintenance">
      <SettingsField
        description="Restore all settings to their factory defaults"
        title="Reset settings"
      >
        <button class="actionButton" type="button" @click="resetPreferences">
          Reset
        </button>
      </SettingsField>
    </SettingsSection>
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

.accentPalette {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  align-self: flex-start;
  overflow: hidden;
  background-color: var(--secondary-background-color);
  border-radius: var(--border-radius-large);
}

.accentButton {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 56px;
  padding: var(--space-8);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-right: 1px solid var(--border-color);
}

.accentButton:last-child {
  border-right: 0;
}

.accentButton:focus-visible {
  outline: 2px solid var(--theme-color);
  outline-offset: -2px;
}

.accentSwatch {
  display: block;
  width: 26px;
  height: 26px;
  border: 2px solid transparent;
  border-radius: var(--border-radius-round);
  transition:
    border-color var(--transition),
    transform var(--transition);
}

.accentButton[aria-pressed='true'] .accentSwatch {
  border-color: var(--background-color);
  box-shadow: 0 0 0 2px var(--theme-color);
  transform: scale(1.08);
}
</style>
