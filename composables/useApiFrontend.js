export function useApiFrontend(url, options = {}) {
  return useNuxtApp().$api(url, options);
}
