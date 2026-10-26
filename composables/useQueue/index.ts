export function useQueue() {
  const { lockScroll, unlockScroll } = useScrollLock('queue');

  const isQueueListOpened = useState(STATE_NAMES.queueListOpened, () => false);
  const isQueuePlayerOpened = useState(
    STATE_NAMES.queuePlayerOpened,
    () => false,
  );

  function toggleLockScroll() {
    if (isQueueListOpened.value || isQueuePlayerOpened.value) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }

  function toggleQueuePlayer() {
    isQueuePlayerOpened.value = !isQueuePlayerOpened.value;
    toggleLockScroll();
  }

  function closeQueuePlayer() {
    if (!isQueuePlayerOpened.value) return;

    isQueuePlayerOpened.value = false;
    toggleLockScroll();
  }

  function toggleQueueList() {
    isQueueListOpened.value = !isQueueListOpened.value;
    toggleLockScroll();
  }

  function closeQueueList() {
    if (!isQueueListOpened.value) return;

    isQueueListOpened.value = false;
    toggleLockScroll();
  }

  function openQueueList() {
    isQueueListOpened.value = true;
    toggleLockScroll();

    if (import.meta.client && isWebOSTV()) {
      nextTick(() => {
        document
          .querySelector<HTMLButtonElement>(
            '.webosQueueList .webosQueueUpcomingPlay, .webosQueueList button',
          )
          ?.focus();
      });
    }
  }

  function resetQueue() {
    isQueueListOpened.value = false;
    isQueuePlayerOpened.value = false;

    unlockScroll();
  }

  return {
    closeQueueList,
    closeQueuePlayer,
    isQueueListOpened,
    isQueuePlayerOpened,
    openQueueList,
    resetQueue,
    toggleQueueList,
    toggleQueuePlayer,
  };
}
