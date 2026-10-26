<script setup lang="ts">
import NoMediaMessage from '@/components/Atoms/NoMediaMessage.vue';
import BookmarksTracksListItem from '@/components/Organisms/TrackLists/BookmarksTracksListItem.vue';

interface BookmarkPage {
  items: Bookmark[];
  startIndex: number;
}

const props = defineProps<{
  bookmarks: Bookmark[];
}>();

const bookmarkPages = computed<BookmarkPage[]>(() => {
  const pages: BookmarkPage[] = [];
  for (let i = 0; i < props.bookmarks.length; i += 2) {
    pages.push({
      items: props.bookmarks.slice(i, i + 2),
      startIndex: i,
    });
  }
  return pages;
});

defineEmits<{
  addToPlaylist: [bookmarkId: string];
  downloadMedia: [bookmark: Bookmark];
  mediaInformation: [bookmark: Bookmark];
  playTrack: [index: number];
  remove: [bookmarkId: string];
}>();

const trackHeaderNames = TRACK_HEADER_NAMES.bookmarkTracks;
</script>

<template>
  <div
    v-if="bookmarks.length"
    ref="tracksWrapper"
    class="trackTable withPreview webosTrackTable"
  >
    <div class="trackHeader">
      <div class="trackCell">{{ trackHeaderNames[0] }}</div>
      <div class="trackCell trackSecondary">{{ trackHeaderNames[1] }}</div>
      <div class="trackCell trackSecondary">{{ trackHeaderNames[2] }}</div>
      <div ref="trackTime" class="trackCell trackTime withPosition">
        {{ trackHeaderNames[3] }}
      </div>
      <div class="trackCell trackOptions" />
      <div class="trackCell trackOptions" />
    </div>

    <div
      v-for="page in bookmarkPages"
      :key="page.startIndex"
      data-webos-grid-page
    >
      <BookmarksTracksListItem
        v-for="(bookmark, rowIndex) in page.items"
        :key="bookmark.id"
        :bookmark
        @addToPlaylist="$emit('addToPlaylist', bookmark.id)"
        @downloadMedia="$emit('downloadMedia', bookmark)"
        @mediaInformation="$emit('mediaInformation', bookmark)"
        @playTrack="$emit('playTrack', page.startIndex + rowIndex)"
        @remove="$emit('remove', bookmark.id)"
      />
    </div>
  </div>

  <NoMediaMessage
    v-else
    :icon="IMAGE_DEFAULT_BY_TYPE.podcastEpisode"
    message="No bookmarks found."
  />
</template>
