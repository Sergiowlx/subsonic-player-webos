<script setup lang="ts" generic="T">
const props = withDefaults(
  defineProps<{
    buffer?: number;
    getKey?: (item: T, index: number) => number | string;
    itemHeight: number;
    items: T[];
    minItemsToVirtualize?: number;
  }>(),
  {
    buffer: 8,
    minItemsToVirtualize: 50,
  },
);

function keyFor(item: T, index: number) {
  if (props.getKey) {
    return props.getKey(item, index);
  }
  const candidate = (item as { id?: number | string })?.id;
  return candidate ?? index;
}

const rootRef = useTemplateRef('rootRef');
const startIndex = ref(0);
const endIndex = ref(props.items.length);

const enabled = computed(
  () => !import.meta.server && props.items.length >= props.minItemsToVirtualize,
);

const totalHeight = computed(() => props.items.length * props.itemHeight);
const offsetY = computed(() => startIndex.value * props.itemHeight);

const visibleSlice = computed(() => {
  if (!enabled.value) {
    return props.items.map((item, index) => ({ index, item }));
  }
  return props.items
    .slice(startIndex.value, endIndex.value)
    .map((item, i) => ({ index: startIndex.value + i, item }));
});

let rafId: null | number = null;

function schedule() {
  if (rafId !== null) {
    return;
  }
  rafId = window.requestAnimationFrame(update);
}

function update() {
  rafId = null;
  if (!rootRef.value) {
    return;
  }
  if (!enabled.value) {
    startIndex.value = 0;
    endIndex.value = props.items.length;
    return;
  }
  const rect = rootRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const scrolledIntoList = Math.max(0, -rect.top);
  const rawStart =
    Math.floor(scrolledIntoList / props.itemHeight) - props.buffer;
  const rawEnd =
    Math.ceil((scrolledIntoList + viewportHeight) / props.itemHeight) +
    props.buffer;
  startIndex.value = Math.max(0, rawStart);
  endIndex.value = Math.min(props.items.length, Math.max(0, rawEnd));
}

onMounted(() => {
  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
  }
});

watch(
  () => props.items.length,
  () => {
    nextTick(update);
  },
);
</script>

<template>
  <template v-if="!enabled">
    <template
      v-for="entry in visibleSlice"
      :key="keyFor(entry.item, entry.index)"
    >
      <slot :index="entry.index" :item="entry.item" />
    </template>
  </template>

  <div
    v-else
    ref="rootRef"
    :class="$style.virtualList"
    :style="{ height: totalHeight + 'px' }"
  >
    <div
      :class="$style.viewport"
      :style="{ transform: `translate3d(0, ${offsetY}px, 0)` }"
    >
      <template
        v-for="entry in visibleSlice"
        :key="keyFor(entry.item, entry.index)"
      >
        <slot :index="entry.index" :item="entry.item" />
      </template>
    </div>
  </div>
</template>

<style module>
.virtualList {
  position: relative;
  width: 100%;
}

.viewport {
  position: absolute;
  inset: 0 0 auto;
  width: 100%;
  will-change: transform;
}
</style>
