<script setup lang="ts">
import ButtonLink from '@/components/Atoms/ButtonLink.vue';
import MixedTracksList from '@/components/Organisms/TrackLists/MixedTracksList.vue';
import PreloadImage from '@/components/Molecules/PreloadImage.vue';
import { isWebOSTV } from '@/utils/webos';

const {
  clearQueue,
  currentTrack,
  playTrackFromQueueList,
  queueList,
  removeTrackFromQueueList,
} = useAudioPlayer();
const { closeQueueList, toggleQueueList } = useQueue();
const { addToPlaylistModal } = usePlaylist();
const { downloadMedia } = useMediaLibrary();
const { openTrackInformationModal } = useMediaInformation();
const { getImageUrl } = useAPI();
const isTV = ref(false);

const currentTrackIndex = computed(() => {
  const exactIndex = queueList.value.indexOf(currentTrack.value);
  if (exactIndex !== -1) return exactIndex;

  return queueList.value.findIndex(
    (track) => track.id === currentTrack.value.id,
  );
});

const queueStartIndex = computed(() =>
  currentTrackIndex.value === -1 ? 0 : currentTrackIndex.value + 1,
);
const upcomingTracks = computed(() =>
  queueList.value.slice(queueStartIndex.value),
);

function getTrackArtist(track: MixedTrack) {
  if ('artists' in track && track.artists.length) {
    return track.artists.map((artist) => artist.name).join(', ');
  }
  if ('author' in track && track.author) return track.author;
  if ('podcastName' in track && track.podcastName) return track.podcastName;
  if ('homePageUrl' in track) return 'Radio station';

  return '';
}

const currentArtist = computed(() => getTrackArtist(currentTrack.value));

const artworkBackground = computed(() => {
  const image = currentTrack.value.image;
  if (!image || Object.values(IMAGE_DEFAULT_BY_TYPE).includes(image as Icon)) {
    return undefined;
  }

  return `url("${getImageUrl(image, '600')}")`;
});

function playUpcomingTrack(index: number) {
  playTrackFromQueueList(queueStartIndex.value + index);
}

function removeUpcomingTrack(track: MixedTrack, index: number) {
  removeTrackFromQueueList(track.id, queueStartIndex.value + index);
}

function closeOnOutsideClick() {
  if (isTV.value) closeQueueList();
}

onMounted(() => {
  isTV.value = isWebOSTV();
});
</script>

