export function useAlbum() {
  const config = useRuntimeConfig();
  const { LOAD_SIZE } = config.public;

  const { fetchData } = useAPI();

  const newestAlbums = useState<Album[]>(STATE_NAMES.newestAlbums, () => []);
  const recentAlbums = useState<Album[]>(STATE_NAMES.recentAlbums, () => []);
  const frequentAlbums = useState<Album[]>(
    STATE_NAMES.frequentAlbums,
    () => [],
  );

  function resetAlbums() {
    newestAlbums.value = [];
    recentAlbums.value = [];
    frequentAlbums.value = [];
  }

  async function getAlbums(params: AlbumsParams) {
    const { enabledMusicFolderIds, isMusicFolderDisabled, musicFolders } =
      useMediaLibrary();

    // If no musicFolderId is provided and some libraries are disabled,
    // we fetch from each enabled library individually and merge the results.
    // This is the only way to reliably hide disabled libraries when the server
    // doesn't provide library IDs in the global list response.
    if (!params.musicFolderId && musicFolders.value.length > 0 && enabledMusicFolderIds.value.length < musicFolders.value.length) {
       // Multi-folder fetch strategy
       const fetchPromises = enabledMusicFolderIds.value.map(folderId => 
         fetchData('/getAlbumList2', {
           query: {
             ...params,
             musicFolderId: folderId,
             offset: 0, // Fetch first page from each
             size: (params.offset || 0) + (params.size || Number(LOAD_SIZE)),
             type: getSortType(params.type) || params.type || 'random',
           },
           transform: /* istanbul ignore next -- @preserve */ (response) =>
             (response.albumList2.album || []).map(album => formatAlbum({ ...album, musicFolderId: folderId })),
         })
       );

       const results = await Promise.all(fetchPromises);
       const allAlbums = results.flatMap(r => r.data || []);
       
       // Sort and slice the merged results to emulate server-side pagination
       const sortedAlbums = sortAlbums(allAlbums, params.type);
       return sortedAlbums.slice(params.offset || 0, (params.offset || 0) + (params.size || Number(LOAD_SIZE)));
    }

    const { data: albumsData } = await fetchData('/getAlbumList2', {
      query: {
        ...params,
        offset: params.offset || 0,
        size: params.size || Number(LOAD_SIZE),
        type: getSortType(params.type) || params.type || 'random',
      },
      transform: /* istanbul ignore next -- @preserve */ (response) => {
        const albums = (response.albumList2.album || []).map(formatAlbum);
        return albums.filter(
          (album) => !isMusicFolderDisabled(album.musicFolderId, album.path),
        );
      },
    });

    return albumsData || [];
  }

  function sortAlbums(albums: Album[], type: AlbumSortBy): Album[] {
    const out = [...albums];
    switch (type) {
      case 'newest':
        return out.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      case 'alphabeticalByName':
        return out.sort((a, b) => a.name.localeCompare(b.name));
      case 'alphabeticalByArtist':
        return out.sort((a, b) => (a.artists[0]?.name || '').localeCompare(b.artists[0]?.name || ''));
      case 'frequent':
        return out.sort((a, b) => (b.information?.playCount || 0) - (a.information?.playCount || 0));
      case 'random':
        return out.sort(() => Math.random() - 0.5);
      default:
        return out;
    }
  }

  async function getAlbum(id: string) {
    const { data: albumData } = await fetchData('/getAlbum', {
      query: {
        id,
      },
      transform: /* istanbul ignore next -- @preserve */ (response) =>
        formatAlbum(response.album),
    });

    return albumData;
  }

  /* istanbul ignore next -- @preserve */
  function getFrequentAlbums(size = 20) {
    return getAlbums({
      size,
      type: 'frequent',
    });
  }

  /* istanbul ignore next -- @preserve */
  function getNewestAlbums(size = 20) {
    return getAlbums({
      size,
      type: 'newest',
    });
  }

  /* istanbul ignore next -- @preserve */
  function getRandomAlbums(size = 20) {
    return getAlbums({
      size,
      type: 'random',
    });
  }

  /* istanbul ignore next -- @preserve */
  function getRecentAlbums(size = 20) {
    return getAlbums({
      size,
      type: 'recent',
    });
  }

  async function getDiscoverAlbums() {
    const [frequentAlbumsData, newestAlbumsData, recentAlbumsData] =
      await Promise.all([
        getFrequentAlbums(),
        getNewestAlbums(),
        getRecentAlbums(),
      ]);

    frequentAlbums.value = frequentAlbumsData;
    newestAlbums.value = newestAlbumsData;
    recentAlbums.value = recentAlbumsData;
  }

  return {
    frequentAlbums,
    getAlbum,
    getAlbums,
    getDiscoverAlbums,
    getFrequentAlbums,
    getNewestAlbums,
    getRandomAlbums,
    getRecentAlbums,
    newestAlbums,
    recentAlbums,
    resetAlbums,
  };
}
