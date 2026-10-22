<script setup lang="ts">
import ArtistsList from '@/components/Atoms/ArtistsList.vue';
import ButtonLink from '@/components/Atoms/ButtonLink.vue';
import LinkOrText from '@/components/Atoms/LinkOrText.vue';
import MarqueeScroll from '@/components/Atoms/MarqueeScroll.vue';
import FavouriteButton from '@/components/Molecules/FavouriteButton.vue';
import PreloadImage from '@/components/Molecules/PreloadImage.vue';
import MainPlayerControls from '@/components/Organisms/MusicPlayerAndQueue/Controls/MainPlayerControls.vue';
import PlaybackRateButton from '@/components/Organisms/MusicPlayerAndQueue/Controls/PlaybackRateButton.vue';
import RepeatButton from '@/components/Organisms/MusicPlayerAndQueue/Controls/RepeatButton.vue';
import ShuffleButton from '@/components/Organisms/MusicPlayerAndQueue/Controls/ShuffleButton.vue';
import TrackSeeker from '@/components/Organisms/MusicPlayerAndQueue/Controls/TrackSeeker.vue';

const {
  currentTime,
  currentTrack,
  fastForwardTrack,
  isPodcastEpisode,
  isRadioStation,
  isTrack,
  rewindTrack,
} = useAudioPlayer();
const { getImageUrl } = useAPI();
const { toggleQueueList, toggleQueuePlayer } = useQueue();
const isTV =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'file:' ||
    window.location.search.includes('webos=true') ||
    document.body.classList.contains('webosTV'));
const artworkBackground = computed(() => {
  if (
    Object.values(IMAGE_DEFAULT_BY_TYPE).includes(
      currentTrack.value.image as Icon,
    )
  ) {
    return undefined;
  }

  return `url("${getImageUrl(currentTrack.value.image, '600')}")`;
});
</script>

