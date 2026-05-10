<script setup lang="ts" generic="T">
import VirtualList from '@/components/Molecules/VirtualList.vue';

const props = withDefaults(
  defineProps<{
    breakpoints?: { desktop: number; tablet: number };
    columns?: { desktop: number; mobile: number; tablet: number };
    estimatedRowHeight?: number;
    gap?: number;
    getKey?: (item: T, index: number) => number | string;
    items: T[];
    minItemsToVirtualize?: number;
  }>(),
  {
    breakpoints: () => ({ desktop: 1100, tablet: 769 }),
    columns: () => ({ desktop: 5, mobile: 2, tablet: 3 }),
    estimatedRowHeight: 320,
    gap: 24,
    minItemsToVirtualize: 40,
  },
);

const viewportWidth = ref(
  import.meta.server ? props.breakpoints.desktop + 1 : window.innerWidth,
);

const rowHeight = ref(props.estimatedRowHeight);

const columnCount = computed(() => {
  if (viewportWidth.value >= props.breakpoints.desktop) {
    return props.columns.desktop;
  }
  if (viewportWidth.value >= props.breakpoints.tablet) {
    return props.columns.tablet;
  }
  return props.columns.mobile;
});

const rows = computed<T[][]>(() => {
  const cols = columnCount.value;
  const out: T[][] = [];
  for (let i = 0; i < props.items.length; i += cols) {
    out.push(props.items.slice(i, i + cols));
  }
  return out;
});

const measureRef = useTemplateRef('measureRef');

function measureFirstRow() {
  if (!measureRef.value) {
    return;
  }
  const firstRow = measureRef.value.querySelector(
    '[data-virtual-grid-row]',
  ) as HTMLElement | null;
  if (!firstRow) {
    return;
  }
  const measured = firstRow.getBoundingClientRect().height;
  if (measured > 0) {
    rowHeight.value = Math.round(measured + props.gap);
  }
}

function onResize() {
  viewportWidth.value = window.innerWidth;
  nextTick(measureFirstRow);
}

onMounted(() => {
  viewportWidth.value = window.innerWidth;
  nextTick(measureFirstRow);
  window.addEventListener('resize', onResize, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});

watch(columnCount, () => {
  nextTick(measureFirstRow);
});
</script>

<template>
  <div ref="measureRef">
    <VirtualList
      :buffer="3"
      :getKey="(_row, index) => index"
      :itemHeight="rowHeight"
      :items="rows"
      :minItemsToVirtualize="Math.ceil(minItemsToVirtualize / columnCount)"
    >
      <template #default="{ index: rowIndex, item: row }">
        <div
          :class="$style.row"
          data-virtual-grid-row
          :style="{
            paddingBottom: `${gap}px`,
          }"
        >
          <div
            v-for="(item, colIndex) in row"
            :key="
              getKey
                ? getKey(item, rowIndex * columnCount + colIndex)
                : rowIndex * columnCount + colIndex
            "
            :style="{
              marginRight: colIndex < columnCount - 1 ? `${gap}px` : '0',
              width: `calc((100% - ${(columnCount - 1) * gap}px) / ${columnCount})`,
            }"
          >
            <slot :index="rowIndex * columnCount + colIndex" :item />
          </div>
        </div>
      </template>
    </VirtualList>
  </div>
</template>

<style module>
.row {
  display: flex;
  width: 100%;
}
</style>
