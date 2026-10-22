export function useArtist() {
  const { fetchData } = useAPI();

  async function getArtists() {
    const { enabledMusicFolderIds, isMusicFolderDisabled, musicFolders } =
      useMediaLibrary();

    // If some libraries are disabled, fetch from each enabled library and merge.
    if (musicFolders.value.length > 0 && enabledMusicFolderIds.value.length < musicFolders.value.length) {
      const fetchPromises = enabledMusicFolderIds.value.map(folderId => 
        fetchData('/getIndexes', {
          query: {
            musicFolderId: folderId,
          },
          transform: /* istanbul ignore next -- @preserve */ (response) =>
            (response.indexes.index || [])
              .flatMap((index) => index.artist!)
              .map(artist => formatArtist({ ...artist, musicFolderId: folderId })),
        })
      );

      const results = await Promise.all(fetchPromises);
      const allArtists = results.flatMap(r => r.data || []);
      
      // Remove potential duplicates between folders (if any) and sort
      const uniqueArtistsMap = new Map<string, Artist>();
      allArtists.forEach(a => uniqueArtistsMap.set(a.id, a));
      
      return Array.from(uniqueArtistsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }

    const { data: artistsData } = await fetchData('/getArtists', {
      transform: /* istanbul ignore next -- @preserve */ (response) => {
        const artists = (response.artists.index || [])
          .flatMap((index) => index.artist!)
          .map(formatArtist);
        return artists.filter(
          (artist) => !isMusicFolderDisabled(artist.musicFolderId, artist.path),
        );
      },
    });

    return artistsData || [];
  }

  function getArtist(id: string) {
    const route = useRoute();
    const config = useRuntimeConfig();
    const shouldFetchFromClient =
      config.public.SPA_MODE || (import.meta.client && isWebOSTV());

    if (shouldFetchFromClient) {
      return useAsyncData(
        route.fullPath,
        () => fetchAndMergeArtistData(id, fetchData),
        {
          default: () => null,
          getCachedData: (key, nuxtApp) =>
            nuxtApp.payload.data[key] || nuxtApp.static.data[key],
        },
      );
    }

    return useFetch('/api/artist', {
      default: () => null,
      getCachedData: (key, nuxtApp) =>
        nuxtApp.payload.data[key] || nuxtApp.static.data[key],
      key: route.fullPath,
      query: {
        id,
      },
      transform: (response) => response.data,
    });
  }

  return {
    getArtist,
    getArtists,
  };
}
