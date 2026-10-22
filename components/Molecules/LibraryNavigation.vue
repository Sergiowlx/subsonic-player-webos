<script setup lang="ts">
import ButtonLink from '@/components/Atoms/ButtonLink.vue';

const route = useRoute();

const navigation = [
  {
    key: 'library',
    label: 'All',
    icon: ICONS.music,
    to: { name: ROUTE_NAMES.library },
  },
  {
    key: 'albums',
    label: 'Albums',
    icon: ICONS.album,
    to: {
      name: ROUTE_NAMES.albums,
      params: {
        [ROUTE_PARAM_KEYS.albums.sortBy]: ROUTE_ALBUMS_SORT_BY_PARAMS['A-Z'],
      },
    },
  },
  {
    key: 'artists',
    label: 'Artist',
    icon: ICONS.artist,
    to: { name: ROUTE_NAMES.artists },
  },
  {
    key: 'playlists',
    label: 'Playlists',
    icon: ICONS.playlist,
    to: { name: ROUTE_NAMES.playlists },
  },
  {
    key: 'genres',
    label: 'Genres',
    icon: ICONS.genre,
    to: { name: ROUTE_NAMES.genres },
  },
  {
    key: 'podcasts',
    label: 'Podcast',
    icon: ICONS.podcast,
    to: { name: ROUTE_NAMES.podcasts },
  },
] as const;

const activeKey = computed(() => {
  if (route.name === ROUTE_NAMES.albums) return 'albums';
  if (route.name === ROUTE_NAMES.artists) return 'artists';
  if (route.name === ROUTE_NAMES.playlists) return 'playlists';
  if (
    route.name === ROUTE_NAMES.genres ||
    route.name === ROUTE_NAMES.genre
  ) {
    return 'genres';
  }
  if (
    route.name === ROUTE_NAMES.podcasts ||
    route.name === ROUTE_NAMES.podcast
  ) {
    return 'podcasts';
  }

  return 'library';
});
</script>

<template>
  <nav class="webosLibraryNavigation" aria-label="Your library">
    <ul class="webosLibraryTabs">
      <li v-for="item in navigation" :key="item.key">
        <ButtonLink
          is="nuxt-link"
          :aria-current="activeKey === item.key ? 'page' : undefined"
          :class="[
            'webosLibraryTab',
            { webosLibraryTabActive: activeKey === item.key },
          ]"
          :icon="item.icon"
          iconSize="small"
          showText
          :to="item.to"
        >
          {{ item.label }}
        </ButtonLink>
      </li>
    </ul>
  </nav>
</template>