<template>
  <div
    class="queueWrapper webosQueueList"
    :class="{ [$style.tvQueueOverlay]: isTV }"
    :style="
      isTV && artworkBackground
        ? { '--queue-artwork-background': artworkBackground }
        : undefined
    "
    @click="closeOnOutsideClick"
  >
    <template v-if="isTV">
      <div :class="$style.tvQueueArtwork" aria-hidden="true" />
      <div :class="$style.tvQueueShade" aria-hidden="true" />

      <section :class="$style.tvQueueNowPlaying">
        <div
          v-if="currentTrackIndex !== -1"
          :class="$style.tvQueueCurrentDetails"
        >
          <PreloadImage
            :class="$style.tvQueueCover"
            :image="currentTrack.image"
            size="400"
          />
          <div :class="$style.tvQueueTrackText">
            <p :class="$style.tvQueueTrackTitle">{{ currentTrack.name }}</p>
            <p v-if="currentArtist" :class="$style.tvQueueTrackArtist">
              {{ currentArtist }}
            </p>
          </div>
        </div>
      </section>

      <aside :class="$style.tvQueuePanel" aria-label="Queue" @click.stop>
        <div :class="$style.tvQueueHeading">
          <h1>Queue</h1>
          <ButtonLink
            ref="clearQueueButton"
            :icon="ICONS.clear"
            title="Clear queue"
            @click="clearQueue"
          >
            Clear
          </ButtonLink>
        </div>

        <div
          v-if="currentTrackIndex !== -1"
          :class="$style.tvQueueNowRow"
        >
          <h2>Now Playing</h2>
          <div :class="$style.tvQueueTrackRow">
            <PreloadImage
              :class="$style.tvQueueRowCover"
              :image="currentTrack.image"
              size="120"
            />
            <div :class="$style.tvQueueRowText">
              <p :class="$style.tvQueueRowTitle">{{ currentTrack.name }}</p>
              <p :class="$style.tvQueueRowArtist">{{ currentArtist }}</p>
            </div>
            <span :class="$style.tvQueuePlayingMark" aria-label="Playing">
              <component :is="ICONS.play" :size="24" weight="fill" />
            </span>
          </div>
        </div>

        <div :class="$style.tvQueueNextSection">
          <h2>Next</h2>
          <div data-webos-scrollable :class="$style.tvQueueItems">
            <div v-if="upcomingTracks.length" :class="$style.tvQueueTrackList">
              <div
                v-for="(track, index) in upcomingTracks"
                :key="`${track.id}-${index}`"
                :class="$style.tvQueueUpcomingRow"
              >
                <button
                  type="button"
                  :class="[$style.tvQueueUpcomingPlay, 'webosQueueUpcomingPlay']"
                  :aria-label="`Play ${track.name}`"
                  @click="playUpcomingTrack(index)"
                >
                  <PreloadImage
                    :class="$style.tvQueueRowCover"
                    :image="track.image"
                    size="160"
                  />
                  <span :class="$style.tvQueueRowText">
                    <span :class="$style.tvQueueRowTitle">{{ track.name }}</span>
                    <span :class="$style.tvQueueRowArtist">
                      {{ getTrackArtist(track) }}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  :class="[$style.tvQueueRemoveButton, 'webosQueueRemoveButton']"
                  :aria-label="`Remove ${track.name} from queue`"
                  :title="`Remove ${track.name} from queue`"
                  @click.stop="removeUpcomingTrack(track, index)"
                >
                  <component :is="ICONS.remove" :size="26" weight="regular" />
                </button>
              </div>
            </div>
            <p v-else :class="$style.tvQueueEmpty">No upcoming tracks</p>
          </div>
        </div>
      </aside>
    </template>

    <template v-else>
      <div class="centerAll">
        <ButtonLink
          ref="closeQueueList"
          class="queueAction"
          fullWidth
          :icon="ICONS.queueClose"
          iconWeight="bold"
          title="Close queue list"
          @click="toggleQueueList"
        >
          Close queue list
        </ButtonLink>
      </div>

      <div class="spaceBetween">
        <div />

        <ButtonLink
          ref="clearQueueButton"
          :icon="ICONS.clear"
          title="Clear queue"
          @click="clearQueue"
        >
          Clear queue
        </ButtonLink>
      </div>

      <h2>Queue ({{ queueList.length }})</h2>

      <MixedTracksList
        :tracks="queueList"
        @addToPlaylist="addToPlaylistModal"
        @downloadMedia="downloadMedia"
        @mediaInformation="openTrackInformationModal"
        @playTrack="playTrackFromQueueList"
        @remove="({ id }) => removeTrackFromQueueList(id)"
      />
    </template>
  </div>
</template>

<style module>
.tvQueueOverlay {
  z-index: 40;
  overflow: hidden;
  color: var(--font-color);
  background: #101114;
  isolation: isolate;
}

