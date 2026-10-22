export function formatAlbum(album: AlbumID3 & AlbumWithSongsID3): Album {
  const {
    coverArt: image = IMAGE_DEFAULT_BY_TYPE.album,
    created,
    duration,
    folder,
    folderId,
    id,
    musicFolderId,
    name,
    playCount = 0,
    song = [],
    songCount: trackCount,
    starred,
    year = DEFAULT_VALUE,
  } = album as any;

  const tracks = song.map(formatTrack);
  const tracksByDiscNumber = groupTracksByDiscNumber(tracks);

  return {
    artists: getArtists(album),
    created: formatDate(created),
    duration,
    favourite: !!starred,
    formattedDuration: secondsToHHMMSS(duration),
    genres: getGenres(album as unknown as Base),
    id,
    image,
    information: {
      playCount,
    },
    musicFolderId: musicFolderId || folderId || folder,
    name,
    path: album.song?.[0]?.path,
    size: bytesToMB(getAlbumSize(song)),
    totalDiscNumber: Object.keys(tracksByDiscNumber).length,
    trackCount,
    tracks,
    tracksByDiscNumber,
    type: MEDIA_TYPE.album,
    year,
  };
}

export function formatAllMedia(favourites: Starred2): AllMedia {
  const { album = [], artist = [], song = [] } = favourites;

  return {
    albums: album.map(formatAlbum),
    artists: artist.map(formatArtist),
    tracks: song.map(formatTrack),
  };
}

export function formatArtist(
  artistData: Partial<
    { similarSongs: SimilarSongs2['song'] } & {
      topSongs: TopSongs['song'];
    } & ArtistInfo2 &
      ArtistWithAlbumsID3
  >,
): Artist {
  const {
    album = [],
    albumCount: totalAlbums = 0,
    artistImageUrl = IMAGE_DEFAULT_BY_TYPE.artist,
    biography,
    coverArt,
    folder,
    folderId,
    id,
    lastFmUrl,
    musicBrainzId,
    musicFolderId,
    name = DEFAULT_VALUE,
    parent,
    similarArtist = [],
    similarSongs = [],
    starred,
    topSongs = [],
  } = artistData as any;

  const resolvedMusicFolderId = musicFolderId || folderId || folder || parent;

  return {
    albums: album.map((a: any) =>
      formatAlbum({ ...a, musicFolderId: resolvedMusicFolderId }),
    ),
    biography,
    favourite: !!starred,
    genres: getUniqueGenres(album),
    id: id!,
    image: coverArt || artistImageUrl,
    lastFmUrl,
    musicBrainzUrl: musicBrainzId
      ? `https://musicbrainz.org/artist/${musicBrainzId}`
      : undefined,
    musicFolderId: resolvedMusicFolderId,
    name,
    path:
      (artistData.album?.[0] as AlbumWithSongsID3 | undefined)?.song?.[0]
        ?.path || (artistData as any).path,
    similarArtist: similarArtist.map((s: any) =>
      formatSimilarArtist({ ...s, musicFolderId: resolvedMusicFolderId }),
    ),
    similarTracks: similarSongs.map(formatTrack),
    topTracks: topSongs.map(formatTrack),
    totalAlbums,
    totalTracks: getTracksTotal(album),
    type: MEDIA_TYPE.artist,
  };
}

export function formatBookmark(bookmark: FormattedBookmark): Bookmark {
  const position = (bookmark.position || 0) / 1000;

  return {
    ...formatPodcastEpisode(bookmark as unknown as ResponsePodcastEpisode),
    formattedPosition: secondsToHHMMSS(position),
    position,
    trackNumber: 0,
  };
}

export function formatGenre(genre: ResponseGenre): Genre {
  const { albumCount, name, songCount: trackCount, value } = genre;

  return {
    albumCount,
    name: name || value,
    trackCount,
  };
}

export function formatPlaylist(playlist: PlaylistWithSongs): Playlist {
  const {
    changed,
    comment,
    created,
    coverArt,
    duration,
    entry = [],
    id,
    name = '(Unnamed)',
    owner = DEFAULT_VALUE,
    public: playlistPublic = false,
    songCount: trackCount,
  } = playlist;

  const tracks = entry.map((media, index) =>
    media.type === 'podcastepisode'
      ? formatPodcastEpisode(media as ResponsePodcastEpisode)
      : formatTrack(media, index),
  );

  return {
    duration,
    formattedDuration: secondsToTimeFormat(duration),
    id,
    images: coverArt ? [coverArt] : getUniqueImages(tracks),
    information: {
      changed: formatDate(changed),
      comment,
      created: formatDate(created),
      owner,
      public: playlistPublic,
    },
    name,
    trackCount,
    tracks,
    type: MEDIA_TYPE.playlist,
  };
}

