<template>
  <main :class="['centerAll', $style.login]">
    <slot />
  </main>
</template>

<style module>
.login {
  position: relative;
  z-index: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: clamp(24px, 5vw, 72px);
  overflow: hidden;
  background-color: var(--body-background-color);
}

.login::before {
  position: absolute;
  top: -45vw;
  left: -35vw;
  width: 75vw;
  height: 75vw;
  pointer-events: none;
  content: '';
  background-color: var(--theme-color);
  border-radius: 50%;
  opacity: 0.12;
  filter: blur(120px);
}
</style>
