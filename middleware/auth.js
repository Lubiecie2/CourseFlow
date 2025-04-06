export default defineNuxtRouteMiddleware(async (to, from) => {
  const accessToken = useCookie("access_token");
  const userStore = useUserStore();

  if (!accessToken.value) {
    if (
      to.path !== "/login" &&
      to.path !== "/register" &&
      to.path !== "/verify-register"
    ) {
      return navigateTo("/login");
    }
    return;
  }

  if (accessToken.value && !userStore.user) {
    await userStore.fetchUser();
  }

  if (
    userStore.user &&
    userStore.user.is_verified === false &&
    to.path !== "/verify-register"
  ) {
    return navigateTo(`/verify-register?email=${userStore.user.email}`);
  }

  if (
    userStore.user?.is_verified === true &&
    ["/login", "/register", "/verify-register"].includes(to.path)
  ) {
    return navigateTo("/");
  }
});
