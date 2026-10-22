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

// Keep two adjacent rows together so remote navigation can advance in a
// predictable TV-sized block instead of scrolling for every focused card.
const rowPages = computed<T[][][]>(() => {
  const pages: T[][][] = [];
  for (let i = 0; i < rows.value.length; i += 2) {
    pages.push(rows.value.slice(i, i + 2));
  }
  return pages;
});

const pageHeight = computed(
  () => rowHeight.value * Math.min(2, rows.value.length),
);

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
    // The row already includes its bottom gap in its measured box.
    rowHeight.value = Math.round(measured);
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

watch(rowPages, () => {
  nextTick(measureFirstRow);
});
</script>

<template>
  <div ref="measureRef">
    <VirtualList
      :buffer="2"
      :getKey="(_page, index) => index"
      :itemHeight="pageHeight"
      :items="rowPages"
      :minItemsToVirtualize="
        Math.ceil(minItemsToVirtualize / columnCount / 2)
      "
    >
      <template #default="{ index: pageIndex, item: page }">
        <div
          data-webos-grid-page
          :style="{ height: pageHeight + 'px' }"
        >
          <div
            v-for="(row, pageRowIndex) in page"
            :key="pageIndex * 2 + pageRowIndex"
            :class="$style.row"
            data-virtual-grid-row
            :style="{ paddingBottom: gap + 'px' }"
          >
            <div
              v-for="(item, colIndex) in row"
              :key="
                getKey
                  ? getKey(item, (pageIndex * 2 + pageRowIndex) * columnCount + colIndex)
                  : (pageIndex * 2 + pageRowIndex) * columnCount + colIndex
              "
              :style="{
                marginRight: colIndex < columnCount - 1 ? gap + 'px' : '0',
                width: 'calc((100% - ' + (columnCount - 1) * gap + 'px) / ' + columnCount + ')',
              }"
            >
              <slot
                :index="(pageIndex * 2 + pageRowIndex) * columnCount + colIndex"
                :item
              />
            </div>
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
