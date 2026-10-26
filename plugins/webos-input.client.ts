/**
 * webOS TV Remote Control & DPAD Navigation Plugin
 *
 * This plugin provides TV-friendly navigation using the remote control's
 * directional pad (DPAD) and action buttons.
 *
 * Features:
 * - Arrow key navigation (up/down/left/right)
 * - Enter/OK key for activation
 * - Back button support (webOS key code 461)
 * - Spatial navigation between focusable elements
 * - Only active on webOS (file:// protocol)
 */

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') {
    return;
  }

  // Check if we're on webOS (file:// protocol) or testing mode (?webos=true)
  const requestedTVPreview = window.location.search.includes('webos=true');
  const isTVPreview =
    window.location.protocol !== 'file:' &&
    (requestedTVPreview ||
      window.sessionStorage.getItem('webosTVPreview') === 'true');

  if (requestedTVPreview && window.location.protocol !== 'file:') {
    window.sessionStorage.setItem('webosTVPreview', 'true');
  }
  const isWebOS = window.location.protocol === 'file:' || isTVPreview;

  // Only activate for webOS TV environment
  if (!isWebOS) {
    return;
  }

  const {
    closeQueueList,
    closeQueuePlayer,
    isQueueListOpened,
    isQueuePlayerOpened,
  } = useQueue();

  // Check if we're on a file system path and need to redirect
  const currentPath = window.location.pathname;
  if (currentPath.includes('/media/')) {
    const router = useRouter();
    router.replace('/');
  }

  // Add webosTV class to body for TV-specific CSS styles.
  // Also add to <html> so root-relative rules (rem scaling, etc.) can target TV.
  document.body.classList.add('webosTV');
  document.documentElement.classList.add('webosTV');
  if (window.location.protocol === 'file:') {
    document.body.classList.add('webosTVDevice');
  } else if (isTVPreview) {
    document.body.classList.add('webosTVPreview');
  }

  // Track currently focused element for .focused CSS class
  let currentFocusedElement: HTMLElement | null = null;
  let hasReceivedNavigationInput = false;

  /**
   * Update .focused class on elements
   * This provides a reliable visual focus indicator for TV browsers
   * where :focus pseudo-class styling may not work consistently
   */
  function updateFocusedClass(newElement: HTMLElement | null): void {
    // Remove .focused from previous element
    if (currentFocusedElement) {
      currentFocusedElement.classList.remove('focused');
      // Also remove from parent trackRow if present
      const trackRow = currentFocusedElement.closest('.trackRow');
      if (trackRow) {
        trackRow.classList.remove('focused');
      }
    }

    // Add .focused to new element
    if (newElement) {
      newElement.classList.add('focused');
      // Also add to parent trackRow for track list highlighting
      const trackRow = newElement.closest('.trackRow');
      if (trackRow) {
        trackRow.classList.add('focused');
      }
    }

    currentFocusedElement = newElement;
  }

  /**
   * Handle focusin event - update .focused class
   */
  function onFocusIn(evt: FocusEvent): void {
    const target = evt.target as HTMLElement;
    if (target && target !== document.body) {
      updateFocusedClass(target);
    }
  }

  /**
   * Handle focusout event - remove .focused class
   */
  function onFocusOut(): void {
    // Small delay to allow focusin to fire for new element first
    setTimeout(() => {
      if (
        currentFocusedElement &&
        document.activeElement !== currentFocusedElement
      ) {
        updateFocusedClass(null);
      }
    }, 10);
  }

  // Add focus event listeners for .focused class management
  document.addEventListener('focusin', onFocusIn);
  document.addEventListener('focusout', onFocusOut);

  // Scroll TV media grids in two-row blocks instead of animating one card at a time.
  let lastGridWheelAt = 0;
  document.addEventListener(
    'wheel',
    (event) => {
      let delta = event.deltaY;
      if (event.deltaMode === 1) {
        delta *= 40;
      } else if (event.deltaMode === 2) {
        delta *= window.innerHeight;
      }
      if (!delta) return;

      const eventTarget = event.target as HTMLElement | null;
      const activeTarget = document.activeElement as HTMLElement | null;
      const gridPage =
        eventTarget?.closest('[data-webos-grid-page]') ??
        activeTarget?.closest('[data-webos-grid-page]');

      if (gridPage) {
        event.preventDefault();
        const now = Date.now();
        if (now - lastGridWheelAt < 140) return;
        lastGridWheelAt = now;

        const pages = Array.from(
          document.querySelectorAll<HTMLElement>('[data-webos-grid-page]'),
        );
        const currentIndex = pages.indexOf(gridPage as HTMLElement);
        const nextPage = pages[currentIndex + (delta > 0 ? 1 : -1)];
        nextPage?.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
      }

      const scrollContainer =
        eventTarget?.closest<HTMLElement>('[data-webos-scrollable]') ??
        activeTarget?.closest<HTMLElement>('[data-webos-scrollable]');
      if (scrollContainer) {
        const maxScrollTop =
          scrollContainer.scrollHeight - scrollContainer.clientHeight;
        scrollContainer.scrollTop = Math.max(
          0,
          Math.min(maxScrollTop, scrollContainer.scrollTop + delta),
        );
        event.preventDefault();
        return;
      }

      event.preventDefault();
      window.scrollBy(0, Math.sign(delta) * window.innerHeight * 0.72);
    },
    { passive: false },
  );

  // Use the TV's fixed logical viewport for stable focus and grid layout.
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=1280, initial-scale=1');
  }

  /**
   * Check if we're on an individual album/artist/playlist detail page
   * vs a list/discovery view
   */
  function isOnDetailPage(): boolean {
    const path = window.location.pathname;
    // Individual detail pages (not plural)
    return (
      path.startsWith('/album/') ||
      path.startsWith('/artist/') ||
      path.startsWith('/playlist/') ||
      path.startsWith('/podcast/')
    );
  }

  /**
   * Check if an element should be skipped for TV navigation
   * We skip links inside layoutContent (album titles, artist names)
   * to allow jumping directly between album images
   */
  function shouldSkipElement(element: Element): boolean {
    if (element.closest('[data-webos-skip-focus]')) {
      return true;
    }

    // Skip all elements inside track seeker (progress bar) - use skip buttons instead
    if (element.closest('[class*="trackSeeker"]')) {
      return true;
    }

    // Skip links/buttons inside layoutContent (album title, artist links)
    const layoutContent = element.closest('.layoutContent');
    if (layoutContent) {
      return true;
    }

    // Skip elements inside hidden action buttons (play/favourite on album hover)
    // These are the buttons that appear on hover in the album grid
    const actions = element.closest('[class*="actions"]');
    if (actions) {
      return true;
    }

    return false;
  }

  /**
   * Navigation zones for deterministic navigation
   * - 'header': top < 70px (top navigation and account controls)
   * - 'player': inside the music player
   * - 'content': main content area (albums, tracks, page tabs, etc.)
   */
  type NavigationZone = 'content' | 'header' | 'player';

  function getNavigationZone(element: Element): NavigationZone {
    // 1. Check if inside the music player FIRST (highest priority)
    if (isInsidePlayer(element)) {
      return 'player';
    }

    // 2. Position-based header check
    const rect = element.getBoundingClientRect();
    if (rect.top < 70) {
      return 'header';
    }

    // 3. Default to content
    return 'content';
  }

  /**
   * Check if element is inside the music player (not just any fixed element)
   * This specifically targets the music player and queue, not the header
   */
  function isInsidePlayer(element: Element): boolean {
    // Check if inside the music player
    const musicPlayer = element.closest('[class*="musicPlayer"]');
    if (musicPlayer) {
      return true;
    }

    // Check if inside the queue wrapper
    const queueWrapper = element.closest('.queueWrapper');
    if (queueWrapper) {
      return true;
    }

    // Check if inside footer that contains player
    const footer = element.closest('footer');
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      // Player footer is near bottom of screen
      if (footerRect.top > window.innerHeight - 200) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if an element is visible
   */
  function isVisible(element: Element): boolean {
    if (!element) return false;
    const el = element as HTMLElement;

    // Check if element or its parent has dimensions
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      // For swiper slides: only consider visible if the slide is mostly in viewport
      // This prevents navigating to off-screen slides which would trigger scroll-snap
      const swiperSlide = el.closest('swiper-slide');
      if (swiperSlide) {
        const slideRect = swiperSlide.getBoundingClientRect();
        const viewportWidth =
          window.innerWidth || document.documentElement.clientWidth;

        // Check if slide is mostly visible (at least 50% in viewport)
        const visibleLeft = Math.max(slideRect.left, 0);
        const visibleRight = Math.min(slideRect.right, viewportWidth);
        const visibleWidth = Math.max(0, visibleRight - visibleLeft);

        if (visibleWidth < slideRect.width * 0.1) {
          return false;
        }
      }
      return true;
    }

    // Fallback to offset dimensions
    if (el.offsetWidth > 0 && el.offsetHeight > 0) {
      return true;
    }

    // For anchor tags, check if they have visible children
    if (el.tagName === 'A') {
      const firstChild = el.firstElementChild;
      if (firstChild) {
        const childRect = firstChild.getBoundingClientRect();
        return childRect.width > 0 && childRect.height > 0;
      }
    }

    return false;
  }

  /**
   * Get all focusable elements on the page
   */
  function getFocusableElements(): HTMLElement[] {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
      '.focusable',
    ].join(',');

    const elements = document.querySelectorAll(selectors);
    const filtered = Array.from(elements).filter(
      (el) => isVisible(el) && !shouldSkipElement(el),
    ) as HTMLElement[];

    return filtered;
  }

  /**
   * Get element's bounding rect with some useful computed properties
   */
  function getElementRect(el: HTMLElement): {
    centerX: number;
    centerY: number;
    rect: DOMRect;
  } {
    const rect = el.getBoundingClientRect();
    return {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      rect,
    };
  }

  /**
   * Check if two elements overlap on an axis (with tolerance)
   */
  function hasOverlap(
    aStart: number,
    aEnd: number,
    bStart: number,
    bEnd: number,
    tolerance: number = 0,
  ): boolean {
    return aStart - tolerance < bEnd && aEnd + tolerance > bStart;
  }

  /**
   * Keep a focused media tile within its two-row page. Move the viewport only
   * when focus crosses into another page; all TV scrolls are immediate.
   */
  function scrollToFocusedElement(
    currentElement: HTMLElement,
    targetElement: HTMLElement,
  ): void {
    const currentPage = currentElement.closest('[data-webos-grid-page]');
    const targetPage = targetElement.closest('[data-webos-grid-page]');

    if (targetPage) {
      if (currentPage !== targetPage) {
        (targetPage as HTMLElement).scrollIntoView({
          behavior: 'auto',
          block: 'start',
        });
      }
      return;
    }

    targetElement.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
      inline: 'nearest',
    });
  }

  /**
   * Navigate to the nearest element in a direction
   * Uses a more predictable algorithm that prioritizes:
   * 1. Elements that are aligned (overlap on the perpendicular axis)
   * 2. Distance in the primary direction
   */
  function navigateSpatial(
    direction: 'down' | 'left' | 'right' | 'up',
  ): boolean {
    const allElements = getFocusableElements();
    if (allElements.length === 0) return false;

    const currentElement = document.activeElement as HTMLElement;

    // If no element is focused or body is focused, focus the first element
    if (
      !currentElement ||
      currentElement === document.body ||
      !isVisible(currentElement)
    ) {
      navigationInit();
      return true;
    }

    const current = getElementRect(currentElement);
    const currentZone = getNavigationZone(currentElement);
    const isHorizontal = direction === 'left' || direction === 'right';

    let bestElement: HTMLElement | null = null;
    let bestScore = Infinity;
    let bestIsAligned = false;

    for (const element of allElements) {
      if (element === currentElement) continue;

      const targetZone = getNavigationZone(element);

      // Keep directional movement within the current area. The player and
      // header should only be reached when a spatial neighbor exists there.

      if (currentZone === 'content') {
        // When in main content:
        // - UP/DOWN: stay in content (don't jump to header/player)
        // - LEFT: stay in content
        // - RIGHT: stay in content
        if (targetZone === 'header' && direction !== 'up') {
          continue; // Only UP from content may enter the header
        }
        if (targetZone === 'player') {
          continue; // Skip player - only accessible from bottom of content
        }
      } else if (currentZone === 'header') {
        // When in header, DOWN can enter content and UP stops at the edge.
        if (targetZone === 'player') {
          continue; // Don't go from header to player
        }
      } else if (currentZone === 'player') {
        // When in player:
        // - UP: go to content
        // - LEFT/RIGHT: stay in player
        if (direction === 'up' && targetZone !== 'content') {
          continue;
        }
        if (
          (direction === 'left' || direction === 'right') &&
          targetZone !== 'player'
        ) {
          continue;
        }
      }

      const target = getElementRect(element);

      // Calculate distances
      const dx = target.centerX - current.centerX;
      const dy = target.centerY - current.centerY;

      // Check if element is in the correct direction (with small threshold)
      let isInDirection = false;
      let primaryDistance = 0;

      switch (direction) {
        case 'down':
          isInDirection = target.rect.top > current.rect.bottom - 10;
          primaryDistance = target.rect.top - current.rect.bottom;
          break;
        case 'left':
          isInDirection = target.rect.right < current.rect.left + 10;
          primaryDistance = current.rect.left - target.rect.right;
          break;
        case 'right':
          isInDirection = target.rect.left > current.rect.right - 10;
          primaryDistance = target.rect.left - current.rect.right;
          break;
        case 'up':
          isInDirection = target.rect.bottom < current.rect.top + 10;
          primaryDistance = current.rect.top - target.rect.bottom;
          break;
      }

      if (!isInDirection || primaryDistance < 0) continue;

      // Check alignment - elements that overlap on perpendicular axis are preferred
      let isAligned: boolean;
      let perpendicularDistance: number;

      if (isHorizontal) {
        // For left/right: check vertical overlap
        isAligned = hasOverlap(
          current.rect.top,
          current.rect.bottom,
          target.rect.top,
          target.rect.bottom,
          5, // 5px tolerance
        );
        perpendicularDistance = Math.abs(dy);
      } else {
        // For up/down: check horizontal overlap
        isAligned = hasOverlap(
          current.rect.left,
          current.rect.right,
          target.rect.left,
          target.rect.right,
          5, // 5px tolerance
        );
        perpendicularDistance = Math.abs(dx);
      }

      // Calculate score
      // Aligned elements get a huge bonus (lower score)
      // Primary distance is the main factor, perpendicular is secondary
      let score: number;

      if (isAligned) {
        // Aligned: primarily care about distance in the navigation direction
        score = primaryDistance + perpendicularDistance * 0.1;
      } else {
        // Not aligned: heavily penalize perpendicular distance
        score = primaryDistance + perpendicularDistance * 5;
      }

      // Prefer aligned elements even if slightly farther away
      const isBetterChoice =
        (isAligned && !bestIsAligned) ||
        (isAligned === bestIsAligned && score < bestScore);

      if (isBetterChoice) {
        bestScore = score;
        bestElement = element;
        bestIsAligned = isAligned;
      }
    }

    if (bestElement) {
      const isInSwiper = bestElement.closest('swiper-slide');
      bestElement.focus();
      if (!isInSwiper) {
        scrollToFocusedElement(currentElement, bestElement);
      }
      return true;
    }

    return false;
  }

  /**
   * Handle arrow key navigation
   */
  function handleArrowUp(): void {
    navigateSpatial('up');
  }

  function handleArrowDown(): void {
    const currentElement = document.activeElement as HTMLElement;
    const currentZone = currentElement
      ? getNavigationZone(currentElement)
      : null;

    // If in content and no elements found below, try to reach player
    if (currentZone === 'content') {
      if (navigateSpatial('down')) return;

      // Check if player exists and has focusable elements
      const playerElements = getFocusableElements().filter(
        (el) => getNavigationZone(el) === 'player',
      );
      if (playerElements.length > 0) {
        // Focus the first player element
        playerElements[0].focus();
        playerElements[0].scrollIntoView({
          behavior: 'auto',
          block: 'center',
        });
      }
      return;
    }

    navigateSpatial('down');
  }

  function handleArrowLeft(): void {
    navigateSpatial('left');
  }

  function handleArrowRight(): void {
    navigateSpatial('right');
  }

  /**
   * Handle back button
   */
  function handleBack(): void {
    if (isQueueListOpened.value) {
      closeQueueList();
      return;
    }

    if (isQueuePlayerOpened.value) {
      closeQueuePlayer();
      return;
    }

    // Try to use webOS platform back if available
    if (
      'webOS' in window &&
      (window as unknown as { webOS?: { platformBack?: () => void } }).webOS
        ?.platformBack
    ) {
      (
        window as unknown as { webOS: { platformBack: () => void } }
      ).webOS.platformBack();
      return;
    }

    // Otherwise use browser history
    const router = useRouter();
    if (window.history.length > 1) {
      router.back();
    }
  }

  /**
   * Handle OK/Enter button
   */
  function handleOK(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      // For checkboxes, toggle the checked state
      if (
        activeElement instanceof HTMLInputElement &&
        activeElement.type === 'checkbox'
      ) {
        activeElement.checked = !activeElement.checked;
        activeElement.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      // For other elements, trigger a click
      activeElement.click();
    }
  }

  /**
   * Initialize navigation - focus the first visible focusable element
   */
  function navigationInit(): void {
    const allElements = getFocusableElements();
    const isDetailPage = isOnDetailPage();

    // On detail pages (album, artist, playlist), prioritize Play All button
    if (isDetailPage) {
      // Try to find Play All button by ID first
      const playAllButton = document.getElementById('play-all-button');
      if (playAllButton && isVisible(playAllButton)) {
        playAllButton.focus();
        return;
      }

      // Fallback: find any button with "play" in text (case insensitive)
      const buttons = document.querySelectorAll('button');
      for (const button of buttons) {
        if (
          button.textContent?.toLowerCase().includes('play') &&
          isVisible(button) &&
          !shouldSkipElement(button)
        ) {
          button.focus();
          return;
        }
      }
    }

    // Start in page content when possible, instead of focusing the decorative
    // brand mark or a header control as soon as the app opens.
    const firstContentElement = allElements.find((element) =>
      element.closest('main'),
    );

    if (firstContentElement) {
      firstContentElement.focus();
      return;
    }
  }

  /**
   * Main keydown event handler
   */
  function onKeyDown(evt: KeyboardEvent): void {
    hasReceivedNavigationInput = true;
    const keyCode = evt.keyCode;

    // Log for debugging

    switch (keyCode) {
      case 10009: // Samsung/Tizen Back button
      case 461: // webOS Back button
        evt.preventDefault();
        handleBack();
        break;
      case 13: // Enter/OK
        // Don't prevent default for form inputs
        if (
          !(document.activeElement instanceof HTMLInputElement) ||
          document.activeElement.type === 'checkbox'
        ) {
          evt.preventDefault();
        }
        handleOK();
        break;
      case 27: // Escape
        evt.preventDefault();
        handleBack();
        break;
      case 37: // Left Arrow
        evt.preventDefault();
        handleArrowLeft();
        break;
      case 38: // Up Arrow
        evt.preventDefault();
        handleArrowUp();
        break;
      case 39: // Right Arrow
        evt.preventDefault();
        handleArrowRight();
        break;
      case 40: // Down Arrow
        evt.preventDefault();
        handleArrowDown();
        break;
      case 8: // Backspace (as back in some contexts)
        // Only handle as back if not in an input field
        if (
          !(document.activeElement instanceof HTMLInputElement) &&
          !(document.activeElement instanceof HTMLTextAreaElement)
        ) {
          evt.preventDefault();
          handleBack();
        }
        break;
    }
  }

  // Add keydown event listener
  document.addEventListener('keydown', onKeyDown);

  // Initialize focus when page loads
  setTimeout(navigationInit, 200);

  // Re-initialize when route changes
  nuxtApp.hook('page:finish', () => {
    setTimeout(navigationInit, 200);
  });

  // Also re-initialize on page transitions
  nuxtApp.hook('page:transition:finish', () => {
    setTimeout(navigationInit, 200);
  });

  // Watch for DOM changes and re-initialize if needed
  const observer = new MutationObserver(() => {
    // Move initial focus into the page once content appears.
    const activeElement = document.activeElement;
    const focusIsInPrimaryNavigation =
      activeElement instanceof HTMLElement &&
      Boolean(activeElement.closest('.tvPrimaryNavigation'));

    if (
      !activeElement ||
      activeElement === document.body ||
      !isVisible(activeElement) ||
      (focusIsInPrimaryNavigation && !hasReceivedNavigationInput)
    ) {
      setTimeout(navigationInit, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