export function formatPodcast(podcast: PodcastChannel): Podcast {
  const {
    coverArt = IMAGE_DEFAULT_BY_TYPE.podcast,
    description,
    episode = [],
    id,
    originalImageUrl,
    title: name = 'Podcast',
    url,
  } = podcast;

  const podcastEpisodes = episode.map(formatPodcastEpisode);
  const episodes = getSortedPodcastEpisodes(podcastEpisodes);

  return {
    description,
    episodes,
    id,
    image: originalImageUrl || coverArt,
    lastUpdated: formatDate(getEarliestDate(episode)),
    name,
    totalDownloadedEpisodes: getDownloadedEpisodesLength(episode),
    totalEpisodes: episode.length,
    type: MEDIA_TYPE.podcast,
    url,
  };
}

export function formatPodcastEpisode(
  episode: ResponsePodcastEpisode,
): PodcastEpisode {
  const {
    album = DEFAULT_VALUE,
    artist: author = DEFAULT_VALUE,
    channelId: podcastId,
    coverArt: image = IMAGE_DEFAULT_BY_TYPE.podcastEpisode,
    description,
    duration,
    id,
    parent,
    publishDate,
    status,
    streamId,
    title: name,
  } = episode;

  return {
    author,
    description,
    downloaded: status === 'completed',
    duration: duration!,
    formattedDuration: secondsToHHMMSS(duration),
    genres: getGenres(episode),
    id,
    image,
    name,
    podcastId: parent || podcastId,
    podcastName: album,
    publishDate: formatDate(publishDate, {}),
    streamUrlId: streamId || id,
    trackNumber: 0,
    type: MEDIA_TYPE.podcastEpisode,
  };
}

export function formatRadioStation(
  station: InternetRadioStation,
): RadioStation {
  const {
    homePageUrl: radioStationHomePageUrl,
    homepageUrl: radioStationHomepageUrl,
    id,
    name,
    streamUrl,
  } = station;

  const homePageUrl = radioStationHomePageUrl || radioStationHomepageUrl;
  const image = homePageUrl
    ? `https://s2.googleusercontent.com/s2/favicons?domain=${encodeURIComponent(homePageUrl)}&sz=50`
    : IMAGE_DEFAULT_BY_TYPE.radioStation;

  return {
    duration: 0,
    formattedDuration: '',
    homePageUrl: radioStationHomePageUrl || radioStationHomepageUrl,
    id,
    image,
    name,
    streamUrlId: streamUrl,
    trackNumber: 0,
    type: MEDIA_TYPE.radioStation,
  };
}

export function formatTrack(track: Base, index: number): Track {
  const {
    album = DEFAULT_VALUE,
    albumId,
    bitRate = 0,
    contentType = DEFAULT_VALUE,
    coverArt: image = IMAGE_DEFAULT_BY_TYPE.track,
    created,
    discNumber = DEFAULT_VALUE,
    duration,
    folder,
    folderId,
    id,
    musicFolderId,
    parent,
    path = DEFAULT_VALUE,
    playCount = 0,
    size = 0,
    starred,
    suffix = DEFAULT_VALUE,
    title: name,
    track: trackNumber = DEFAULT_VALUE,
    transcodedContentType = DEFAULT_VALUE,
    transcodedSuffix = DEFAULT_VALUE,
    year = DEFAULT_VALUE,
  } = track as any;

  return {
    album,
    albumId: albumId || parent,
    artists: getArtists(track),
    discNumber,
    duration: duration!,
    favourite: !!starred,
    formattedDuration: secondsToHHMMSS(duration),
    genres: getGenres(track),
    id,
    image,
    index,
    information: {
      bitRate: `${bitRate} kbps`,
      contentType,
      created: formatDate(created),
      path,
      playCount,
      suffix,
      transcodedContentType,
      transcodedSuffix,
    },
    musicFolderId: musicFolderId || folderId || folder,
    name,
    path: (track as any).path,
    size: bytesToMB(size),
    streamUrlId: id,
    trackNumber,
    type: MEDIA_TYPE.track,
    year,
  };
}

function formatSimilarArtist(similarArtist: ArtistID3): SimilarArtist {
  const {
    coverArt = IMAGE_DEFAULT_BY_TYPE.artist,
    id,
    musicFolderId,
    name,
  } = similarArtist as any;

  return {
    id,
    image: coverArt,
    musicFolderId,
    name,
  };
}
