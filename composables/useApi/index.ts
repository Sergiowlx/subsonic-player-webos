import type { UseFetchOptions } from 'nuxt/app';

export function useAPI() {
  const config = useRuntimeConfig();
  const { IMAGE_SIZE } = config.public;

  const { addErrorSnack } = useSnack();

  type FetchDataErrorOptions = {
    notifyOnError?: boolean;
  };

  function getAuthToken() {
    return isWebOS()
      ? getAuthFromLocalStorage()
      : (useCookie(COOKIE_NAMES.auth).value ?? null);
  }

  function getUrl(path: string, param: Record<string, number | string>) {
    const authToken = getAuthToken();
    const { baseParams, baseURL } = getBaseOptions(authToken || '');

    const url = new URL(`${baseURL}/${path}`);
    url.search = convertToQueryString({
      ...baseParams,
      ...param,
    });

    return url.toString();
  }

  function getImageUrl(image: string, size?: string) {
    // If radio station.
    if (isUrl(image)) {
      return image;
    }

    // TV cards are rendered at about 200px in the 1280px webOS viewport.
    // Requesting the 500px desktop default wastes bandwidth and decode time on
    // Chromium 79, so use a TV-sized cover unless a caller asked for a size.
    const isWebOSTV =
      isWebOS() ||
      (import.meta.client && window.location.search.includes('webos=true'));

    return getUrl('getCoverArt', {
      id: image,
      size: size ?? (isWebOSTV ? '300' : IMAGE_SIZE),
    });
  }

  function getStreamUrl(streamUrlId: string, maxBitRate?: number) {
    // If radio station.
    if (isUrl(streamUrlId)) {
      return streamUrlId;
    }

    return getUrl('stream', {
      id: streamUrlId,
      ...(maxBitRate ? { maxBitRate } : {}),
    });
  }

  function getDownloadUrl(id: string) {
    return getUrl('download', {
      id,
    });
  }

  async function fetchData<DataT = SubsonicResponse>(
    url: string,
    options: UseFetchOptions<SubsonicResponse, DataT> = {},
    { notifyOnError = true }: FetchDataErrorOptions = {},
  ) {
    try {
      const { $api } = useNuxtApp();
      const authToken = getAuthToken();

      const { baseParams, baseURL } = getBaseOptions(authToken || '');

      const response = await $api(url, {
        ...options,
        baseURL: options.baseURL ?? baseURL,
        query: {
          ...baseParams,
          ...options.query,
        },
      } as never);

      if (!response) {
        throw new Error(DEFAULT_ERROR_MESSAGE);
      }

      let result = response as DataT;

      if (options.transform) {
        result = await options.transform(response as SubsonicResponse);
      }

      return {
        data: result,
        error: null,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error : new Error(error as string);

      if (notifyOnError) {
        addErrorSnack(errorMessage.message);
      }

      return {
        data: null,
        error: errorMessage,
      };
    }
  }

  return {
    fetchData,
    getDownloadUrl,
    getImageUrl,
    getStreamUrl,
  };
}
