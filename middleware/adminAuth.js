export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUserStore();

  if (user.user.role !== "admin") {
    return navigateTo("/");
  }
});
