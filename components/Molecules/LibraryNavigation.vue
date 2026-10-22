<script setup lang="ts">
import ButtonLink from '@/components/Atoms/ButtonLink.vue';

const route = useRoute();

const navigation = [
  {
    icon: ICONS.music,
    key: 'library',
    label: 'All',
    to: { name: ROUTE_NAMES.library },
  },
  {
    icon: ICONS.album,
    key: 'albums',
    label: 'Albums',
    to: {
      name: ROUTE_NAMES.albums,
      params: {
        [ROUTE_PARAM_KEYS.albums.sortBy]: ROUTE_ALBUMS_SORT_BY_PARAMS['A-Z'],
      },
    },
  },
  {
    icon: ICONS.artist,
    key: 'artists',
    label: 'Artist',
    to: { name: ROUTE_NAMES.artists },
  },
  {
    icon: ICONS.playlist,
    key: 'playlists',
    label: 'Playlists',
    to: { name: ROUTE_NAMES.playlists },
  },
  {
    icon: ICONS.genre,
    key: 'genres',
    label: 'Genres',
    to: { name: ROUTE_NAMES.genres },
  },
  {
    icon: ICONS.podcast,
    key: 'podcasts',
    label: 'Podcast',
    to: { name: ROUTE_NAMES.podcasts },
  },
] as const;

const activeKey = computed(() => {
  if (route.name === ROUTE_NAMES.albums) return 'albums';
  if (route.name === ROUTE_NAMES.artists) return 'artists';
  if (route.name === ROUTE_NAMES.playlists) return 'playlists';
  if (route.name === ROUTE_NAMES.genres || route.name === ROUTE_NAMES.genre) {
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
  <nav aria-label="Your library" class="webosLibraryNavigation">
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
