<script setup lang="ts">
import MainPlayerControls from '@/components/Organisms/MusicPlayerAndQueue/Controls/MainPlayerControls.vue';
import RepeatButton from '@/components/Organisms/MusicPlayerAndQueue/Controls/RepeatButton.vue';
import ShuffleButton from '@/components/Organisms/MusicPlayerAndQueue/Controls/ShuffleButton.vue';

const { isRadioStation } = useAudioPlayer();
const isTV = isWebOSTV();
</script>

<template>
  <div :class="['centerItems', $style.playerControls]">
    <ShuffleButton
      v-if="!isRadioStation"
      class="webosPlayerShuffleControl"
    />

    <MainPlayerControls
      class="webosPlayerMainControls"
      :showSeekControls="!isTV"
    />

    <RepeatButton
      v-if="!isRadioStation"
      class="webosPlayerRepeatControl"
    />
  </div>
</template>

<style module>
.playerControls {
  gap: var(--default-space);
}
</style>
