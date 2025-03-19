export default defineNuxtRouteMiddleware((to, from) => {
  const accessToken = useCookie("access_token");

  if (!accessToken.value) {
    return navigateTo("/login");
  }
});
