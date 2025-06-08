export function useApiServer(url, options = {}) {
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$api,
  });
}
