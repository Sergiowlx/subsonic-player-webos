<script setup lang="ts">
import DropdownDivider from '@/components/Molecules/Dropdown/DropdownDivider.vue';
import DropdownItem from '@/components/Molecules/Dropdown/DropdownItem.vue';
import DropdownMenu from '@/components/Molecules/Dropdown/DropdownMenu.vue';
import WebOSTVPlaylistArtwork from '@/components/Molecules/WebOSTVPlaylistArtwork.vue';

const props = defineProps<{
  playlist: Playlist;
  showActions?: boolean;
}>();

defineEmits<{
  deletePlaylist: [playlistId: string];
  editPlaylist: [playlist: Playlist];
}>();

const to = computed(() => ({
  name: ROUTE_NAMES.playlist,
  params: { [ROUTE_PARAM_KEYS.playlist.id]: props.playlist.id },
}));
</script>

<template>
  <article class="layoutItem webosPlaylistCard" data-test-id="playlist">
    <div class="webosPlaylistArtworkWrapper">
      <NuxtLink
        class="webosPlaylistArtwork"
        :title="`Go to playlist ${playlist.name}`"
        :to
      >
        <WebOSTVPlaylistArtwork :playlist />
      </NuxtLink>

      <div v-if="showActions" class="webosPlaylistActions">
        <DropdownMenu
          :text="`More options for ${playlist.name}`"
          :title="`More options for ${playlist.name}`"
        >
          <DropdownItem is="nuxt-link" :to>Go to playlist</DropdownItem>
          <DropdownDivider />
          <DropdownItem @click="$emit('editPlaylist', playlist)">
            Edit playlist
          </DropdownItem>
          <DropdownItem @click="$emit('deletePlaylist', playlist.id)">
            Delete playlist
          </DropdownItem>
        </DropdownMenu>
      </div>
    </div>

    <div class="layoutContent">
      <NuxtLink class="layoutLink webosPlaylistTitle" :to>
        {{ playlist.name }}
      </NuxtLink>
      <p class="webosPlaylistSubTitle">
        Playlist · {{ playlist.trackCount }} tracks
      </p>
    </div>
  </article>
</template>
