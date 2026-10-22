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
        :aria-expanded="expanded"
        :class="['centerItems', 'spaceBetween', $style.sectionToggle]"
        type="button"
        @click="expanded = !expanded"
      >
        <span>{{ title }}</span>
        <component
          :is="ICONS.queueClose"
          aria-hidden="true"
          :class="$style.chevron"
          :size="18"
          :style="{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }"
        />
      </button>
    </h4>
    <h4 v-else class="visuallyHidden">{{ title }}</h4>

    <ul v-if="$slots.default" v-show="collapsed || expanded" ref="navigation">
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
  cursor: pointer;
  background: transparent;
  border: 0;
}

.chevron {
  flex-shrink: 0;
  transition: transform 140ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
</style>
