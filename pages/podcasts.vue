<script setup lang="ts">
import ButtonLink from '@/components/Atoms/ButtonLink.vue';
import GridWrapper from '@/components/Atoms/GridWrapper.vue';
import HeaderWithAction from '@/components/Atoms/HeaderWithAction.vue';
import NoMediaMessage from '@/components/Atoms/NoMediaMessage.vue';
import LibraryNavigation from '@/components/Molecules/LibraryNavigation.vue';
import LoadingData from '@/components/Molecules/LoadingData.vue';
import RefreshButton from '@/components/Molecules/RefreshButton.vue';
import BookmarksTracksList from '@/components/Organisms/TrackLists/BookmarksTracksList.vue';
import PodcastItem from '@/components/Organisms/PodcastItem.vue';
import PodcastEpisodesList from '@/components/Organisms/TrackLists/PodcastEpisodesList.vue';

const { viewLayout } = useViewLayout();
const { downloadMedia } = useMediaLibrary();
const { addToPlaylistModal } = usePlaylist();
const { openPodcastInformationModal, openTrackInformationModal } =
  useMediaInformation();
const {
  addTracksToQueue,
  addTrackToQueue,
  playTracks,
  setCurrentTime,
} = useAudioPlayer();
const { dragStart } = useDragAndDrop();
const { getMediaTracks } = useMediaTracks();
const { bookmarks, deleteBookmark, getBookmarks } = useBookmark();
const {
  addPodcastModal,
  deletePodcastEpisode,
  downloadPodcastEpisode,
  getPodcastsAndNewestPodcastEpisodes,
  newestPodcastEpisodes,
  podcasts,
} = usePodcast();

/* istanbul ignore next -- @preserve */
const { refresh, status } = useAsyncData(
  ASYNC_DATA_NAMES.podcasts,
  async () => {
    await Promise.all([
      getPodcastsAndNewestPodcastEpisodes(),
      getBookmarks(),
    ]);

    return {
      bookmarks: bookmarks.value,
      newestPodcastEpisodes: newestPodcastEpisodes.value,
      podcasts: podcasts.value,
    };
  },
  {
    default: () => ({
      bookmarks: [],
      newestPodcastEpisodes: [],
      podcasts: [],
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === 'refresh:manual') {
        return undefined;
      }

      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    },
  },
);

const gridWrapperProps = computed(() =>
  viewLayout.value === 'gridLayout' ? undefined : '0',
);
const hasPodcastContent = computed(
  () =>
    podcasts.value.length ||
    bookmarks.value.length ||
    newestPodcastEpisodes.value.length,
);

async function onAddPodcastToQueue(podcast: Podcast) {
  const podcastEpisodes = await getMediaTracks(podcast);

  if (podcastEpisodes) {
    await addTracksToQueue(podcastEpisodes);
  }
}

function onPlayEpisode(episode: PodcastEpisode) {
  playTracks([episode]);
}

async function onResumeBookmarkedEpisode(index: number) {
  const episode = bookmarks.value[index];

  if (!episode) return;

  await playTracks([episode], -1);
  setCurrentTime(episode.position);
}

async function onPlayPodcast(podcast: Podcast) {
  const podcastEpisodes = await getMediaTracks(podcast);

  if (podcastEpisodes) {
    await playTracks(podcastEpisodes);
  }
}

useHead({
  title: () => ['Podcasts'].filter(Boolean).join(' - '),
});
</script>

<template>
  <LibraryNavigation />

  <HeaderWithAction>
    <h1>Podcasts</h1>

    <template #actions>
      <RefreshButton :status @refresh="refresh" />

      <ButtonLink
        ref="addPodcastButton"
        :icon="ICONS.add"
        iconSize="large"
        title="Add podcast"
        @click="addPodcastModal"
      >
        Add podcast
      </ButtonLink>
    </template>
  </HeaderWithAction>

  <LoadingData :status>
    <div
      v-if="hasPodcastContent"
      ref="podcastsContent"
      :class="viewLayout"
    >
      <GridWrapper
        v-if="podcasts.length"
        class="mBXL"
        :desktop="gridWrapperProps"
        :mobile="gridWrapperProps"
        :spacing="gridWrapperProps"
        :tablet="gridWrapperProps"
      >
        <PodcastItem
          v-for="podcast in podcasts"
          :key="podcast.id"
          :podcast
          @addPodcastToQueue="onAddPodcastToQueue"
          @dragStart="dragStart"
          @mediaInformation="openPodcastInformationModal"
          @playPodcast="onPlayPodcast"
        />
      </GridWrapper>

      <section v-if="bookmarks.length" class="mBXL">
        <h2>Continue listening</h2>

        <BookmarksTracksList
          :bookmarks
          @addToPlaylist="addToPlaylistModal"
          @downloadMedia="downloadMedia"
          @mediaInformation="openTrackInformationModal"
          @playTrack="onResumeBookmarkedEpisode"
          @remove="deleteBookmark"
        />
      </section>

      <section v-if="newestPodcastEpisodes.length">
        <h3>Latest Podcast Episodes</h3>

        <PodcastEpisodesList
          isRecentList
          :podcastEpisodes="newestPodcastEpisodes"
          @addToPlaylist="addToPlaylistModal"
          @addToQueue="addTrackToQueue"
          @deleteEpisode="deletePodcastEpisode"
          @downloadEpisode="downloadPodcastEpisode"
          @downloadMedia="downloadMedia"
          @dragStart="dragStart"
          @episodeInformation="openTrackInformationModal"
          @playEpisode="onPlayEpisode"
        />
      </section>
    </div>

    <NoMediaMessage
      v-else
      :icon="IMAGE_DEFAULT_BY_TYPE.podcast"
      message="No podcasts found."
    />
  </LoadingData>
</template>
