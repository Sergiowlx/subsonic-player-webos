export function useInfinityLoading<T>(id: string) {
  const config = useRuntimeConfig();
  const { LOAD_SIZE } = config.public;

  const items = useState<T[]>(`${STATE_NAMES.infinityItems}-${id}`, () => []);
  const offset = useState(`${STATE_NAMES.infinityOffset}-${id}`, () => 0);
  const hasMore = useState(`${STATE_NAMES.infinityHasMore}-${id}`, () => true);
  const isLoading = ref(false);

  async function fetchMoreData<T>(
    dataToFetch: (offset: number) => Promise<T> | T,
  ) {
    if (isLoading.value || !hasMore.value) {
      return items.value;
    }

    isLoading.value = true;

    try {
      const values = await dataToFetch(offset.value);

      if (!values || (Array.isArray(values) && !values.length)) {
        hasMore.value = false;
      }

      if (Array.isArray(values)) {
        const existingIds = new Set(
          items.value.map((item: any) => item.id || item.name || JSON.stringify(item)),
        );
        const newItems = values.filter(
          (item: any) => !existingIds.has(item.id || item.name || JSON.stringify(item)),
        );

        items.value.push(...newItems);
        offset.value = items.value.length;
        hasMore.value = values.length >= Number(LOAD_SIZE);
      }
    } finally {
      isLoading.value = false;
    }

    return items.value;
  }

  function resetInfinityLoading() {
    items.value = [];
    offset.value = 0;
    hasMore.value = true;
  }

  return {
    fetchMoreData,
    hasMore,
    items,
    LOAD_SIZE: Number(LOAD_SIZE),
    resetInfinityLoading,
  };
}
