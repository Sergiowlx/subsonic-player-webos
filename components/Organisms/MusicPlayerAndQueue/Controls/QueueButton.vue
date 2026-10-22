<script setup lang="ts">
import ButtonLink from '@/components/Atoms/ButtonLink.vue';

const { toggleQueuePlayer } = useQueue();

// On TV this control opens the expanded Now Playing view. Desktop keeps the
// existing queue panel behavior.
const isWebOS =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'file:' ||
    window.location.search.includes('webos=true') ||
    document.body.classList.contains('webosTV'));

const buttonTitle = isWebOS ? 'Open now playing' : 'Open queue';
const buttonIcon = isWebOS ? ICONS.genre : ICONS.queue;
</script>

<template>
  <ButtonLink
    :icon="buttonIcon"
    :title="buttonTitle"
    @click="toggleQueuePlayer"
  >
    {{ buttonTitle }}
  </ButtonLink>
</template>
