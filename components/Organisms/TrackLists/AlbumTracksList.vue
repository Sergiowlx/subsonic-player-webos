<script setup lang="ts">
import NoMediaMessage from '@/components/Atoms/NoMediaMessage.vue';
import AlbumTracksListItem from '@/components/Organisms/TrackLists/AlbumTracksListItem.vue';

interface AlbumTrackPage {
  items: Track[];
  startIndex: number;
}

const props = defineProps<{
  tracks: Track[];
}>();

const trackPages = computed<AlbumTrackPage[]>(() => {
  const pages: AlbumTrackPage[] = [];
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

const trackHeaderNames = TRACK_HEADER_NAMES.albumTracks;
</script>

<template>
  <div
    v-if="tracks.length"
    ref="tracksWrapper"
    class="trackTable webosAlbumTrackTable webosTrackTable"
  >
    <div class="trackHeader">
      <div class="trackCell">{{ trackHeaderNames[0] }}</div>
      <div class="trackCell trackSecondary">{{ trackHeaderNames[1] }}</div>
      <div class="trackCell trackTime">{{ trackHeaderNames[2] }}</div>
      <div class="trackCell trackOptions" />
    </div>

    <div v-for="page in trackPages" :key="page.startIndex" data-webos-grid-page>
      <AlbumTracksListItem
        v-for="track in page.items"
        :key="track.id"
        :track
        @addToPlaylist="$emit('addToPlaylist', track.id)"
        @addToQueue="$emit('addToQueue', track)"
        @downloadMedia="$emit('downloadMedia', track)"
        @dragStart="(event) => $emit('dragStart', track, event)"
        @mediaInformation="$emit('mediaInformation', track)"
        @playTrack="$emit('playTrack', track.index)"
      />
    </div>
  </div>

  <NoMediaMessage
    v-else
    :icon="IMAGE_DEFAULT_BY_TYPE.track"
    message="No tracks found."
  />
</template>
