export default defineNuxtPlugin(async () => {
  const accessToken = useCookie("access_token");
  const userStore = useUserStore();

  if (accessToken.value) {
    await userStore.fetchUser();
  }
});
