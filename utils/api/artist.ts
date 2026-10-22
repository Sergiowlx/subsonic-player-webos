import type { UseFetchOptions } from 'nuxt/app';

export async function fetchAndMergeArtistData(
  id: string,
  fetchFn: <DataT = SubsonicResponse>(
    url: string,
    options: UseFetchOptions<SubsonicResponse, DataT>,
    requestOptions?: { notifyOnError?: boolean },
  ) => Promise<{
    data: DataT | null;
    error?: Error | null;
  }>,
) {
  // Artist info is optional metadata. Navidrome may not have Last.fm data for
  // every artist, so it must not hide an otherwise valid artist record.
  const { data: artistInfo } = await fetchFn(
    '/getArtistInfo2',
    {
      query: {
        id,
      },
    },
    { notifyOnError: false },
  );

  const { data: artistData } = await fetchFn('/getArtist', {
    query: {
      id,
    },
  });

  if (!artistData?.artist) {
    return null;
  }

  const { data: similarSongs } = await fetchFn('/getSimilarSongs2', {
    query: {
      count: PREVIEW_TRACK_COUNT,
      id,
    },
  });

  const { data: topSongs } = await fetchFn('/getTopSongs', {
    query: {
      artist: artistData.artist?.name || '',
      count: PREVIEW_TRACK_COUNT,
    },
  });

  const mergedArtists = {
    ...artistInfo?.artistInfo2,
    ...artistData.artist,
    similarSongs: similarSongs?.similarSongs2?.song,
    topSongs: topSongs?.topSongs?.song,
  };

  return formatArtist(mergedArtists);
}
