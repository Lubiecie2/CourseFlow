export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUserStore();

  const pagePermissions = to.meta.pagePermissions || [];

  const hasAllPagePermissions = pagePermissions.every((permission) =>
    user.user.permissions.includes(permission)
  );

  if (pagePermissions.length > 0) {
    if (!hasAllPagePermissions) {
      return navigateTo("/");
    }
  }
});
