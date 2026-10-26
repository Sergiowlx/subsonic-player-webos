<script setup lang="ts">
import type { SwiperContainer } from 'swiper/element';

import ButtonLink from '@/components/Atoms/ButtonLink.vue';
import { isWebOSTV } from '@/utils/webos';

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

let edgeMoveTimer: ReturnType<typeof setTimeout> | undefined;
let pointerEdgeDirection: -1 | 0 | 1 = 0;

function clearPointerEdgeMove() {
  if (edgeMoveTimer) {
    clearTimeout(edgeMoveTimer);
    edgeMoveTimer = undefined;
  }

  pointerEdgeDirection = 0;
}

function moveCarouselFromPointerEdge() {
  const instance = swiper.instance.value;
  const carousel = swiperRef.value;
  if (!isTV || !pointerEdgeDirection || !carousel) return;

  if (instance) {
    const nextIndex = instance.activeIndex + pointerEdgeDirection;
    if (nextIndex < 0 || nextIndex >= instance.slides.length) {
      clearPointerEdgeMove();
      return;
    }

    swiper.to(nextIndex, 220);
  } else {
    // Older webOS Chromium cannot initialize Swiper's custom element. In that
    // fallback mode the container is a native horizontal strip, so move it by
    // one card whenever the pointer stays near either edge.
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
    if (maxScrollLeft <= 0) {
      clearPointerEdgeMove();
      return;
    }

    const carouselBounds = carousel.getBoundingClientRect();
    const visibleSlides = Array.from(
      carousel.querySelectorAll<HTMLElement>('swiper-slide'),
    ).filter((slide) => {
      const bounds = slide.getBoundingClientRect();
      return (
        bounds.width > 0 &&
        bounds.right > carouselBounds.left &&
        bounds.left < carouselBounds.right
      );
    });
    const referenceSlide =
      pointerEdgeDirection > 0
        ? visibleSlides[visibleSlides.length - 1]
        : visibleSlides[0];
    const slideBounds = referenceSlide?.getBoundingClientRect();
    const slideGap = referenceSlide
      ? Number.parseFloat(window.getComputedStyle(referenceSlide).marginRight) || 16
      : 16;
    const step = (slideBounds?.width || carousel.clientWidth / 5) + slideGap;
    const nextScrollLeft = Math.max(
      0,
      Math.min(
        maxScrollLeft,
        carousel.scrollLeft + pointerEdgeDirection * step,
      ),
    );

    if (nextScrollLeft === carousel.scrollLeft) {
      clearPointerEdgeMove();
      return;
    }

    carousel.scrollLeft = nextScrollLeft;
  }

  edgeMoveTimer = setTimeout(moveCarouselFromPointerEdge, 650);
}

function onPointerMove(event: MouseEvent) {
  if (!isTV) return;
  if (event.buttons !== 0) {
    clearPointerEdgeMove();
    return;
  }

  const bounds = swiperRef.value?.getBoundingClientRect();
  if (!bounds || bounds.width === 0) return;

  const edgeSize = Math.min(72, bounds.width * 0.12);
  const direction: -1 | 0 | 1 =
    event.clientX <= bounds.left + edgeSize
      ? -1
      : event.clientX >= bounds.right - edgeSize
        ? 1
        : 0;

  if (direction === pointerEdgeDirection) return;

  if (edgeMoveTimer) {
    clearTimeout(edgeMoveTimer);
    edgeMoveTimer = undefined;
  }
  pointerEdgeDirection = direction;

  if (direction) {
    edgeMoveTimer = setTimeout(moveCarouselFromPointerEdge, 350);
  }
}

onBeforeUnmount(clearPointerEdgeMove);

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
  <div
    :class="['mBL', $style.carouselSwiper]"
    @mousemove="onPointerMove"
    @mouseleave="clearPointerEdgeMove"
  >
    <swiper-container ref="swiperRef" @keydown="onRemoteKeydown">
      <slot />
    </swiper-container>

    <ButtonLink
      :class="$style.previous"
      data-webos-skip-focus
      :icon="ICONS.previous"
      @click="swiper.prev()"
    >
      Previous slide
    </ButtonLink>

    <ButtonLink
      :class="$style.next"
      data-webos-skip-focus
      :icon="ICONS.next"
      @click="swiper.next()"
    >
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
