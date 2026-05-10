<script setup lang="ts">
const { isHydrating } = useNuxtApp();

const rootRef = useTemplateRef('rootRef');

const isWebOS =
  import.meta.client &&
  (window.location.protocol === 'file:' ||
    window.location.search.includes('webos=true'));

const loadSlot = ref(!!import.meta.server || !!isHydrating || isWebOS);
const intersectionObserver = ref<IntersectionObserver | null>(null);

onMounted(() => {
  if (!rootRef.value || !!isHydrating || isWebOS) {
    return;
  }

  intersectionObserver.value = new IntersectionObserver(
    ([entry], observer) => {
      if (entry && entry.isIntersecting) {
        loadSlot.value = true;
        observer.disconnect();
      }
    },
    {
      root: null,
      threshold: 0,
    },
  );

  intersectionObserver.value.observe(rootRef.value);
});

onUnmounted(() => {
  intersectionObserver.value?.disconnect();
});
</script>

<template>
  <div ref="rootRef" :class="$style.lazyLoadContent">
    <div
      v-if="!loadSlot"
      ref="loading"
      :class="['skeletonLoader', $style.skeletonLoader]"
    >
      <span class="visuallyHidden">Loading data</span>
    </div>

    <slot v-else />
  </div>
</template>

<style module>
.lazyLoadContent {
  height: inherit;
}

.skeletonLoader {
  position: relative;
  width: var(--width-height-100);
  height: inherit;
}
</style>