<template>
  <div
    class="queueWrapper column"
    :class="{ [$style.tvPlayer]: isTV, tvPlayer: isTV }"
    :style="
      isTV && artworkBackground
        ? { '--tv-artwork-background': artworkBackground }
        : undefined
    "
  >
    <ButtonLink
      v-if="!isTV"
      ref="closeQueueMenu"
      class="queueAction"
      fullWidth
      :icon="ICONS.queueClose"
      iconWeight="bold"
      title="Close queue menu"
      @click="toggleQueuePlayer"
    >
      Close queue menu
    </ButtonLink>

    <div :class="['column', $style.playerWrapper]">
      <div :class="$style.wrapper">
        <div :class="['mBXL', $style.inner]">
          <div :class="$style.imageWrapper">
            <div :class="$style.imageInner">
              <div :class="$style.preloadImageWrapper">
                <button
                  v-if="!isTV"
                  ref="rewindButton"
                  :class="[$style.rewindFastForwardButton, $style.rewindButton]"
                  @click="doubleClick(rewindTrack)"
                >
                  <span class="visuallyHidden">
                    {{ REWIND_FAST_FORWARD_TITLES.rewind }}
                  </span>
                </button>
                <button
                  v-if="!isTV"
                  ref="fastForwardButton"
                  :class="[
                    $style.rewindFastForwardButton,
                    $style.fastForwardButton,
                  ]"
                  @click="doubleClick(fastForwardTrack)"
                >
                  <span class="visuallyHidden">
                    {{ REWIND_FAST_FORWARD_TITLES.fastForward }}
                  </span>
                </button>
                <PreloadImage
                  :class="$style.preloadImage"
                  :image="currentTrack.image"
                  size="600"
                />
              </div>
            </div>
          </div>
        </div>

        <div :class="$style.trackDetailsWrapper">
          <div :class="['mBAllL', 'column', $style.trackDetails]">
            <div>
              <p v-if="isTV" :class="$style.nowPlayingLabel">NOW PLAYING</p>
              <div :class="{ [$style.tvTrackHeading]: isTV }">
                <MarqueeScroll :class="{ [$style.tvTrackTitle]: isTV }" inert>
                  <h2 class="strong mBXS">
                    {{ currentTrack.name }}
                  </h2>
                </MarqueeScroll>

                <FavouriteButton
                  v-if="isTV && 'favourite' in currentTrack"
                  :id="currentTrack.id"
                  :class="$style.tvTrackFavourite"
                  :favourite="currentTrack.favourite"
                  :type="currentTrack.type"
                />
              </div>

              <template v-if="isTrack">
                <MarqueeScroll
                  v-if="'album' in currentTrack && currentTrack.album"
                  ref="albumMarqueeScroll"
                >
                  <LinkOrText
                    :isLink="!!currentTrack.albumId"
                    :text="currentTrack.album"
                    :to="{
                      name: ROUTE_NAMES.album,
                      params: {
                        [ROUTE_PARAM_KEYS.album.id]: currentTrack.albumId,
                      },
                    }"
                  />
                </MarqueeScroll>

                <MarqueeScroll
                  v-if="
                    'artists' in currentTrack && currentTrack.artists.length
                  "
                  ref="artistsMarqueeScroll"
                >
                  <ArtistsList :artists="currentTrack.artists" />
                </MarqueeScroll>
              </template>

              <template v-if="isPodcastEpisode">
                <MarqueeScroll
                  v-if="'podcastId' in currentTrack && currentTrack.podcastId"
                  ref="podcastIdMarqueeScroll"
                >
                  <LinkOrText
                    :isLink="!!currentTrack.podcastId"
                    :text="currentTrack.podcastName"
                    :to="{
                      name: ROUTE_NAMES.podcast,
                      params: {
                        [ROUTE_PARAM_KEYS.podcast.sortBy]:
                          ROUTE_PODCAST_SORT_BY_PARAMS.All,
                        [ROUTE_PARAM_KEYS.podcast.id]: currentTrack.podcastId,
                      },
                    }"
                  />
                </MarqueeScroll>

                <MarqueeScroll
                  v-if="'author' in currentTrack && currentTrack.author"
                  ref="authorMarqueeScroll"
                >
                  <p>{{ currentTrack.author }}</p>
                </MarqueeScroll>
              </template>
            </div>

            <div :class="['fullWidth', { [$style.tvProgress]: isTV }]">
              <TrackSeeker
                :class="['fullWidth', { webosNowPlayingSeeker: isTV }]"
              />

              <div
                v-if="!isRadioStation"
                ref="timeProgress"
                class="smallFont centerItems spaceBetween"
              >
                <time>{{ secondsToHHMMSS(currentTime) }}</time>
                <time>{{ currentTrack.formattedDuration }}</time>
              </div>
            </div>

            <div
              v-if="isTV"
              :class="[$style.tvNowPlayingControls, 'tvNowPlayingControls']"
            >
              <ShuffleButton v-if="!isRadioStation" />

              <MainPlayerControls
                :class="$style.tvTransportControls"
                :showSeekControls="false"
              />

              <RepeatButton v-if="!isRadioStation" />

              <ButtonLink
                ref="openQueueList"
                class="webosQueueButton"
                :class="$style.tvQueueButton"
                :icon="ICONS.queue"
                iconWeight="bold"
                :showText="isTV"
                title="Queue"
                @click="toggleQueueList"
              >
                Queue
              </ButtonLink>

              <PlaybackRateButton v-if="isPodcastEpisode" />
            </div>

            <MainPlayerControls
              v-else
              :class="['fullWidth', $style.secondaryOptions]"
              :showSeekControls="true"
            />

            <div
              v-if="!isTV"
              :class="['centerAll', 'spaceBetween', $style.secondaryOptions]"
            >
              <FavouriteButton
                v-if="'favourite' in currentTrack"
                :id="currentTrack.id"
                :favourite="currentTrack.favourite"
                :type="currentTrack.type"
              />

              <ShuffleButton v-if="!isRadioStation" />

              <RepeatButton v-if="!isRadioStation" />

              <PlaybackRateButton v-if="isPodcastEpisode" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <ButtonLink
      v-if="!isTV"
      ref="openQueueList"
      class="queueAction"
      :fullWidth="true"
      :icon="ICONS.playlist"
      iconWeight="bold"
      title="Open queue list"
      @click="toggleQueueList"
    >
      Open queue list
    </ButtonLink>
  </div>
</template>

<style module>
.playerWrapper {
  flex: 1;
  width: var(--width-height-100);
  max-width: 700px;
  margin: auto;
}

.wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100vh - (var(--space-40) * 2) - (var(--space-16) * 2));
  padding: var(--space-40) var(--space-40) var(--space-16);
}

.inner {
  overflow: hidden;
}

.imageWrapper {
  display: flex;
  max-width: 500px;
  aspect-ratio: 1;
  margin: auto;
}

.imageInner {
  position: relative;
  aspect-ratio: 1;
}

.preloadImageWrapper {
  position: absolute;
  top: 0;
  width: var(--width-height-100);
}

.imageWrapper,
.imageInner,
.preloadImageWrapper,
.preloadImage {
  height: var(--width-height-100);
}

.rewindFastForwardButton {
  -webkit-tap-highlight-color: transparent;
  -webkit-tap-highlight-color: rgb(0 0 0 / 0%);
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 50%;
}

