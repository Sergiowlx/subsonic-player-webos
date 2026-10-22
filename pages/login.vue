<script setup lang="ts">
import ThemeSwitcher from '@/components/Molecules/ThemeSwitcher.vue';
import LoginForm from '@/components/Organisms/LoginForm.vue';

definePageMeta({
  layout: 'login',
});

const route = useRoute();

const { error, isAuthenticated, loading, login } = useAuth();

async function checkLogin() {
  if (isAuthenticated.value) {
    const redirect = route.query.redirect?.toString();

    // For webOS file:// protocol, ignore redirect query as it may contain file system paths
    const isWebOS = import.meta.client && window.location.protocol === 'file:';
    const isValidRedirect =
      redirect &&
      !redirect.includes('/media/') &&
      !redirect.includes('/usr/palm/') &&
      redirect.startsWith('/');

    await navigateTo(
      !isWebOS && isValidRedirect
        ? redirect
        : {
            name: ROUTE_NAMES.index,
          },
    );
  }
}

async function onFormSubmit(fields: AuthData) {
  const { password, server, username } = fields;

  await login({
    password,
    server,
    username,
  });

  await checkLogin();
}

useHead({
  title: 'Login',
});
</script>

<template>
  <section aria-labelledby="login-title" :class="$style.login">
    <header data-login-header :class="$style.header">
      <div :class="$style.brand">
        <span :class="$style.brandMark">
          <component
            :is="ICONS.logo"
            aria-hidden="true"
            :size="26"
            weight="bold"
          />
        </span>
        <span :class="$style.brandName">Subsonic Player for webOS</span>
      </div>

      <ThemeSwitcher />
    </header>

    <div :class="$style.intro">
      <p :class="$style.eyebrow">YOUR MUSIC, YOUR SERVER</p>
      <h1 id="login-title">Welcome back</h1>
      <p :class="$style.description">
        Connect to your music server to continue listening.
      </p>
    </div>

    <LoginForm :class="$style.form" :error :loading @submit="onFormSubmit" />

    <p :class="$style.footer">
      Sign in with your Subsonic or Navidrome account.
    </p>
  </section>
</template>

<style module>
.login {
  position: relative;
  width: min(100%, 540px);
  padding: clamp(28px, 4vw, 48px);
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  box-shadow: 0 28px 80px rgb(0 0 0 / 25%);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(40px, 6vh, 64px);
}

.brand {
  display: flex;
  gap: 14px;
  align-items: center;
  min-width: 0;
}

.brandMark {
  display: grid;
  flex: 0 0 48px;
  place-items: center;
  width: 48px;
  height: 48px;
  color: var(--theme-color);
}

.brandName {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.intro {
  margin-bottom: 32px;
}

.eyebrow {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--theme-color);
  letter-spacing: 0.14em;
}

.intro h1 {
  margin: 0;
  font-size: clamp(32px, 4vw, 44px);
  font-weight: 700;
  line-height: 1.15;
}

.description {
  margin: 12px 0 0;
  font-size: 17px;
  line-height: 1.5;
  color: var(--secondary-font-color);
}

.form {
  display: block;
}

.form :global(input),
.form :global(.formButton) {
  border-radius: 8px;
}

.footer {
  margin: 24px 0 0;
  font-size: 14px;
  color: var(--secondary-font-color);
  text-align: center;
}

@media (width <= 600px) {
  .login {
    padding: 28px 24px;
  }

  .header {
    margin-bottom: 40px;
  }
}
</style>
