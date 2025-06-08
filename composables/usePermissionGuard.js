export function usePermissionGuard(permission) {
  const user = useUserStore();

  return user.user.permissions.includes(permission);
}
