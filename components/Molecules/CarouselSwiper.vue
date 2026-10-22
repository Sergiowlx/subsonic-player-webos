<script setup lang="ts">
import ButtonLink from '@/components/Atoms/ButtonLink.vue';
import { isWebOSTV } from '@/utils/webos';
import type { SwiperContainer } from 'swiper/element';

const props = withDefaults(
  defineProps<{
    gridRows?: number;
  }>(),
  {
    gridRows: 0,
  },
);

const swiperRef = ref<null | SwiperContainer>(null);
const isTV = isWebOSTV();

function breakpointsSettings(slides = 2) {
  return {
    grid: {
      fill: 'row',
      rows: props.gridRows,
    },
    slidesPerGroup: slides,
    slidesPerView: slides,
    spaceBetween: 15,
  } as never;
}

const swiper = useSwiper(swiperRef, {
  breakpoints: {
    /* eslint-disable perfectionist/sort-objects */
    0: breakpointsSettings(),
    500: breakpointsSettings(3),
    900: breakpointsSettings(4),
    1200: breakpointsSettings(5),
    1500: breakpointsSettings(6),
    1800: breakpointsSettings(7),
    /* eslint-enable perfectionist/sort-objects */
  },
});

function onRemoteKeydown(event: KeyboardEvent) {
  if (!isTV || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Element)) return;

  const currentSlide = target.closest('swiper-slide');
  const instance = swiper.instance.value;
  if (!currentSlide || !instance) return;

  const currentIndex = instance.slides.indexOf(currentSlide as HTMLElement);
  const nextIndex = currentIndex + (event.key === 'ArrowRight' ? 1 : -1);
  const nextSlide = instance.slides[nextIndex];
  if (currentIndex < 0 || !nextSlide) return;

  // Let the remote move one card at a time. Only shift the carousel when the
  // next card would otherwise be clipped by the viewport.
  event.preventDefault();
  event.stopPropagation();

  const viewportRect = swiperRef.value?.getBoundingClientRect();
  const nextRect = nextSlide.getBoundingClientRect();
  if (
    viewportRect &&
    (nextRect.left < viewportRect.left || nextRect.right > viewportRect.right)
  ) {
    swiper.to(nextIndex, 180);
  }

  nextSlide
    .querySelector<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    ?.focus({ preventScroll: true });
}
</script>

<template>
  <div :class="['mBL', $style.carouselSwiper]">
    <swiper-container ref="swiperRef" @keydown="onRemoteKeydown">
      <slot />
    </swiper-container>

    <ButtonLink
      :class="$style.previous"
      :icon="ICONS.previous"
      @click="swiper.prev()"
    >
      Previous slide
    </ButtonLink>

    <ButtonLink :class="$style.next" :icon="ICONS.next" @click="swiper.next()">
      Next slide
    </ButtonLink>
  </div>
</template>

<style module>
.carouselSwiper {
  position: relative;
  z-index: 0;
  transition: all var(--transition);

  @media (hover: hover) {
    &:hover {
      .next,
      .previous {
        --carousel-swiper-button-opacity: 1;
      }
    }
  }
}

swiper-container {
  position: relative;
  display: flex;
  flex-direction: row;
  padding: 0;
  margin-right: auto;
  margin-left: auto;
  overflow: hidden;
  list-style: none;
  text-size-adjust: none;
}

.next,
.previous {
  --carousel-swiper-button-opacity: 0;

  position: absolute;
  inset: 0 auto;
  z-index: 1;
  height: var(--width-height-100);
  opacity: var(--carousel-swiper-button-opacity);
  transition: opacity var(--transition);
}

.next {
  right: 0;
}

.previous {
  left: 0;
}
</style>
