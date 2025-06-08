export default defineNuxtPlugin((nuxtApp) => {
  const api = $fetch.create({
    // <--- Tu jest tworzona instancja $fetch z podstawowym adresem URL
    baseURL: "http://localhost:4000/api",
    onRequest: ({ request, options, error }) => {
      // <--- Middleware który wykonuje się przed wysłaniem żądania
      const token = useCookie("access_token"); // <--- Pobiera się token z ciasteczka
      if (token.value) {
        // <--- Sprawdza się czy token istnieje
        const headers = (options.headers ||= {});

        if (Array.isArray(headers)) {
          headers.push(["Authorization", `Bearer ${token.value}`]); // <--- Jeśli headers to tablica dodaje nagłówek jako tablice
        } else if (headers instanceof Headers) {
          // <--- Jeśli headers to obiekt Ustwaia nagłówek authorization
          headers.set("Authorization", `Bearer ${token.value}`);
        } else {
          headers.Authorization = `Bearer ${token.value}`; // <--- W przeciwnym wypadku dodaje nagłówek jako obiekt
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
      // <--- Dzięki temu można używać $api w komponentach
      api,
    },
  };
});
