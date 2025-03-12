<template>
  <div>
    <loggedUserNavbar></loggedUserNavbar>
    <foter />
    <UserNavbar></UserNavbar>
  </div>
</template>

<script>
import UserNavbar from "~/components/userNavbar.vue";

definePageMeta({
  layout: "login",
});
</script>