.tvQueueArtwork,
.tvQueueShade {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tvQueueArtwork {
  inset: -6%;
  z-index: 0;
  background-image: var(--queue-artwork-background);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  filter: blur(36px) brightness(0.62) saturate(1.08);
  transform: scale(1.08);
}

.tvQueueShade {
  z-index: 1;
  background:
    linear-gradient(
      90deg,
      rgb(8 10 14 / 22%) 0%,
      rgb(8 10 14 / 34%) 49%,
      rgb(8 10 14 / 44%) 100%
    ),
    rgb(8 10 14 / 14%);
}

.tvQueueNowPlaying {
  position: absolute;
  z-index: 2;
  inset: 0 38% 0 0;
  display: flex;
  align-items: flex-end;
  padding: 0 clamp(32px, 5vw, 80px) clamp(42px, 7vh, 84px);
  pointer-events: none;
}

.tvQueueCurrentDetails {
  display: flex;
  align-items: center;
  max-width: 100%;
}

.tvQueueCover {
  flex: 0 0 clamp(150px, 19vh, 240px);
  width: clamp(150px, 19vh, 240px);
  height: clamp(150px, 19vh, 240px);
  margin-right: clamp(16px, 1.8vw, 28px);
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgb(0 0 0 / 32%);
}

.tvQueueTrackText,
.tvQueueRowText {
  min-width: 0;
}

.tvQueueTrackTitle,
.tvQueueTrackArtist,
.tvQueueRowTitle,
.tvQueueRowArtist {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tvQueueTrackTitle {
  margin: 0 0 5px;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.16;
  font-weight: var(--font-weight-bold);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  white-space: normal;
}

.tvQueueTrackArtist {
  margin: 0;
  color: rgb(255 255 255 / 76%);
  font-size: clamp(1.25rem, 1.8vw, 1.6rem);
}

.tvQueuePanel {
  position: absolute;
  z-index: 3;
  inset: 0 0 0 auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 38%;
  min-width: 410px;
  max-width: 620px;
  padding: clamp(24px, 3vw, 44px) clamp(24px, 3vw, 42px);
  overflow: hidden;
  background: rgb(9 10 13 / 72%);
  -webkit-backdrop-filter: blur(22px);
  backdrop-filter: blur(22px);
}

.tvQueueHeading {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(22px, 3vh, 36px);

  h1 {
    margin: 0;
    font-size: var(--h1-font-size);
  }

  button > svg + span {
    margin-left: 8px;
  }
}

.tvQueueNowRow {
  flex: 0 0 auto;
  margin-bottom: clamp(20px, 3vh, 34px);

  h2 {
    margin: 0 0 12px;
    font-size: 1rem;
    font-weight: var(--font-weight-bold);
  }
}

.tvQueueTrackRow {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 4px;
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: 7px;
  background: rgb(255 255 255 / 5%);
}

.tvQueueRowCover {
  flex: 0 0 96px;
  width: 96px;
  height: 96px;
  margin-right: 12px;
  overflow: hidden;
  border-radius: 4px;
}

.tvQueueRowText {
  flex: 1;
}

.tvQueueRowTitle {
  margin: 0 0 5px;
  font-size: 1.125rem;
  font-weight: var(--font-weight-bold);
  color: var(--font-color);
}

.tvQueueNowRow .tvQueueRowTitle {
  color: var(--theme-color);
}

.tvQueueRowArtist {
  margin: 0;
  color: var(--secondary-font-color);
  font-size: 1rem;
}

.tvQueuePlayingMark {
  display: flex;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  color: var(--font-color);
}

.tvQueueNextSection {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;

  > h2 {
    flex: 0 0 auto;
    margin: 0 0 12px;
    overflow: hidden;
    font-size: 1rem;
    font-weight: var(--font-weight-bold);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.tvQueueItems {
  flex: 1 1 0;
  height: 0;
  min-height: 0;
  padding-right: 8px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgb(255 255 255 / 5%);
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 32%);
    border-radius: 8px;
  }
}

.tvQueueTrackList {
  display: flex;
  flex-direction: column;
}

.tvQueueTrackList > * + * {
  margin-top: 10px;
}

.tvQueueUpcomingRow {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 4px;
  border: 1px solid rgb(255 255 255 / 5%);
  border-radius: 12px;
  transition:
    background-color 130ms ease-out,
    border-color 130ms ease-out;
}

.tvQueueUpcomingPlay {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  min-width: 0;
  padding: 8px;
  overflow: hidden;
  color: var(--font-color);
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 10px;
  transition:
    background-color 130ms ease-out,
    border-color 130ms ease-out;

  &:focus-within,
  &:hover,
  &:focus-visible,
  &.focused {
    background: rgb(255 255 255 / 9%);
    outline: none;
  }

  &:focus,
  &:focus-visible {
    outline: none;
  }

  &:focus-visible .tvQueueRowTitle,
  &.focused .tvQueueRowTitle {
    color: var(--theme-color);
  }
}

.tvQueueRemoveButton {
  display: flex;
  flex: 0 0 52px;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-left: 8px;
  color: var(--secondary-font-color);
  cursor: pointer;
  background: rgb(255 255 255 / 5%);
  border: 0;
  border-radius: 50%;
  transition:
    color 130ms ease-out,
    background-color 130ms ease-out,
    transform 130ms ease-out;

  &:hover,
  &:focus-visible,
  &.focused {
    color: var(--font-color);
    background: rgb(255 255 255 / 14%);
    outline: none;
  }

  &.focused {
    color: var(--theme-color);
    background: rgb(var(--theme-color-rgb), 0.2);
    transform: scale(1.06);
  }
}

.tvQueueUpcomingPlay .tvQueueRowCover {
  flex-basis: 76px;
  width: 76px;
  height: 76px;
}

.tvQueueUpcomingPlay .tvQueueRowText {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tvQueueUpcomingPlay .tvQueueRowTitle {
  margin-bottom: 5px;
}

.tvQueueRowTitle,
.tvQueueRowArtist {
  display: block;
}

.tvQueueEmpty {
  margin: 18px 0;
  color: var(--secondary-font-color);
  text-align: center;
}

@media (max-width: 900px) {
  .tvQueuePanel {
    width: 43%;
    min-width: 360px;
  }

  .tvQueueNowPlaying {
    right: 43%;
  }
}
</style>
