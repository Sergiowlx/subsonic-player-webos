export function useSearch() {
  const config = useRuntimeConfig();
  const { LOAD_SIZE } = config.public;

  const { fetchData } = useAPI();

  async function search(params: SearchParams) {
    const { enabledMusicFolderIds, isMusicFolderDisabled, musicFolders } =
      useMediaLibrary();
    const { mediaType, offset, query } = params;

    // If some libraries are disabled, search in each enabled library and merge.
    if (
      musicFolders.value.length > 0 &&
      enabledMusicFolderIds.value.length < musicFolders.value.length
    ) {
      const fetchPromises = enabledMusicFolderIds.value.map((folderId) =>
        fetchData('/search3', {
          query: {
            albumCount: LOAD_SIZE,
            albumOffset: offset || 0,
            artistCount: LOAD_SIZE,
            artistOffset: offset || 0,
            musicFolderId: folderId,
            query,
            songCount: LOAD_SIZE,
            songOffset: offset || 0,
          },
          transform: /* istanbul ignore next -- @preserve */ (response) => {
            const results = formatAllMedia(response.searchResult3);
            // Ensure everything is tagged with the folder ID
            results.albums.forEach((a) => (a.musicFolderId = folderId));
            results.artists.forEach((a) => (a.musicFolderId = folderId));
            results.tracks.forEach((t) => (t.musicFolderId = folderId));
            return results;
          },
        }),
      );

      const results = await Promise.all(fetchPromises);
      const allAlbums = results.flatMap((r) => r.data?.albums || []);
      const allArtists = results.flatMap((r) => r.data?.artists || []);
      const allTracks = results.flatMap((r) => r.data?.tracks || []);

      const merged = {
        albums: deduplicate(allAlbums),
        artists: deduplicate(allArtists),
        tracks: deduplicate(allTracks),
      };

      return merged[mediaType] || [];
    }

    const { data: searchData } = await fetchData('/search3', {
      query: {
        albumCount: LOAD_SIZE,
        albumOffset: offset || 0,
        artistCount: LOAD_SIZE,
        artistOffset: offset || 0,
        query,
        songCount: LOAD_SIZE,
        songOffset: offset || 0,
      },
      transform: /* istanbul ignore next -- @preserve */ (response) => {
        const results = formatAllMedia(response.searchResult3);

        return {
          albums: results.albums.filter(
            (album) => !isMusicFolderDisabled(album.musicFolderId, album.path),
          ),
          artists: results.artists.filter(
            (artist) => !isMusicFolderDisabled(artist.musicFolderId),
          ),
          tracks: results.tracks.filter(
            (track) =>
              !isMusicFolderDisabled(
                track.musicFolderId,
                track.path || track.information.path,
              ),
          ),
        };
      },
    });

    return searchData?.[mediaType] || DEFAULT_ALL_MEDIA[mediaType];
  }

  function deduplicate<T extends { id: string }>(items: T[]): T[] {
    const map = new Map<string, T>();
    items.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }

  return {
    search,
  };
}
