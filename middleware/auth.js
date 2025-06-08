export default defineNuxtRouteMiddleware((to, from) => {
  const accessToken = useCookie("access_token");

  if (!accessToken.value) {
    if (to.path !== "/login" && to.path !== "/register") {
      return navigateTo("/login");
    }
  } else {
    if (to.path === "/login" || to.path === "/register") {
      return navigateTo("/");
    }
  }
});
