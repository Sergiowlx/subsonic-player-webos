<script setup lang="ts">
import NoMediaMessage from '@/components/Atoms/NoMediaMessage.vue';
import VirtualList from '@/components/Molecules/VirtualList.vue';
import TracksListItem from '@/components/Organisms/TrackLists/TracksListItem.vue';

interface TrackPage {
  items: Track[];
  startIndex: number;
}

const props = defineProps<{
  tracks: Track[];
}>();

const TRACK_ROW_HEIGHT =
  import.meta.client && document.body.classList.contains('webosTV') ? 70 : 55;
const TRACK_PAGE_HEIGHT = TRACK_ROW_HEIGHT * 2;

const trackPages = computed<TrackPage[]>(() => {
  const pages: TrackPage[] = [];
  for (let i = 0; i < props.tracks.length; i += 2) {
    pages.push({
      items: props.tracks.slice(i, i + 2),
      startIndex: i,
    });
  }
  return pages;
});

defineEmits<{
  addToPlaylist: [trackId: string];
  addToQueue: [track: Track];
  downloadMedia: [track: Track];
  dragStart: [track: Track, event: DragEvent];
  mediaInformation: [track: Track];
  playTrack: [index: number];
}>();

const trackHeaderNames = TRACK_HEADER_NAMES.tracks;
</script>

<template>
  <div v-if="tracks.length" ref="tracksWrapper" class="trackTable withPreview">
    <div class="trackHeader">
      <div class="trackCell">{{ trackHeaderNames[0] }}</div>
      <div class="trackCell trackSecondary">{{ trackHeaderNames[1] }}</div>
      <div class="trackCell trackSecondary">{{ trackHeaderNames[2] }}</div>
      <div class="trackCell trackTime">{{ trackHeaderNames[3] }}</div>
      <div class="trackCell trackOptions" />
    </div>

    <VirtualList
      v-slot="{ item: page }"
      :buffer="3"
      :getKey="(page) => page.startIndex"
      :itemHeight="TRACK_PAGE_HEIGHT"
      :items="trackPages"
      :minItemsToVirtualize="25"
    >
      <div
        data-webos-grid-page
        :style="{ height: TRACK_PAGE_HEIGHT + 'px' }"
      >
        <TracksListItem
          v-for="(track, rowIndex) in page.items"
          :key="track.id"
          :style="
            (page.startIndex + rowIndex) % 2 === 1
              ? { backgroundColor: 'var(--hover-selected-color)' }
              : undefined
          "
          :track
          @addToPlaylist="$emit('addToPlaylist', track.id)"
          @addToQueue="$emit('addToQueue', track)"
          @downloadMedia="$emit('downloadMedia', track)"
          @dragStart="(event) => $emit('dragStart', track, event)"
          @mediaInformation="$emit('mediaInformation', track)"
          @playTrack="$emit('playTrack', page.startIndex + rowIndex)"
        />
      </div>
    </VirtualList>
  </div>

  <NoMediaMessage
    v-else
    :icon="IMAGE_DEFAULT_BY_TYPE.track"
    message="No tracks found."
  />
</template>