.rewindButton {
  left: 0;
}

.fastForwardButton {
  right: 0;
}

.trackDetailsWrapper {
  display: contents;
}

.trackDetails {
  flex: 1;
  justify-content: end;
  margin-top: auto;
}

.secondaryOptions {
  max-width: 400px;
  margin: 0 auto;
}

.tvPlayer {
  position: fixed;
  inset: 0;
  z-index: 20;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 12px clamp(20px, 4vw, 64px);
  overflow: hidden;
  background:
    radial-gradient(
      circle at 26% 48%,
      rgb(var(--theme-color-rgb), 0.16),
      transparent 34%
    ),
    var(--body-background-color);
  isolation: isolate;
}

.tvPlayer::before,
.tvPlayer::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
}

.tvPlayer::before {
  inset: -6%;
  z-index: 0;
  background-image: var(--tv-artwork-background);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  filter: blur(36px) brightness(0.6) saturate(1.1);
  transform: scale(1.08);
}

.tvPlayer::after {
  z-index: 1;
  background:
    linear-gradient(
      90deg,
      rgb(8 10 14 / 42%) 0%,
      rgb(8 10 14 / 24%) 48%,
      rgb(8 10 14 / 42%) 100%
    ),
    rgb(8 10 14 / 5%);
}

.tvAction {
  position: relative;
  z-index: 3;
  align-self: flex-start;
  padding: 10px 12px;
  color: var(--secondary-font-color);
}

.tvPlayer .playerWrapper {
  position: relative;
  z-index: 2;
  flex: 1;
  width: 100%;
  max-width: none;
  min-height: 0;
  margin: auto 0;
}

.tvPlayer .wrapper {
  box-sizing: border-box;
  flex-direction: row;
  gap: 6vw;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 12px 4vw;
}

.tvPlayer .inner {
  flex: 0 0 42vh;
  width: 42vh;
  max-width: 480px;
  margin: 0;
}

.tvPlayer .imageWrapper,
.tvPlayer .imageInner {
  width: 100%;
  max-width: 480px;
  height: 42vh;
  max-height: 480px;
}

.tvPlayer .imageWrapper {
  aspect-ratio: auto;
}

.tvPlayer .imageInner {
  position: relative;
  aspect-ratio: auto;
}

.tvPlayer .preloadImageWrapper {
  inset: 0;
  width: 100%;
  height: 100%;
}

.tvPlayer .trackDetailsWrapper {
  display: flex;
  flex: 1 1 520px;
  min-width: 0;
  max-width: 620px;
}

.tvPlayer .trackDetails {
  flex: 0 1 620px;
  align-self: center;
  justify-content: center;
  width: 100%;
  height: auto !important;
  min-height: 0;
  margin-top: 0;

  > *:not(:last-child) {
    margin-bottom: 0;
  }
}

.tvTrackHeading {
  display: flex;
  gap: 18px;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
}

.tvTrackTitle {
  flex: 1 1 0;
  width: 0 !important;
  min-width: 0;

  :global(h2) {
    padding-bottom: 0.12em;
    margin-bottom: 0 !important;
    line-height: 1.25;
  }
}

.tvTrackFavourite {
  display: inline-flex;
  flex: 0 0 52px;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  padding: 0;
  color: var(--font-color);
  background: rgb(255 255 255 / 8%);
  border-radius: 50%;
}

.tvProgress {
  margin-top: 4px;
  margin-bottom: 8px;
}

.tvNowPlayingControls {
  display: flex;
  gap: clamp(12px, 1.6vw, 24px);
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 620px;
  margin-top: 0;
}

.tvTransportControls {
  display: contents;
}

.tvQueueButton {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 100px;
  height: 56px;
  padding: 0 18px;
  color: var(--font-color);
  background: rgb(255 255 255 / 8%);
  border: 0;
  border-radius: 999px;
  transition:
    background-color 130ms ease-out,
    color 130ms ease-out;
}

.tvPlayer .preloadImage {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 12px;
  box-shadow: 0 24px 70px rgb(0 0 0 / 42%);
}

.nowPlayingLabel {
  margin-bottom: var(--space-12);
  font-size: 0.85rem;
  font-weight: var(--font-weight-bold);
  color: var(--theme-color);
  letter-spacing: 0.16em;
}

@media (height <= 800px) {
  .tvPlayer .inner {
    flex-basis: 38vh;
    width: 38vh;
  }

  .tvPlayer .imageWrapper,
  .tvPlayer .imageInner {
    height: 38vh;
  }
}
</style>
