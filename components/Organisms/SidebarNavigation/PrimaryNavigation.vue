<script setup lang="ts">
import NavigationItem from './Items/NavigationItem.vue';
import SubNavigationItem from './Items/SubNavigationItem.vue';

defineProps<{
  collapsed: boolean;
}>();

const { drop } = useDragAndDrop();
const { settings } = useWebOSTVSettings();

const visibleNavigation = computed(() =>
  SIDEBAR_DESKTOP_NAVIGATION.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (item.title === 'Podcasts') return settings.value.showPodcasts;
      if (item.title === 'Radio Stations') return settings.value.showRadioStations;
      return true;
    }),
  })).filter((section) => section.items.length),
);
</script>

<template>
  <ul class="mBM">
    <NavigationItem
      v-for="items in visibleNavigation
      :key="`navigation-${items.title}`"
      class="mBM"
      :collapsed
      :title="items.title"
    >
      <SubNavigationItem
        v-for="item in items.items"
        :key="`item-${item.title}`"
        :class="[
          {
            [DRAG_AND_DROP_CLASS_NAMES.isDroppable]: item.isDroppable,
          },
        ]"
        :collapsed
        :icon="item.icon"
        :title="item.title"
        :to="item.to"
        @drop="drop(QUEUE_ID, $event)"
      />
    </NavigationItem>
  </ul>
</template>
