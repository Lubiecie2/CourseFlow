export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUserStore();

  const pagePermissions = to.meta.pagePermissions || [];

  const hasAllPagePermissions = pagePermissions.every((permission) =>
    user.user.permissions.includes(permission)
  );
  console.log("pagePermissions", hasAllPagePermissions);
  console.log("pageuprawnienia", pagePermissions);

  if (pagePermissions.length > 0) {
    if (!hasAllPagePermissions) {
      return navigateTo("/");
    }
  }
});
