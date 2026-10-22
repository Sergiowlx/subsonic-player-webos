<script setup lang="ts">
import VirtualGrid from '@/components/Molecules/VirtualGrid.vue';
import WebOSTVPlaylistCard from '@/components/Organisms/WebOSTVPlaylistCard.vue';
import WebOSTVFavouritesCard from '@/components/Organisms/WebOSTVFavouritesCard.vue';

const props = withDefaults(
  defineProps<{
    playlists: Playlist[];
    showActions?: boolean;
  }>(),
  { showActions: false },
);

defineEmits<{
  deletePlaylist: [playlistId: string];
  editPlaylist: [playlist: Playlist];
}>();

interface PlaylistGridItem {
  id: string;
  isFavourites?: boolean;
  playlist?: Playlist;
}

const items = computed<PlaylistGridItem[]>(() => [
  { id: 'favourites', isFavourites: true },
  ...props.playlists.map((playlist) => ({ id: playlist.id, playlist })),
]);

const columns = { desktop: 7, tablet: 6, mobile: 3 };
</script>

<template>
  <VirtualGrid
    v-if="items.length"
    v-slot="{ item }"
    :columns
    :estimatedRowHeight="270"
    :getKey="(item) => item.id"
    :items
  >
    <WebOSTVFavouritesCard v-if="item.isFavourites" />
    <WebOSTVPlaylistCard
      v-else-if="item.playlist"
      :playlist="item.playlist"
      :showActions
      @deletePlaylist="$emit('deletePlaylist', $event)"
      @editPlaylist="$emit('editPlaylist', $event)"
    />
  </VirtualGrid>
</template>
