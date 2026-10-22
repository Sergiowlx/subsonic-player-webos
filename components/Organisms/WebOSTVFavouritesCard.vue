<script setup lang="ts">
const to = {
  name: ROUTE_NAMES.favourites,
  params: {
    [ROUTE_PARAM_KEYS.favourites.mediaType]: ROUTE_MEDIA_TYPE_PARAMS.Tracks,
  },
};
</script>

<template>
  <article class="layoutItem webosPlaylistCard" data-test-id="favourites-playlist">
    <NuxtLink
      class="webosPlaylistArtwork webosFavouritesArtwork"
      :to
      title="Go to favourites"
    >
      <component :is="ICONS.favourite" :size="64" weight="fill" />
    </NuxtLink>
    <div class="layoutContent">
      <NuxtLink class="layoutLink webosPlaylistTitle" :to>Favoritos</NuxtLink>
      <p class="webosPlaylistSubTitle">Canciones favoritas</p>
    </div>
  </article>
</template>
