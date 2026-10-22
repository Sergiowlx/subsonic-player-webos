<script setup lang="ts">
import ArtistsList from '@/components/Atoms/ArtistsList.vue';
import MarqueeScroll from '@/components/Atoms/MarqueeScroll.vue';
import PlayPauseButton from '@/components/Molecules/PlayPauseButton.vue';
import PreloadImage from '@/components/Molecules/PreloadImage.vue';
import ImageLink from '@/components/Organisms/ImageLink.vue';
import QueueButton from '@/components/Organisms/MusicPlayerAndQueue/Controls/QueueButton.vue';
import TrackSeeker from '@/components/Organisms/MusicPlayerAndQueue/Controls/TrackSeeker.vue';

import PlayerControls from './PlayerControls.vue';
import PlayerOptions from './PlayerOptions.vue';

const { currentTrack } = useAudioPlayer();
const { toggleQueuePlayer } = useQueue();
const isTV = isWebOSTV();

function onPlayerBarClick(event: MouseEvent) {
  if (!isTV) return;

  const target = event.target;
  if (
    target instanceof Element &&
    target.closest(
      'a, button, input, select, textarea, [role="button"], [class*="trackSeeker"]',
    )
  ) {
    return;
  }

  toggleQueuePlayer();
}
</script>

<template>
  <div :class="$style.musicPlayer" @click="onPlayerBarClick">
    <TrackSeeker
      :class="['desktopOnly', $style.trackSeeker]"
      hideThumb
    />

    <div :class="['spaceBetween', 'centerItems', $style.inner]">
      <div :class="['centerItems', $style.trackDetailsWrapper]">
        <QueueButton :class="['mobileOnly', $style.queueControl]" />

        <ImageLink
          v-if="'albumId' in currentTrack && currentTrack.albumId"
          ref="albumImageLink"
          :class="$style.image"
          :image="currentTrack.image"
          :title="`Go to album ${currentTrack.name}`"
          :to="{
            name: ROUTE_NAMES.album,
            params: {
              [ROUTE_PARAM_KEYS.album.id]: currentTrack.albumId,
            },
          }"
        />

        <ImageLink
          v-else-if="'podcastId' in currentTrack && currentTrack.podcastId"
          ref="podcastImageLink"
          :class="$style.image"
          :image="currentTrack.image"
          :title="`Go to podcast ${currentTrack.podcastName}`"
          :to="{
            name: ROUTE_NAMES.podcast,
            params: {
              [ROUTE_PARAM_KEYS.podcast.sortBy]:
                ROUTE_PODCAST_SORT_BY_PARAMS.All,
              [ROUTE_PARAM_KEYS.podcast.id]: currentTrack.podcastId,
            },
          }"
        />

        <button
          v-else-if="isTV"
          :class="[$style.image, $style.imageNowPlaying]"
          aria-label="Open now playing"
          title="Open now playing"
          @click.stop="toggleQueuePlayer"
        >
          <PreloadImage :image="currentTrack.image" />
        </button>

        <PreloadImage
          v-else
          :class="$style.image"
          :image="currentTrack.image"
        />

        <div :class="$style.trackDetails">
          <p v-if="isTV" :class="['strong', 'mBXS', $style.trackTitle]">
            {{ currentTrack.name }}
          </p>

          <MarqueeScroll v-else>
            <p class="strong mBXS">
              {{ currentTrack.name }}
            </p>
          </MarqueeScroll>

          <MarqueeScroll
            v-if="'artists' in currentTrack && currentTrack.artists.length"
            ref="artistsMarqueeScroll"
          >
            <ArtistsList :artists="currentTrack.artists" class="smallFont" />
          </MarqueeScroll>

          <MarqueeScroll
            v-if="'author' in currentTrack && currentTrack.author"
            ref="authorMarqueeScroll"
          >
            <p>{{ currentTrack.author }}</p>
          </MarqueeScroll>
        </div>
      </div>

      <PlayPauseButton :class="['mobileOnly', $style.playPauseButton]" />

      <div :class="['centerAll', 'desktopOnly', $style.transportControls]">
        <PlayerControls />
      </div>

      <PlayerOptions :class="['desktopOnly', $style.playerOptions]" />
    </div>

    <TrackSeeker
      :class="['mobileOnly', $style.trackSeeker]"
      :height="3"
      hideThumb
    />
  </div>
</template>

<style module>
.musicPlayer {
  --music-player-bottom: var(--header-height);

  position: fixed;
  inset: auto 0 var(--music-player-bottom) 0;
  z-index: 10;
  height: var(--media-player-height);
  max-height: var(--media-player-height);
  background-color: var(--background-color);
  border-top: 1px solid var(--border-color);
  box-shadow: var(--dark-box-shadow-medium);

  @media (--tablet-up) {
    --music-player-bottom: 0;
  }
}

.trackSeeker {
  position: absolute;
  z-index: 10;
  display: block;
  transform: translateY(-50%);
}

.inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--width-height-100);
}

.trackDetailsWrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--default-space);

  @media (--tablet-up) {
    flex: 0 0 25%;
    max-width: 25%;
  }
}

.playerOptions {
  justify-content: end;

  @media (--tablet-up) {
    flex: 0 0 25%;
  }
}

.transportControls {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
}

.trackDetails,
.trackDetailsWrapper {
  overflow: hidden;
}

.trackTitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.queueControl {
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0;
}

.image {
  /* Remove white background that causes empty space issues */
  background-color: transparent;
}

.image,
.playPauseButton {
  flex-shrink: 0;
  width: var(--media-player-height);
  height: var(--media-player-height);
}

.image :global(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playPauseButton {
  justify-content: center;
}
</style>
