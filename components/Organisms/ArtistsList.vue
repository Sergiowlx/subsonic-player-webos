<script setup lang="ts">
import GridWrapper from '@/components/Atoms/GridWrapper.vue';
import NoMediaMessage from '@/components/Atoms/NoMediaMessage.vue';
import VirtualGrid from '@/components/Molecules/VirtualGrid.vue';
import ArtistItem from '@/components/Organisms/ArtistItem.vue';

defineProps<{
  artists: (Artist | SimilarArtist)[];
}>();

const { viewLayout } = useViewLayout();

const gridWrapperProps = computed(() =>
  viewLayout.value === 'gridLayout' ? undefined : '0',
);
</script>

<template>
  <template v-if="artists.length">
    <VirtualGrid
      v-if="viewLayout === 'gridLayout'"
      v-slot="{ item: artist }"
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
