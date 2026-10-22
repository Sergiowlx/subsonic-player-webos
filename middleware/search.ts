export default defineNuxtRouteMiddleware((to) => {
  // The TV navigation has a dedicated search landing page at /search. Keep
  // invalid or incomplete result URLs redirected as before.
  if (to.path === '/search') {
    return;
  }

  if (
    !(
      to.params[ROUTE_PARAM_KEYS.search.mediaType] &&
      to.params[ROUTE_PARAM_KEYS.search.query] &&
      Object.values(ROUTE_MEDIA_TYPE_PARAMS).includes(
        to.params[ROUTE_PARAM_KEYS.search.mediaType] as never,
      )
    )
  ) {
    return navigateTo({
      name: ROUTE_NAMES.index,
    });
  }
});
