export function useMediaLibrary() {
  const { fetchData } = useAPI();
  const { addSuccessSnack } = useSnack();

  const musicFolders = useState<FormattedMusicFolder[]>(
    'music-folders-list',
    () => [],
  );

  const disabledMusicFolderIds = useState<string[]>(
    'disabled-music-folder-ids',
    () => {
      const stored =
        import.meta.client && localStorage.getItem('disabled-music-folder-ids');
      return stored ? JSON.parse(stored).map(String) : [];
    },
  );

  const enabledMusicFolderIds = computed(() => {
    if (!musicFolders.value.length) {
      return [];
    }
    return musicFolders.value
      .map((f) => String(f.id))
      .filter((id) => !disabledMusicFolderIds.value.includes(id));
  });

  const musicFolderPaths = useState<Record<string, string>>(
    'music-folder-paths',
    () => ({}),
  );

  watch(
    disabledMusicFolderIds,
    (newValue) => {
      if (import.meta.client) {
        localStorage.setItem(
          'disabled-music-folder-ids',
          JSON.stringify(newValue),
        );
      }
    },
    { deep: true },
  );

  function toggleMusicFolder(id: string | number) {
    const stringId = String(id);
    const index = disabledMusicFolderIds.value.indexOf(stringId);
    if (index === -1) {
      disabledMusicFolderIds.value = [...disabledMusicFolderIds.value, stringId];
    } else {
      disabledMusicFolderIds.value = disabledMusicFolderIds.value.filter(
        (folderId) => folderId !== stringId,
      );
    }
  }

  function isMusicFolderDisabled(
    id: string | number | undefined,
    path?: string,
  ) {
    if (id !== undefined && disabledMusicFolderIds.value.includes(String(id))) {
      return true;
    }

    if (path) {
      // Normalize paths to use forward slashes for matching
      const normalizedPath = path.replace(/\\/g, '/');

      // Try to match path to a folder ID
      const folderEntry = Object.entries(musicFolderPaths.value).find(
        ([folderPath]) => {
          const normalizedFolder = folderPath.replace(/\\/g, '/');
          return (
            normalizedPath === normalizedFolder ||
            normalizedPath.startsWith(`${normalizedFolder}/`)
          );
        },
      );

      const folderIdFromPath = folderEntry?.[1];

      if (
        folderIdFromPath &&
        disabledMusicFolderIds.value.includes(folderIdFromPath)
      ) {
        return true;
      }
    }

    return false;
  }

  async function startScan() {
    const { data: startScanData } = await fetchData('/startScan');

    if (startScanData) {
      addSuccessSnack('Scan started.');
    }
  }

  async function downloadMedia(track: DownloadTrack) {
    const { data: downloadMediaData } = await fetchData<Blob>('/download', {
      method: 'GET',
      query: {
        id: track.streamUrlId,
      },
      responseType: 'blob',
    });

    if (downloadMediaData) {
      downloadFileFromBlob(downloadMediaData, track);
    }
  }

  async function getMusicFolders() {
    const { data: musicFoldersData } = await fetchData('/getMusicFolders', {
      transform: /* istanbul ignore next -- @preserve */ (response) => {
        const folders = response.musicFolders.musicFolder || [];
        const paths: Record<string, string> = {};

        folders.forEach((folder) => {
          if (folder.path) {
            paths[folder.path] = String(folder.id);
          }
        });

        musicFolderPaths.value = paths;

        const formattedFolders = folders.map<FormattedMusicFolder>(
          (folder) => ({
            ...folder,
            image: IMAGE_DEFAULT_BY_TYPE.folder,
          }),
        );

        musicFolders.value = formattedFolders;

        return {
          folders: formattedFolders,
          tracks: [],
        };
      },
    });

    return musicFoldersData || DEFAULT_MEDIA_LIBRARY;
  }

  async function getIndexes(musicFolderId: string) {
    const { data: indexesData } = await fetchData('/getIndexes', {
      query: {
        musicFolderId,
      },
      transform: /* istanbul ignore next -- @preserve */ (response) => ({
        folders: (response.indexes.index || [])
          .flatMap((index) => index.artist!)
          .map((artist) => formatArtist({ ...artist, musicFolderId })),
        tracks: (response.indexes.child || []).map((track, index) =>
          formatTrack({ ...track, musicFolderId }, index),
        ),
      }),
    });

    return indexesData || DEFAULT_MEDIA_LIBRARY;
  }

  async function getMusicDirectory(id: string) {
    const { data: musicDirectoryData } = await fetchData('/getMusicDirectory', {
      query: {
        id,
      },
      transform: /* istanbul ignore next -- @preserve */ (response) => {
        const items = response.directory.child || [];

        return {
          folders: items.filter((item) => item.isDir).map(formatTrack),
          tracks: items
            .filter((item) => !item.isDir && item.type === 'music')
            .map(formatTrack),
        };
      },
    });

    return musicDirectoryData || DEFAULT_MEDIA_LIBRARY;
  }

  function getFiles(filesParams: FilesParams = {}) {
    const { id, slug = [] } = filesParams;

    if (slug.length) {
      return getMusicDirectory(slug.at(-1) as string);
    }

    if (id) {
      return getIndexes(id);
    }

    return getMusicFolders();
  }

  /* istanbul ignore next -- @preserve */
  async function scrobble(id: string) {
    await fetchData('/scrobble', {
      query: {
        id,
      },
    });
  }

  return {
    disabledMusicFolderIds,
    downloadMedia,
    enabledMusicFolderIds,
    getFiles,
    getIndexes,
    getMusicDirectory,
    getMusicFolders,
    isMusicFolderDisabled,
    musicFolders,
    scrobble,
    startScan,
    toggleMusicFolder,
  };
}
