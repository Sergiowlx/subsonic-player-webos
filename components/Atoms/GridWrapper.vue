<script setup lang="ts">
withDefaults(
  defineProps<{
    desktop?: string;
    mobile?: string;
    spacing?: string;
    tablet?: string;
  }>(),
  {
    desktop: '5',
    mobile: '2',
    spacing: '24',
    tablet: '3',
  },
);
</script>

<template>
  <section
    :class="$style.mediaListWrapper"
    :style="{
      '--loop-rows-mobile': mobile,
      '--loop-rows-tablet': tablet,
      '--loop-rows-desktop': desktop,
      '--loop-grid-gap': `${spacing}px`,
    }"
  >
    <slot />
  </section>
</template>

<style module>
.mediaListWrapper {
  --loop-columns: var(--loop-rows-mobile);

  position: relative;
  display: flex;
  flex-wrap: wrap;
  width: calc(100% + var(--loop-grid-gap));
  margin-right: calc(var(--loop-grid-gap) * -0.5);
  margin-left: calc(var(--loop-grid-gap) * -0.5);

  @media (--tablet-up) {
    --loop-columns: var(--loop-rows-tablet);
  }

  @media (width >= 1100px) {
    --loop-columns: var(--loop-rows-desktop);
  }
}

.mediaListWrapper > * {
  width: calc((100% / var(--loop-columns)) - var(--loop-grid-gap));
  margin: calc(var(--loop-grid-gap) * 0.5);
}
</style>
