<script setup lang="ts">
defineProps<{
  collapsed: boolean;
  title: string;
}>();

const expanded = ref(true);
</script>

<template>
  <li>
    <h4
      v-if="!collapsed"
      ref="title"
      :class="['strong', 'mBM', $style.sectionHeading]"
    >
      <button
        type="button"
        :aria-expanded="expanded"
        :class="['centerItems', 'spaceBetween', $style.sectionToggle]"
        @click="expanded = !expanded"
      >
        <span>{{ title }}</span>
        <component
          :is="ICONS.queueClose"
          :class="$style.chevron"
          :style="{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }"
          aria-hidden="true"
          :size="18"
        />
      </button>
    </h4>
    <h4 v-else class="visuallyHidden">{{ title }}</h4>

    <ul
      v-if="$slots.default"
      ref="navigation"
      v-show="collapsed || expanded"
    >
      <slot />
    </ul>
  </li>
</template>

<style module>
.sectionHeading {
  padding: 0;
}

.sectionToggle {
  width: 100%;
  padding: 0 var(--space-24);
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.chevron {
  flex-shrink: 0;
  transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
