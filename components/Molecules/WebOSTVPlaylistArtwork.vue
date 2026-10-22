<script setup lang="ts">
const props = defineProps<{
  playlist: Playlist;
}>();

const { getImageUrl } = useAPI();
const { getPlaylistArtwork } = usePlaylist();
const artworkRef = useTemplateRef('artworkRef');
const imageIds = ref(
  (props.playlist.images || []).filter(
    (image) => !Object.values(IMAGE_DEFAULT_BY_TYPE).includes(image as Icon),
  ),
);
let observer: IntersectionObserver | null = null;
let requested = false;

const artworkImages = computed(() => {
  if (imageIds.value.length < 2) return imageIds.value;

  return Array.from(
    { length: 4 },
    (_, index) => imageIds.value[index % imageIds.value.length],
  );
});

async function loadArtwork() {
  if (requested) return;
  requested = true;

  if (!imageIds.value.length) {
    imageIds.value = await getPlaylistArtwork(props.playlist.id);
  }
}

onMounted(() => {
  if (!artworkRef.value || typeof IntersectionObserver === 'undefined') {
    void loadArtwork();
    return;
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        void loadArtwork();
        observer?.disconnect();
      }
    },
    { rootMargin: '300px 0px' },
  );

  observer.observe(artworkRef.value);
});

onUnmounted(() => observer?.disconnect());
</script>

<template>
  <figure ref="artworkRef" :class="$style.artwork">
    <div
      v-if="!artworkImages.length"
      aria-hidden="true"
      :class="$style.placeholder"
    >
      <component :is="ICONS.playlist" :size="48" />
    </div>

    <img
      v-for="(image, index) in artworkImages"
      :key="`${image}-${index}`"
      :alt="''"
      :class="$style.cover"
      draggable="false"
      loading="lazy"
      :src="getImageUrl(image, '300')"
    />
  </figure>
</template>

<style module>
.artwork {
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--secondary-background-color);
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover:only-of-type {
  grid-row: 1 / -1;
  grid-column: 1 / -1;
}

.placeholder {
  display: flex;
  grid-row: 1 / -1;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--secondary-font-color);
}
</style>
