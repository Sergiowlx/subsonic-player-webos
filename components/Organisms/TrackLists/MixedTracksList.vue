<script setup lang="ts">
import NoMediaMessage from '@/components/Atoms/NoMediaMessage.vue';
import VirtualList from '@/components/Molecules/VirtualList.vue';
import MixedTracksListItem from '@/components/Organisms/TrackLists/MixedTracksListItem.vue';

const TRACK_ROW_HEIGHT = 55;

defineProps<{
  hideRemoveOption?: boolean;
  tracks: MixedTrack[];
}>();

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
  <div v-if="tracks.length" ref="tracksWrapper" class="trackTable withPreview">
    <div class="trackHeader">
      <div class="trackCell">{{ trackHeaderNames[0] }}</div>
      <div class="trackCell trackSecondary">{{ trackHeaderNames[1] }}</div>
      <div class="trackCell trackSecondary">{{ trackHeaderNames[2] }}</div>
      <div ref="trackTime" class="trackCell trackTime">
        {{ trackHeaderNames[3] }}
      </div>
      <div class="trackCell trackOptions" />
      <div
        v-if="!hideRemoveOption"
        ref="trackRemoveHeader"
        class="trackCell trackOptions"
      />
    </div>

    <VirtualList
      v-slot="{ index, item: track }"
      :itemHeight="TRACK_ROW_HEIGHT"
      :items="tracks"
    >
      <MixedTracksListItem
        :key="track.id"
        :hasAddToQueueEvent
        :hasDragStartEvent
        :hideRemoveOption
        :index
        :style="
          index % 2 === 1
            ? { backgroundColor: 'var(--hover-selected-color)' }
            : undefined
        "
        :track
        @addToPlaylist="$emit('addToPlaylist', track.id, index)"
        @addToQueue="$emit('addToQueue', track)"
        @downloadMedia="$emit('downloadMedia', track)"
        @dragStart="(event) => $emit('dragStart', track, event)"
        @mediaInformation="$emit('mediaInformation', track)"
        @playTrack="$emit('playTrack', index)"
        @remove="$emit('remove', { id: track.id, index })"
      />
    </VirtualList>
  </div>

  <NoMediaMessage
    v-else
    :icon="IMAGE_DEFAULT_BY_TYPE.track"
    message="No tracks found."
  />
</template>
