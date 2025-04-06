export const useUserStore = defineStore("user", () => {
  const user = ref(null);

  const fetchUser = async () => {
    try {
      const { data } = await useApiServer("/auth/me");
      if (data.value) {
        user.value = data.value;
        if (user.value && user.value.is_verified === false) {
          console.log("User is not verified, will redirect to verification");
        }
      }

      return user.value;
    } catch (error) {
      user.value = null;
      return null;
    }
  };

  const isLogged = computed(() => !!user.value);

  const logout = () => {
    console.log("logout");
    user.value = null;
    useCookie("access_token").value = null;
  };

  return {
    user,
    fetchUser,
    isLogged,
    logout,
  };
});
