<script setup lang="ts">
import GridWrapper from '@/components/Atoms/GridWrapper.vue';
import NoMediaMessage from '@/components/Atoms/NoMediaMessage.vue';
import VirtualGrid from '@/components/Molecules/VirtualGrid.vue';
import AlbumItem from '@/components/Organisms/AlbumItem.vue';
import { isWebOSTV } from '@/utils/webos';

defineProps<{
  albums: Album[];
  hideArtist?: boolean;
}>();

const emit = defineEmits<{
  addToQueue: [album: Album];
  dragStart: [album: Album, event: DragEvent];
  mediaInformation: [album: Album];
  playAlbum: [album: Album];
}>();

const { viewLayout } = useViewLayout();
const isTV = isWebOSTV();
const isGridLayout = computed(
  () => isTV || viewLayout.value === 'gridLayout',
);
const virtualGridColumns = isTV
  ? { desktop: 7, tablet: 6, mobile: 3 }
  : undefined;

function onDragStart(album: Album, event: DragEvent) {
  emit('dragStart', album, event);
}

const gridWrapperProps = computed(() =>
  isGridLayout.value ? undefined : '0',
);
</script>

<template>
  <template v-if="albums.length">
    <VirtualGrid
      v-if="isGridLayout"
      v-slot="{ item: album }"
      :columns="virtualGridColumns"
      :getKey="(album) => album.name"
      :items="albums"
    >
      <AlbumItem
        :album
        :hideArtist
        @addToQueue="$emit('addToQueue', $event)"
        @dragStart="onDragStart"
        @mediaInformation="$emit('mediaInformation', $event)"
        @playAlbum="$emit('playAlbum', $event)"
      />
    </VirtualGrid>

    <GridWrapper
      v-else
      :desktop="gridWrapperProps"
      :mobile="gridWrapperProps"
      :spacing="gridWrapperProps"
      :tablet="gridWrapperProps"
    >
      <AlbumItem
        v-for="album in albums"
        :key="album.name"
        :album
        :hideArtist
        @addToQueue="$emit('addToQueue', $event)"
        @dragStart="onDragStart"
        @mediaInformation="$emit('mediaInformation', $event)"
        @playAlbum="$emit('playAlbum', $event)"
      />
    </GridWrapper>
  </template>

  <NoMediaMessage
    v-else
    :icon="IMAGE_DEFAULT_BY_TYPE.album"
    message="No albums found."
  />
</template>
