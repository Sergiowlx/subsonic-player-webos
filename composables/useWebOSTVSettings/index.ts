export const WEBOS_SETTINGS_STORAGE_KEY = 'webos-tv-settings';

export const WEBOS_ACCENT_COLOURS = [
  { label: 'Lime', value: '#1ed760', rgb: '30, 215, 96' },
  { label: 'Purple', value: '#6313bc', rgb: '99, 19, 188' },
  { label: 'Blue', value: '#1976d2', rgb: '25, 118, 210' },
  { label: 'Teal', value: '#00897b', rgb: '0, 137, 123' },
  { label: 'Green', value: '#388e3c', rgb: '56, 142, 60' },
  { label: 'Orange', value: '#ef6c00', rgb: '239, 108, 0' },
  { label: 'Red', value: '#d32f2f', rgb: '211, 47, 47' },
  { label: 'Pink', value: '#d81b60', rgb: '216, 27, 96' },
] as const;

export interface WebOSTVSettings {
  accentColor: string;
  scrobbleEnabled: boolean;
  showPodcasts: boolean;
  showRadioStations: boolean;
  streamBitrate: number;
}

const DEFAULT_WEBOS_SETTINGS: WebOSTVSettings = {
  accentColor: '#1ed760',
  scrobbleEnabled: true,
  showPodcasts: true,
  showRadioStations: true,
  streamBitrate: 0,
};

export function useWebOSTVSettings() {
  const settings = useState<WebOSTVSettings>('webos-tv-settings', () => ({
    ...DEFAULT_WEBOS_SETTINGS,
  }));
  const restored = useState('webos-tv-settings-restored', () => false);

  const accentColor = computed(() => settings.value.accentColor);
  const accentColorRgb = computed(
    () =>
      WEBOS_ACCENT_COLOURS.find(
        (colour) => colour.value === settings.value.accentColor,
      )?.rgb ?? WEBOS_ACCENT_COLOURS[0].rgb,
  );

  function persistSettings() {
    setLocalStorage(WEBOS_SETTINGS_STORAGE_KEY, settings.value);
  }

  function restoreSettings() {
    if (!import.meta.client || restored.value) {
      return;
    }

    const stored = getLocalStorage(
      WEBOS_SETTINGS_STORAGE_KEY,
    ) as Partial<WebOSTVSettings> | '';

    if (stored && typeof stored === 'object') {
      const accentColorIsValid = WEBOS_ACCENT_COLOURS.some(
        (colour) => colour.value === stored.accentColor,
      );
      const bitrateIsValid = [0, 128, 192, 256, 320].includes(
        Number(stored.streamBitrate),
      );

      settings.value = {
        accentColor: accentColorIsValid
          ? (stored.accentColor as string)
          : DEFAULT_WEBOS_SETTINGS.accentColor,
        scrobbleEnabled:
          typeof stored.scrobbleEnabled === 'boolean'
            ? stored.scrobbleEnabled
            : DEFAULT_WEBOS_SETTINGS.scrobbleEnabled,
        showPodcasts:
          typeof stored.showPodcasts === 'boolean'
            ? stored.showPodcasts
            : DEFAULT_WEBOS_SETTINGS.showPodcasts,
        showRadioStations:
          typeof stored.showRadioStations === 'boolean'
            ? stored.showRadioStations
            : DEFAULT_WEBOS_SETTINGS.showRadioStations,
        streamBitrate: bitrateIsValid
          ? Number(stored.streamBitrate)
          : DEFAULT_WEBOS_SETTINGS.streamBitrate,
      };
    }

    restored.value = true;
  }

  function updateSettings(changes: Partial<WebOSTVSettings>) {
    settings.value = {
      ...settings.value,
      ...changes,
    };
    persistSettings();
  }

  function setAccentColor(value: string) {
    if (WEBOS_ACCENT_COLOURS.some((colour) => colour.value === value)) {
      updateSettings({ accentColor: value });
    }
  }

  function setStreamBitrate(value: number) {
    if ([0, 128, 192, 256, 320].includes(value)) {
      updateSettings({ streamBitrate: value });
    }
  }

  function toggleScrobble() {
    updateSettings({ scrobbleEnabled: !settings.value.scrobbleEnabled });
  }

  function toggleShowPodcasts() {
    updateSettings({ showPodcasts: !settings.value.showPodcasts });
  }

  function toggleShowRadioStations() {
    updateSettings({ showRadioStations: !settings.value.showRadioStations });
  }

  function resetSettings() {
    settings.value = { ...DEFAULT_WEBOS_SETTINGS };
    persistSettings();
  }

  return {
    accentColor,
    accentColorRgb,
    resetSettings,
    restoreSettings,
    setAccentColor,
    setStreamBitrate,
    settings,
    toggleScrobble,
    toggleShowPodcasts,
    toggleShowRadioStations,
  };
}
