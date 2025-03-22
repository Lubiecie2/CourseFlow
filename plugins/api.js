export default defineNuxtPlugin((nuxtApp) => {
  const api = $fetch.create({
    baseURL: "http://localhost:4000/api",
    onRequest: ({ request, options, error }) => {
      const token = useCookie("access_token");
      console.log("plgin token");
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
        console.log("response", response.status);
        // useCookie("access_token").value = null;
        await nuxtApp.runWithContext(() =>
          navigateTo("/login", { replace: true })
        );
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
