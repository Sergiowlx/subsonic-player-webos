<script setup lang="ts">
import GridWrapper from '@/components/Atoms/GridWrapper.vue';
import NoMediaMessage from '@/components/Atoms/NoMediaMessage.vue';
import VirtualGrid from '@/components/Molecules/VirtualGrid.vue';
import ArtistItem from '@/components/Organisms/ArtistItem.vue';
import { isWebOSTV } from '@/utils/webos';

defineProps<{
  artists: (Artist | SimilarArtist)[];
}>();

const { viewLayout } = useViewLayout();
const isTV = isWebOSTV();
const isGridLayout = computed(
  () => isTV || viewLayout.value === 'gridLayout',
);
const virtualGridColumns = isTV
  ? { desktop: 7, tablet: 6, mobile: 3 }
  : undefined;

const gridWrapperProps = computed(() =>
  isGridLayout.value ? undefined : '0',
);
</script>

<template>
  <template v-if="artists.length">
    <VirtualGrid
      v-if="isGridLayout"
      v-slot="{ item: artist }"
      :columns="virtualGridColumns"
      :getKey="(artist) => artist.id"
      :items="artists"
    >
      <ArtistItem :artist />
    </VirtualGrid>

    <GridWrapper
      v-else
      :desktop="gridWrapperProps"
      :mobile="gridWrapperProps"
      :spacing="gridWrapperProps"
      :tablet="gridWrapperProps"
    >
      <ArtistItem v-for="artist in artists" :key="artist.id" :artist />
    </GridWrapper>
  </template>

  <NoMediaMessage
    v-else
    :icon="IMAGE_DEFAULT_BY_TYPE.artist"
    message="No artists found."
  />
</template>
