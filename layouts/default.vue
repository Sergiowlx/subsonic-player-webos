<script setup lang="ts">
import ButtonLink from '@/components/Atoms/ButtonLink.vue';
import HotkeyMappings from '@/components/Atoms/HotkeyMappings.vue';
import DropdownDivider from '@/components/Molecules/Dropdown/DropdownDivider.vue';
import DropdownItem from '@/components/Molecules/Dropdown/DropdownItem.vue';
import DropdownMenu from '@/components/Molecules/Dropdown/DropdownMenu.vue';
import MobileNavigation from '@/components/Molecules/MobileNavigation.vue';
import MusicLogo from '@/components/Molecules/MusicLogo.vue';
import PageNavigation from '@/components/Molecules/PageNavigation.vue';
import SearchForm from '@/components/Molecules/SearchForm.vue';
import MusicPlayerAndQueue from '@/components/Organisms/MusicPlayerAndQueue/MusicPlayerAndQueue.vue';

const route = useRoute();
const user = useUser();
const {
  closeQueuePlayer,
  isQueueListOpened,
  isQueuePlayerOpened,
} = useQueue();
const { logoutAndRedirect } = useAuth();
const { startScan } = useMediaLibrary();
const isHeaderScrolled = ref(false);

function updateHeaderScrollState() {
  isHeaderScrolled.value = window.scrollY > 0;
}

onMounted(() => {
  if (!isWebOSTV()) return;

  updateHeaderScrollState();
  window.addEventListener('scroll', updateHeaderScrollState, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateHeaderScrollState);
});

async function onSubmit(term: string) {
  await navigateTo({
    name: ROUTE_NAMES.search,
    params: {
      [ROUTE_PARAM_KEYS.search.mediaType]: ROUTE_MEDIA_TYPE_PARAMS.Albums,
      [ROUTE_PARAM_KEYS.search.query]: term,
    },
  });
}

const showPageNavigation = computed(() =>
  PAGE_NAVIGATION_ROUTES.includes(route.name as RouteName),
);
</script>

<template>
  <div :class="$style.mainLayout">
    <header
      :class="[
        'centerItems',
        $style.header,
        {
          headerScrolled: isHeaderScrolled,
          nowPlayingHeader: isQueuePlayerOpened,
          tvQueueListOpen: isQueueListOpened,
        },
      ]"
      @click.capture="closeQueuePlayer"
    >
      <div class="spaceBetween inner centerItems">
        <MusicLogo class="mobileOnly" />

        <span :class="$style.tvLogo" aria-hidden="true">
          <component :is="ICONS.logo" :size="40" weight="regular" />
        </span>

        <nav
          aria-label="Primary navigation"
          :class="[$style.tvPrimaryNavigation, 'tvPrimaryNavigation']"
        >
          <ButtonLink
            is="nuxt-link"
            class="tvPrimaryLink"
            exactActiveClass="tvPrimaryLinkActive"
            :icon="ICONS.home"
            showText
            :to="{ name: ROUTE_NAMES.index }"
          >
            Home
          </ButtonLink>

          <ButtonLink
            is="nuxt-link"
            class="tvPrimaryLink"
            exactActiveClass="tvPrimaryLinkActive"
            :icon="ICONS.search"
            showText
            to="/search"
          >
            Search
          </ButtonLink>

          <ButtonLink
            is="nuxt-link"
            class="tvPrimaryLink"
            exactActiveClass="tvPrimaryLinkActive"
            :icon="ICONS.library"
            showText
            :to="{ name: ROUTE_NAMES.library }"
          >
            Your library
          </ButtonLink>
        </nav>

        <div :class="$style.search" data-header-search>
          <SearchForm @submit="onSubmit" />
        </div>

        <div
          v-if="user"
          ref="userDetails"
          :class="['centerItems', $style.secondary]"
        >
          <div :class="$style.secondaryItem">
            <ButtonLink
              is="nuxt-link"
              :icon="ICONS.setting"
              :showText="false"
              title="Settings"
              :to="{ name: ROUTE_NAMES.settings }"
            >
              Settings
            </ButtonLink>
          </div>

          <div :class="$style.secondaryItem">
            <DropdownMenu
              :icon="ICONS.profile"
              :showText="false"
              :text="user.username!"
              title="View account details"
            >
              <DropdownItem
                is="nuxt-link"
                :to="{
                  name: ROUTE_NAMES.userProfile,
                }"
              >
                Profile
              </DropdownItem>
              <DropdownItem
                is="nuxt-link"
                :to="{
                  name: ROUTE_NAMES.files,
                }"
              >
                Files
              </DropdownItem>
              <DropdownItem ref="scan" @click="startScan">Scan</DropdownItem>
              <DropdownDivider />
              <DropdownItem
                ref="logoutButton"
                :icon="ICONS.signOut"
                @click="logoutAndRedirect"
              >
                Log out
              </DropdownItem>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>

    <MobileNavigation class="mobileOnly" />

    <main :class="['main', $style.mainContent]">
      <div
        :class="[
          'column',
          $style.mainContentInner,
          {
            [$style.noPaddingTop]: showPageNavigation,
          },
        ]"
      >
        <PageNavigation
          v-if="showPageNavigation"
          class="mobileOnly mBL"
          :navigation="MOBILE_PAGE_NAVIGATION"
        />

        <div class="column inner mBAllL">
          <slot />
        </div>
      </div>
    </main>

    <footer>
      <MusicPlayerAndQueue />
      <HotkeyMappings />
    </footer>
  </div>
</template>

<style module>
.mainLayout {
  display: flex;
}

.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 30;
  min-height: var(--header-height);
  background-color: var(--background-color);
  border-bottom: 0;
  box-shadow: none;
}

.search {
  --search-width: 65%;

  width: var(--search-width);

  @media (--tablet-up) {
    display: none;
  }
}

.tvLogo {
  display: none;

  @media (--tablet-up) {
    display: flex;
    flex: 0 0 auto;
    margin-right: var(--space-24);
  }
}

.tvPrimaryNavigation {
  display: none;

  @media (--tablet-up) {
    display: flex;
    flex: 1 1 auto;
    gap: clamp(16px, 2.5vw, 36px);
    align-items: center;
    justify-content: center;
    min-width: 0;
  }
}

:global(.tvPrimaryLink) {
  gap: 10px;
  padding: 10px 12px;
  font-size: 1rem;
  font-weight: var(--font-weight-bold);
  color: var(--secondary-font-color);
  text-decoration: none;
  border-radius: 8px;
}

:global(.tvPrimaryLinkActive) {
  color: var(--font-color);
}

.secondary {
  gap: var(--default-space);
  margin-right: calc(var(--default-space) * -2);
}

.mainContent {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 100vh;
  overflow: hidden;
}

.mainContentInner {
  --main-width: 100vw;
  --main-padding-top: calc(var(--header-height) + var(--space-40));
  --main-padding-bottom: calc(
    var(--media-player-height) + var(--space-40) + var(--header-height)
  );

  width: var(--main-width);
  padding: var(--main-padding-top) 0 var(--main-padding-bottom);

  @media (--tablet-up) {
    --main-padding-bottom: calc(
      var(--media-player-height) + var(--space-40)
    );
  }
}

.noPaddingTop {
  @media (--mobile-only) {
    --main-padding-top: var(--header-height);
  }
}
</style>
