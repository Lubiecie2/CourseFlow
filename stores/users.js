export const useUserStore = defineStore("user", () => {
  const user = ref(null);

  const fetchUser = async () => {
    try {
      console.log("🔄 Pobieranie danych użytkownika z serwera...");

      const response = await useApiFrontend("/auth/me", {
        method: "GET",

        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "X-Timestamp": Date.now().toString(),
        },
      });

      if (response && response.id) {
        user.value = {
          id: response.id,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          role: response.role,
          createdAt: response.createdAt,
          permissions: response.permissions,
          is_verified: true,
        };

        console.log("✅ Dane użytkownika pobrane z serwera:", user.value);
      } else {
        console.log("❌ Brak danych użytkownika w odpowiedzi serwera");
        user.value = null;
      }

      return user.value;
    } catch (error) {
      console.error("❌ Błąd podczas pobierania danych użytkownika:", error);
      user.value = null;
      return null;
    }
  };

  const login = async (credentials) => {
    try {
      console.log("🔑 Rozpoczęcie logowania...");

      user.value = null;

      const response = await useApiFrontend("/auth/login", {
        method: "POST",
        body: credentials,
        credentials: "include",
      });

      if (response.user && response.user.is_verified === false) {
        user.value = {
          id: response.user.id,
          email: response.user.email,
          is_verified: false,
        };

        try {
          await useApiFrontend("/auth/resend-code", {
            method: "POST",
            body: { email: credentials.email },
          });
        } catch (resendError) {
          console.error("Error resending verification code:", resendError);
        }

        return {
          success: true,
          needsVerification: true,
          email: credentials.email,
        };
      }

      console.log("✅ Logowanie udane, pobieranie danych użytkownika...");

      await new Promise((resolve) => setTimeout(resolve, 100));

      const userData = await fetchUser();

      if (!userData) {
        throw new Error("Nie udało się pobrać danych użytkownika po logowaniu");
      }

      console.log("✅ Dane użytkownika załadowane:", user.value);

      return {
        success: true,
        needsVerification: false,
        user: user.value,
      };
    } catch (error) {
      console.error("❌ Błąd logowania:", error);
      user.value = null;
      throw error;
    }
  };

  const isLogged = computed(() => !!user.value);

  const logout = () => {
    console.log("🔄 Wylogowywanie użytkownika...");
    user.value = null;

    const accessTokenCookie = useCookie("access_token", {
	domain: '.courseflow.pl',
    });
    accessTokenCookie.value = null;

    if (process.client) {
      try {
        document.cookie =
          "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("user");
        localStorage.removeItem("auth");

        document.cookie.split(";").forEach(function (c) {
           document.cookie = c
             .replace(/^ +/, "")
             .replace(
               /=.*/,
               "=;expires=" + new Date().toUTCString() + ";path=/"
             );
        });
      } catch (e) {
        console.warn("Błąd podczas czyszczenia localStorage:", e);
      }
    }
  };

  const refreshUser = async () => {
    console.log("🔄 Wymuszenie odświeżenia danych użytkownika...");
    const token = useCookie("access_token");

    if (!token.value) {
      console.log("Brak tokenu - czyszczenie store");
      user.value = null;
      return null;
    }

    user.value = null;
    return await fetchUser();
  };

  return {
    user,
    fetchUser,
    refreshUser,
    isLogged,
    login,
    logout,
  };
});
