<script setup lang="ts">
import NoMediaMessage from '@/components/Atoms/NoMediaMessage.vue';
import VirtualList from '@/components/Molecules/VirtualList.vue';
import MixedTracksListItem from '@/components/Organisms/TrackLists/MixedTracksListItem.vue';
import { isWebOSTV } from '@/utils/webos';

interface MixedTrackPage {
  items: MixedTrack[];
  startIndex: number;
}

const props = defineProps<{
  hideRemoveOption?: boolean;
  tracks: MixedTrack[];
}>();

function getTrackPageHeight() {
  if (!import.meta.client || !isWebOSTV()) {
    return 55 * 2;
  }

  const rootStyle = getComputedStyle(document.documentElement);
  const rootFontSize = Number.parseFloat(rootStyle.fontSize) || 16;
  const rowHeightRem =
    Number.parseFloat(rootStyle.getPropertyValue('--webos-track-row-height')) ||
    4.75;
  const rowGapRem =
    Number.parseFloat(rootStyle.getPropertyValue('--webos-track-row-gap')) ||
    0.5;

  // The TV stylesheet converts these dimensions to rem; VirtualList's spacer
  // uses inline px, so calculate its stride from the rendered root font size.
  return Math.round((rowHeightRem + rowGapRem) * rootFontSize * 2);
}

const TRACK_PAGE_HEIGHT = getTrackPageHeight();

const trackPages = computed<MixedTrackPage[]>(() => {
  const pages: MixedTrackPage[] = [];
  for (let i = 0; i < props.tracks.length; i += 2) {
    pages.push({
      items: props.tracks.slice(i, i + 2),
      startIndex: i,
    });
  }
  return pages;
});

defineEmits<{
  addToPlaylist: [trackId: string, index: number];
  addToQueue: [track: MixedTrack];
  downloadMedia: [track: MixedTrack];
  dragStart: [track: MixedTrack, event: DragEvent];
  mediaInformation: [track: MixedTrack];
  playTrack: [index: number];
  remove: [
    removeArgs: {
      id: string;
      index: number;
    },
  ];
}>();

const trackHeaderNames = TRACK_HEADER_NAMES.mix;

const hasAddToQueueEvent = computed(
  () => !!getCurrentInstance()?.vnode.props?.onAddToQueue,
);

const hasDragStartEvent = computed(
  () => !!getCurrentInstance()?.vnode.props?.onDragStart,
);
</script>

<template>
  <div
    v-if="tracks.length"
    ref="tracksWrapper"
    class="trackTable withPreview webosTrackTable"
  >
    <div class="trackHeader">
      <div class="trackCell">{{ trackHeaderNames[0] }}</div>
      <div class="trackCell trackSecondary">{{ trackHeaderNames[1] }}</div>
      <div class="trackCell trackSecondary">{{ trackHeaderNames[2] }}</div>
      <div ref="trackTime" class="trackCell trackTime">
        {{ trackHeaderNames[3] }}
      </div>
      <div class="trackCell trackOptions" />
      <div
        v-if="hideRemoveOption !== true"
        ref="trackRemoveHeader"
        class="trackCell trackOptions"
      />
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
        <MixedTracksListItem
          v-for="(track, rowIndex) in page.items"
          :key="track.id"
          :hasAddToQueueEvent
          :hasDragStartEvent
          :hideRemoveOption
          :index="page.startIndex + rowIndex"
          :track
          @addToPlaylist="$emit('addToPlaylist', track.id, page.startIndex + rowIndex)"
          @addToQueue="$emit('addToQueue', track)"
          @downloadMedia="$emit('downloadMedia', track)"
          @dragStart="(event) => $emit('dragStart', track, event)"
          @mediaInformation="$emit('mediaInformation', track)"
          @playTrack="$emit('playTrack', page.startIndex + rowIndex)"
          @remove="$emit('remove', { id: track.id, index: page.startIndex + rowIndex })"
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
