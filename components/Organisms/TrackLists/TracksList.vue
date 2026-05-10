<script setup lang="ts">
import NoMediaMessage from '@/components/Atoms/NoMediaMessage.vue';
import VirtualList from '@/components/Molecules/VirtualList.vue';
import TracksListItem from '@/components/Organisms/TrackLists/TracksListItem.vue';

defineProps<{
  tracks: Track[];
}>();

const TRACK_ROW_HEIGHT = 55;

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
      v-slot="{ index, item: track }"
      :itemHeight="TRACK_ROW_HEIGHT"
      :items="tracks"
    >
      <TracksListItem
        :key="track.id"
        :style="
          index % 2 === 1
            ? { backgroundColor: 'var(--hover-selected-color)' }
            : undefined
        "
        :track
        @addToPlaylist="$emit('addToPlaylist', track.id)"
        @addToQueue="$emit('addToQueue', track)"
        @downloadMedia="$emit('downloadMedia', track)"
        @dragStart="(event) => $emit('dragStart', track, event)"
        @mediaInformation="$emit('mediaInformation', track)"
        @playTrack="$emit('playTrack', index)"
      />
    </VirtualList>
  </div>

  <NoMediaMessage
    v-else
    :icon="IMAGE_DEFAULT_BY_TYPE.track"
    message="No tracks found."
  />
</template>
