export default defineNuxtPlugin((nuxtApp) => {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "localhost";
  const apiHost = hostname.endsWith("courseflow.pl")
    ? "https://api.courseflow.pl"
    : "http://localhost:4000";
  const api = $fetch.create({
    baseURL: `${apiHost}/api`,
    onRequest: ({ request, options, error }) => {
      const token = useCookie("access_token");
      if (token.value) {
        const headers = (options.headers ||= {});
        if (Array.isArray(headers)) {
          headers.push(["Authorization", `Bearer ${token.value}`]);
        } else if (headers instanceof Headers) {
          headers.set("Authorization", `Bearer ${token.value}`);
        } else {
          headers.Authorization = `Bearer ${token.value}`;
        }
      }
    },
    onResponseError: async ({ response }) => {
      if (response.status === 401) {
        await nuxtApp.runWithContext(() =>
          navigateTo("/login", { replace: true })
        );
      }
    },
  });

  return { provide: { api } };
});
