export const useUserStore = defineStore("user", () => {
  const user = ref(null);

  const fetchUser = async () => {
    try {
      const { data } = await useAPI("/auth/me");
      if (data.value) {
        user.value = {
          email: data.value.email,
          firstName: data.value.firstName,
          lastName: data.value.lastName,
          role: data.value.role,
        };
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
